
const express = require("express");
const router = express.Router();
const pool = require("../db");

// 1. GET semua data notifikasi
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.*, u.username
       FROM notifikasi n
       JOIN public."user" u ON n.id_user = u.id_user
       ORDER BY n.id_notifikasi ASC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET notifikasi berdasarkan judul
router.get("/judul/:judul", async (req, res) => {
  try {
    const { judul } = req.params;

    const result = await pool.query(
      `SELECT n.*, u.username
       FROM notifikasi n
       JOIN public."user" u ON n.id_user = u.id_user
       WHERE n.judul ILIKE $1
       ORDER BY n.id_notifikasi ASC`,
      [`%${judul}%`]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. GET notifikasi berdasarkan ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT n.*, u.username
       FROM notifikasi n
       JOIN public."user" u ON n.id_user = u.id_user
       WHERE n.id_notifikasi = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data notifikasi tidak ditemukan"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. POST menambahkan notifikasi
router.post("/", async (req, res) => {
  try {
    const {
      id_user,
      judul,
      pesan,
      status_dibaca
    } = req.body;

    const result = await pool.query(
      `INSERT INTO notifikasi
       (id_user, judul, pesan, status_dibaca)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        id_user,
        judul,
        pesan || null,
        status_dibaca ?? false
      ]
    );

    res.status(201).json({
      message: "Notifikasi berhasil ditambahkan",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. PUT mengubah notifikasi
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_user,
      judul,
      pesan,
      status_dibaca
    } = req.body;

    const result = await pool.query(
      `UPDATE notifikasi
       SET id_user = $1,
           judul = $2,
           pesan = $3,
           status_dibaca = $4
       WHERE id_notifikasi = $5
       RETURNING *`,
      [
        id_user,
        judul,
        pesan || null,
        status_dibaca,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data notifikasi tidak ditemukan"
      });
    }

    res.json({
      message: "Notifikasi berhasil diperbarui",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. DELETE menghapus notifikasi
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM notifikasi
       WHERE id_notifikasi = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Data notifikasi tidak ditemukan"
      });
    }

    res.json({
      message: "Notifikasi berhasil dihapus",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;