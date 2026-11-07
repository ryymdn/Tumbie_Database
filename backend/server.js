
const express = require("express");

const app = express();

// Middleware untuk membaca JSON dari Postman
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Halaman utama
app.get("/", (req, res) => {
    res.send("Backend Posyandu Tumbie berhasil berjalan!");
});

// Import routes
const anakRoutes = require("./routes/anak");
const pemeriksaanRoutes = require("./routes/pemeriksaan");
const userRoutes = require("./routes/user");
const ibuRoutes = require("./routes/ibu");
const jadwalPosyanduRoutes = require("./routes/jadwal_posyandu");
const notifikasiRoutes = require("./routes/notifikasi");
const pesertaJadwalRoutes = require("./routes/peserta_jadwal");

// Daftarkan routes
app.use("/api/anak", anakRoutes);
app.use("/api/pemeriksaan", pemeriksaanRoutes);
app.use("/api/user", userRoutes);
app.use("/api/ibu", ibuRoutes);
app.use("/api/jadwal_posyandu", jadwalPosyanduRoutes);
app.use("/api/notifikasi", notifikasiRoutes);
app.use("/api/peserta_jadwal", pesertaJadwalRoutes);

// Menjalankan server 
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});