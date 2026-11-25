# Tumbie

Monorepo dua aplikasi dengan peran pengguna terpisah, dan satu database (nanti lewat `backend/`).

| Aplikasi | Untuk siapa | Folder | Port |
|---|---|---|---|
| Portal Orang Tua | Orang tua / wali balita | `apps/ortu` | 5173 |
| Sistem Data Kader | Perawat / dokter / kader posyandu | `apps/kader` | 5174 |

## Menjalankan

```bash
npm install            # sekali saja, di folder ini (bukan di dalam apps/)
npm run dev:ortu       # http://localhost:5173
npm run dev:kader      # http://localhost:5174   (boleh dijalankan bersamaan di terminal lain)
```

Build produksi: `npm run build:ortu`, `npm run build:kader`, atau `npm run build` untuk keduanya.

## Struktur

```
tumbie/
├─ apps/
│  ├─ ortu/      # index.html, vite.config.js, package.json, public/, src/
│  └─ kader/     # idem
├─ backend/      # (belum dibuat) API + database tunggal
├─ package.json  # workspaces + perintah dev/build
└─ .gitignore
```

Tiap aplikasi berdiri sendiri (kode, CSS, login, aset). Jangan jalankan `npm install`
di dalam `apps/ortu` atau `apps/kader`; cukup di folder induk ini.
Salin `.env.example` di tiap aplikasi menjadi `.env` saat backend sudah ada.
