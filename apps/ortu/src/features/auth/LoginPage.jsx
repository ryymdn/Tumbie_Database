import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, UserRound } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import IconField from '../../components/ui/IconField.jsx';
import { PATHS } from '../../data/routes.js';
import { MIN_PASSWORD_LOGIN } from './data.js';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const found = {};
    if (!identity.trim()) found.identity = 'Masukkan nama pengguna, No. WhatsApp, atau NIK.';
    if (password.length < MIN_PASSWORD_LOGIN) found.password = `Kata sandi minimal ${MIN_PASSWORD_LOGIN} karakter.`;
    setErrors(found);
    if (Object.keys(found).length) return;
    onLogin(identity.trim());
    navigate(PATHS.home, { replace: true });
  };

  return (
    <AuthLayout>
      <h1 className="auth-title">Masuk Akun</h1>
      <p className="auth-sub">Masukkan identitas akun yang telah terdaftar di kader Posyandu.</p>

      {state?.notice && <p className="auth-notice" role="status">{state.notice}</p>}

      <form className="auth-form" onSubmit={submit} noValidate>
        <IconField
          variant="outlined"
          label="Nama Pengguna / No. WhatsApp / NIK"
          required
          icon={UserRound}
          placeholder="Contoh: rina_wati atau 081234567890"
          autoComplete="username"
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          error={errors.identity}
        />

        <div>
          <IconField
            variant="outlined"
            label="Kata Sandi"
            reveal
            icon={Lock}
            placeholder="Masukkan kata sandi"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <small className="auth-hint">Min. {MIN_PASSWORD_LOGIN} Karakter</small>
        </div>

        <Link className="auth-link right" to={PATHS.forgot}>Lupa kata sandi?</Link>

        <button className="auth-submit dark" type="submit">Masuk</button>
      </form>

      <p className="auth-foot">Belum punya akun Tumbie? <Link to={PATHS.register}>Daftar di sini</Link></p>
    </AuthLayout>
  );
}
