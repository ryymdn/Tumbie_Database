const express = require("express");
const pool = require("../config/database");
const { authenticateToken, allowRoles } = require("../middleware/auth");

const router = express.Router();
const validId = (value) => typeof value === "string" && /^[1-9]\d{0,17}$/.test(value);
const guardian = `EXISTS (
  SELECT 1 FROM child_guardians g JOIN parent_profiles pp ON pp.id = g.parent_profile_id
  JOIN users u ON u.id = pp.user_id AND u.is_active
  JOIN roles r ON r.id = u.role_id AND r.name = 'orang_tua'
  WHERE g.child_id = c.id AND pp.user_id = $1
)`;
const cadre = `EXISTS (
  SELECT 1 FROM cadre_posyandu a
  JOIN users u ON u.id = a.cadre_user_id AND u.is_active
  JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
  JOIN posyandu p ON p.id = a.posyandu_id AND p.is_active
  WHERE a.cadre_user_id = $1 AND a.posyandu_id = s.posyandu_id
)`;

router.use(authenticateToken);

router.get("/:scheduleId/queue", allowRoles("kader"), async (req, res) => {
  if (!validId(req.params.scheduleId)) return res.status(400).json({ success: false, message: "ID jadwal tidak valid." });
  const { rows: [result] } = await pool.query(`
    SELECT ARRAY(
      SELECT jsonb_build_object('childId', c.id::text, 'name', c.full_name, 'attended', q.attended)
      FROM schedule_queue q JOIN children c ON c.id = q.child_id
      WHERE q.schedule_id = s.id AND c.posyandu_id = s.posyandu_id ORDER BY q.created_at, q.child_id
    ) AS queue
    FROM schedules s WHERE s.id = $2 AND ${cadre}
  `, [req.user.sub, req.params.scheduleId]);
  if (!result) return res.status(404).json({ success: false, message: "Jadwal tidak ditemukan." });
  res.json({ success: true, data: result.queue });
});

router.patch("/:scheduleId/queue/:childId", allowRoles("kader"), async (req, res) => {
  const { scheduleId, childId } = req.params;
  if (!validId(scheduleId) || !validId(childId) || typeof req.body?.attended !== "boolean") {
    return res.status(400).json({ success: false, message: "Periksa data kehadiran." });
  }
  const { rows: [result] } = await pool.query(`
    UPDATE schedule_queue q SET attended = $4
    FROM schedules s JOIN children c ON c.posyandu_id = s.posyandu_id AND c.id = $3
    WHERE q.schedule_id = s.id AND q.child_id = c.id AND s.id = $2
      AND s.status IN ('upcoming', 'ongoing') AND ${cadre}
    RETURNING q.attended
  `, [req.user.sub, scheduleId, childId, req.body.attended]);
  if (!result) return res.status(404).json({ success: false, message: "Pendaftar pada jadwal aktif tidak ditemukan." });
  res.json({ success: true, data: result });
});

router.post("/:scheduleId/queue/:childId", allowRoles("orang_tua"), signup);

async function signup(req, res) {
  const { scheduleId, childId } = req.params;
  if (!validId(scheduleId) || !validId(childId)) {
    return res.status(400).json({ success: false, message: "ID jadwal atau anak tidak valid." });
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: [session] } = await client.query(`
      SELECT s.quota
      FROM schedules s JOIN posyandu p ON p.id = s.posyandu_id AND p.is_active
      JOIN children c ON c.id = $3 AND c.posyandu_id = s.posyandu_id
      WHERE s.id = $2 AND s.status IN ('upcoming', 'ongoing')
        AND s.event_date >= (now() AT TIME ZONE 'Asia/Jakarta')::date
        AND c.registration_status = 'verified' AND ${guardian}
      FOR UPDATE OF s
    `, [req.user.sub, scheduleId, childId]);
    if (!session) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Jadwal aktif untuk anak terverifikasi tidak ditemukan." });
    }
    const { rows: [state] } = await client.query(`
      SELECT count(*)::int AS count, coalesce(bool_or(child_id = $2), false) AS registered
      FROM schedule_queue WHERE schedule_id = $1
    `, [scheduleId, childId]);
    if (!state.registered && session.quota != null && state.count >= session.quota) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, message: "Kuota sesi sudah penuh." });
    }
    if (!state.registered) {
      await client.query("INSERT INTO schedule_queue (schedule_id, child_id) VALUES ($1,$2)", [scheduleId, childId]);
    }
    await client.query("COMMIT");
    res.status(state.registered ? 200 : 201).json({ success: true, data: { scheduleId, childId, queueCount: state.count + (state.registered ? 0 : 1) } });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = router;
