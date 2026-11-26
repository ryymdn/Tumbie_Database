import reference from '../../backend/src/services/weightForAgeReference.json';

const W = 460;
const H = 160;
const LEFT = 46;
const RIGHT = 429;
const TOP = 12;
const BOTTOM = 122;

function line(points) {
  return points.map(([x, y], index) => (index ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
}

export default function WeightForAgeChart({ exams, gender }) {
  const limits = reference[gender];
  const measured = exams
    .filter((exam) => Number.isInteger(exam.ageMonths) && exam.ageMonths >= 0 && exam.ageMonths <= 60 && Number.isFinite(exam.weight) && exam.weight > 0)
    .sort((a, b) => a.ageMonths - b.ageMonths || a.date.localeCompare(b.date));
  if (!limits || !measured.length) return <p>Belum ada pengukuran BB/U yang dapat ditampilkan.</p>;

  const maxWeight = Math.max(limits[60][2], ...measured.map((exam) => exam.weight));
  const step = Math.max(5, Math.ceil(maxWeight / 25) * 5);
  const tickCount = Math.max(4, Math.ceil(maxWeight / step));
  const maxY = step * tickCount;
  const x = (age) => LEFT + age / 60 * (RIGHT - LEFT);
  const y = (weight) => BOTTOM - weight / maxY * (BOTTOM - TOP);
  const guides = [0, 1, 2].map((column) => limits.map((row, age) => [x(age), y(row[column])]));
  const band = line(guides[1]) + ' ' + [...guides[2]].reverse().map(([a, b]) => 'L' + a.toFixed(1) + ',' + b.toFixed(1)).join(' ') + ' Z';
  const points = measured.map((exam) => [x(exam.ageMonths), y(exam.weight)]);

  return (
    <svg className="growth-chart" width="460" height="160" viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: '100%', height: 'auto' }} role="img" aria-label="Grafik berat badan menurut umur 0 sampai 60 bulan, dengan garis rujukan WHO">
      <path d={band} fill="#def3e4" />
      {Array.from({ length: tickCount + 1 }, (_, index) => index).map((index) => (
        <g key={index}>
          <path d={`M${LEFT},${y(step * index)} H${RIGHT}`} stroke="#bacacc" strokeWidth=".6" />
          <text x={LEFT - 7} y={y(step * index) + 3} textAnchor="end" fontSize="10" fill="#526970">{step * index}</text>
        </g>
      ))}
      {[0, 12, 24, 36, 48, 60].map((age) => (
        <text key={age} x={x(age)} y={BOTTOM + 13} textAnchor="middle" fontSize="10" fill="#526970">{age}</text>
      ))}
      <text x="6" y="14" fontSize="10" fill="#526970">kg</text>
      <text x={(LEFT + RIGHT) / 2} y={H - 5} textAnchor="middle" fontSize="10" fill="#526970">Umur (bulan)</text>
      {guides.map((guide, index) => (
        <g key={index}>
          <path d={line(guide)} fill="none" stroke={index === 0 ? '#a45c24' : '#4c8063'} strokeWidth="1" strokeDasharray="3 2" />
          <text x={RIGHT + 4} y={guide[60][1] + (index === 0 ? 8 : 2)} fontSize="10" fill="#526970">{['−3', '−2', '+1'][index]}</text>
        </g>
      ))}
      <path d={line(points)} fill="none" stroke="#2f6f7a" strokeWidth="1.8" />
      {points.map(([cx, cy], index) => (
        <circle key={measured[index].id} cx={cx} cy={cy} r="3" fill="#2f6f7a">
          <title>{measured[index].ageMonths + ' bulan · ' + measured[index].weight + ' kg · ' + measured[index].date}</title>
        </circle>
      ))}
    </svg>
  );
}
