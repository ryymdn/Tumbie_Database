import { logisticsItems } from './data.js';

function ProgressItem({ name, value, percent, tone }) {
  return (
    <div className="progress-item">
      <div><span>{name}</span><b className={tone}>{value}</b></div>
      <div className="progress"><i className={tone} style={{ width: `${percent}%` }} /></div>
    </div>
  );
}

export default function LogisticsSummary() {
  return (
    <div className="panel logistics">
      <div className="logistics-head">
        <h3>Ringkasan Logistik & PMT</h3>
        <span className="pill green-pill small">Stok Siap</span>
      </div>
      <p>Persediaan suplemen & gizi kader</p>
      {logisticsItems.map((item) => <ProgressItem key={item.name} {...item} />)}
    </div>
  );
}
