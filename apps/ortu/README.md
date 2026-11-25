# Tumbie – Portal Orang Tua

Frontend React + JavaScript (Vite) dengan data contoh (dummy), tanpa backend.
Halaman: Registrasi, Masuk, dan Lupa Kata Sandi (2 langkah).

## Menjalankan

```bash
npm install
npm run dev
```

Buka alamat lokal dari Vite (biasanya `http://localhost:5173`).

| Halaman | Rute |
|---|---|
| Landing page (publik) | `/` |
| Artikel edukasi | `/artikel/:slug` |
| Registrasi | `/daftar` |
| Masuk | `/masuk` |
| Lupa kata sandi (verifikasi OTP → kata sandi baru) | `/lupa-sandi` |
| Dashboard | `/beranda` |
| Data Anak | `/data-anak` |
| Tambah Data Anak (form) | `/data-anak/tambah` |
| Jadwal Posyandu | `/jadwal-posyandu` |
| Riwayat Pemeriksaan | `/riwayat-pemeriksaan` |
| Profil Akun | `/profil` |

Demo: login menerima identitas apa pun + kata sandi minimal 8 karakter. Kode OTP demo: `123456`
(diatur di `src/features/auth/data.js`).

## Struktur proyek (per fitur)

```
src/
├─ main.jsx                 # entry point
├─ App.jsx                  # daftar route + guard sesi
├─ data/                    # data bersama (daftar rute)
├─ components/
│  ├─ layout/               # AuthLayout (foto latar + kartu putih + logo)
│  └─ ui/                   # IconField, CheckBox
├─ features/
│  ├─ auth/                 # LoginPage, RegisterPage, ForgotPasswordPage,
│  │                        # useAuth, validators, data.js, auth.css
│  └─ home/                 # HomePage (placeholder)
└─ styles/
   ├─ index.css             # pintu masuk semua CSS
   └─ base.css              # reset & variabel dasar
```

Saat integrasi API, ganti isi `onSubmit` di tiap halaman `features/auth` dan konstanta demo di `data.js`.

## Aset

Letakkan di `public/assets/`:

- `tumbie-logo.png` (logo, PNG transparan)
- `posyandu-orangtua-bg.jpg` (foto latar dari Figma). Jika belum ada, dipakai `posyandu-bg.png`.
