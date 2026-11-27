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


router.patch("/children/:id", authenticateToken, allowRoles("kader"), async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(1).max(150),
    birthDate: z.iso.date(),
    gender: z.enum(["Laki-laki", "Perempuan"]),
  }).safeParse(req.body);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
  if (!/^[1-9][0-9]{0,17}$/.test(req.params.id) || !parsed.success || parsed.data.birthDate > today) {
    return res.status(400).json({ success: false, message: "Periksa nama, tanggal lahir, dan jenis kelamin anak." });
  }

  const { name, birthDate, gender } = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const scoped = await client.query(`
      SELECT c.id FROM children c
      JOIN posyandu p ON p.id = c.posyandu_id AND p.is_active
      WHERE c.id = $1 AND EXISTS (
        SELECT 1 FROM cadre_posyandu a
        JOIN users u ON u.id = a.cadre_user_id AND u.is_active
        JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
        WHERE a.cadre_user_id = $2 AND a.posyandu_id = c.posyandu_id
      ) FOR UPDATE OF c
    `, [req.params.id, req.user.sub]);
    if (!scoped.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Anak tidak ditemukan di wilayah tugas kader." });
    }

    const earlierExam = await client.query(
      "SELECT 1 FROM examinations WHERE child_id = $1 AND examination_date < $2 LIMIT 1",
      [req.params.id, birthDate]
    );
    if (earlierExam.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, message: "Tanggal lahir tidak boleh setelah tanggal pemeriksaan yang sudah tersimpan." });
    }

    const { rows: [child] } = await client.query(`
      UPDATE children SET full_name = $2, birth_date = $3, gender = $4, updated_at = now()
      WHERE id = $1
      RETURNING id, full_name AS name, birth_date::text AS "birthDate", gender, registration_status AS "registrationStatus"
    `, [req.params.id, name, birthDate, gender]);
    await client.query("COMMIT");
    res.json({ success: true, data: child });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

router.delete("/children/:id", authenticateToken, allowRoles("kader"), async (req, res) => {
  const childId = req.params.id;
  if (!/^[1-9][0-9]{0,17}$/.test(childId)) {
    return res.status(400).json({ success: false, message: "ID anak tidak valid." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const scoped = await client.query(`
      SELECT c.id FROM children c JOIN posyandu p ON p.id = c.posyandu_id AND p.is_active
      WHERE c.id = $1 AND EXISTS (
        SELECT 1 FROM cadre_posyandu a
        JOIN users u ON u.id = a.cadre_user_id AND u.is_active
        JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
        WHERE a.cadre_user_id = $2 AND a.posyandu_id = c.posyandu_id
      ) FOR UPDATE OF c
    `, [childId, req.user.sub]);
    if (!scoped.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Anak tidak ditemukan di wilayah tugas kader." });
    }
    const { rows: [usage] } = await client.query(`
      SELECT EXISTS (SELECT 1 FROM examinations WHERE child_id = $1)
          OR EXISTS (SELECT 1 FROM schedule_queue WHERE child_id = $1) AS used
    `, [childId]);
    if (usage.used) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, message: "Data anak masih memiliki riwayat pemeriksaan atau pendaftaran jadwal." });
    }
    await client.query("DELETE FROM children WHERE id = $1", [childId]);
    await client.query("COMMIT");
    res.json({ success: true, data: { id: childId } });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

const registrationLocations = `
  SELECT p.id AS posyandu_id, p.name, p.rw FROM cadre_posyandu a
  JOIN posyandu p ON p.id = a.posyandu_id AND p.is_active
  WHERE a.cadre_user_id = $1
`;

router.get("/locations", authenticateToken, allowRoles("kader"), async (req, res) => {
  const { rows } = await pool.query(`
    SELECT locations.posyandu_id::text AS id, locations.name, locations.rw
    FROM (${registrationLocations}) locations
    ORDER BY locations.name, locations.posyandu_id
  `, [req.user.sub]);
  res.json({ success: true, data: rows });
});

const guardianScope = `
  NOT EXISTS (SELECT 1 FROM child_guardians g WHERE g.parent_profile_id = pp.id)
  OR EXISTS (
    SELECT 1 FROM child_guardians g JOIN children c ON c.id = g.child_id
    JOIN assignment a ON a.posyandu_id = c.posyandu_id
    WHERE g.parent_profile_id = pp.id
  )
`;

router.post("/guardian-lookup", authenticateToken, allowRoles("kader"), async (req, res) => {
  const input = z.object({ nik: z.string().trim().regex(/^[0-9]{16}$/) }).safeParse(req.body);
  if (!input.success) return res.status(400).json({ success: false, message: "Masukkan NIK orang tua 16 digit." });
  const { rows: [result] } = await pool.query(`
    WITH assignment AS (${registrationLocations})
    SELECT
      (SELECT jsonb_build_object('name', pp.full_name)
       FROM parent_profiles pp JOIN users u ON u.id = pp.user_id AND u.is_active
       JOIN roles r ON r.id = u.role_id AND r.name = 'orang_tua'
       WHERE pp.nik = $2 AND (${guardianScope}) AND EXISTS (SELECT 1 FROM assignment)
       LIMIT 1) AS parent,
      (SELECT COALESCE(jsonb_agg(jsonb_build_object('id', posyandu_id::text, 'name', name, 'rw', rw) ORDER BY name), '[]'::jsonb)
       FROM assignment) AS locations
  `, [req.user.sub, input.data.nik]);
  if (!result.locations.length) return res.status(422).json({ success: false, message: "Akun kader belum memiliki penugasan Posyandu aktif." });
  if (!result.parent) return res.status(404).json({ success: false, message: "Akun orang tua tidak ditemukan untuk wilayah tugas ini. Periksa NIK dan pastikan akun sudah terdaftar." });
  res.set("Cache-Control", "no-store");
  res.json({ success: true, data: result });
});

router.post("/children", authenticateToken, allowRoles("kader"), async (req, res) => {
  const parsed = z.object({
    name: z.string().trim().min(1).max(150),
    birth: z.iso.date(),
    gender: z.enum(["Laki-laki", "Perempuan"]),
    notes: z.string().trim().max(2000),
    nik: z.string().trim().regex(/^[0-9]{16}$/),
    posyanduId: z.string().regex(/^[1-9][0-9]{0,17}$/).optional(),
    parent: z.string().trim().min(1).max(150).optional(),
    phone: z.string().trim().min(8).max(25).optional(),
    address: z.string().trim().min(5).max(1000).optional(),
  }).safeParse(req.body);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
  if (!parsed.success || parsed.data.birth > today) {
    return res.status(400).json({ success: false, message: "Periksa data balita, tanggal lahir, dan identitas wali." });
  }
  const data = parsed.data;
  const { rows: [child] } = await pool.query(`
    WITH assignment AS (${registrationLocations}), guardian AS (
      SELECT pp.id, pp.full_name, left(pp.nik,4) || '************' AS nik, pp.phone
      FROM parent_profiles pp JOIN users u ON u.id = pp.user_id AND u.is_active
      JOIN roles r ON r.id = u.role_id AND r.name = 'orang_tua'
      WHERE pp.nik = $2 AND (
        ($10::bigint IS NOT NULL AND (${guardianScope}))
        OR ($10 IS NULL AND lower(trim(pp.full_name)) = lower($7)
          AND regexp_replace(pp.phone, '[^0-9]', '', 'g') = regexp_replace($8, '[^0-9]', '', 'g')
          AND lower(trim(pp.address)) = lower($9))
      )
    ), added AS (
      INSERT INTO children (posyandu_id, full_name, birth_date, gender, allergy_notes, created_by, registration_status)
      SELECT a.posyandu_id, $3, $4, $5, NULLIF($6,''), $1, 'pending'
      FROM assignment a
      WHERE a.posyandu_id = COALESCE($10::bigint, (SELECT min(posyandu_id) FROM assignment HAVING count(*) = 1))
        AND (SELECT count(*) FROM guardian) = 1
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
  `, [req.user.sub, data.nik, data.name, data.birth, data.gender, data.notes, data.parent, data.phone, data.address, data.posyanduId]);

  if (!child) {
    return res.status(422).json({ success: false, message: "Pastikan akun orang tua terdaftar dan Posyandu yang dipilih termasuk wilayah tugas kader." });
  }
  res.status(201).json({ success: true, data: child });
});

router.get("/profile", authenticateToken, allowRoles("kader"), async (req, res) => {
  const { rows: [profile] } = await pool.query(`
    SELECT u.id, u.username, cp.full_name AS name, cp.phone, cp.nik, cp.nip, cp.job_title AS "jobTitle",
      cp.area_label AS "areaLabel", cp.puskesmas,
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
    nik: z.string().trim().regex(/^(?:[0-9]{16})?$/).optional(),
    nip: z.string().trim().regex(/^(?:[0-9]{18})?$/).optional(),
    jobTitle: z.string().trim().max(100).optional(),
    areaLabel: z.string().trim().max(150).optional(),
    puskesmas: z.string().trim().max(150).optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Periksa biodata. NIK harus 16 digit, NIP 18 digit, jabatan maksimal 100 karakter, serta wilayah dan puskesmas maksimal 150 karakter." });

  const { rows: [profile] } = await pool.query(`
    UPDATE cadre_profiles cp SET full_name = $2, phone = NULLIF($3, ''),
      nik = CASE WHEN $4::text IS NULL THEN cp.nik ELSE NULLIF($4, '') END,
      nip = CASE WHEN $5::text IS NULL THEN cp.nip ELSE NULLIF($5, '') END,
      job_title = CASE WHEN $6::text IS NULL THEN cp.job_title ELSE NULLIF($6, '') END,
      area_label = CASE WHEN $7::text IS NULL THEN cp.area_label ELSE NULLIF($7, '') END,
      puskesmas = CASE WHEN $8::text IS NULL THEN cp.puskesmas ELSE NULLIF($8, '') END,
      updated_at = now()
    FROM users u JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
    WHERE cp.user_id = u.id AND u.id = $1 AND u.is_active
    RETURNING cp.full_name AS name, cp.phone, cp.nik, cp.nip, cp.job_title AS "jobTitle", cp.area_label AS "areaLabel", cp.puskesmas
  `, [req.user.sub, parsed.data.name, parsed.data.phone, parsed.data.nik, parsed.data.nip, parsed.data.jobTitle, parsed.data.areaLabel, parsed.data.puskesmas]);
  if (!profile) return res.status(404).json({ success: false, message: "Profil kader tidak ditemukan." });
  res.json({ success: true, data: profile });
});

module.exports = router;
