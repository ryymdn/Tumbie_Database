import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AtSign, IdCard, Lock, LockKeyhole, MapPin, MessageSquare, UserRound } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout.jsx';
import IconField from '../../components/ui/IconField.jsx';
import CheckBox from '../../components/ui/CheckBox.jsx';
import { PATHS } from '../../data/routes.js';
import { emptyRegisterForm } from './data.js';
import * as check from './validators.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyRegisterForm);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const found = check.compact({
      name: check.required(form.name, 'Nama lengkap'),
      nik: check.nik(form.nik),
      phone: check.phone(form.phone),
      username: check.username(form.username),
      address: check.required(form.address, 'Alamat domisili'),
      password: check.newPassword(form.password),
      confirm: check.sameAs(form.confirm, form.password),
      agree: form.agree ? '' : 'Setujui syarat & ketentuan untuk melanjutkan.',
    });
    setErrors(found);
    if (Object.keys(found).length) return;
    navigate(PATHS.login, { state: { notice: 'Pendaftaran berhasil. Silakan masuk dengan akun Anda.' } });
  };

  return (
    <AuthLayout>
      <form className="auth-form" onSubmit={submit} noValidate>
        <div className="auth-grid">
          <IconField label="Nama Lengkap Ibu / Ayah" required icon={UserRound} placeholder="Contoh: Rina Wati" autoComplete="name" value={form.name} onChange={set('name')} error={errors.name} />
          <IconField label="NIK (KTP 16 Digit)" required icon={IdCard} placeholder="320101xxxxxxxxxx" inputMode="numeric" maxLength={16} value={form.nik} onChange={set('nik')} error={errors.nik} />
          <IconField label="No. WhatsApp Aktif" required icon={MessageSquare} placeholder="081234567890" inputMode="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
          <IconField label="Nama Pengguna (Username)" required icon={AtSign} placeholder="rinawati" autoComplete="username" value={form.username} onChange={set('username')} error={errors.username} />
          <IconField
            className="full"
            label="Alamat Domisili Lengkap"
            required
            multiline
            icon={MapPin}
            placeholder="Contoh: Jl. Mawar No. 12, RT 03 / RW 05, Kelurahan Sukamaju, Kecamatan Cilodong"
            value={form.address}
            onChange={set('address')}
            error={errors.address}
          />
          <IconField label="Kata Sandi" required reveal icon={Lock} placeholder="Minimal 8 karakter" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
          <IconField label="Ulangi Kata Sandi" required reveal icon={LockKeyhole} placeholder="Ketik ulang sandi" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        </div>

        <CheckBox checked={form.agree} onChange={(agree) => setForm((f) => ({ ...f, agree }))} error={errors.agree}>
          Saya menyetujui <strong>Syarat & Ketentuan</strong> serta <strong>Kebijakan Privasi</strong> pengelolaan
          rekam data medis Posyandu Ceria & Puskesmas Pembina.
        </CheckBox>

        <button className="auth-submit teal" type="submit">DAFTAR SEKARANG <ArrowRight size={15} /></button>
      </form>

      <p className="auth-foot">Sudah memiliki akun Tumbie? <Link to={PATHS.login}>Masuk di sini</Link></p>
    </AuthLayout>
  );
}
