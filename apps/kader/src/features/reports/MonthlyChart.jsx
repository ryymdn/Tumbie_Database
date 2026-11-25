import { MONTH_TARGET, monthlyExaminations } from './data.js';

export default function MonthlyChart() {
  return (
    <div className="panel chart-panel">
      <h3>Jumlah Pemeriksaan Per Bulan</h3>
      <p>Juni - November 2026 • Target sasaran RW 05: {MONTH_TARGET} balita</p>

      <div className="bar-chart">
        <div className="target-line" />
        {monthlyExaminations.map(({ month, value, note, active }) => (
          <div key={month} className={active ? 'bar-col active' : 'bar-col'}>
            <div className="bar-area">
              {active && <span className="bar-tag outline">Aktif<br />Target: {MONTH_TARGET}</span>}
              {note && <span className="bar-tag solid">{note}</span>}
              <b>{value}</b>
              <i style={{ height: `${(value / MONTH_TARGET) * 100}%` }} />
            </div>
            <small>{month}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
