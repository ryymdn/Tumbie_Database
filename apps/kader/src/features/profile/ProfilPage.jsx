import { useEffect, useRef, useState } from 'react';
import { Camera, CircleCheck, IdCard, ImageUp, Lock, Phone, UserRound } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { initialProfile, initialPassword } from './data.js';
import { MIN_PASSWORD } from '../auth/data.js';

export default function ProfilPage() {
  const [profile, setProfile] = useState(initialProfile);
  const [password, setPassword] = useState(initialPassword);
  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
  const fileRef = useRef(null);

  // Lepas object URL foto lama agar tidak bocor memori.
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);

  const setField = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const setPass = (key) => (e) => setPassword((p) => ({ ...p, [key]: e.target.value }));

  const pickPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const reset = () => {
    setProfile(initialProfile);
    setPassword(initialPassword);
    setMessage(null);
  };

  const save = (e) => {
    e.preventDefault();
    if (password.next && password.next.length < MIN_PASSWORD) {
      return setMessage({ type: 'error', text: `Kata sandi baru minimal ${MIN_PASSWORD} karakter.` });
    }
    if (password.next !== password.confirm) {
      return setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak sama.' });
    }
    setPassword(initialPassword);
    setMessage({ type: 'ok', text: 'Profil berhasil disimpan.' });
  };

  return (
    <>
      <PageHeader
        tag="Posyandu Melati RW 02"
        meta={<span className="meta-region"><i /> Wilayah Binaan Cibinong</span>}
        title="Profil Petugas"
        subtitle="Informasi biodata kader pendamping dan kontak operasional Posyandu Melati RW 02."
      />

      <form className="profile-panel" onSubmit={save} noValidate>
        <div className="profile-hero">
          <div className="profile-photo">
            {photo ? <img src={photo} alt="Foto petugas" /> : <UserRound size={34} />}
            <button type="button" className="photo-cam" onClick={() => fileRef.current?.click()} aria-label="Ganti foto">
              <Camera size={11} />
            </button>
          </div>

          <div className="profile-id">
            <h3>{profile.name}</h3>
            <small>Bidan Koordinator & Pengelola Posyandu</small>
            <div>
              <span className="pill teal-pill"><CircleCheck size={12} /> Kader / Bidan Aktif</span>
              <span className="pill gray-pill">ID Petugas: KD-MLT-02</span>
            </div>
          </div>

          <button type="button" className="photo-btn" onClick={() => fileRef.current?.click()}>
            <ImageUp size={14} /> Ubah Foto
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
        </div>

        <h4 className="section-title"><IdCard size={16} /> Biodata & Penugasan</h4>
        <div className="profile-grid">
          <label className="fld sand">
            <span>Nama Lengkap & Gelar</span>
            <input value={profile.name} onChange={setField('name')} />
          </label>
          <label className="fld sand">
            <span>Peran / Jabatan</span>
            <input value={profile.role} onChange={setField('role')} />
          </label>
          <label className="fld sand">
            <span>NIK / NIP</span>
            <div className="field-icon">
              <input value={profile.nik} onChange={setField('nik')} inputMode="numeric" />
              <CircleCheck size={15} className="ok" />
            </div>
          </label>
          <label className="fld sand">
            <span>Nomor WhatsApp Aktif</span>
            <div className="field-icon">
              <input value={profile.phone} onChange={setField('phone')} inputMode="tel" />
              <Phone size={14} />
            </div>
            <small>Untuk menerima notifikasi & koordinasi warga</small>
          </label>
          <label className="fld sand">
            <span>Wilayah Penugasan</span>
            <input value={profile.area} onChange={setField('area')} />
          </label>
          <label className="fld sand">
            <span>Puskesmas Pembina</span>
            <input value={profile.puskesmas} onChange={setField('puskesmas')} />
          </label>
        </div>

        <h4 className="section-title"><Lock size={16} /> Keamanan Akun</h4>
        <div className="security-box">
          <label className="fld">
            <span>Kata Sandi Baru (Opsional)</span>
            <input type="password" autoComplete="new-password" placeholder="Kosongkan jika tidak diubah" value={password.next} onChange={setPass('next')} />
          </label>
          <label className="fld">
            <span>Konfirmasi Kata Sandi</span>
            <input type="password" autoComplete="new-password" placeholder="Ulangi kata sandi baru" value={password.confirm} onChange={setPass('confirm')} />
          </label>
        </div>

        <div className="form-actions">
          {message && <span className={`save-msg ${message.type}`} role="status">{message.text}</span>}
          <button type="button" className="btn-text" onClick={reset}>Batal</button>
          <button type="submit" className="primary save-btn">Simpan Profil</button>
        </div>
      </form>
    </>
  );
}
