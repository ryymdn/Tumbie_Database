const express = require("express");
const { z } = require("zod");
const pool = require("../config/database");
const { assessWeightForAge } = require("../services/weightForAge");
const { assessLengthHeight } = require("../services/lengthHeight");
const { authenticateToken, allowRoles } = require("../middleware/auth");

const router = express.Router();
const fields = 'c.id, c.full_name AS name, c.birth_date::text AS "birthDate", c.gender, p.name AS posyandu, c.blood_type AS "bloodType", c.allergy_notes AS note, (c.registration_status = \'verified\') AS verified';
const schema = z.object({
  name: z.string().trim().min(1).max(150),
  birthDate: z.iso.date(),
  gender: z.enum(["Laki-laki", "Perempuan"]),
  posyandu: z.string().regex(/^[1-9]\d{0,17}$/),
  birthWeight: z.number().positive().max(99),
  birthLength: z.number().positive().max(999),
  headCircumference: z.number().positive().max(999).nullable(),
  bloodType: z.enum(["Belum Diketahui", "A", "B", "AB", "O"]),
  note: z.string().trim().max(2000),
});

router.use(authenticateToken, allowRoles("orang_tua"));

router.get("/", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT ${fields},
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', e.id::text, 'date', e.examination_date::text,
          'weight', e.weight_kg, 'height', e.height_cm, 'head', e.head_cm, 'position', e.measurement_position,
          'officer', e.health_worker_name,
          'vaccines', ARRAY(
            SELECT concat_ws(' ', t.name, i.dose)
            FROM examination_immunizations i JOIN immunization_types t ON t.id = i.immunization_type_id
            WHERE i.examination_id = e.id ORDER BY i.id
          ),
          'pmt', ARRAY(
            SELECT t.name FROM examination_pmt m JOIN pmt_types t ON t.id = m.pmt_type_id
            WHERE m.examination_id = e.id ORDER BY m.id
          ),
          'vitA', e.vitamin_a_given, 'worm', e.deworming_given
        ) ORDER BY e.examination_date DESC NULLS LAST, e.id DESC)
        FROM examinations e WHERE e.child_id = c.id
      ), '[]'::jsonb) AS exams
    FROM children c JOIN posyandu p ON p.id = c.posyandu_id
    WHERE EXISTS (
      SELECT 1 FROM child_guardians g
      JOIN parent_profiles pp ON pp.id = g.parent_profile_id
      JOIN users u ON u.id = pp.user_id AND u.is_active
      WHERE g.child_id = c.id AND pp.user_id = $1
    )
    ORDER BY c.id
  `, [req.user.sub]);
  const data = rows.map((child) => ({
    ...child,
    exams: child.exams.map((exam) => {
      const weightForAge = assessWeightForAge(child.birthDate, exam.date, child.gender, exam.weight);
      return {
        ...exam,
        weightForAge,
        ...assessLengthHeight({ birthDate: child.birthDate, examDate: exam.date, gender: child.gender, height: exam.height, weight: exam.weight, position: exam.position }),
      };
    }),
  }));
  res.json({ success: true, data });
});

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(new Date());
  if (!parsed.success || parsed.data.birthDate > today) {
    return res.status(400).json({ success: false, message: "Periksa kembali isian data anak dan tanggal lahir." });
  }
  const { name, birthDate, gender, posyandu, birthWeight, birthLength, headCircumference, bloodType, note } = parsed.data;
  const { rows } = await pool.query(`
    WITH guardian AS (
      SELECT pp.id FROM parent_profiles pp
      JOIN users u ON u.id = pp.user_id AND u.is_active
      WHERE pp.user_id = $1
    ), new_child AS (
      INSERT INTO children (posyandu_id, full_name, birth_date, gender, birth_weight,
        birth_length, birth_head_circumference, blood_type, allergy_notes, registration_status, created_by)
      SELECT p.id, $3, $4, $5, $6, $7, $8, $9, NULLIF($10, ''), 'pending', $1
      FROM posyandu p
      WHERE p.id = $2 AND p.is_active AND EXISTS (SELECT 1 FROM guardian)
      RETURNING *
    ), linked AS (
      INSERT INTO child_guardians (child_id, parent_profile_id, relationship, is_primary)
      SELECT c.id, g.id, 'Orang Tua', true FROM new_child c CROSS JOIN guardian g
      RETURNING child_id
    )
    SELECT ${fields}
    FROM new_child c JOIN posyandu p ON p.id = c.posyandu_id
    WHERE EXISTS (SELECT 1 FROM linked WHERE child_id = c.id)
  `, [req.user.sub, posyandu, name, birthDate, gender, birthWeight, birthLength, headCircumference, bloodType, note]);

  if (!rows.length) {
    return res.status(422).json({ success: false, message: "Profil orang tua atau Posyandu aktif tidak ditemukan." });
  }
  res.status(201).json({ success: true, data: rows[0] });
});

module.exports = router;
