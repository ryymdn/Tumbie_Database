export default function MonthlyChart({ monthly, ready }) {
  const scale = Math.max(1, ...monthly.map((item) => item.value));
  return (
    <div className="panel chart-panel">
      <h3>Jumlah Pemeriksaan Per Bulan</h3>
      <p>Enam bulan terakhir di wilayah tugas kader</p>

      <div className="bar-chart">

        {monthly.map(({ key, month, value, active }) => (
          <div key={key} className={active ? 'bar-col active' : 'bar-col'}>
            <div className="bar-area">

              <b>{ready ? value : "—"}</b>
              <i style={{ height: `${(value / scale) * 100}%` }} />
            </div>
            <small>{month}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
