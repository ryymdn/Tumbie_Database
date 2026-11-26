const express = require("express");
const pool = require("../config/database");
const { registerParent, login, me, changePassword } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const { requestPasswordReset, resetPassword } = require("../controllers/passwordResetController");

const router = express.Router();

router.post("/register", registerParent);
router.post("/login", login);
router.get("/me", authenticateToken, me);
router.post("/change-password", authenticateToken, changePassword);

router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/confirm", resetPassword);

router.get("/photo", authenticateToken, async (req, res) => {
  const { rows: [user] } = await pool.query("SELECT profile_photo FROM users WHERE id = $1", [req.user.sub]);
  const image = user?.profile_photo;
  res.set("Cache-Control", "no-store");
  res.json({ success: true, data: { photo: image ? "data:image/jpeg;base64," + image.toString("base64") : null } });
});

async function saveProfilePhoto(req, res, image) {
  const saved = await pool.query(
    "UPDATE users SET profile_photo = $2 WHERE id = $1 AND is_active AND password_version = $3 RETURNING id",
    [req.user.sub, image, req.user.pv ?? 0]
  );
  if (!saved.rowCount) return res.status(401).json({ success: false, message: "Sesi berakhir. Silakan masuk kembali." });
  res.set("Cache-Control", "no-store");
  res.json({ success: true, data: { photo: image ? "data:image/jpeg;base64," + image.toString("base64") : null } });
}

router.delete("/photo", authenticateToken, (req, res) => saveProfilePhoto(req, res, null));

router.post("/photo", authenticateToken, async (req, res) => {
  const content = req.body?.image;
  const image = typeof content === "string" && content.length <= 200000 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(content) ? Buffer.from(content, "base64") : null;
  if (!image || image.length < 5 || image[0] !== 255 || image[1] !== 216 ||
      image[2] !== 255 || image.at(-2) !== 255 || image.at(-1) !== 217 || image.toString("base64") !== content) {
    return res.status(400).json({ success: false, message: "Gunakan foto JPEG yang valid." });
  }
  return saveProfilePhoto(req, res, image);
});

module.exports = router;
