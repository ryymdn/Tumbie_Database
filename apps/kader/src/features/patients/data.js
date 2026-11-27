import { Baby, CircleCheck, Clock, MapPin } from 'lucide-react';

export const ALL_POS = 'Semua Posyandu';
export const POS_OPTIONS = [ALL_POS, 'Posyandu Melati', 'Posyandu Anggrek'];

export const ALL_STATUS = 'Semua Status';
export const VERIFIED = 'Terverifikasi';
export const PENDING = 'Menunggu Verifikasi';
export const STATUS_OPTIONS = [ALL_STATUS, VERIFIED, PENDING];

export const BASE_TOTAL = 12; // total balita terdaftar sebelum data baru ditambahkan

// kind note: 'pill-green' | 'pill-yellow' | 'text'; tone: warna kotak ikon
export const summaryCards = [
  { label: 'Total Terdaftar', value: '12', note: '+2 bln ini', noteKind: 'pill-green', icon: Baby, tone: 'teal' },
  { label: 'Terverifikasi', value: '11', note: 'Balita valid', noteKind: 'text', icon: CircleCheck, tone: 'green' },
  { label: 'Menunggu', value: '1', note: 'Perlu review', noteKind: 'pill-yellow', icon: Clock, tone: 'amber' },
  { label: 'Pos Layanan', value: '3', note: 'Wilayah aktif', noteKind: 'text', icon: MapPin, tone: 'teal' },
];

export const initialChildren = [
  { id: 1, initial: 'BS', tone: 'blue', name: 'Bima Satria', age: '2 Bulan', birth: '12 Agustus 2024', gender: 'Laki-Laki', parent: 'Rina Wati', nik: '3201************', phone: '0812-3456-7890', status: VERIFIED, pos: 'Posyandu Melati' },
  { id: 2, initial: 'AP', tone: 'pink', name: 'Alya Putri', age: '2 Bulan', birth: '18 Agustus 2024', gender: 'Perempuan', parent: 'Dedi Kurniawan', nik: '3201************', phone: '0813-2211-4455', status: VERIFIED, pos: 'Posyandu Melati' },
  { id: 3, initial: 'NP', tone: 'pink', name: 'Nadia Putri', age: '2 Bulan', birth: '21 Agustus 2024', gender: 'Perempuan', parent: 'Andi Pratama', nik: '3201************', phone: '0857-1122-3344', status: VERIFIED, pos: 'Posyandu Anggrek' },
  { id: 4, initial: 'PL', tone: 'blue', name: 'Pelangi', age: '2 Bulan', birth: '12 Agustus 2024', gender: 'Laki-Laki', parent: 'Maya Lestari', nik: '3201************', phone: '0821-9908-7766', status: PENDING, pos: 'Posyandu Melati' },
];

export const emptyChildForm = {
  name: '',
  birth: '',
  gender: 'Perempuan',
  notes: '',
};

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// '2024-08-12' -> '12 Agustus 2024'
export function formatDateID(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_ID[m - 1]} ${y}`;
}

// Usia dalam bulan dari tanggal lahir ISO.
export function ageInMonths(iso, now = new Date()) {
  const [y, m, d] = iso.split('-').map(Number);
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (now.getDate() < d) months -= 1;
  return Math.max(months, 0);
}

export function initialsOf(name) {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? parts[0][1] ?? '')).toUpperCase();
}
