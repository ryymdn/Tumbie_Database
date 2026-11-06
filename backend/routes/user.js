
const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// REGISTER: Membuat akun baru
// ==========================================
router.post("/register", async (req, res) => {
    try {
        const { nama_user, username, password } = req.body;

        if (!nama_user || !username || !password) {
            return res.status(400).json({
                message: "Nama, username, dan password wajib diisi"
            });
        }

        // Cek username
        const cekUser = await db.query(
            'SELECT id_user FROM public."user" WHERE username = $1',
            [username]
        );

        if (cekUser.rows.length > 0) {
            return res.status(409).json({
                message: "Username sudah digunakan"
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Role otomatis user
        const result = await db.query(
            `INSERT INTO public."user"
            (nama_user, username, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id_user, nama_user, username, role`,
            [nama_user, username, passwordHash, "user"]
        );

        res.status(201).json({
            message: "Akun berhasil dibuat",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal membuat akun"
        });
    }
});


// ==========================================
// LOGIN: Masuk menggunakan username dan password
// ==========================================
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username dan password wajib diisi"
            });
        }

        const result = await db.query(
            'SELECT * FROM public."user" WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        const user = result.rows[0];

        // Verifikasi password
        const passwordCocok = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCocok) {
            return res.status(401).json({
                message: "Username atau password salah"
            });
        }

        // Periksa JWT_SECRET
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET belum diatur di file .env");
        }

        // Membuat token
        const token = jwt.sign(
            {
                id_user: user.id_user,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login berhasil",
            token: token,
            user: {
                id_user: user.id_user,
                nama_user: user.nama_user,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal login"
        });
    }
});


// ==========================================
// GET: Menampilkan semua user
// ==========================================
router.get("/", async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id_user, nama_user, username, role
             FROM public."user"
             ORDER BY id_user ASC`
        );

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal mengambil data user"
        });
    }
});


// ==========================================
// GET: Menampilkan user berdasarkan nama
// ==========================================
router.get("/nama/:nama_user", async (req, res) => {
    try {
        const { nama_user } = req.params;

        const result = await db.query(
            `SELECT id_user, nama_user, username, role
             FROM public."user"
             WHERE nama_user ILIKE $1
             ORDER BY id_user ASC`,
            [`%${nama_user}%`]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal mengambil data user berdasarkan nama"
        });
    }
});


// ==========================================
// GET: Menampilkan user berdasarkan ID
// ==========================================
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: "ID user harus berupa angka"
            });
        }

        const result = await db.query(
            `SELECT id_user, nama_user, username, role
             FROM public."user"
             WHERE id_user = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal mengambil data user"
        });
    }
});


// ==========================================
// PUT: Mengubah data user
// ==========================================
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_user, username } = req.body;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: "ID user harus berupa angka"
            });
        }

        if (!nama_user || !username) {
            return res.status(400).json({
                message: "Nama dan username wajib diisi"
            });
        }

        // Cek username milik user lain
        const cekUsername = await db.query(
            `SELECT id_user
             FROM public."user"
             WHERE username = $1 AND id_user <> $2`,
            [username, id]
        );

        if (cekUsername.rows.length > 0) {
            return res.status(409).json({
                message: "Username sudah digunakan"
            });
        }

        const result = await db.query(
            `UPDATE public."user"
             SET nama_user = $1,
                 username = $2
             WHERE id_user = $3
             RETURNING id_user, nama_user, username, role`,
            [nama_user, username, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        res.json({
            message: "Data user berhasil diubah",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal mengubah data user"
        });
    }
});


// ==========================================
// DELETE: Menghapus user
// ==========================================
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!/^\d+$/.test(id)) {
            return res.status(400).json({
                message: "ID user harus berupa angka"
            });
        }

        const result = await db.query(
            `DELETE FROM public."user"
             WHERE id_user = $1
             RETURNING id_user, nama_user, username, role`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User tidak ditemukan"
            });
        }

        res.json({
            message: "User berhasil dihapus",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Gagal menghapus user"
        });
    }
});

module.exports = router;