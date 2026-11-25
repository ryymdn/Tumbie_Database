import { Link } from 'react-router-dom';
import { PATHS } from '../../data/routes.js';

// Navbar publik (landing & artikel).
export default function SiteNavbar({ isLoggedIn = false }) {
  return (
    <header className="site-nav">
      <Link to={PATHS.landing} className="site-nav-logo" aria-label="Tumbie — Beranda">
        <img src="/assets/tumbie-logo.png" alt="Tumbie" />
      </Link>
      <nav aria-label="Menu situs">
        <Link to={PATHS.landing}>Beranda</Link>
        <Link to={{ pathname: PATHS.landing, hash: '#layanan' }}>Layanan Posyandu</Link>
        <Link to={{ pathname: PATHS.landing, hash: '#artikel' }}>Artikel Edukasi</Link>
        <Link to={{ pathname: PATHS.landing, hash: '#kontak' }}>Kontak & Bantuan</Link>
        {isLoggedIn
          ? <Link to={PATHS.home}>Dashboard</Link>
          : <Link to={PATHS.register}>Daftar Akun</Link>}
      </nav>
    </header>
  );
}
