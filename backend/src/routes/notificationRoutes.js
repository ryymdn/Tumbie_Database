const express = require("express");
const pool = require("../config/database");
const { authenticateToken, allowRoles } = require("../middleware/auth");

const router = express.Router();
router.use(authenticateToken, allowRoles("kader", "orang_tua"));

const cadreEvents = `
  SELECT 'registration:' || c.id AS key, 'registration' AS type,
         c.id::text AS "childId", c.full_name AS name, c.created_at AS "createdAt"
  FROM children c
  JOIN posyandu p ON p.id = c.posyandu_id AND p.is_active
  WHERE c.registration_status = 'pending'
    AND EXISTS (SELECT 1 FROM cadre_posyandu a
                WHERE a.cadre_user_id = $1 AND a.posyandu_id = c.posyandu_id)
`;

const parentEvents = `
  WITH own_children AS (
    SELECT c.* FROM children c
    WHERE EXISTS (
      SELECT 1 FROM child_guardians g JOIN parent_profiles pp ON pp.id = g.parent_profile_id
      WHERE g.child_id = c.id AND pp.user_id = $1
    )
  )
  SELECT 'verified:' || c.id AS key, 'verified' AS type,
         c.id::text AS "childId", c.full_name AS name, c.updated_at AS "createdAt"
  FROM own_children c WHERE c.registration_status = 'verified'
  UNION ALL
  SELECT 'exam:' || e.id, 'exam', c.id::text, c.full_name, e.created_at
  FROM examinations e JOIN own_children c ON c.id = e.child_id
  UNION ALL
  SELECT DISTINCT 'schedule:' || s.id || ':' || extract(epoch FROM s.updated_at)::text,
         CASE WHEN s.status = 'cancelled' THEN 'schedule_cancelled' ELSE 'schedule_updated' END,
         NULL::text, s.title, s.updated_at
  FROM schedules s JOIN schedule_queue q ON q.schedule_id = s.id
  JOIN own_children c ON c.id = q.child_id
  WHERE s.updated_at > s.created_at AND q.created_at <= s.updated_at
`;

function eventsFor(role) {
  return role === "kader" ? cadreEvents : parentEvents;
}

router.get("/", async (req, res) => {
  const { rows } = await pool.query(`
    WITH events AS (${eventsFor(req.user.role)})
    SELECT events.*, (nr.read_at IS NOT NULL) AS read
    FROM events LEFT JOIN notification_reads nr
      ON nr.user_id = $1 AND nr.notification_key = events.key
    ORDER BY events."createdAt" DESC NULLS LAST, events.key DESC
    LIMIT 30
  `, [req.user.sub]);
  res.set("Cache-Control", "no-store");
  res.json({ success: true, data: rows });
});

router.post("/read", async (req, res) => {
  const key = req.body?.key;
  if (typeof key !== "string" || key.length > 100 || !key.length) {
    return res.status(400).json({ success: false, message: "Notifikasi tidak valid." });
  }
  await pool.query(`
    WITH events AS (${eventsFor(req.user.role)})
    INSERT INTO notification_reads (user_id, notification_key)
    SELECT $1, events.key FROM events WHERE events.key = $2
    ON CONFLICT DO NOTHING
  `, [req.user.sub, key]);
  res.json({ success: true, data: { read: true } });
});

module.exports = router;
