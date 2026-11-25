import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ParentSidebar from './ParentSidebar.jsx';
import ParentTopbar from './ParentTopbar.jsx';
import { useParent } from '../../context/ParentContext.jsx';

// Kerangka halaman utama: sidebar + topbar + konten (Outlet).
export default function ParentLayout() {
  const { onLogout } = useParent();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <div className="parent-app-shell">
      <ParentSidebar onLogout={onLogout} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="parent-main">
        <ParentTopbar onToggleMenu={() => setMenuOpen((o) => !o)} />
        <section className="parent-page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
