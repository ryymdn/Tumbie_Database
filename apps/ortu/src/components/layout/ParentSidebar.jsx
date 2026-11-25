import { NavLink } from 'react-router-dom';
import { CalendarDays, ClipboardList, FileClock, Home, LogOut, UserRound } from 'lucide-react';
import { PATHS } from '../../data/routes.js';

const NAV_ITEMS = [
  { to: PATHS.home, label: 'Dashboard', icon: Home },
  { to: PATHS.children, label: 'Data Anak', icon: ClipboardList },
  { to: PATHS.schedule, label: 'Jadwal Posyandu', icon: CalendarDays },
  { to: PATHS.history, label: 'Riwayat Pemeriksaan', icon: FileClock },
  { to: PATHS.profile, label: 'Profile', icon: UserRound },
];

export default function ParentSidebar({ onLogout, open, onClose }) {
  return (
    <>
      {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Tutup menu" />}
      <aside className={`parent-sidebar ${open ? 'open' : ''}`}>
        <img src="/assets/tumbie-logo.png" className="side-logo" alt="Tumbie" />
        <nav aria-label="Menu utama">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={19} strokeWidth={2.5} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button className="logout" type="button" onClick={onLogout}>
          <LogOut size={19} strokeWidth={2.5} />
          Keluar
        </button>
      </aside>
    </>
  );
}
