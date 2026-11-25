import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, IdCard, Lock, LockKeyhole, MessageSquare } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import IconField from '../../components/ui/IconField.jsx';
import CheckBox from '../../components/ui/CheckBox.jsx';
import { PATHS } from '../../data/routes.js';
import { DEMO_OTP, OTP_COOLDOWN_SECONDS, emptyForgotForm, emptyResetForm } from './data.js';
import * as check from './validators.js';

// Dua langkah: 'verify' (identitas + OTP) lalu 'reset' (kata sandi baru).
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('verify');
  const [form, setForm] = useState(emptyForgotForm);
  const [reset, setReset] = useState(emptyResetForm);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const setVerify = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setNew = (key) => (e) => setReset((r) => ({ ...r, [key]: e.target.value }));

  const identityErrors = () => check.compact({
    nik: check.nik(form.nik),
    phone: check.phone(form.phone),
    username: check.username(form.username),
  });

  const sendOtp = () => {
    const found = identityErrors();
    setErrors(found);
    if (Object.keys(found).length) return;
    setOtpSent(true);
    setCooldown(OTP_COOLDOWN_SECONDS);
  };

  const submitVerify = (e) => {
    e.preventDefault();
    const found = identityErrors();
    if (!otpSent) found.otp = 'Kirim OTP terlebih dahulu.';
    else if (form.otp.trim() !== DEMO_OTP) found.otp = 'Kode OTP tidak sesuai.';
    if (!form.agree) found.agree = 'Setujui syarat & ketentuan untuk melanjutkan.';
    setErrors(found);
    if (Object.keys(found).length) return;
    setStep('reset');
  };

  const submitReset = (e) => {
    e.preventDefault();
    const found = check.compact({
      password: check.newPassword(reset.password),
      confirm: check.sameAs(reset.confirm, reset.password),
      human: reset.human ? '' : 'Centang untuk melanjutkan.',
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    navigate(PATHS.login, { state: { notice: 'Kata sandi berhasil diubah. Silakan masuk kembali.' } });
  };

  if (step === 'reset') {
    return (
      <AuthLayout>
        <form className="auth-form" onSubmit={submitReset} noValidate>
          <div className="auth-grid">
            <IconField label="Kata Sandi" required reveal icon={Lock} placeholder="Minimal 8 karakter" autoComplete="new-password" value={reset.password} onChange={setNew('password')} error={errors.password} />
            <IconField label="Ulangi Kata Sandi" required reveal icon={LockKeyhole} placeholder="Ketik ulang sandi" autoComplete="new-password" value={reset.confirm} onChange={setNew('confirm')} error={errors.confirm} />
          </div>

          <CheckBox checked={reset.human} onChange={(human) => setReset((r) => ({ ...r, human }))} error={errors.human}>
            Saya bukan robot
          </CheckBox>

          <button className="auth-submit teal" type="submit">Ubah Kata Sandi <ArrowRight size={15} /></button>
        </form>
        <p className="auth-foot"><Link to={PATHS.login}>Kembali ke halaman masuk</Link></p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submitVerify} noValidate>
        <IconField label="NIK (KTP 16 Digit)" required icon={IdCard} placeholder="320101xxxxxxxxxx" inputMode="numeric" maxLength={16} value={form.nik} onChange={setVerify('nik')} error={errors.nik} />

        <div className="auth-grid">
          <IconField label="No. WhatsApp Aktif" required icon={MessageSquare} placeholder="081234567890" inputMode="tel" value={form.phone} onChange={setVerify('phone')} error={errors.phone} />
          <IconField label="Nama Pengguna (Username)" required icon={AtSign} placeholder="rinawati" autoComplete="username" value={form.username} onChange={setVerify('username')} error={errors.username} />
        </div>

        <div className="auth-otp-row">
          {otpSent && <small className="auth-hint">Kode demo: {DEMO_OTP}</small>}
          <button type="button" className="auth-otp-btn" onClick={sendOtp} disabled={cooldown > 0}>
            {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : otpSent ? 'Kirim ulang OTP' : 'Kirim OTP'}
          </button>
        </div>

        <IconField label="OTP" required reveal icon={Lock} placeholder="●●●-●●●" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={form.otp} onChange={setVerify('otp')} error={errors.otp} />

        <CheckBox checked={form.agree} onChange={(agree) => setForm((f) => ({ ...f, agree }))} error={errors.agree}>
          Saya menyetujui <strong>Syarat & Ketentuan</strong> serta <strong>Kebijakan Privasi</strong> pengelolaan
          rekam data medis Posyandu Ceria & Puskesmas Pembina.
        </CheckBox>

        <button className="auth-submit teal" type="submit">Membuat Kata Sandi Baru <ArrowRight size={15} /></button>
      </form>
      <p className="auth-foot"><Link to={PATHS.login}>Kembali ke halaman masuk</Link></p>
    </AuthLayout>
  );
}
