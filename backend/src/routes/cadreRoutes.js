const express = require("express");
const { z } = require("zod");
const pool = require("../config/database");
const { authenticateToken, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/children", authenticateToken, allowRoles("kader"), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT c.id, c.full_name AS name, c.birth_date::text AS "birthDate",
           c.gender, c.registration_status AS "registrationStatus",
           p.id AS "posyanduId", p.name AS posyandu, guardian.name AS parent, guardian.nik, guardian.phone
    FROM public.children c
    JOIN public.posyandu p ON p.id = c.posyandu_id AND p.is_active
    LEFT JOIN LATERAL (
      SELECT pp.full_name AS name, left(pp.nik, 4) || '************' AS nik, pp.phone
      FROM public.child_guardians g
      JOIN public.parent_profiles pp ON pp.id = g.parent_profile_id
      WHERE g.child_id = c.id
      ORDER BY g.is_primary DESC, g.id
      LIMIT 1
    ) guardian ON true
    WHERE EXISTS (
      SELECT 1
      FROM public.cadre_posyandu a
      JOIN public.users u ON u.id = a.cadre_user_id AND u.is_active
      JOIN public.roles r ON r.id = u.role_id AND r.name = 'kader'
      WHERE a.cadre_user_id = $1 AND a.posyandu_id = c.posyandu_id
    )
    ORDER BY c.full_name, c.id
  `, [req.user.sub]);
  res.json({ success: true, data: rows });
});

router.patch("/children/:id/verify", authenticateToken, allowRoles("kader"), async (req, res) => {
  if (!/^[1-9]\d{0,17}$/.test(req.params.id)) {
    return res.status(400).json({ success: false, message: "ID anak tidak valid." });
  }

  const { rows } = await pool.query(`
    UPDATE public.children c
    SET registration_status = 'verified',
        updated_at = CASE WHEN c.registration_status = 'verified' THEN c.updated_at ELSE now() END
    WHERE c.id = $1 AND EXISTS (
      SELECT 1
      FROM public.cadre_posyandu a
      JOIN public.posyandu p ON p.id = a.posyandu_id AND p.is_active
      JOIN public.users u ON u.id = a.cadre_user_id AND u.is_active
      JOIN public.roles r ON r.id = u.role_id AND r.name = 'kader'
      WHERE a.cadre_user_id = $2 AND a.posyandu_id = c.posyandu_id
    )
    RETURNING c.id, c.registration_status AS "registrationStatus"
  `, [req.params.id, req.user.sub]);

  if (!rows.length) {
    return res.status(404).json({ success: false, message: "Anak tidak ditemukan di wilayah tugas kader." });
  }
  res.json({ success: true, data: rows[0] });
});

router.post("/children", authenticateToken, allowRoles("kader"), async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(1).max(150),
    birth: z.iso.date(),
    gender: z.enum(["Laki-laki", "Perempuan"]),
    notes: z.string().trim().max(2000),
    parent: z.string().trim().min(1).max(150),
    nik: z.string().regex(/^\d{16}$/),
    phone: z.string().trim().min(8).max(25),
    address: z.string().trim().min(5).max(1000),
  }).safeParse(req.body);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
  if (!parsed.success || parsed.data.birth > today) {
    return res.status(400).json({ success: false, message: "Periksa data balita, tanggal lahir, dan identitas wali." });
  }
  const data = parsed.data;
  const { rows: [child] } = await pool.query(`
    WITH assignment AS (
      SELECT a.posyandu_id FROM cadre_posyandu a
      JOIN posyandu p ON p.id = a.posyandu_id AND p.is_active
      JOIN users u ON u.id = a.cadre_user_id AND u.is_active
      JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
      WHERE a.cadre_user_id = $1
    ), guardian AS (
      SELECT pp.id, pp.full_name, left(pp.nik,4) || '************' AS nik, pp.phone
      FROM parent_profiles pp JOIN users u ON u.id = pp.user_id AND u.is_active
      JOIN roles r ON r.id = u.role_id AND r.name = 'orang_tua'
      WHERE pp.nik = $2 AND lower(trim(pp.full_name)) = lower($7)
        AND regexp_replace(pp.phone, '[^0-9]', '', 'g') = regexp_replace($8, '[^0-9]', '', 'g')
        AND lower(trim(pp.address)) = lower($9)
    ), added AS (
      INSERT INTO children (posyandu_id, full_name, birth_date, gender, allergy_notes, created_by, registration_status)
      SELECT a.posyandu_id, $3, $4, $5, NULLIF($6,''), $1, 'pending'
      FROM assignment a WHERE (SELECT count(*) FROM assignment) = 1 AND (SELECT count(*) FROM guardian) = 1
      RETURNING *
    ), linked AS (
      INSERT INTO child_guardians (child_id, parent_profile_id, relationship, is_primary)
      SELECT c.id, g.id, 'Orang Tua', true FROM added c CROSS JOIN guardian g
      RETURNING child_id
    )
    SELECT c.id, c.full_name AS name, c.birth_date::text AS "birthDate", c.gender,
           c.registration_status AS "registrationStatus", p.id AS "posyanduId",
           p.name AS posyandu, g.full_name AS parent, g.nik, g.phone
    FROM added c JOIN linked l ON l.child_id = c.id JOIN posyandu p ON p.id = c.posyandu_id
    CROSS JOIN guardian g
  `, [req.user.sub, data.nik, data.name, data.birth, data.gender, data.notes, data.parent, data.phone, data.address]);

  if (!child) {
    return res.status(422).json({ success: false, message: "Pastikan identitas sesuai akun orang tua terdaftar dan kader memiliki tepat satu Posyandu aktif." });
  }
  res.status(201).json({ success: true, data: child });
});

router.get("/profile", authenticateToken, allowRoles("kader"), async (req, res) => {
  const { rows: [profile] } = await pool.query(`
    SELECT u.id, u.username, cp.full_name AS name, cp.phone,
      ARRAY(SELECT p.name || COALESCE(' (RW ' || p.rw || ')', '')
        FROM cadre_posyandu a JOIN posyandu p ON p.id = a.posyandu_id AND p.is_active
        WHERE a.cadre_user_id = u.id ORDER BY p.name, p.id) AS areas
    FROM users u JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
    JOIN cadre_profiles cp ON cp.user_id = u.id
    WHERE u.id = $1 AND u.is_active
  `, [req.user.sub]);
  if (!profile) return res.status(404).json({ success: false, message: "Profil kader tidak ditemukan." });
  res.json({ success: true, data: profile });
});

router.patch("/profile", authenticateToken, allowRoles("kader"), async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(2).max(150),
    phone: z.string().trim().regex(/^(?:[+0-9][0-9 -]{7,24})?$/),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Periksa nama dan nomor WhatsApp." });

  const { rows: [profile] } = await pool.query(`
    UPDATE cadre_profiles cp SET full_name = $2, phone = NULLIF($3, ''), updated_at = now()
    FROM users u JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
    WHERE cp.user_id = u.id AND u.id = $1 AND u.is_active
    RETURNING cp.full_name AS name, cp.phone
  `, [req.user.sub, parsed.data.name, parsed.data.phone]);
  if (!profile) return res.status(404).json({ success: false, message: "Profil kader tidak ditemukan." });
  res.json({ success: true, data: profile });
});

module.exports = router;
