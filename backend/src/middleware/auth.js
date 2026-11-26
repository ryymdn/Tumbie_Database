const jwt = require("jsonwebtoken");
const pool = require("../config/database");

async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Token autentikasi tidak ditemukan.",
    });
  }

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET, { issuer: "tumbie-api", algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({
      success: false,
      message: "Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.",
    });
  }
  const { rows: [account] } = await pool.query(`
    SELECT u.password_version, r.name AS role
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1 AND u.is_active
  `, [claims.sub]);
  if (!account || account.role !== claims.role || account.password_version !== (claims.pv ?? 0)) {
    return res.status(401).json({ success: false, message: "Sesi berakhir. Silakan masuk kembali." });
  }
  req.user = claims;
  return next();
}

function allowRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki izin untuk mengakses fitur ini.",
      });
    }
    return next();
  };
}

module.exports = { authenticateToken, allowRoles };
