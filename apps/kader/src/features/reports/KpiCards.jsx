import { TriangleAlert } from 'lucide-react';
import Sparkline from './Sparkline.jsx';
import { kpiCards } from './data.js';

export default function KpiCards() {
  return (
    <div className="kpi-row">
      {kpiCards.map((k) => (
        <div className="kpi" key={k.label}>
          <div className="kpi-head">
            <span>{k.label}</span>
            <em className={`kpi-badge ${k.badgeTone}`}>{k.badge}</em>
          </div>
          <div className="kpi-main">
            <div><strong>{k.value}</strong> <span>{k.unit}</span></div>
            <Sparkline points={k.trend} />
          </div>
          <small className={k.footTone}>{k.foot}</small>
        </div>
      ))}

      <div className="kpi alert">
        <div className="kpi-head">
          <span>Perhatian Khusus</span>
          <em className="kpi-badge red">Segera Rujuk</em>
        </div>
        <div className="kpi-main">
          <div><strong className="red">1</strong> <span className="red">Stunting</span> <span className="amber">• 2 Kurang</span></div>
          <span className="alert-icon"><TriangleAlert size={16} /></span>
        </div>
        <small>Intervensi PMT Tinggi Protein</small>
      </div>
    </div>
  );
}
