
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 1. GET semua data peserta jadwal
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         pj.*,
         a.nama_anak,
         j.nama_kegiatan,
         j.tanggal,
         j.waktu
       FROM peserta_jadwal pj
       JOIN anak a ON pj.id_anak = a.id_anak
       JOIN jadwal_posyandu j ON pj.id_jadwal = j.id_jadwal
       ORDER BY pj.id_peserta ASC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET peserta berdasarkan nama anak
router.get("/nama-anak/:nama_anak", async (req, res) => {
  try {
    const { nama_anak } = req.params;

    const result = await pool.query(
      `SELECT
         pj.*,
         a.nama_anak,
         j.nama_kegiatan,
         j.tanggal,
         j.waktu
       FROM peserta_jadwal pj
       JOIN anak a ON pj.id_anak = a.id_anak
       JOIN jadwal_posyandu j ON pj.id_jadwal = j.id_jadwal
       WHERE a.nama_anak ILIKE $1
       ORDER BY pj.id_peserta ASC`,
      [`%${nama_anak}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET peserta berdasarkan nama kegiatan
router.get("/nama-kegiatan/:nama_kegiatan", async (req, res) => {
  try {
    const { nama_kegiatan } = req.params;

    const result = await pool.query(
      `SELECT
         pj.*,
         a.nama_anak,
         j.nama_kegiatan,
         j.tanggal,
         j.waktu
       FROM peserta_jadwal pj
       JOIN anak a ON pj.id_anak = a.id_anak
       JOIN jadwal_posyandu j ON pj.id_jadwal = j.id_jadwal
       WHERE j.nama_kegiatan ILIKE $1
       ORDER BY pj.id_peserta ASC`,
      [`%${nama_kegiatan}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. GET peserta berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         pj.*,
         a.nama_anak,
         j.nama_kegiatan,
         j.tanggal,
         j.waktu
       FROM peserta_jadwal pj
       JOIN anak a ON pj.id_anak = a.id_anak
       JOIN jadwal_posyandu j ON pj.id_jadwal = j.id_jadwal
       WHERE pj.id_peserta = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data peserta jadwal tidak ditemukan"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. POST menambahkan peserta jadwal
router.post("/", async (req, res) => {
  try {
    const {
      id_jadwal,
      id_anak,
      status_kehadiran
    } = req.body;

    const result = await pool.query(
      `INSERT INTO peserta_jadwal
       (id_jadwal, id_anak, status_kehadiran)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id_jadwal, id_anak, status_kehadiran]
    );

    res.status(201).json({
      message: "Peserta jadwal berhasil ditambahkan",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. PUT mengubah peserta jadwal
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_jadwal,
      id_anak,
      status_kehadiran
    } = req.body;

    const result = await pool.query(
      `UPDATE peserta_jadwal
       SET id_jadwal = $1,
           id_anak = $2,
           status_kehadiran = $3
       WHERE id_peserta = $4
       RETURNING *`,
      [id_jadwal, id_anak, status_kehadiran, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data peserta jadwal tidak ditemukan"
      });
    }

    res.json({
      message: "Peserta jadwal berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. DELETE menghapus peserta jadwal
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM peserta_jadwal
       WHERE id_peserta = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data peserta jadwal tidak ditemukan"
      });
    }

    res.json({
      message: "Peserta jadwal berhasil dihapus",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;