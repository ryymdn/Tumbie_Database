import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../../data/navigation.js';

export default function Sidebar({ open, onNavigate, onLogout }) {
  return (
    <aside className={open ? 'sidebar open' : 'sidebar'}>
      <img src="/assets/tumbie-logo.png" className="side-logo" alt="Tumbie" />
      <nav>
        {NAV_ITEMS.map(({ label, path, icon: Icon, filled }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onNavigate}
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Icon size={21} fill={filled ? 'currentColor' : 'none'} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <button className="logout" onClick={onLogout}>
        <LogOut size={21} /> Keluar
      </button>
    </aside>
  );
}
