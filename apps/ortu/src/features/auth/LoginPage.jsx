import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, UserRound } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import IconField from '../../components/ui/IconField.jsx';
import { PATHS } from '../../data/routes.js';
import { authRequest } from './authApi.js';
import { MIN_PASSWORD_LOGIN } from './data.js';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    const found = {};
    if (!identity.trim()) found.identity = 'Masukkan nama pengguna, No. WhatsApp, atau NIK.';
    if (password.length < MIN_PASSWORD_LOGIN) found.password = `Kata sandi minimal ${MIN_PASSWORD_LOGIN} karakter.`;
    setErrors(found);
    if (Object.keys(found).length) return;
    setPending(true);
    try {
      const { token, user } = await authRequest('login', {
        body: { identity: identity.trim(), password },
      });
      if (user.role !== 'orang_tua') {
        setErrors({ submit: 'Gunakan akun orang tua untuk masuk.' });
        return;
      }
      onLogin(token, user);
      navigate(PATHS.home, { replace: true });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setPending(false);
    }
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

        {errors.submit && <p role="alert">{errors.submit}</p>}
        <button className="auth-submit dark" type="submit" disabled={pending}>
          {pending ? 'Memeriksa…' : 'Masuk'}
        </button>
      </form>

      <p className="auth-foot">Belum punya akun Tumbie? <Link to={PATHS.register}>Daftar di sini</Link></p>
    </AuthLayout>
  );
}
