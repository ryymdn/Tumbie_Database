import { Home, ClipboardList, BriefcaseMedical, CalendarDays, FileChartColumn, UserRound } from 'lucide-react';

// filled: ikon dirender solid (sesuai desain untuk Dashboard & Profile)
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: Home, filled: true },
  { label: 'Data Ibu & Anak', path: '/data-anak', icon: ClipboardList },
  { label: 'Pemeriksaan', path: '/pemeriksaan', icon: BriefcaseMedical },
  { label: 'Jadwal Posyandu', path: '/jadwal', icon: CalendarDays },
  { label: 'Laporan', path: '/laporan', icon: FileChartColumn },
  { label: 'Profile', path: '/profil', icon: UserRound, filled: true },
];
