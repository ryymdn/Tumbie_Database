import { useRef, useState } from 'react';
import { CirclePlus } from 'lucide-react';
import StatCard from './StatCard.jsx';
import EventCard from './EventCard.jsx';
import SessionForm from './SessionForm.jsx';
import { scheduleStats, initialSessions, dateParts } from './data.js';

export default function JadwalPage() {
  const [sessions, setSessions] = useState(initialSessions);
  const formRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formRef.current?.querySelector('input[name="sessionName"]')?.focus({ preventScroll: true });
  };

  const addSession = (form) => {
    const { weekday, day, month } = dateParts(form.date);
    setSessions((list) => [
      ...list,
      {
        id: Date.now(),
        weekday,
        day,
        month,
        title: form.name.trim(),
        badge: { label: 'Terjadwal', tone: 'planned' },
        time: form.time.trim(),
        place: form.place.trim(),
        quotaLabel: 'Pendaftar',
        quota: `0 / ${Number(form.quota)} Balita`,
        services: form.services.length ? form.services : ['Layanan belum dipilih'],
      },
    ]);
  };

  return (
    <>
      <div className="schedule-head">
        <h1>Manajemen Jadwal Posyandu</h1>
        <button className="primary add-session" onClick={scrollToForm}><CirclePlus size={16} /> Tambah Sesi Baru</button>
      </div>

      <div className="sched-stats">
        {scheduleStats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {sessions.map((session) => <EventCard key={session.id} session={session} />)}

      <SessionForm ref={formRef} onSubmit={addSession} />
    </>
  );
}
