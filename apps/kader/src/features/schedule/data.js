export const scheduleStats = [
  { label: 'JADWAL AKTIF BULAN INI', value: '3 Sesi', sub: 'Desember 2026', footIcon: 'check', foot: '1 sesi sedang berjalan' },
  { label: 'ESTIMASI SASARAN BALITA', value: '145 Balita', sub: 'RW 01 – 06', footIcon: 'users', foot: '89 balita terdaftar' },
  { label: 'KADER & BIDAN BERTUGAS', value: '8 Petugas', sub: 'Terjadwal', footIcon: 'clinic', foot: '2 Bidan Puskesmas' },
];

// tone badge: live | soon | planned
export const initialSessions = [
  {
    id: 1,
    featured: true,
    weekday: 'SEN',
    day: '01',
    month: 'Des',
    title: 'Posyandu Melati 01 (Sesi Pagi)',
    badge: { label: 'Sedang Berlangsung', tone: 'live' },
    time: '08.00 – 11.30 WIB',
    place: 'Balai Warga RW 02 (Jl. Melati No. 12)',
    quotaLabel: 'Kapasitas',
    quota: '42 / 50 Anak',
    serviceLabel: 'LAYANAN & AGENDA TERJADWAL:',
    services: [
      'Antropometri (BB/TB/LK)',
      'Imunisasi DPT-HB-Hib & Polio',
      'Distribusi Kapsul Vitamin A',
      'Konsultasi MPASI Bidan',
    ],
    attendance: 84,
    remaining: 'Sisa Kuota: 8 Balita',
    staff: ['BD', 'KA', 'KR', 'KS'],
    staffCount: 4,
    queueCount: 42,
  },
  {
    id: 2,
    weekday: 'SEL',
    day: '15',
    month: 'Des',
    title: 'Posyandu Mawar RW 04',
    badge: { label: 'Mendatang (H-14)', tone: 'soon' },
    time: '08.30 – 11.00 WIB',
    place: 'Pos Satkamling RT 03 / RW 04',
    quotaLabel: 'Pendaftar',
    quota: '28 / 40 Balita',
    services: ['Penimbangan Rutin', 'Pemberian PMT Pemulihan', 'Edukasi Sanitasi Higiene'],
  },
  {
    id: 3,
    weekday: 'SEL',
    day: '22',
    month: 'Des',
    title: 'Posyandu Anggrek Terpadu',
    badge: { label: 'Terjadwal (H-21)', tone: 'planned' },
    time: '09.00 – 12.00 WIB',
    place: 'Gedung Serbaguna RW 06',
    quotaLabel: 'Pendaftar',
    quota: '19 / 35 Balita',
    services: ['Imunisasi PCV 2 & Rotavirus', 'Suplementasi Zat Besi Balita'],
  },
];

export const SERVICE_OPTIONS = ['Antropometri', 'Vaksin Wajib', 'Vitamin A & PMT', 'Konsultasi Gizi'];

// Daftar kader yang bisa ditambahkan lewat tombol "+ Tambah Kader".
export const KADER_POOL = ['Kader Sari', 'Kader Dewi', 'Kader Lina', 'Kader Maya'];

export const initialSessionForm = {
  name: '',
  date: '',
  time: '',
  place: '',
  services: [],
  quota: '',
  bidan: '',
  kaders: [],
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const WEEKDAYS = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];

// '2026-12-28' -> { weekday: 'SEN', day: '28', month: 'Des' }
export function dateParts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return { weekday: WEEKDAYS[date.getDay()], day: String(d).padStart(2, '0'), month: MONTHS_SHORT[m - 1] };
}
