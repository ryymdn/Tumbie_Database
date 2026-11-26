# Tumbie Authentication API

## Endpoints
- `POST /api/auth/register` — registrasi orang tua.
- `POST /api/auth/login` — login orang tua atau kader.
- `GET /api/auth/me` — profil akun berdasarkan Bearer token.

## Register parent body
```json
{
  "fullName": "Nama Orang Tua",
  "nik": "16 digit NIK",
  "phone": "081234567890",
  "username": "nama_pengguna",
  "address": "Alamat lengkap",
  "password": "minimal8karakter"
}
```

## Login body
```json
{
  "identity": "username, NIK, atau nomor WhatsApp",
  "password": "password"
}
```

Kader login menggunakan username dan password. Akun kader dibuat secara internal; tidak ada registrasi kader publik.

## Catatan
- Semua password disimpan dengan bcrypt.
- Token JWT dikirim pada response login.
- Untuk endpoint terlindungi, kirim header `Authorization: Bearer <token>`.
- Jangan commit atau membagikan file `.env`.
