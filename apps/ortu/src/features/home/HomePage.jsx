import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock3, Smile } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';
import { PATHS } from '../../data/routes.js';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';
import { formatAge } from '../../data/format.js';


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
  const latest = selectedChild?.latest;
  const [schedules, setSchedules] = useState([]);
  const [scheduleMessage, setScheduleMessage] = useState('Memuat jadwal…');

  useEffect(() => {
    let active = true;
    apiRequest('schedules', { token: sessionStorage.getItem(STORAGE_KEY) })
      .then(({ schedules }) => {
        if (!active) return;
        setSchedules(schedules);
        setScheduleMessage('');
      })
      .catch((error) => { if (active) setScheduleMessage(error.message); });
    return () => { active = false; };
  }, []);

  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const upcoming = schedules.filter((item) => item.date >= today && item.posyandu === selectedChild?.posyandu).slice(0, 3);
  const monthLabel = (date) => new Date(date + 'T12:00:00').toLocaleDateString('id-ID', { month: 'short' });
  const next = upcoming[0];

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
            <strong>{selectedChild?.name ?? 'Belum ada anak terdaftar'}</strong>
            <small>{selectedChild ? formatAge(selectedChild.birthDate, { capital: true }) : '—'}</small>
          </div>
        </div>
      </div>

      <div className="dash-stats-grid">
        <StatCard value={kids.length} label="Jumlah Anak" onClick={() => navigate(PATHS.children)} />
        <StatCard value={latest?.weight ?? "—"} unit={latest?.weight !== "—" && latest?.weight ? "kg" : undefined} label="Berat Terakhir" onClick={() => navigate(PATHS.history)} />
        <StatCard value={latest?.height ?? "—"} unit={latest?.height !== "—" && latest?.height ? "cm" : undefined} label="Tinggi Terakhir" onClick={() => navigate(PATHS.history)} />
        <StatCard value={next?.date.slice(8, 10) ?? "—"} unit={next && monthLabel(next.date)} label="Jadwal Berikutnya" onClick={() => navigate(PATHS.schedule)} />
      </div>

      <div className="parent-dashboard-grid">
        <section className="parent-panel dash-schedule-panel">
          <div className="dash-panel-title"><h2>Jadwal Posyandu</h2><p>Agenda kegiatan terdekat</p></div>
          <div className="dash-schedule-list">
            {!upcoming.length && <p role="status">{scheduleMessage || "Belum ada jadwal mendatang."}</p>}
            {upcoming.map((item, i) => (
              <article className={`dash-schedule-item ${i === 0 ? 'next' : ''}`} key={item.id}>
                <div className="dash-date-tile"><strong>{item.date.slice(8, 10)}</strong><small>{monthLabel(item.date)}</small></div>
                <div className="dash-schedule-info">
                  <strong>{item.title}</strong>
                  <span><Clock3 size={12} /> {item.start} – {item.end} WIB</span>
                  <em>{item.place}</em>
                </div>
                {i === 0 && <i className="next-dot" aria-label="Jadwal berikutnya" />}
              </article>
            ))}
          </div>
        </section>

        <section className="parent-panel dash-history-panel">
          <div className="dash-panel-head">
            <div className="dash-panel-title"><h2>Riwayat Pemeriksaan Anak</h2><p>Hasil pemeriksaan terakhir{selectedChild ? " " + selectedChild.name : ""}</p></div>
            <button className="text-action" type="button" onClick={() => navigate(PATHS.history)}>Lihat Semua →</button>
          </div>
          <div className="parent-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>Tanggal</th><th>Berat Badan</th><th>Tinggi Badan</th><th>Status BB/U</th><th>Petugas</th></tr>
              </thead>
              <tbody>
                {selectedChild?.hasHistory ? selectedChild.exams.slice(0, 3).map((row) => (
                  <tr key={row.id}>
                    <td><i className="row-dot" />{row.dateText}</td>
                    <td>{row.weight ?? '—'}</td>
                    <td>{row.height ?? '—'}</td>
                    <td>{row.nutrition}</td>
                    <td className="officer">{row.officer}</td>
                  </tr>
                )) : <tr><td colSpan={5}>Belum ada riwayat pemeriksaan.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
