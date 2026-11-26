export const kpiCards = [
  { label: 'Total Terdaftar', unit: 'Balita', badgeTone: 'green' },
  { label: 'Cakupan Kehadiran', unit: 'Anak', badgeTone: 'teal' },
  { label: 'Berat Badan Normal (BB/U)', unit: 'Anak', badgeTone: 'green' },
];

export const nutritionBreakdown = [
  { key: 'normal', label: 'Berat badan normal', tone: 'green', color: '#12a06b', statuses: ['Berat badan normal'] },
  { key: 'low', label: 'Berat badan kurang / sangat kurang', tone: 'red', color: '#e5384b', statuses: ['Berat badan kurang', 'Berat badan sangat kurang'] },
  { key: 'risk', label: 'Risiko berat badan lebih', tone: 'amber', color: '#f5a623', statuses: ['Risiko berat badan lebih'] },
];

export const STATUS_TABS = ['Semua', ...nutritionBreakdown.flatMap((item) => item.statuses)];