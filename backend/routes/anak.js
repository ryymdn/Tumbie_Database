const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET: Menampilkan semua data anak
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id_anak,
        nama_anak,
        TO_CHAR(tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir,
        jenis_kelamin,
        nama_ibu,
        alamat
       FROM anak
       ORDER BY id_anak ASC`
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data anak"
    });
  }
});

// GET: Menampilkan data anak berdasarkan nama
router.get("/nama", async (req, res) => {
  try {
    const { nama_anak } = req.query;

    if (!nama_anak || !nama_anak.trim()) {
      return res.status(400).json({
        message: "Nama anak wajib diisi"
      });
    }

    const result = await pool.query(
      `SELECT
        id_anak,
        nama_anak,
        TO_CHAR(tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir,
        jenis_kelamin,
        nama_ibu,
        alamat
       FROM anak
       WHERE nama_anak ILIKE $1
       ORDER BY id_anak ASC`,
      [`%${nama_anak.trim()}%`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data anak dengan nama tersebut tidak ditemukan"
      });
    }

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mencari data anak berdasarkan nama"
    });
  }
});

// GET: Menampilkan data anak berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "ID anak harus berupa angka"
      });
    }

    const result = await pool.query(
      `SELECT
        id_anak,
        nama_anak,
        TO_CHAR(tanggal_lahir, 'YYYY-MM-DD') AS tanggal_lahir,
        jenis_kelamin,
        nama_ibu,
        alamat
       FROM anak
       WHERE id_anak = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data anak tidak ditemukan"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data anak"
    });
  }
});

// POST: Menambahkan data anak
router.post("/", async (req, res) => {
  try {
    const {
      nama_anak,
      tanggal_lahir,
      jenis_kelamin,
      nama_ibu,
      alamat
    } = req.body;

    if (
      !nama_anak ||
      !tanggal_lahir ||
      !jenis_kelamin ||
      !nama_ibu ||
      !alamat
    ) {
      return res.status(400).json({
        message: "Semua data anak wajib diisi"
      });
    }

    const result = await pool.query(
      `INSERT INTO anak
       (nama_anak, tanggal_lahir, jenis_kelamin, nama_ibu, alamat)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        nama_anak,
        tanggal_lahir,
        jenis_kelamin,
        nama_ibu,
        alamat
      ]
    );

    res.status(201).json({
      message: "Data anak berhasil ditambahkan",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menambahkan data anak"
    });
  }
});

// PUT: Mengubah data anak
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "ID anak harus berupa angka"
      });
    }

    const {
      nama_anak,
      tanggal_lahir,
      jenis_kelamin,
      nama_ibu,
      alamat
    } = req.body;

    if (
      !nama_anak ||
      !tanggal_lahir ||
      !jenis_kelamin ||
      !nama_ibu ||
      !alamat
    ) {
      return res.status(400).json({
        message: "Semua data anak wajib diisi"
      });
    }

    const result = await pool.query(
      `UPDATE anak
       SET nama_anak = $1,
           tanggal_lahir = $2,
           jenis_kelamin = $3,
           nama_ibu = $4,
           alamat = $5
       WHERE id_anak = $6
       RETURNING *`,
      [
        nama_anak,
        tanggal_lahir,
        jenis_kelamin,
        nama_ibu,
        alamat,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data anak tidak ditemukan"
      });
    }

    res.json({
      message: "Data anak berhasil diperbarui",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal memperbarui data anak"
    });
  }
});

// DELETE: Menghapus data anak
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        message: "ID anak harus berupa angka"
      });
    }

    const result = await pool.query(
      `DELETE FROM anak
       WHERE id_anak = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data anak tidak ditemukan"
      });
    }

    res.json({
      message: "Data anak berhasil dihapus",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Gagal menghapus data anak"
    });
  }
});

module.exports = router;