const { randomInt, createHmac, timingSafeEqual } = require("node:crypto");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const pool = require("../config/database");

const identity = z.object({
  username: z.string().trim().min(3).max(50),
  nik: z.string().regex(/^\d{16}$/),
  phone: z.string().trim().min(8).max(25),
});
const resetSchema = identity.extend({
  otp: z.string().regex(/^\d{6}$/),
  password: z.string().min(8).max(72).refine(value => Buffer.byteLength(value) <= 72),
});
const requestMessage = "Jika data akun cocok, kode OTP akan dikirim ke WhatsApp terdaftar.";
const invalidMessage = "Kode OTP salah, kedaluwarsa, atau batas percobaan tercapai.";

function normalizePhone(value) {
  return value.replace(/\D/g, "").replace(/^0/, "62");
}

function config() {
  const env = process.env;
  if (!/^v\d+\.\d+$/.test(env.WHATSAPP_API_VERSION ?? "") ||
      !/^\d+$/.test(env.WHATSAPP_PHONE_NUMBER_ID ?? "") ||
      !env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_OTP_TEMPLATE || !env.WHATSAPP_OTP_LANGUAGE ||
      (env.PASSWORD_RESET_OTP_SECRET ?? "").length < 32) return null;
  return env;
}

function digest(secret, userId, otp) {
  return createHmac("sha256", secret).update(String(userId) + ":" + otp).digest("hex");
}

async function lockedAccount(client, fields) {
  const { rows: [user] } = await client.query(`
    SELECT u.id, p.nik, p.phone FROM users u
    JOIN roles r ON r.id = u.role_id AND r.name = 'orang_tua'
    JOIN parent_profiles p ON p.user_id = u.id
    WHERE u.username = $1 AND u.is_active FOR UPDATE OF u
  `, [fields.username]);
  if (!user || user.nik.trim() !== fields.nik) return null;
  const phone = normalizePhone(user.phone);
  return /^62\d{8,13}$/.test(phone) && phone === normalizePhone(fields.phone) ? { id: user.id, phone } : null;
}

async function sendWhatsApp(env, phone, otp) {
  const parameters = [{ type: "text", text: otp }];
  const response = await fetch(
    `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: { Authorization: "Bearer " + env.WHATSAPP_ACCESS_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: env.WHATSAPP_OTP_TEMPLATE,
          language: { code: env.WHATSAPP_OTP_LANGUAGE },
          components: [
            { type: "body", parameters },
            { type: "button", sub_type: "url", index: "0", parameters },
          ],
        },
      }),
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!response.ok) throw new Error("WhatsApp rejected the OTP request.");
}

async function requestPasswordReset(req, res) {
  const env = config();
  if (!env) return res.status(503).json({ success: false, message: "Layanan pengiriman OTP WhatsApp belum aktif." });
  const parsed = identity.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Periksa data akun." });

  const otp = String(randomInt(0, 1000000)).padStart(6, "0");
  let delivery;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const account = await lockedAccount(client, parsed.data);
    if (account) {
      const { rows: [limit] } = await client.query(`
        SELECT count(*)::int AS total, COALESCE(bool_or(created_at > now() - interval '1 minute'), false) AS recent
        FROM password_reset_otps WHERE user_id = $1 AND created_at > now() - interval '1 hour'
      `, [account.id]);
      if (!limit.recent && limit.total < 5) {
        await client.query("UPDATE password_reset_otps SET used_at = now() WHERE user_id = $1 AND used_at IS NULL", [account.id]);
        const { rows: [entry] } = await client.query(`
          INSERT INTO password_reset_otps (user_id, otp_hash, expires_at, attempts)
          VALUES ($1, $2, now() + interval '5 minutes', 0) RETURNING id
        `, [account.id, digest(env.PASSWORD_RESET_OTP_SECRET, account.id, otp)]);
        delivery = { id: entry.id, phone: account.phone };
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  if (delivery) {
    try {
      await sendWhatsApp(env, delivery.phone, otp);
    } catch {
      await pool.query("UPDATE password_reset_otps SET used_at = now() WHERE id = $1 AND used_at IS NULL", [delivery.id]);
      console.error("WhatsApp OTP delivery failed.");
    }
  }
  return res.status(202).json({ success: true, message: requestMessage });
}

async function resetPassword(req, res) {
  const secret = process.env.PASSWORD_RESET_OTP_SECRET;
  if ((secret ?? "").length < 32) {
    return res.status(503).json({ success: false, message: "Layanan pemulihan kata sandi belum aktif." });
  }
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Periksa kode OTP dan kata sandi baru." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const account = await lockedAccount(client, parsed.data);
    const entry = account && (await client.query(`
      SELECT id, otp_hash FROM password_reset_otps
      WHERE user_id = $1 AND used_at IS NULL AND expires_at > now() AND attempts < 5
      ORDER BY created_at DESC, id DESC LIMIT 1 FOR UPDATE
    `, [account.id])).rows[0];
    if (entry) {
      const actual = Buffer.from(digest(secret, account.id, parsed.data.otp), "hex");
      const expected = Buffer.from(entry.otp_hash, "hex");
      if (expected.length === actual.length && timingSafeEqual(expected, actual)) {
        const hash = await bcrypt.hash(parsed.data.password, 12);
        await client.query("UPDATE users SET password_hash = $2, password_version = password_version + 1, updated_at = now() WHERE id = $1", [account.id, hash]);
        await client.query("UPDATE password_reset_otps SET used_at = now() WHERE user_id = $1 AND used_at IS NULL", [account.id]);
        await client.query("COMMIT");
        return res.json({ success: true, message: "Kata sandi berhasil diubah." });
      }
      await client.query("UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = $1", [entry.id]);
    }
    await client.query("COMMIT");
    return res.status(400).json({ success: false, message: invalidMessage });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { requestPasswordReset, resetPassword };
