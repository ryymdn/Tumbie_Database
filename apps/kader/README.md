# Tumbie – Sistem Data Kader Posyandu

Frontend React + JavaScript (Vite) dengan data contoh (dummy), tanpa backend.

## Menjalankan

```bash
npm install
npm run dev
```

Buka alamat lokal dari Vite (biasanya `http://localhost:5173`).
Login demo: username apa pun + password minimal 8 karakter (nama di dashboard mengikuti username).

## Struktur proyek (per fitur)

```
src/
├─ main.jsx                 # entry point
├─ App.jsx                  # auth guard + daftar route
├─ data/                    # data bersama (navigasi, daftar balita)
├─ components/
│  ├─ layout/               # AppShell, Sidebar, Topbar
│  └─ ui/                   # PageHeader, Pagination
├─ features/
│  ├─ auth/                 # LoginPage, useAuth, auth.css
│  ├─ dashboard/            # DashboardPage, StatTile + panel-panelnya, dashboard.css
│  ├─ patients/             # DataAnakPage, SummaryCard, PatientTable, ChildForm, patients.css
│  ├─ examinations/         # PemeriksaanPage, ExaminationTable, ExaminationForm, examinations.css
│  ├─ schedule/             # JadwalPage, StatCard, EventCard, SessionForm, schedule.css
│  ├─ reports/              # LaporanPage, KpiCards, MonthlyChart, NutritionDistribution, ReportTable
│  └─ profile/              # ProfilPage, profile.css
└─ styles/
   ├─ index.css             # pintu masuk semua CSS
   ├─ base.css              # reset, variabel, tombol umum
   ├─ layout.css            # sidebar, topbar, konten
   └─ components.css        # header halaman, panel, tabel, form, paginasi
```

Setiap fitur punya `data.js` untuk data statis. Saat integrasi API, cukup ganti isi
`data.js` / `src/data/*` dengan pemanggilan API.

## Aset

Letakkan di `public/assets/`:

- `tumbie-logo.png` (logo, PNG transparan)
- `posyandu-bg.jpg` (latar halaman login)
