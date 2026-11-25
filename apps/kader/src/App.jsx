import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import { useAuth } from './features/auth/useAuth.js';
import LoginPage from './features/auth/LoginPage.jsx';
import { UserProvider } from './features/auth/UserContext.jsx';
import DashboardPage from './features/dashboard/DashboardPage.jsx';
import DataAnakPage from './features/patients/DataAnakPage.jsx';
import PemeriksaanPage from './features/examinations/PemeriksaanPage.jsx';
import JadwalPage from './features/schedule/JadwalPage.jsx';
import LaporanPage from './features/reports/LaporanPage.jsx';
import ProfilPage from './features/profile/ProfilPage.jsx';

export default function App() {
  const { isLoggedIn, username, login, logout } = useAuth();

  if (!isLoggedIn) return <LoginPage onLogin={login} />;

  return (
    <UserProvider username={username}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppShell onLogout={logout} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/data-anak" element={<DataAnakPage />} />
          <Route path="/pemeriksaan" element={<PemeriksaanPage />} />
          <Route path="/jadwal" element={<JadwalPage />} />
          <Route path="/laporan" element={<LaporanPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="*" element={<DashboardPage />} />
        </Route>
      </Routes>
    </UserProvider>
  );
}
