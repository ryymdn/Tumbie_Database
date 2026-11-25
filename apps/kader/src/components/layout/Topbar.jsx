import { useState } from 'react';
import { Bell, Menu, Search, UserRound } from 'lucide-react';
import { useUser } from '../../features/auth/UserContext.jsx';

export default function Topbar({ onToggleMenu }) {
  const [query, setQuery] = useState('');
  const { name, initial } = useUser();

  return (
    <header className="topbar">
      <button className="hamb" onClick={onToggleMenu} aria-label="Buka menu"><Menu /></button>
      <div className="global-search">
        <Search size={20} />
        <input
          placeholder="Cari data balita, ibu, atau jadwal di sini..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="top-user">
        <button className="bell" aria-label="Notifikasi"><Bell size={20} /><i /></button>
        <div>
          <b>{name}</b>
          <small>Kader Posyandu</small>
        </div>
        <span className="avatar-user"><UserRound size={20} /><em>{initial}</em></span>
      </div>
    </header>
  );
}
