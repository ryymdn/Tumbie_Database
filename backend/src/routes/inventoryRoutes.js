const express = require("express");
const { z } = require("zod");
const pool = require("../config/database");
const { authenticateToken, allowRoles } = require("../middleware/auth");

const router = express.Router();
const scope = `EXISTS (
  SELECT 1 FROM cadre_posyandu a
  JOIN users u ON a.cadre_user_id = u.id AND u.is_active
  JOIN roles r ON r.id = u.role_id AND r.name = 'kader'
  WHERE a.posyandu_id = p.id AND a.cadre_user_id = $1
)`;
const schema = z.object({
  posyanduId: z.string().regex(/^[1-9]\d{0,17}$/),
  item: z.enum(["vitamin_a", "immunization", "pmt"]),
  quantity: z.number().int().min(0).max(1000000),
});

router.use(authenticateToken, allowRoles("kader"));

router.get("/", async (req, res) => {
  const { rows } = await pool.query(`
    SELECT p.id, p.name, COALESCE(jsonb_object_agg(i.item, i.quantity)
      FILTER (WHERE i.item IS NOT NULL), '{}'::jsonb) AS stock
    FROM posyandu p LEFT JOIN posyandu_inventory i ON i.posyandu_id = p.id
    WHERE p.is_active AND ${scope}
    GROUP BY p.id, p.name ORDER BY p.name, p.id
  `, [req.user.sub]);
  res.json({ success: true, data: rows });
});

router.put("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: "Periksa Posyandu, jenis barang, dan jumlah stok." });
  const { posyanduId, item, quantity } = parsed.data;
  const { rows: [saved] } = await pool.query(`
    INSERT INTO posyandu_inventory (posyandu_id, item, quantity, updated_by)
    SELECT p.id, $3, $4, $1 FROM posyandu p
    WHERE p.id = $2 AND p.is_active AND ${scope}
    ON CONFLICT (posyandu_id, item) DO UPDATE
    SET quantity = EXCLUDED.quantity, updated_by = EXCLUDED.updated_by, updated_at = now()
    RETURNING item, quantity
  `, [req.user.sub, posyanduId, item, quantity]);
  if (!saved) return res.status(403).json({ success: false, message: "Posyandu berada di luar wilayah tugas kader." });
  res.json({ success: true, data: saved });
});

module.exports = router;
