// trend = titik sparkline (0-100); alert = kartu perhatian khusus
export const kpiCards = [
  {
    label: 'Total Terdaftar', value: '12', unit: 'Balita', badge: '+2 Baru', badgeTone: 'green',
    foot: '100% NIK tervalidasi Dukcapil', footTone: 'green', trend: [62, 55, 50, 38, 40, 22, 14],
  },
  {
    label: 'Cakupan Kehadiran', value: '10', unit: 'Anak', badge: '83.3% Aktif', badgeTone: 'teal',
    foot: '2 belum hadir (sweeping)', footTone: 'red', trend: [70, 40, 55, 28, 36, 16, 20],
  },
  {
    label: 'Gizi Baik (Normal)', value: '9', unit: 'Anak', badge: '75% Kohort', badgeTone: 'green',
    foot: 'Tumbuh optimal sesuai kurva', footTone: 'green', trend: [60, 52, 56, 42, 38, 30, 20],
  },
];

export const MONTH_TARGET = 12;

export const monthlyExaminations = [
  { month: 'Jun', value: 8 },
  { month: 'Jul', value: 9 },
  { month: 'Agu', value: 11 },
  { month: 'Sep', value: 10 },
  { month: 'Okt', value: 12, note: '100%' },
  { month: 'Nov', value: 10, active: true },
];

// tone dipakai untuk warna donut & kartu legenda
export const nutritionBreakdown = [
  { key: 'baik', label: 'Gizi Baik', count: 9, tone: 'green' },
  { key: 'kurang', label: 'Gizi Kurang', count: 2, tone: 'amber' },
  { key: 'stunting', label: 'Stunting TB/U', count: 1, tone: 'red' },
];

export const STATUS_TABS = ['Semua', 'Gizi Baik', 'Gizi Kurang', 'Stunting'];
export const TOTAL_EXAMINED = 10;

export const reportRows = [
  { id: 1, initial: 'BS', tone: 'mint', name: 'Bima Satria', mother: 'Siti Aminah', nik: '3201...8892', age: '2 th 3 bln', gender: 'Laki-laki', weight: '12,4', weightDelta: '+0.3 kg dr bln lalu', height: '88', heightDelta: '+1.0 cm', trend: 'up', status: 'Gizi Baik', date: '03 Nov 2026', action: 'kms' },
  { id: 2, initial: 'AP', tone: 'mint', name: 'Alya Putri', mother: 'Rahmawati', nik: '3201...9912', age: '2 th 3 bln', gender: 'Perempuan', weight: '11,1', weightDelta: '+0.2 kg dr bln lalu', height: '85', heightDelta: '+0.8 cm', trend: 'up', status: 'Gizi Baik', date: '03 Nov 2026', action: 'kms' },
  { id: 3, initial: 'NP', tone: 'amber', name: 'Nadia Putri', mother: 'Dewi Lestari', nik: '3201...4421', age: '2 th 2 bln', gender: 'Perempuan', weight: '9,6', weightDelta: 'Berat stagnan (T2)', height: '81', heightDelta: '+0.5 cm', trend: 'flat', status: 'Gizi Kurang', date: '05 Nov 2026', action: 'intervensi' },
  { id: 4, initial: 'PL', tone: 'pink', priority: true, name: 'Pelangi', mother: 'Endang Maryani', nik: '3201...7734', age: '2 th 2 bln', gender: 'Perempuan', weight: '10,2', weightDelta: '+0.1kg', height: '79', heightDelta: 'Z-Score: −2.4 SD', trend: 'alert', status: 'Stunting', date: '05 Nov 2026', action: 'kms' },
];
