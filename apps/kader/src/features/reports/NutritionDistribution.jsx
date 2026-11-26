import { nutritionBreakdown } from './data.js';

export default function NutritionDistribution({ assessed, normal }) {
  const total = assessed.length;
  let start = 0;
  const groups = nutritionBreakdown.map((item) => {
    const count = assessed.filter((status) => item.statuses.includes(status)).length;
    const end = start + (total ? count * 100 / total : 0);
    const stop = item.color + ' ' + start + '% ' + end + '%';
    start = end;
    return { ...item, count, stop };
  });
  const background = total ? 'conic-gradient(' + groups.map((item) => item.stop).join(',') + ')' : '#e6eeee';
  return (
    <div className="panel breakdown-panel">
      <div className="breakdown-head">
        <div>
          <h3>Distribusi Status BB/U</h3>
          <p>Pemeriksaan terakhir tiap anak usia 0–60 bulan</p>
        </div>
        <span className="pill teal-total">{total} anak dinilai</span>
      </div>

      <div className="breakdown-body">
        <div className="donut" style={{ background }}>
          <div className="donut-hole">
            <b>{total ? Math.round(100 * normal / total) + "%" : "—"}</b>
            <small>BB NORMAL</small>
          </div>
        </div>

        <div className="legend">
          {groups.map((item) => (
            <div key={item.key} className={`legend-item ${item.tone}`}>
              <span><i />{item.label}</span>
              <b>{item.count}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
