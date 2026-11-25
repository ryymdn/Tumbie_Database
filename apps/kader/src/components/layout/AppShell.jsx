import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppShell({ onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} onLogout={onLogout} />
      <main className="main">
        <Topbar onToggleMenu={() => setMenuOpen((open) => !open)} />
        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
