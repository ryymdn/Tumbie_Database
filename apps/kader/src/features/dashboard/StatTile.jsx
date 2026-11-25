import { ArrowUpRight } from 'lucide-react';

// Kartu ringkasan kecil di dashboard. `children` dirender di sisi kanan nilai (mis. badge persen).
export default function StatTile({ label, value, total, sub, subClass = '', percent, onOpen, children }) {
  return (
    <div className="tile">
      <div className="tile-head">
        <span>{label}</span>
        <button className="tile-open" onClick={onOpen} aria-label={`Buka ${label}`}>
          <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="tile-body">
        <div className="tile-value">
          <strong>{value}{total && <em> / {total}</em>}</strong>
          {children}
        </div>
        {percent !== undefined && <div className="tile-bar"><i style={{ width: `${percent}%` }} /></div>}
        {sub && <small className={subClass}>{sub}</small>}
      </div>
    </div>
  );
}
