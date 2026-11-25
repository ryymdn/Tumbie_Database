// Garis tren mini. `points`: nilai 0–100 (makin kecil = makin tinggi di grafik).
export default function Sparkline({ points }) {
  const w = 74;
  const h = 30;
  const step = w / (points.length - 1);
  const coords = points.map((y, i) => `${(i * step).toFixed(1)},${(y * h / 100 + 2).toFixed(1)}`);
  const [lastX, lastY] = coords[coords.length - 1].split(',');

  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h + 4}`} width={w} height={h + 4} aria-hidden="true">
      <polyline points={coords.join(' ')} fill="none" stroke="#1e8c78" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lastX} cy={lastY} r="2.4" fill="#1e8c78" />
    </svg>
  );
}
