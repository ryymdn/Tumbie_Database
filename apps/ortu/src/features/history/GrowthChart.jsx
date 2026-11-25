import { GROWTH } from '../../data/parentData.js';

const W = 460, H = 120, PAD_X = 20, TOP = 14, BOTTOM = 96;

// Menskalakan tiap deret ke tinggi grafik agar kedua garis terbaca pada satu kanvas.
function toPoints(values) {
  const min = Math.min(...values), max = Math.max(...values);
  const step = (W - PAD_X * 2) / (values.length - 1);
  return values.map((v, i) => [PAD_X + i * step, BOTTOM - ((v - min) / (max - min || 1)) * (BOTTOM - TOP) * 0.55 - 10]);
}

export default function GrowthChart() {
  const weight = toPoints(GROWTH.weight);
  const height = toPoints(GROWTH.height).map(([x, y]) => [x, y - 6]);
  const line = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const band = `${line(weight.map(([x, y]) => [x, y - 10]))} ${[...weight].reverse().map(([x, y]) => `L${x.toFixed(1)},${(y + 16).toFixed(1)}`).join(' ')} Z`;

  return (
    <svg className="growth-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Grafik tren berat dan tinggi badan 6 bulan terakhir">
      <path d={band} className="kms-band" />
      <path d={line(weight)} className="line-weight" />
      <path d={line(height)} className="line-height" />
      {weight.map(([x, y], i) => <circle key={`w${i}`} cx={x} cy={y} r="2.6" className="dot-weight" />)}
      {height.map(([x, y], i) => <circle key={`h${i}`} cx={x} cy={y} r="2.2" className="dot-height" />)}
      {GROWTH.months.map((m, i) => (
        <text key={m} x={weight[i][0]} y={H - 6} textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}
