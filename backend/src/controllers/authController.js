const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const pool = require("../config/database");

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(150),
  nik: z.string().regex(/^\d{16}$/, "NIK harus terdiri dari 16 digit."),
  phone: z.string().trim().min(8).max(25),
  username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/),
  address: z.string().trim().min(5).max(1000),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  identity: z.string().trim().min(1),
  password: z.string().min(1).max(72),
});

function issueToken(user, role) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET belum diatur atau terlalu pendek (minimal 32 karakter).");
  }

  return jwt.sign(
    { sub: String(user.id), role, pv: user.password_version },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h", issuer: "tumbie-api" }
  );
}

function publicUser(row) {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    profile: row.full_name
      ? {
          fullName: row.full_name,
          phone: row.phone || null,
          nik: row.nik || null,
          address: row.address || null,
        }
      : null,
  };
}

async function registerParent(req, res, next) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Data pendaftaran belum valid.",
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const data = parsed.data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const roleResult = await client.query(
      "SELECT id FROM roles WHERE name = $1",
      ["orang_tua"]
    );
    if (roleResult.rowCount !== 1) {
      throw new Error("Role orang_tua belum tersedia pada tabel roles.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const userResult = await client.query(
      `INSERT INTO users (role_id, username, password_hash, is_active)
       VALUES ($1, $2, $3, TRUE)
       RETURNING id, username, email, is_active`,
      [roleResult.rows[0].id, data.username, passwordHash]
    );

    const user = userResult.rows[0];

    await client.query(
      `INSERT INTO parent_profiles (user_id, full_name, nik, phone, address)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, data.fullName, data.nik, data.phone, data.address]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil. Silakan login.",
      data: { id: user.id, username: user.username, role: "orang_tua" },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      const constraint = error.constraint || "";
      const message = constraint.includes("nik")
        ? "NIK sudah terdaftar."
        : constraint.includes("username")
          ? "Username sudah digunakan."
          : "Data akun sudah terdaftar.";
      return res.status(409).json({ success: false, message });
    }
    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message: "Relasi data pendaftaran tidak sesuai dengan database.",
      });
    }
    return next(error);
  } finally {
    client.release();
  }
}

async function login(req, res, next) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Username/NIK/nomor WhatsApp dan password wajib diisi.",
    });
  }

  const { identity, password } = parsed.data;

  try {
    const result = await pool.query(
      `SELECT
         u.id, u.username, u.email, u.password_hash, u.password_version, u.is_active,
         r.name AS role,
         COALESCE(pp.full_name, cp.full_name) AS full_name,
         COALESCE(pp.phone, cp.phone) AS phone,
         pp.nik, pp.address
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN parent_profiles pp ON pp.user_id = u.id
       LEFT JOIN cadre_profiles cp ON cp.user_id = u.id
       WHERE lower(u.username) = lower($1)
          OR (r.name = 'orang_tua' AND (pp.nik = $1 OR pp.phone = $1))
       LIMIT 1`,
      [identity]
    );

    const user = result.rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Identitas atau password salah, atau akun tidak aktif.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Identitas atau password salah, atau akun tidak aktif.",
      });
    }

    if (!["orang_tua", "kader"].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Role akun tidak dikenali.",
      });
    }

    const token = issueToken(user, user.role);
    return res.json({
      success: true,
      message: "Login berhasil.",
      data: {
        token,
        user: publicUser(user),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT
         u.id, u.username, u.email, u.is_active,
         r.name AS role,
         COALESCE(pp.full_name, cp.full_name) AS full_name,
         COALESCE(pp.phone, cp.phone) AS phone,
         pp.nik, pp.address
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN parent_profiles pp ON pp.user_id = u.id
       LEFT JOIN cadre_profiles cp ON cp.user_id = u.id
       WHERE u.id = $1`,
      [req.user.sub]
    );

    if (!result.rowCount || !result.rows[0].is_active) {
      return res.status(404).json({ success: false, message: "Akun tidak ditemukan atau tidak aktif." });
    }

    return res.json({ success: true, data: { user: publicUser(result.rows[0]) } });
  } catch (error) {
    return next(error);
  }
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72).refine(value => Buffer.byteLength(value) <= 72),
});

async function changePassword(req, res) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Periksa kata sandi lama dan kata sandi baru (minimal 8 karakter)." });
  }

  const { currentPassword, newPassword } = parsed.data;
  const { rows: [account] } = await pool.query(`
    SELECT password_hash, password_version FROM users
    WHERE id = $1 AND is_active AND password_version = $2
  `, [req.user.sub, req.user.pv ?? 0]);
  if (!account || !await bcrypt.compare(currentPassword, account.password_hash)) {
    return res.status(400).json({ success: false, message: "Kata sandi lama tidak sesuai." });
  }
  if (await bcrypt.compare(newPassword, account.password_hash)) {
    return res.status(400).json({ success: false, message: "Pilih kata sandi baru yang berbeda." });
  }

  const hash = await bcrypt.hash(newPassword, 12);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(`
      UPDATE users SET password_hash = $2, password_version = password_version + 1, updated_at = now()
      WHERE id = $1 AND is_active AND password_version = $3 RETURNING id
    `, [req.user.sub, hash, account.password_version]);
    if (!result.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, message: "Sesi berubah. Silakan masuk kembali." });
    }
    await client.query("UPDATE password_reset_otps SET used_at = now() WHERE user_id = $1 AND used_at IS NULL", [req.user.sub]);
    await client.query("COMMIT");
    return res.json({ success: true, message: "Kata sandi berhasil diubah. Silakan masuk kembali." });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { registerParent, login, me, changePassword };
