const express = require("express");
const { z } = require("zod");
const pool = require("../config/database");
const { assessWeightForAge } = require("../services/weightForAge");
const { assessLengthHeight } = require("../services/lengthHeight");
const { authenticateToken, allowRoles } = require("../middleware/auth");

const router = express.Router();
const vaccineNames = new Map([
  ["DPT-HB-Hib 3", ["DPT-HB-Hib", "3"]],
  ["Campak Rubella (MR)", ["MR", null]],
  ["Polio", ["Polio", null]],
  ["BCG", ["BCG", null]],
]);
const pmtNames = new Map([
  ["Telur Rebus (Protein Hewani)", "Telur"],
  ["Biskuit Balita Kemenkes", "Biskuit PMT"],
  ["Susu Kotak UHT Pertumbuhan", "Susu"],
]);
const schema = z.object({
  childId: z.string().regex(/^[1-9]\d{0,17}$/),
  date: z.iso.date(),
  bb: z.number().positive().max(99),
  tb: z.number().positive().max(250),
  lk: z.number().positive().max(100).nullable(),
  position: z.enum(["lying", "standing"]).optional(),
  vaccine: z.string().refine(v => v === "Tidak ada imunisasi" || vaccineNames.has(v) || /^[1-9]\d{0,17}$/.test(v)),
  vitA: z.boolean(),
  worm: z.boolean(),
  pmt: z.array(z.string().refine(v => pmtNames.has(v) || /^[1-9]\d{0,17}$/.test(v))),
  nakes: z.string().trim().max(150),
  notes: z.string().trim().max(3000),
});
const scope = `EXISTS (
  SELECT 1 FROM cadre_posyandu a
  JOIN posyandu p ON p.id = a.posyandu_id AND p.is_active
  JOIN users u ON u.id = a.cadre_user_id AND u.is_active
  JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
  WHERE a.cadre_user_id = $1 AND a.posyandu_id = c.posyandu_id
)`;

router.use(authenticateToken, allowRoles("kader"));

router.get("/immunization-types", async (_req, res) => {
  const { rows } = await pool.query("SELECT id, name FROM public.immunization_types ORDER BY id");
  res.json({ success: true, data: rows });
});

router.get("/pmt-types", async (_req, res) => {
  const { rows } = await pool.query("SELECT id, name FROM public.pmt_types ORDER BY id");
  res.json({ success: true, data: rows });
});

router.get("/", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT e.id, c.id AS "childId", c.full_name AS name, c.birth_date::text AS "birthDate", c.gender, e.examination_date::text AS date,
      e.weight_kg AS bb, e.height_cm AS tb, e.head_cm AS lk, e.measurement_position AS position,
      e.vitamin_a_given AS "vitA", e.deworming_given AS worm,
      e.health_worker_name AS officer, p.name AS posyandu,
      guardian.name AS mother, guardian.nik,
      ARRAY(SELECT concat_ws(' ', t.name, i.dose)
        FROM examination_immunizations i JOIN immunization_types t ON t.id = i.immunization_type_id
        WHERE i.examination_id = e.id ORDER BY i.id) AS vaccines,
      ARRAY(SELECT t.name FROM examination_pmt m JOIN pmt_types t ON t.id = m.pmt_type_id
        WHERE m.examination_id = e.id ORDER BY m.id) AS pmt
    FROM examinations e JOIN children c ON c.id = e.child_id
    JOIN posyandu p ON p.id = c.posyandu_id
    LEFT JOIN LATERAL (
      SELECT pp.full_name AS name, left(pp.nik, 4) || '************' AS nik
      FROM child_guardians g JOIN parent_profiles pp ON pp.id = g.parent_profile_id
      WHERE g.child_id = c.id ORDER BY g.is_primary DESC, g.id LIMIT 1
    ) guardian ON true
    WHERE ${scope}
    ORDER BY e.examination_date DESC NULLS LAST, e.id DESC
  `, [req.user.sub]);
  const data = rows.map((exam) => {
    const weightForAge = assessWeightForAge(exam.birthDate, exam.date, exam.gender, exam.bb);
    return {
      ...exam,
      weightForAge,
      ...assessLengthHeight({ birthDate: exam.birthDate, examDate: exam.date, gender: exam.gender, height: exam.tb, weight: exam.bb, position: exam.position }),
    };
  });
  res.json({ success: true, data });
});

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
  if (!parsed.success || parsed.data.date > today) {
    return res.status(400).json({ success: false, message: "Periksa tanggal, pengukuran, dan pilihan layanan pemeriksaan." });
  }

  const data = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: [child] } = await client.query(`
      SELECT c.id, c.birth_date::text AS birth, c.registration_status
      FROM children c WHERE ${scope} AND c.id = $2 FOR UPDATE OF c
    `, [req.user.sub, data.childId]);
    if (!child || child.registration_status !== "verified" || data.date < child.birth) {
      await client.query("ROLLBACK");
      return res.status(422).json({ success: false, message: "Pilih anak terverifikasi di wilayah tugas dan tanggal sejak anak lahir." });
    }
    const { rows: [exam] } = await client.query(`
      INSERT INTO examinations (child_id, examiner_id, examination_date, weight_kg, height_cm,
        head_cm, vitamin_a_given, deworming_given, health_worker_name, notes, measurement_position)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULLIF($9,''),NULLIF($10,''),$11) RETURNING id
    `, [child.id, req.user.sub, data.date, data.bb, data.tb, data.lk, data.vitA, data.worm, data.nakes, data.notes, data.position ?? null]);
    if (data.vaccine !== "Tidak ada imunisasi") {
      const legacy = vaccineNames.get(data.vaccine);
      const result = await client.query(`
        INSERT INTO examination_immunizations (examination_id, immunization_type_id, dose)
        SELECT $1, id, $3 FROM immunization_types
        WHERE ${legacy ? "name" : "id"} = $2
      `, [exam.id, legacy ? legacy[0] : data.vaccine, legacy?.[1] ?? null]);
      if (result.rowCount !== 1) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Jenis imunisasi tidak tersedia." });
      }
    }
    const pmt = [...new Set(data.pmt)];
    if (pmt.length) {
      const result = await client.query(`
        INSERT INTO examination_pmt (examination_id, pmt_type_id)
        SELECT $1, id FROM pmt_types WHERE id = ANY($2::bigint[]) OR name = ANY($3::text[])
      `, [exam.id, pmt.filter(item => !pmtNames.has(item)), pmt.filter(item => pmtNames.has(item)).map(item => pmtNames.get(item))]);
      if (result.rowCount !== pmt.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Pilihan PMT tidak tersedia atau duplikat." });
      }
    }
    await client.query("COMMIT");
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

router.patch("/:id/measurements", async (req, res) => {
  const examId = z.string().regex(/^[1-9]\d{0,17}$/).safeParse(req.params.id);
  const parsed = schema.pick({ bb: true, tb: true, lk: true, position: true }).required().safeParse(req.body);
  if (!examId.success || !parsed.success) {
    return res.status(400).json({ success: false, message: "Periksa berat, panjang atau tinggi, lingkar kepala, dan posisi ukur." });
  }
  const { bb, tb, lk, position } = parsed.data;
  const { rows: [updated] } = await pool.query(`
    UPDATE examinations e SET weight_kg = $3, height_cm = $4, head_cm = $5,
      measurement_position = $6, updated_at = now()
    FROM children c
    WHERE e.id = $2 AND c.id = e.child_id AND ${scope}
    RETURNING e.id
  `, [req.user.sub, examId.data, bb, tb, lk, position]);
  if (!updated) return res.status(404).json({ success: false, message: "Pemeriksaan tidak ditemukan di wilayah tugas." });
  res.json({ success: true, data: updated });
});

router.delete("/:id", async (req, res) => {
  const examId = req.params.id;
  if (!/^[1-9][0-9]{0,17}$/.test(examId)) {
    return res.status(400).json({ success: false, message: "ID pemeriksaan tidak valid." });
  }
  const { rows: [exam] } = await pool.query(`
    DELETE FROM examinations e USING children c
    WHERE e.id = $2 AND c.id = e.child_id AND ${scope}
    RETURNING e.id
  `, [req.user.sub, examId]);
  if (!exam) return res.status(404).json({ success: false, message: "Pemeriksaan tidak ditemukan di wilayah tugas kader." });
  res.json({ success: true, data: exam });
});

module.exports = router;
