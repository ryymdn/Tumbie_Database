import { nutritionBreakdown } from './data.js';

const COLORS = { green: '#12a06b', amber: '#f5a623', red: '#e5384b' };

const percent = (count, total) => (count / total) * 100;
const format = (n) => `${(Math.round(n * 10) / 10).toString().replace('.', ',')}`;

export default function NutritionDistribution() {
  const total = nutritionBreakdown.reduce((sum, item) => sum + item.count, 0);

  // Susun conic-gradient dari proporsi tiap kategori.
  let acc = 0;
  const stops = nutritionBreakdown.map((item) => {
    const start = acc;
    acc += percent(item.count, total);
    return `${COLORS[item.tone]} ${start}% ${acc}%`;
  });

  const good = nutritionBreakdown[0];

  return (
    <div className="panel breakdown-panel">
      <div className="breakdown-head">
        <div>
          <h3>Breakdown Status Gizi</h3>
          <p>Standar Baku WHO - Antropometri Kemenkes</p>
        </div>
        <span className="pill teal-total">{total} Anak Total</span>
      </div>

      <div className="breakdown-body">
        <div className="donut" style={{ background: `conic-gradient(${stops.join(',')})` }}>
          <div className="donut-hole">
            <b>{Math.round(percent(good.count, total))}%</b>
            <small>GIZI BAIK</small>
          </div>
        </div>

        <div className="legend">
          {nutritionBreakdown.map((item) => (
            <div key={item.key} className={`legend-item ${item.tone}`}>
              <span><i />{item.label}</span>
              <b>{item.count} Anak <em>({format(percent(item.count, total))}%)</em></b>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
