
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET: Menampilkan semua data pemeriksaan
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        p.id_pemeriksaan,
        p.id_anak,
        a.nama_anak,
        TO_CHAR(p.tanggal_pemeriksaan, 'YYYY-MM-DD') AS tanggal_pemeriksaan,
        p.berat_badan,
        p.tinggi_badan,
        p.lingkar_kepala,
        p.jenis_imunisasi
      FROM pemeriksaan p
      JOIN anak a ON p.id_anak = a.id_anak
      ORDER BY p.id_pemeriksaan ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data pemeriksaan"
    });
  }
});

// GET: Menampilkan data pemeriksaan berdasarkan nama anak
router.get("/nama/:nama_anak", async (req, res) => {
  try {
    const { nama_anak } = req.params;

    const result = await pool.query(
      `SELECT
        p.id_pemeriksaan,
        p.id_anak,
        a.nama_anak,
        TO_CHAR(p.tanggal_pemeriksaan, 'YYYY-MM-DD') AS tanggal_pemeriksaan,
        p.berat_badan,
        p.tinggi_badan,
        p.lingkar_kepala,
        p.jenis_imunisasi
      FROM pemeriksaan p
      JOIN anak a ON p.id_anak = a.id_anak
      WHERE a.nama_anak ILIKE $1
      ORDER BY p.tanggal_pemeriksaan DESC`,
      [`%${nama_anak}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data pemeriksaan anak tidak ditemukan"
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data pemeriksaan berdasarkan nama anak"
    });
  }
});

// GET: Menampilkan data pemeriksaan berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "ID pemeriksaan harus berupa angka"
      });
    }

    const result = await pool.query(
      `SELECT
        p.id_pemeriksaan,
        p.id_anak,
        a.nama_anak,
        TO_CHAR(p.tanggal_pemeriksaan, 'YYYY-MM-DD') AS tanggal_pemeriksaan,
        p.berat_badan,
        p.tinggi_badan,
        p.lingkar_kepala,
        p.jenis_imunisasi
      FROM pemeriksaan p
      JOIN anak a ON p.id_anak = a.id_anak
      WHERE p.id_pemeriksaan = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data pemeriksaan tidak ditemukan"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data pemeriksaan"
    });
  }
});

// POST: Menambahkan data pemeriksaan
router.post("/", async (req, res) => {
  try {
    const {
      id_anak,
      tanggal_pemeriksaan,
      berat_badan,
      tinggi_badan,
      lingkar_kepala,
      jenis_imunisasi
    } = req.body;

    if (
      !id_anak ||
      !tanggal_pemeriksaan ||
      berat_badan == null ||
      tinggi_badan == null ||
      lingkar_kepala == null ||
      !jenis_imunisasi
    ) {
      return res.status(400).json({
        message: "Semua data pemeriksaan wajib diisi"
      });
    }

    const result = await pool.query(
      `INSERT INTO pemeriksaan
      (id_anak, tanggal_pemeriksaan, berat_badan, tinggi_badan,
       lingkar_kepala, jenis_imunisasi)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        id_anak,
        tanggal_pemeriksaan,
        berat_badan,
        tinggi_badan,
        lingkar_kepala,
        jenis_imunisasi
      ]
    );

    res.status(201).json({
      message: "Data pemeriksaan berhasil ditambahkan",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menambahkan data pemeriksaan"
    });
  }
});

// PUT: Mengubah data pemeriksaan
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_anak,
      tanggal_pemeriksaan,
      berat_badan,
      tinggi_badan,
      lingkar_kepala,
      jenis_imunisasi
    } = req.body;

    const result = await pool.query(
      `UPDATE pemeriksaan
       SET id_anak = $1,
           tanggal_pemeriksaan = $2,
           berat_badan = $3,
           tinggi_badan = $4,
           lingkar_kepala = $5,
           jenis_imunisasi = $6
       WHERE id_pemeriksaan = $7
       RETURNING *`,
      [
        id_anak,
        tanggal_pemeriksaan,
        berat_badan,
        tinggi_badan,
        lingkar_kepala,
        jenis_imunisasi,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data pemeriksaan tidak ditemukan"
      });
    }

    res.json({
      message: "Data pemeriksaan berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal memperbarui data pemeriksaan"
    });
  }
});

// DELETE: Menghapus data pemeriksaan
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM pemeriksaan
       WHERE id_pemeriksaan = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data pemeriksaan tidak ditemukan"
      });
    }

    res.json({
      message: "Data pemeriksaan berhasil dihapus",
      data: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menghapus data pemeriksaan"
    });
  }
});

module.exports = router;