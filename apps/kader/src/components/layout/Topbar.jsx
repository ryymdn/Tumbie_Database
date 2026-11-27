import { useState } from 'react';
import NotificationMenu from '../../../../shared/NotificationMenu.jsx';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../features/auth/authApi.js';
import { STORAGE_KEY } from '../../features/auth/useAuth.js';
import { Menu, Search, UserRound } from 'lucide-react';
import { useUser } from '../../features/auth/UserContext.jsx';

export default function Topbar({ onToggleMenu }) {
  const [query, setQuery] = useState('');
  const { name, initial } = useUser();
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  const search = async (event) => {
    event.preventDefault();
    const term = query.trim().toLocaleLowerCase('id');
    if (!term || pending) return;
    setPending(true);
    setResults(null);
    setMessage('Mencari…');
    const matches = (value) => value?.toLocaleLowerCase('id').includes(term);
    const options = { token: sessionStorage.getItem(STORAGE_KEY) };
    try {
      const [children, { schedules }] = await Promise.all([
        apiRequest('cadre/children', options),
        apiRequest('schedules', options),
      ]);
      const found = [
        ...children.filter((child) => matches(child.name) || matches(child.parent)).map((child) => ({
          to: '/data-anak?anak=' + child.id,
          title: child.name,
          detail: [child.parent, child.posyandu].filter(Boolean).join(' · '),
        })),
        ...schedules.filter((session) => [session.title, session.posyandu, session.place, session.date].some(matches)).map((session) => ({
          to: '/jadwal?sesi=' + session.id,
          title: session.title,
          detail: [session.date, session.posyandu].filter(Boolean).join(' · '),
        })),
      ];
      setResults(found);
      setMessage(found.length ? '' : 'Tidak ada hasil pencarian.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  };

  const closeResults = () => {
    setResults(null);
    setMessage('');
  };

  return (
    <header className="topbar">
      <button className="hamb" onClick={onToggleMenu} aria-label="Buka menu"><Menu /></button>
      <form className="global-search" role="search" onSubmit={search} onKeyDown={(e) => {
        if (e.key === 'Escape' && !pending) closeResults();
      }}>
        <button className="global-search-submit" type="submit" aria-label="Cari" disabled={pending || !query.trim()}><Search size={20} /></button>
        <input
          aria-label="Cari data balita, orang tua, atau jadwal"
          readOnly={pending}
          placeholder="Cari data balita, ibu, atau jadwal di sini..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); closeResults(); }}
        />
        {(message || results?.length > 0) && (
          <div className="global-search-results">
            {message && <p role="status">{message}</p>}
            {results?.length > 0 && (
              <ul aria-label="Hasil pencarian">
                {results.map((result) => (
                  <li key={result.to}>
                    <Link to={result.to} onClick={closeResults}>
                      <strong>{result.title}</strong>
                      <small>{result.detail}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
      <div className="top-user">
        <NotificationMenu request={apiRequest} token={sessionStorage.getItem(STORAGE_KEY)}
          destination={(item) => '/data-anak?anak=' + item.childId} />
        <div>
          <b>{name}</b>
          <small>Kader Posyandu</small>
        </div>
        <span className="avatar-user"><UserRound size={20} /><em>{initial}</em></span>
      </div>
    </header>
  );
}
