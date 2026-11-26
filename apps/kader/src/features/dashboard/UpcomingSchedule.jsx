import { NavLink } from 'react-router-dom';

export default function UpcomingSchedule({ sessions, message }) {
  return (
    <div className="panel schedule-panel">
      <h2>Jadwal Posyandu</h2>
      <p>Agenda kegiatan terdekat</p>

      <div className="mini-events">
        {!sessions.length && <p role="status">{message || "Belum ada jadwal mendatang."}</p>}
        {sessions.map((s) => (
          <div className="mini-event" key={s.id}>
            <div><b>{s.day}</b><small>{s.month}</small></div>
            <span>{s.name}<small>{s.time}</small></span>
          </div>
        ))}
      </div>

      <NavLink to="/jadwal" className="outline-btn add-btn">+ Tambah</NavLink>
    </div>
  );
}
