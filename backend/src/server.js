require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174")
    .split(",").map((value) => value.trim()),
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ success: true, message: "API Posyandu Tumbie berjalan." });
});

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database, NOW() AS server_time"
    );
    res.json({ success: true, message: "Database berhasil terhubung.", data: result.rows[0] });
  } catch (error) {
    console.error("Health check database error:", error.message);
    res.status(500).json({ success: false, message: "Database gagal terhubung." });
  }
});

app.get("/api/posyandu", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, rw FROM public.posyandu WHERE is_active = true ORDER BY name, id"
  );
  res.json({ success: true, data: rows });
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak percobaan. Coba lagi beberapa saat." },
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/children", require("./routes/childRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoutes"));
app.use("/api/schedules", require("./routes/scheduleQueueRoutes"));
app.use("/api/cadre/examinations", require("./routes/examinationRoutes"));
app.use("/api/cadre/inventory", require("./routes/inventoryRoutes"));
app.use("/api/cadre", require("./routes/cadreRoutes"));

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

app.use((error, _req, res, _next) => {
  console.error("API error:", error.message);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server.",
  });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Server Posyandu Tumbie berjalan di http://localhost:${PORT}`);
});
