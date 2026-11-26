import { useState } from 'react';
import { Eye, UserRound } from 'lucide-react';
import { authRequest } from './authApi.js';
import { MIN_PASSWORD } from './data.js';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    try {
      const { token, user } = await authRequest('login', {
        body: { identity: username.trim(), password },
      });
      if (user.role !== 'kader') {
        setError('Gunakan akun kader untuk masuk.');
        return;
      }
      onLogin(token, user);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-glass">
        <img className="login-logo" src="/assets/tumbie-logo.png" alt="Tumbie" />
        <h2>Sistem Data Kader</h2>
        <p>Masukkan identitas akun yang telah terdaftar</p>

        <form onSubmit={handleSubmit}>
          <label>Nama Pengguna <b>*</b></label>
          <div className="field">
            <UserRound />
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: dian_sastro"
            />
          </div>

          <label>Kata Sandi</label>
          <div className="field">
            <span className="lock">▢</span>
            <input
              required
              minLength={MIN_PASSWORD}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
            />
            <button type="button" className="eye" onClick={() => setShowPassword((v) => !v)}>
              <Eye size={22} />
            </button>
          </div>
          <small>Min. {MIN_PASSWORD} Karakter</small>

          {error && <p role="alert">{error}</p>}
          <button className="login-btn" type="submit" disabled={pending}>
            {pending ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
