import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import './notifications.css';

const titles = {
  registration: 'Anak baru menunggu verifikasi',
  verified: 'Data anak terverifikasi',
  exam: 'Hasil pemeriksaan tersedia',
  schedule_updated: 'Jadwal posyandu berubah',
  schedule_cancelled: 'Jadwal posyandu dibatalkan',
};
const dateFormat = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta',
});

export default function NotificationMenu({ request, token, destination, onSelect }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!token) return;
    let active = true;
    let loading = false;
    const refresh = async () => {
      if (loading || document.hidden) return;
      loading = true;
      try {
        const data = await request('notifications', { token });
        if (active) {
          setItems(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        loading = false;
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
    };
  }, [request, token, revision]);

  const unread = items?.filter((item) => !item.read).length ?? 0;

  const select = async (item) => {
    setOpen(false);
    onSelect?.(item);
    if (item.read) return;
    try {
      await request('notifications/read', { token, body: { key: item.key } });
      setItems((current) => current?.map((entry) => entry.key === item.key ? { ...entry, read: true } : entry));
      setRevision((current) => current + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="notification-menu" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={(event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        event.currentTarget.querySelector('button')?.focus();
      }
    }}>
      <button type="button" className="notification-bell"
        aria-label={unread ? 'Notifikasi, ' + unread + ' belum dibaca' : 'Notifikasi'}
        aria-expanded={open} onClick={() => {
          if (!open) setRevision((current) => current + 1);
          setOpen(!open);
        }}>
        <Bell size={20} />
        {unread > 0 && <span aria-hidden="true">{unread}</span>}
      </button>
      {open && (
        <section className="notification-list" aria-label="Daftar notifikasi">
          <h2>Notifikasi</h2>
          {error && <p role="status">{error}</p>}
          {!error && !items && <p role="status">Memuat notifikasi…</p>}
          {!error && items?.length === 0 && <p>Belum ada notifikasi.</p>}
          <ul>
            {items?.map((item) => (
              <li key={item.key}>
                <Link className={item.read ? '' : 'unread'} to={destination(item)} onClick={() => select(item)}>
                  <strong>{titles[item.type]}</strong>
                  <span>{item.name}</span>
                  {item.createdAt && <time dateTime={item.createdAt}>{dateFormat.format(new Date(item.createdAt))}</time>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
