
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 1. GET semua data jadwal posyandu
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.username
       FROM jadwal_posyandu j
       JOIN public."user" u ON j.id_user = u.id_user
       ORDER BY j.id_jadwal ASC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET jadwal berdasarkan nama kegiatan
router.get("/nama/:nama_kegiatan", async (req, res) => {
  try {
    const { nama_kegiatan } = req.params;

    const result = await pool.query(
      `SELECT j.*, u.username
       FROM jadwal_posyandu j
       JOIN public."user" u ON j.id_user = u.id_user
       WHERE j.nama_kegiatan ILIKE $1
       ORDER BY j.id_jadwal ASC`,
      [`%${nama_kegiatan}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET jadwal berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT j.*, u.username
       FROM jadwal_posyandu j
       JOIN public."user" u ON j.id_user = u.id_user
       WHERE j.id_jadwal = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data jadwal posyandu tidak ditemukan"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. POST menambahkan jadwal posyandu
router.post("/", async (req, res) => {
  try {
    const {
      nama_kegiatan,
      tanggal,
      waktu,
      lokasi,
      keterangan,
      id_user
    } = req.body;

    const result = await pool.query(
      `INSERT INTO jadwal_posyandu
       (nama_kegiatan, tanggal, waktu, lokasi, keterangan, id_user)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nama_kegiatan, tanggal, waktu, lokasi, keterangan, id_user]
    );

    res.status(201).json({
      message: "Jadwal posyandu berhasil ditambahkan",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. PUT mengubah jadwal posyandu
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_kegiatan,
      tanggal,
      waktu,
      lokasi,
      keterangan,
      id_user
    } = req.body;

    const result = await pool.query(
      `UPDATE jadwal_posyandu
       SET nama_kegiatan = $1,
           tanggal = $2,
           waktu = $3,
           lokasi = $4,
           keterangan = $5,
           id_user = $6
       WHERE id_jadwal = $7
       RETURNING *`,
      [
        nama_kegiatan,
        tanggal,
        waktu,
        lokasi,
        keterangan,
        id_user,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data jadwal posyandu tidak ditemukan"
      });
    }

    res.json({
      message: "Jadwal posyandu berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. DELETE menghapus jadwal posyandu
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM jadwal_posyandu
       WHERE id_jadwal = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data jadwal posyandu tidak ditemukan"
      });
    }

    res.json({
      message: "Jadwal posyandu berhasil dihapus",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;