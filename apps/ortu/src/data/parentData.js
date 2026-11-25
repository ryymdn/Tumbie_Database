// Data contoh (dummy) portal orang tua. Ganti dengan respons API saat integrasi backend.

export const PARENT = {
  name: 'Rina Wati',
  username: 'rinawati',
  motherNik: '3201014506900001',
  fatherName: 'Budi Santoso',
  fatherNik: '3201011508880002',
  phone: '0812-3456-7890',
  address: 'Jl. Melati No. 12, RT 03/RW 05, Desa Sukamaju, Kec. Cibinong',
  addressFull: 'Jl. Melati No. 12, RT 03/RW 05, Desa Sukamaju, Kec. Cibinong, Kab. Bogor',
  posyandu: 'Posyandu Melati (RW 05)',
  village: 'Desa Sukamaju',
};

export const INITIAL_CHILDREN = [
  {
    id: 'bima',
    name: 'Bima Satria',
    birthDate: '2024-08-12',
    gender: 'Laki-laki',
    nik: '3201011208240001',
    posyandu: 'Posyandu Melati',
    note: 'Tidak ada alergi',
    verified: true,
    hasHistory: true,
    latest: { weight: '12,4', height: '88', head: '48', nutrition: 'Gizi Baik' },
  },
];

export const NEXT_SCHEDULE_TEXT = 'Senin, 01 Desember 2026 pukul 08.00 WIB di Posyandu Melati';

export const EXAMINATIONS = [
  { date: '03 Nov 2026', weight: '12,4 kg', height: '88 cm', head: '48 cm', nutrition: 'Gizi Baik', immunization: 'Vaksin DPT-HB-Hib 3', officer: 'Bidan Dian Sastro' },
  { date: '06 Okt 2026', weight: '12,1 kg', height: '87 cm', head: '47,8 cm', nutrition: 'Gizi Baik', immunization: 'Vitamin A Biru & Oralit', officer: 'Bidan Dian Sastro' },
  { date: '08 Sep 2026', weight: '11,8 kg', height: '86 cm', head: '47,5 cm', nutrition: 'Gizi Baik', immunization: 'Polio 4', officer: 'Bidan Ayuna Distira' },
  { date: '10 Agu 2026', weight: '11,5 kg', height: '85 cm', head: '47,2 cm', nutrition: 'Gizi Baik', immunization: null, officer: 'Bidan Ayuna Distira' },
];

// Ringkasan riwayat di dashboard (mengikuti desain Figma).
export const DASHBOARD_EXAMS = [
  { date: '06 Okt 2026', weight: '12,1 kg', height: '87 cm', nutrition: 'Gizi Baik', officer: 'Bidan Dian Sastro' },
  { date: '08 Sep 2026', weight: '11,8 kg', height: '86 cm', nutrition: 'Gizi Baik', officer: 'Bidan Ayuna Distira' },
  { date: '04 Agu 2026', weight: '11,5 kg', height: '85 cm', nutrition: 'Gizi Baik', officer: 'Bidan Dian Sastro' },
];

export const DASHBOARD_SCHEDULES = [
  { day: '01', month: 'DES', title: 'Posyandu Melati', time: '08.00 - 10.00 WIB', chip: 'Balai Warga RW 02' },
  { day: '05', month: 'JAN', title: 'Posyandu Melati', time: '08.00 - 10.00 WIB', chip: 'Pemberian Vitamin A' },
  { day: '02', month: 'FEB', title: 'Posyandu Melati', time: '08.00 - 10.00 WIB', chip: 'Bulan Imunisasi & Timbang' },
];

export const REGION_SCHEDULES = [
  {
    id: 'melati', month: 'DES 2026', day: '01', weekday: 'Senin', title: 'Posyandu Melati (RW 02)',
    badge: 'Jadwal Terdaftar', badgeTone: 'green', description: 'Penimbangan Rutin & Imunisasi Campak Rubella Balita',
    time: '08.00 - 11.30 WIB', place: 'Balai RW 02 (Jl. Melati)', quota: 'Terbuka', main: true,
  },
  {
    id: 'mawar', month: 'DES 2026', day: '15', weekday: 'Selasa', title: 'Posyandu Mawar (RW 04)',
    badge: 'Terbuka untuk Umum', badgeTone: 'sand', description: 'Penimbangan Berkala & Edukasi Praktik MPASI Bergizi',
    time: '08.30 - 11.00 WIB', place: 'Pos Satkamling RW 04', quota: 'Terbuka',
  },
  {
    id: 'anggrek', month: 'DES 2026', day: '22', weekday: 'Selasa', title: 'Posyandu Anggrek (RW 06)',
    badge: 'Pemberian Vitamin & PMT', badgeTone: 'sand', description: 'Pengukuran Antropometri & Distribusi PMT Khusus Pemulihan Balita',
    time: '09.00 - 12.00 WIB', place: 'Gedung Serbaguna RW 06', quota: 'Terbuka',
  },
];

export const POSYANDU_OPTIONS = ['Posyandu Melati – RW 02', 'Posyandu Mawar – RW 04', 'Posyandu Anggrek – RW 06'];
export const BLOOD_TYPES = ['Belum Diketahui', 'A', 'B', 'AB', 'O'];

// Tren pertumbuhan 6 bulan terakhir (grafik KMS sederhana).
export const GROWTH = {
  months: ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'],
  weight: [10.9, 11.2, 11.5, 11.8, 12.1, 12.4],
  height: [83, 84, 85, 86, 87, 88],
};
