# Backend (belum dibuat)

Tempat API + database tunggal Tumbie. Aplikasi `ortu` dan `kader` memanggil backend yang sama
lewat `VITE_API_URL` (lihat `.env.example` di tiap aplikasi).

Saran aturan peran (dijaga di backend, bukan di tampilan):
- tabel `users` punya kolom `role` (`orang_tua` atau `kader`);
- orang tua hanya bisa membaca data anaknya sendiri;
- kader hanya bisa membaca/mengisi data pasien di posyandunya.


## Migrasi antrean jadwal

Jalankan `migrations/001_schedule_queue.sql` melalui Query Tool pgAdmin pada database Tumbie sebelum menjalankan versi backend yang memakai antrean. Migrasi menambahkan tabel `schedule_queue` dan dapat dijalankan ulang.

## OTP WhatsApp untuk Lupa Kata Sandi Orang Tua

Isi variabel WhatsApp dan PASSWORD_RESET_OTP_SECRET di backend/.env, lalu restart backend. Gunakan versi Graph API yang didukung akun Meta, Phone Number ID dari Cloud API, dan template kategori Authentication dengan tombol Copy Code yang sudah disetujui. WHATSAPP_OTP_LANGUAGE harus sama dengan bahasa template. Buat secret acak terpisah dengan node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))". Simpan token dan secret hanya di backend.

OTP berlaku lima menit dan dikirim ke nomor WhatsApp yang cocok dengan akun orang tua terdaftar. Pengiriman aktif setelah konfigurasi lengkap. Untuk nomor uji Meta, tambahkan nomor penguji ke daftar penerima dalam dashboard Meta sebelum uji kirim.

## Migrasi versi kata sandi

Jalankan `migrations/002_password_version.sql` sebelum menjalankan backend yang mendukung perubahan kata sandi. Versi kata sandi dipakai untuk mengakhiri sesi lama setelah kata sandi diganti atau direset.

## Indikator berat badan menurut umur (BB/U)

Layanan weightForAge.js menggunakan umur dalam bulan penuh pada tanggal pemeriksaan dan tiga ambang dalam kilogram (−3 SD, −2 SD, +1 SD) pada tabel bulanan WHO Weight-for-age, usia 0–60 bulan. Data referensi disimpan menurut jenis kelamin dan diurutkan dari bulan 0 hingga 60. Ambang dan kategori mengikuti Permenkes No. 2 Tahun 2020. Hasil kosong menandakan data atau usia di luar cakupan. Indikator ini belum mencakup BB/PB, BB/TB, atau penilaian stunting.

- WHO: https://www.who.int/tools/child-growth-standards/standards/weight-for-age
- Kemenkes: https://jdih.kemkes.go.id/storage/documents/pdfs/2020permenkes002.pdf

## Migrasi posisi ukur dan stok

Jalankan `migrations/003_measurement_position.sql` dan `migrations/004_posyandu_inventory.sql` sebelum menjalankan backend. Posisi ukur kosong pada catatan lama, sehingga PB/U, TB/U, BB/PB, dan BB/TB tidak dihitung untuk catatan tersebut. Tabel rujukan panjang/tinggi dan berat terhadap panjang/tinggi diambil dari tabel z-score WHO; konversi posisi 0,7 cm mengikuti Permenkes No. 2 Tahun 2020.

Stok vitamin A, vaksin, dan PMT dikelola kader sebagai saldo fisik per Posyandu. Pemeriksaan tetap mencatat pemberian secara terpisah.

- WHO: https://www.who.int/tools/child-growth-standards/standards/length-height-for-age
- WHO: https://www.who.int/tools/child-growth-standards/standards/weight-for-length-height

## Migrasi foto profil

Jalankan `migrations/005_profile_photo.sql` sebelum memakai penyimpanan foto profil. Foto pengguna disimpan dalam kolom biner pada database Tumbie.