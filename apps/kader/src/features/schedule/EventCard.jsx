import { Clock, MapPin, UserRoundCog } from 'lucide-react';

export default function EventCard({ session, onEdit, onQueue, onRetire, retiring }) {
  const {
    featured, weekday, day, month, title, badge, time, place, quotaLabel, quota,
    serviceLabel, services, attendance, remaining, staff = [], staffCount, queueCount,
  } = session;

  const action = onRetire && (
    <button type="button" className="btn-sand" onClick={onRetire} disabled={retiring}>
      {session.queueCount || session.hasExaminations ? 'Batalkan Sesi' : 'Hapus Sesi'}
    </button>
  );

  return (
    <article className={featured ? 'event-card featured' : 'event-card'}>
      <div className="event-top">
        <div className="event-date">
          <small>{weekday}</small>
          <b>{day}</b>
          <small>{month}</small>
        </div>

        <div className="event-title">
          <h3>{title}</h3>
          <span className={`badge ${badge.tone}`}>{badge.tone === 'live' && <i />}{badge.label}</span>
          <p><Clock size={13} /> {time}</p>
          <p><MapPin size={13} /> {place}</p>
        </div>

        <div className="event-quota">
          <small>{quotaLabel}</small>
          <b className={featured ? 'teal' : ''}>{quota}</b>
        </div>
      </div>

      {featured ? (
        <>
          <div className="service-box">
            <small>{serviceLabel}</small>
            <div>{services.map((s) => <span key={s}>{s}</span>)}</div>
          </div>

          <div className="attendance">
            <div className="attendance-text">
              <span>Kehadiran Terverifikasi Kader: {attendance}%</span>
              <span>{remaining}</span>
            </div>
            <div className="attendance-bar"><i style={{ width: `${attendance}%` }} /></div>
          </div>

          <div className="event-bottom">
            <div className="staff">
              <div className="staff-avatars">
                {staff.map((s, i) => <span key={s} className={i === staff.length - 1 && staffCount > staff.length ? 'sand' : ''}>{s}</span>)}
              </div>
              <small>{staffCount} Petugas<br />bertugas</small>
            </div>
            <div className="event-actions">
              <button type="button" className="btn-sand" onClick={onEdit} disabled={!onEdit}>Ubah Jadwal</button>
              {action}
              <button type="button" className="primary" onClick={onQueue}><UserRoundCog size={14} /> Kelola Antrean ({queueCount})</button>
            </div>
          </div>
        </>
      ) : (
        <div className="service-chips">
          {services.map((s) => <span key={s}>{s}</span>)}
          {onEdit && <button type="button" className="btn-sand" onClick={onEdit}>Ubah Jadwal</button>}
          {action}
          <button type="button" className="primary" onClick={onQueue}><UserRoundCog size={14} /> Kelola Antrean ({queueCount})</button>
        </div>
      )}
    </article>
  );
}
