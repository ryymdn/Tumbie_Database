const express = require("express");
const { z } = require("zod");
const pool = require("../config/database");
const { authenticateToken, allowRoles } = require("../middleware/auth");

const router = express.Router();
const id = z.string().regex(/^[1-9]\d{0,17}$/);
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
const schema = z.object({
  posyanduId: id,
  title: z.string().trim().min(1).max(150),
  date: z.iso.date(),
  start: time,
  end: time,
  place: z.string().trim().min(1).max(200),
  quota: z.number().int().min(1).max(10000),
  midwife: z.string().trim().max(150),
  services: z.array(z.string().trim().min(1).max(150)).max(20),
  staff: z.array(id).max(100),
});

const cadreScope = `EXISTS (
  SELECT 1 FROM cadre_posyandu a JOIN users u ON u.id = a.cadre_user_id AND u.is_active
  JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
  WHERE a.posyandu_id = p.id AND a.cadre_user_id = $1
)`;
const parentScope = `EXISTS (
  SELECT 1 FROM children c JOIN child_guardians g ON g.child_id = c.id
  JOIN parent_profiles pp ON pp.id = g.parent_profile_id
  JOIN users u ON u.id = pp.user_id AND u.is_active
  JOIN roles r ON r.id = u.role_id AND r.name = 'orang_tua'
  WHERE c.posyandu_id = p.id AND pp.user_id = $1
)`;

router.use(authenticateToken, allowRoles("kader", "orang_tua"));

router.get("/", async (req, res) => {
  const cadre = req.user.role === "kader";
  const scope = cadre ? cadreScope : parentScope;
  const [locations, schedules] = await Promise.all([
    pool.query(`
      SELECT p.id, p.name, p.rw
      ${cadre ? `, ARRAY(
        SELECT jsonb_build_object('id', u.id::text, 'name', COALESCE(cp.full_name, u.username))
        FROM cadre_posyandu a JOIN users u ON u.id = a.cadre_user_id AND u.is_active
        JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
        LEFT JOIN cadre_profiles cp ON cp.user_id = u.id
        WHERE a.posyandu_id = p.id ORDER BY COALESCE(cp.full_name, u.username), u.id
      ) AS staff` : ""}
      FROM posyandu p WHERE p.is_active AND ${scope} ORDER BY p.name, p.id
    `, [req.user.sub]),
    pool.query(`
      SELECT s.id, s.title, s.description, s.event_date::text AS date,
        to_char(s.start_time, 'HH24:MI') AS start, to_char(s.end_time, 'HH24:MI') AS end,
        s.location AS place, s.quota, s.midwife_name AS midwife, s.status,
        p.id AS "posyanduId", p.name AS posyandu,
        (SELECT count(*)::int FROM schedule_queue q WHERE q.schedule_id = s.id) AS "queueCount",
        ${cadre ? "" : `ARRAY(
          SELECT q.child_id::text FROM schedule_queue q
          JOIN child_guardians g ON g.child_id = q.child_id
          JOIN parent_profiles pp ON pp.id = g.parent_profile_id
          WHERE q.schedule_id = s.id AND pp.user_id = $1
        ) AS "registeredChildIds",`}
        ARRAY(SELECT ss.service_name FROM schedule_services ss WHERE ss.schedule_id = s.id ORDER BY ss.id) AS services
        ${cadre ? `, ARRAY(SELECT st.cadre_user_id::text FROM schedule_staff st WHERE st.schedule_id = s.id ORDER BY st.cadre_user_id) AS staff` : ""}
      FROM schedules s JOIN posyandu p ON p.id = s.posyandu_id AND p.is_active
      WHERE ${scope} ${cadre ? "" : "AND s.status IN ('upcoming', 'ongoing')"}
      ORDER BY s.event_date, s.start_time, s.id
    `, [req.user.sub]),
  ]);
  res.json({ success: true, data: { locations: locations.rows, schedules: schedules.rows } });
});

router.post("/", allowRoles("kader"), saveSchedule);
router.patch("/:id", allowRoles("kader"), saveSchedule);

async function saveSchedule(req, res) {
  const scheduleId = req.params.id;
  if (scheduleId && !id.safeParse(scheduleId).success) {
    return res.status(400).json({ success: false, message: "ID jadwal tidak valid." });
  }
  const parsed = schema.safeParse(req.body);
  if (!parsed.success || parsed.data.end <= parsed.data.start) {
    return res.status(400).json({ success: false, message: "Periksa tanggal, jam, lokasi, dan kuota sesi." });
  }
  const data = parsed.data;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const location = await client.query(`
      SELECT p.id FROM posyandu p WHERE p.is_active AND p.id = $2 AND ${cadreScope}
    `, [req.user.sub, data.posyanduId]);
    if (!location.rowCount) {
      await client.query("ROLLBACK");
      return res.status(403).json({ success: false, message: "Posyandu berada di luar wilayah tugas kader." });
    }
    const staffIds = [...new Set(data.staff)];
    if (staffIds.length) {
      const assigned = await client.query(`
        SELECT u.id FROM cadre_posyandu a JOIN users u ON u.id = a.cadre_user_id AND u.is_active
        JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
        WHERE a.posyandu_id = $1 AND u.id = ANY($2::bigint[])
      `, [data.posyanduId, staffIds]);
      if (assigned.rowCount !== staffIds.length) {
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, message: "Kader jaga harus bertugas di Posyandu yang sama." });
      }
    }
    const values = [data.posyanduId, req.user.sub, data.title, data.date, data.start,
      data.end, data.place, data.quota, data.midwife];
    const { rows: [schedule] } = scheduleId
      ? await client.query(`
        UPDATE schedules
        SET title = $3, event_date = $4, start_time = $5, end_time = $6,
            location = $7, quota = $8, midwife_name = NULLIF($9,''), updated_at = now()
        WHERE id = $10 AND posyandu_id = $1 AND status = 'upcoming'
          AND EXISTS (
            SELECT 1 FROM posyandu p WHERE p.id = $1 AND p.is_active AND EXISTS (
              SELECT 1 FROM cadre_posyandu a JOIN users u ON u.id = a.cadre_user_id AND u.is_active
              JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
              WHERE a.posyandu_id = p.id AND a.cadre_user_id = $2
            )
          )
        RETURNING id
      `, [...values, scheduleId])
      : await client.query(`
        INSERT INTO schedules (posyandu_id, created_by, title, event_date, start_time, end_time,
          location, quota, midwife_name, status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULLIF($9,''),'upcoming') RETURNING id
      `, values);
    if (!schedule) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Jadwal terjadwal di wilayah tugas tidak ditemukan." });
    }
    if (scheduleId) {
      const { rows: [queue] } = await client.query(
        "SELECT count(*)::int AS count FROM schedule_queue WHERE schedule_id = $1", [schedule.id]
      );
      if (queue.count > data.quota) {
        await client.query("ROLLBACK");
        return res.status(409).json({ success: false, message: "Kuota tidak boleh di bawah jumlah pendaftar." });
      }
      await client.query("DELETE FROM schedule_services WHERE schedule_id = $1", [schedule.id]);
      await client.query("DELETE FROM schedule_staff WHERE schedule_id = $1", [schedule.id]);
    }
    await client.query("INSERT INTO schedule_services (schedule_id, service_name) SELECT $1, unnest($2::text[])",
      [schedule.id, [...new Set(data.services)]]);
    await client.query("INSERT INTO schedule_staff (schedule_id, cadre_user_id) SELECT $1, unnest($2::bigint[])",
      [schedule.id, staffIds]);
    await client.query("COMMIT");
    res.status(scheduleId ? 200 : 201).json({ success: true, data: schedule });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = router;
