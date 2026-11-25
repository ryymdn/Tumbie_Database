import { useCallback, useRef } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './features/auth/useAuth.js';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import ForgotPasswordPage from './features/auth/ForgotPasswordPage.jsx';
import LandingPage from './features/landing/LandingPage.jsx';
import ArticlePage from './features/landing/ArticlePage.jsx';
import ParentLayout from './components/layout/ParentLayout.jsx';
import { ParentProvider } from './context/ParentContext.jsx';
import HomePage from './features/home/HomePage.jsx';
import ChildrenPage from './features/children/ChildrenPage.jsx';
import AddChildPage from './features/children/AddChildPage.jsx';
import SchedulePage from './features/schedule/SchedulePage.jsx';
import HistoryPage from './features/history/HistoryPage.jsx';
import ProfilePage from './features/profile/ProfilePage.jsx';
import { PATHS } from './data/routes.js';

// Semua halaman portal hanya bisa dibuka setelah login.
// Setelah tombol Keluar ditekan, pengguna diarahkan ke landing page (bukan halaman masuk).
function ProtectedArea({ isLoggedIn, identity, onLogout, leavingRef }) {
  if (!isLoggedIn) return <Navigate to={leavingRef.current ? PATHS.landing : PATHS.login} replace />;
  return (
    <ParentProvider onLogout={onLogout} identity={identity}>
      <Outlet />
    </ParentProvider>
  );
}

export default function App() {
  const { identity, isLoggedIn, login, logout } = useAuth();
  const navigate = useNavigate();
  const leavingRef = useRef(false);

  const handleLogin = useCallback((value) => {
    leavingRef.current = false;
    login(value);
  }, [login]);

  const handleLogout = useCallback(() => {
    leavingRef.current = true;
    logout();
    navigate(PATHS.landing, { replace: true });
  }, [logout, navigate]);

  return (
    <Routes>
      <Route path={PATHS.landing} element={<LandingPage isLoggedIn={isLoggedIn} />} />
      <Route path={PATHS.article} element={<ArticlePage isLoggedIn={isLoggedIn} />} />
      <Route
        path={PATHS.login}
        element={isLoggedIn ? <Navigate to={PATHS.home} replace /> : <LoginPage onLogin={handleLogin} />}
      />
      <Route path={PATHS.register} element={<RegisterPage />} />
      <Route path={PATHS.forgot} element={<ForgotPasswordPage />} />

      <Route element={<ProtectedArea isLoggedIn={isLoggedIn} identity={identity} onLogout={handleLogout} leavingRef={leavingRef} />}>
        <Route element={<ParentLayout />}>
          <Route path={PATHS.home} element={<HomePage />} />
          <Route path={PATHS.children} element={<ChildrenPage />} />
          <Route path={PATHS.schedule} element={<SchedulePage />} />
          <Route path={PATHS.history} element={<HistoryPage />} />
          <Route path={PATHS.profile} element={<ProfilePage />} />
        </Route>
        <Route path={PATHS.addChild} element={<AddChildPage />} />
      </Route>

      <Route path="*" element={<Navigate to={PATHS.landing} replace />} />
    </Routes>
  );
}
