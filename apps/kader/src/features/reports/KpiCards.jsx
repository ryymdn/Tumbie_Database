import { TriangleAlert } from 'lucide-react';
import { kpiCards } from './data.js';

export default function KpiCards({ total, examined, normal, attention }) {
  const cards = kpiCards.map((card, index) => ({
    ...card,
    value: (index === 0 ? total : index === 1 ? examined : normal) ?? '—',
    badge: ['Wilayah tugas', 'Bulan ini', 'BB/U'][index],
    foot: ['Balita terdaftar di wilayah tugas', 'Balita dengan pemeriksaan tercatat bulan ini', 'Berdasarkan pemeriksaan terakhir'][index],
    footTone: '',
  }));
  return (
    <div className="kpi-row">
      {cards.map((k) => (
        <div className="kpi" key={k.label}>
          <div className="kpi-head">
            <span>{k.label}</span>
            <em className={`kpi-badge ${k.badgeTone}`}>{k.badge}</em>
          </div>
          <div className="kpi-main">
            <div><strong>{k.value}</strong> <span>{k.unit}</span></div>

          </div>
          <small className={k.footTone}>{k.foot}</small>
        </div>
      ))}

      <div className="kpi alert">
        <div className="kpi-head">
          <span>Perhatian Khusus</span>
          <em className="kpi-badge red">BB/U</em>
        </div>
        <div className="kpi-main">
          <div><strong>{attention ?? "—"}</strong></div>
          <span className="alert-icon"><TriangleAlert size={16} /></span>
        </div>
        <small>Kategori BB/U di luar rentang normal</small>
      </div>
    </div>
  );
}
