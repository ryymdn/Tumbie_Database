import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, IdCard, Lock, LockKeyhole, MessageSquare } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import IconField from '../../components/ui/IconField.jsx';
import CheckBox from '../../components/ui/CheckBox.jsx';
import { PATHS } from '../../data/routes.js';
import { emptyForgotForm, emptyResetForm } from './data.js';
import { authRequest } from './authApi.js';
import * as check from './validators.js';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForgotForm);
  const [reset, setReset] = useState(emptyResetForm);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState(false);
  const [step, setStep] = useState('request');
  const setVerify = (key) => (e) => setForm((fields) => ({ ...fields, [key]: e.target.value }));
  const setNew = (key) => (e) => setReset((fields) => ({ ...fields, [key]: e.target.value }));
  const account = { username: form.username.trim(), nik: form.nik.trim(), phone: form.phone.trim() };
  const accountErrors = () => check.compact({
    nik: check.nik(account.nik),
    phone: check.phone(account.phone),
    username: check.username(account.username),
  });

  const sendOtp = async () => {
    if (pending) return;
    const found = accountErrors();
    setErrors(found);
    setNotice('');
    if (Object.keys(found).length) return;
    setPending(true);
    try {
      await authRequest('password-reset/request', { body: account });
      setNotice('Jika data akun cocok, kode OTP akan dikirim ke WhatsApp terdaftar.');
    } catch (error) {
      setErrors({ otp: error.message });
    } finally {
      setPending(false);
    }
  };

  const submitVerify = (event) => {
    event.preventDefault();
    if (pending) return;
    const found = accountErrors();
    if (!/^\d{6}$/.test(form.otp.trim())) found.otp = 'Masukkan kode OTP 6 digit.';
    if (!form.agree) found.agree = 'Setujui syarat & ketentuan untuk melanjutkan.';
    setErrors(found);
    if (!Object.keys(found).length) setStep('reset');
  };

  const submitReset = async (event) => {
    event.preventDefault();
    if (pending) return;
    const found = check.compact({
      password: check.newPassword(reset.password),
      confirm: check.sameAs(reset.confirm, reset.password),
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    setPending(true);
    try {
      await authRequest('password-reset/confirm', {
        body: { ...account, otp: form.otp.trim(), password: reset.password },
      });
      navigate(PATHS.login, { replace: true, state: { notice: 'Kata sandi berhasil diubah. Silakan masuk kembali.' } });
    } catch (error) {
      setErrors({ reset: error.message });
    } finally {
      setPending(false);
    }
  };

  if (step === 'reset') {
    return (
      <AuthLayout>
        <form className="auth-form" onSubmit={submitReset} noValidate>
          <div className="auth-grid">
            <IconField label="Kata Sandi Baru" required reveal icon={Lock} autoComplete="new-password" value={reset.password} onChange={setNew('password')} error={errors.password} />
            <IconField label="Ulangi Kata Sandi" required reveal icon={LockKeyhole} autoComplete="new-password" value={reset.confirm} onChange={setNew('confirm')} error={errors.confirm} />
          </div>
          {errors.reset && <p role="alert">{errors.reset}</p>}
          <button className="auth-submit teal" type="submit" disabled={pending}>Ubah Kata Sandi <ArrowRight size={15} /></button>
        </form>
        <p className="auth-foot"><button type="button" className="auth-otp-btn" disabled={pending} onClick={() => { setReset(emptyResetForm); setErrors({}); setStep('request'); }}>Kembali ke kode OTP</button></p>
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

          {notice && <small className="auth-hint" role="status">{notice}</small>}
          <button type="button" className="auth-otp-btn" onClick={sendOtp} disabled={pending}>
            Kirim OTP
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
