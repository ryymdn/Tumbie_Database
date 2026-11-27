import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CirclePlus } from 'lucide-react';
import StatCard from './StatCard.jsx';
import EventCard from './EventCard.jsx';
import SessionForm from './SessionForm.jsx';
import { scheduleStats, dateParts } from './data.js';

import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';

function request(body, id) {
  return apiRequest(id ? 'schedules/' + id : 'schedules', { body, method: id ? 'PATCH' : body ? 'POST' : 'GET', token: sessionStorage.getItem(STORAGE_KEY) });
}

const badges = {
  upcoming: { label: 'Terjadwal', tone: 'planned' },
  ongoing: { label: 'Sedang Berlangsung', tone: 'live' },
  completed: { label: 'Selesai', tone: 'planned' },
  cancelled: { label: 'Dibatalkan', tone: 'planned' },
};

export default function JadwalPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sesi');
  const [data, setData] = useState({ schedules: [], locations: [] });
  const [message, setMessage] = useState('Memuat jadwal…');
  const { schedules, locations } = data;
  const visible = sessionId ? schedules.filter((session) => String(session.id) === sessionId) : schedules;
  const now = new Date();
  const month = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' }).format(now);
  const monthName = new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', year: 'numeric', month: 'long' }).format(now);
  const active = schedules.filter((s) => s.date.startsWith(month) && ['upcoming', 'ongoing'].includes(s.status));
  const quota = active.reduce((sum, s) => sum + (s.quota ?? 0), 0);
  const cadres = new Set(active.flatMap((s) => s.staff)).size;
  const midwives = new Set(active.map((s) => s.midwife).filter(Boolean)).size;
  const stats = [
    { value: active.length + ' Sesi', sub: monthName, foot: active.filter(s => s.status === 'ongoing').length + ' sesi sedang berjalan' },
    { value: quota + ' Balita', sub: 'Wilayah tugas', foot: 'Total kuota sesi aktif' },
    { value: (cadres + midwives) + ' Petugas', sub: 'Terjadwal', foot: midwives + ' Bidan Puskesmas' },
  ];

  useEffect(() => {
    let active = true;
    request().then((value) => {
      if (!active) return;
      setData(value);
      setMessage('');
    }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  const formRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const dialog = useRef(null);
  const [queue, setQueue] = useState(null);
  const [queueMessage, setQueueMessage] = useState('');
  const [queuePending, setQueuePending] = useState(false);
  const [retiring, setRetiring] = useState(false);

  const retireSession = async (session) => {
    const cancel = Boolean(session.queueCount || session.hasExaminations);
    const question = cancel
      ? 'Batalkan sesi "' + session.title + '"? Orang tua yang sudah mendaftar akan mendapat notifikasi.'
      : 'Hapus sesi kosong "' + session.title + '"?';
    if (retiring || !window.confirm(question)) return;
    setRetiring(true);
    try {
      const result = await apiRequest('schedules/' + session.id + (cancel ? '/cancel' : ''), {
        token: sessionStorage.getItem(STORAGE_KEY),
        method: cancel ? 'POST' : 'DELETE',
      });
      setData((current) => ({
        ...current,
        schedules: cancel
          ? current.schedules.map((item) => item.id === session.id ? { ...item, status: result.status } : item)
          : current.schedules.filter((item) => item.id !== session.id),
      }));
      setEditing((current) => current?.id === session.id ? null : current);
      setMessage(cancel ? 'Sesi dibatalkan.' : 'Sesi dihapus.');
    } catch (error) {
      setMessage(error.message);
      try { setData(await request()); } catch {}
    } finally {
      setRetiring(false);
    }
  };

  const openQueue = async (session) => {
    setQueue({ session, rows: [] });
    setQueueMessage('Memuat antrean…');
    dialog.current?.showModal();
    try {
      const token = sessionStorage.getItem(STORAGE_KEY);
      const rows = await apiRequest('schedules/' + session.id + '/queue', { token });
      setQueue({ session, rows });
      setQueueMessage('');
    } catch (error) {
      setQueueMessage(error.message);
    }
  };

  const markAttendance = async (child) => {
    if (queuePending) return;
    setQueuePending(true);
    try {
      const token = sessionStorage.getItem(STORAGE_KEY);
      const { attended } = await apiRequest('schedules/' + queue.session.id + '/queue/' + child.childId, {
        token, method: 'PATCH', body: { attended: !child.attended },
      });
      setQueue((current) => ({
        ...current,
        rows: current.rows.map((row) => row.childId === child.childId ? { ...row, attended } : row),
      }));
      setQueueMessage('');
    } catch (error) {
      setQueueMessage(error.message);
    } finally {
      setQueuePending(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formRef.current?.querySelector('input[name="sessionName"]')?.focus({ preventScroll: true });
  };

  const saveSession = async (form, location) => {
    const times = form.time.trim().match(/^(\d{1,2})[.:](\d{2})\s*[-–—]\s*(\d{1,2})[.:](\d{2})(?:\s*WIB)?$/i);
    if (!times) throw new Error('Isi rentang waktu seperti 08.00 - 11.00 WIB.');
    await request({
      posyanduId: location.id,
      title: form.name,
      date: form.date,
      start: times[1].padStart(2, '0') + ':' + times[2],
      end: times[3].padStart(2, '0') + ':' + times[4],
      place: form.place,
      quota: Number(form.quota),
      midwife: form.bidan,
      services: form.services,
      staff: form.kaders,
    }, editing?.id);
    setEditing(null);
    try {
      setData(await request());
      setMessage('');
    } catch {
      setMessage('Jadwal tersimpan. Muat ulang halaman untuk melihat jadwal terbaru.');
    }
  };

  return (
    <>
      <div className="schedule-head">
        <h1>Manajemen Jadwal Posyandu</h1>
        <button className="primary add-session" onClick={() => { setEditing(null); scrollToForm(); }}><CirclePlus size={16} /> Tambah Sesi Baru</button>
      </div>

      <div className="sched-stats">
        {scheduleStats.map((s, i) => <StatCard key={s.label} {...s} {...stats[i]} />)}
      </div>

      {message && <p role="status">{message}</p>}
      {sessionId && <Link to="/jadwal">Tampilkan semua jadwal</Link>}
      {!message && !visible.length && <p>{sessionId ? "Jadwal tidak ditemukan." : "Belum ada jadwal Posyandu."}</p>}
      {visible.map((session) => <EventCard key={session.id} onQueue={() => openQueue(session)}
        retiring={retiring} onRetire={session.status === "upcoming" ? () => retireSession(session) : undefined} onEdit={session.status === "upcoming" ? () => { setEditing(session); scrollToForm(); } : undefined} session={{
        ...session,
        ...dateParts(session.date),
        badge: badges[session.status] ?? badges.upcoming,
        time: session.start + ' – ' + session.end + ' WIB',
        quotaLabel: 'Kapasitas',
        quota: session.quota ? session.quota + ' Balita' : '—',
      }} />)}

      <dialog ref={dialog} className="panel" aria-labelledby="schedule-queue-title">
        <h3 id="schedule-queue-title">Antrean {queue?.session.title}</h3>
        {queueMessage && <p role="status">{queueMessage}</p>}
        {!queueMessage && queue?.rows.length === 0 && <p>Belum ada pendaftar.</p>}
        <ol>
          {queue?.rows.map((child) => (
            <li key={child.childId}>
              {child.name} {' '}
              <button type="button" className="btn-sand"
                disabled={queuePending || !['upcoming', 'ongoing'].includes(queue.session.status)}
                onClick={() => markAttendance(child)}>
                {child.attended ? 'Hadir' : 'Tandai Hadir'}
              </button>
            </li>
          ))}
        </ol>
        <form method="dialog"><button className="outline-btn">Tutup</button></form>
      </dialog>

      <SessionForm key={editing?.id ?? "new"} ref={formRef} onSubmit={saveSession} locations={locations} monthName={monthName} editing={editing} onCancel={() => setEditing(null)} />
    </>
  );
}
