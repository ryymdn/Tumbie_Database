
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET semua data ibu
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.username
       FROM ibu i
       JOIN public."user" u ON i.id_user = u.id_user
       ORDER BY i.id_ibu ASC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET data ibu berdasarkan nama
router.get("/nama/:nama", async (req, res) => {
  try {
    const { nama } = req.params;

    const result = await pool.query(
      `SELECT i.*, u.username
       FROM ibu i
       JOIN public."user" u ON i.id_user = u.id_user
       WHERE i.nama_ibu ILIKE $1
       ORDER BY i.id_ibu ASC`,
      [`%${nama}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET data ibu berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT i.*, u.username
       FROM ibu i
       JOIN public."user" u ON i.id_user = u.id_user
       WHERE i.id_ibu = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data ibu tidak ditemukan"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST menambahkan data ibu
router.post("/", async (req, res) => {
  try {
    const {
      id_user,
      nama_ibu,
      nik,
      tanggal_lahir,
      alamat,
      no_hp
    } = req.body;

    const result = await pool.query(
      `INSERT INTO ibu
       (id_user, nama_ibu, nik, tanggal_lahir, alamat, no_hp)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_user, nama_ibu, nik, tanggal_lahir, alamat, no_hp]
    );

    res.status(201).json({
      message: "Data ibu berhasil ditambahkan",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT mengubah data ibu
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_user,
      nama_ibu,
      nik,
      tanggal_lahir,
      alamat,
      no_hp
    } = req.body;

    const result = await pool.query(
      `UPDATE ibu
       SET id_user = $1,
           nama_ibu = $2,
           nik = $3,
           tanggal_lahir = $4,
           alamat = $5,
           no_hp = $6
       WHERE id_ibu = $7
       RETURNING *`,
      [id_user, nama_ibu, nik, tanggal_lahir, alamat, no_hp, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data ibu tidak ditemukan"
      });
    }

    res.json({
      message: "Data ibu berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE menghapus data ibu
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM ibu
       WHERE id_ibu = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data ibu tidak ditemukan"
      });
    }

    res.json({
      message: "Data ibu berhasil dihapus",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;