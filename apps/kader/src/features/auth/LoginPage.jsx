import { useState } from 'react';
import { Eye, UserRound } from 'lucide-react';
import { MIN_PASSWORD } from './data.js';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username);
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

          <button className="login-btn">Masuk</button>
        </form>
      </div>
    </div>
  );
}
