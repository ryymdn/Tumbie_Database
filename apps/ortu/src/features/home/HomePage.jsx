import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock3, Smile } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';
import { PATHS } from '../../data/routes.js';
import { DASHBOARD_EXAMS, DASHBOARD_SCHEDULES } from '../../data/parentData.js';
import { formatAge } from '../../data/format.js';
import { NutritionPill } from '../../components/parent/Widgets.jsx';

function StatCard({ value, unit, label, delta, onClick }) {
  return (
    <article className="dash-stat">
      <div className="dash-stat-copy">
        <strong>{value}{unit && <small>{unit}</small>}</strong>
        <span>{label}{delta && <em className="delta-chip">{delta}</em>}</span>
      </div>
      <button className="stat-go" type="button" onClick={onClick} aria-label={`Buka ${label}`}>
        <ChevronRight size={16} />
      </button>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { parent, kids, selectedChild } = useParent();
  const latest = selectedChild.latest;

  return (
    <>
      <div className="parent-welcome-row">
        <div className="parent-welcome-copy">
          <h1>Halo, {parent.name}</h1>
          <p>Selamat datang kembali! Berikut ringkasan tumbuh kembang anak Anda. Pantau berat dan tinggi badan anak setiap bulan. Jangan lupa datang ke Posyandu sesuai jadwalnya.</p>
          <button className="primary parent-action" type="button" onClick={() => navigate(PATHS.children)}>Lihat Data Anak</button>
        </div>
        <div className="child-mini-card">
          <span className="child-mini-icon"><Smile size={26} strokeWidth={2} /></span>
          <div>
            <span>PROFIL AKTIF</span>
            <strong>{selectedChild.name}</strong>
            <small>{formatAge(selectedChild.birthDate, { capital: true })}</small>
          </div>
        </div>
      </div>

      <div className="dash-stats-grid">
        <StatCard value={kids.length} label="Jumlah Anak" onClick={() => navigate(PATHS.children)} />
        <StatCard value={latest.weight} unit="kg" label="Berat Terakhir" delta={selectedChild.hasHistory ? '+0,3 kg' : undefined} onClick={() => navigate(PATHS.history)} />
        <StatCard value={latest.height} unit="cm" label="Tinggi Terakhir" delta={selectedChild.hasHistory ? '+1 cm' : undefined} onClick={() => navigate(PATHS.history)} />
        <StatCard value="01" unit="Des" label="Jadwal Berikutnya" onClick={() => navigate(PATHS.schedule)} />
      </div>

      <div className="parent-dashboard-grid">
        <section className="parent-panel dash-schedule-panel">
          <div className="dash-panel-title"><h2>Jadwal Posyandu</h2><p>Agenda kegiatan terdekat</p></div>
          <div className="dash-schedule-list">
            {DASHBOARD_SCHEDULES.map((item, i) => (
              <article className={`dash-schedule-item ${i === 0 ? 'next' : ''}`} key={item.day + item.month}>
                <div className="dash-date-tile"><strong>{item.day}</strong><small>{item.month}</small></div>
                <div className="dash-schedule-info">
                  <strong>{item.title}</strong>
                  <span><Clock3 size={12} /> {item.time}</span>
                  <em>{item.chip}</em>
                </div>
                {i === 0 && <i className="next-dot" aria-label="Jadwal berikutnya" />}
              </article>
            ))}
          </div>
        </section>

        <section className="parent-panel dash-history-panel">
          <div className="dash-panel-head">
            <div className="dash-panel-title"><h2>Riwayat Pemeriksaan Anak</h2><p>Hasil pemeriksaan terakhir {selectedChild.name}</p></div>
            <button className="text-action" type="button" onClick={() => navigate(PATHS.history)}>Lihat Semua →</button>
          </div>
          <div className="parent-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>Tanggal</th><th>Berat Badan</th><th>Tinggi Badan</th><th>Status Gizi</th><th>Petugas</th></tr>
              </thead>
              <tbody>
                {DASHBOARD_EXAMS.map((row) => (
                  <tr key={row.date}>
                    <td><i className="row-dot" />{row.date}</td>
                    <td>{row.weight}</td>
                    <td>{row.height}</td>
                    <td><NutritionPill variant="cyan" /></td>
                    <td className="officer">{row.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
