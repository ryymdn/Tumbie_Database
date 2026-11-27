import { useProfilePhoto } from '../../../../shared/useProfilePhoto.js';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Phone, Plus, AtSign } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';
import { PATHS } from '../../data/routes.js';
import { authRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';
import { initialsOf } from '../../data/format.js';
import { Avatar, NutritionPill, PageHeading } from '../../components/parent/Widgets.jsx';

function Info({ label, value, full = false }) {
  return <div className={full ? 'detail-full' : ''}><span>{label}</span><strong>{value}</strong></div>;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { parent, kids, selectedChild, setSelectedId, nextScheduleText, onLogout } = useParent();
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' });
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const { photo, busy, uploadPhoto, removePhoto } = useProfilePhoto(authRequest, sessionStorage.getItem(STORAGE_KEY), setMessage);
  const fileRef = useRef(null);

  const reset = () => { setPass({ current: '', next: '', confirm: '' }); setMessage(null); };

  const save = async () => {
    if (pending) return;
    if (!pass.current || pass.next.length < 8) {
      return setMessage({ type: 'error', text: 'Isi kata sandi lama dan kata sandi baru minimal 8 karakter.' });
    }
    if (pass.next !== pass.confirm) return setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak sama.' });
    setPending(true);
    try {
      await authRequest('change-password', {
        token: sessionStorage.getItem(STORAGE_KEY),
        body: { currentPassword: pass.current, newPassword: pass.next },
      });
      onLogout();
      navigate(PATHS.login, { replace: true, state: { notice: 'Kata sandi berhasil diubah. Silakan masuk kembali.' } });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setPending(false);
    }
  };


  const openChild = (id) => { setSelectedId(id); navigate(PATHS.children); };

  return (
    <>
      <PageHeading title="Profil Akun" description="Kelola informasi data keluarga, identitas orang tua, dan pengaturan keamanan akun.">
        <button type="button" className="btn-light" onClick={reset}>Batal</button>
        <button type="button" className="btn-dark" onClick={save} disabled={pending}>Simpan Perubahan</button>
      </PageHeading>
      {message && <p className={`profile-message ${message.type}`} role="status">{message.text}</p>}

      <section className="account-banner">
        <div className="account-avatar">
          {photo ? <img src={photo} alt="Foto profil" /> : initialsOf(parent.name)}
          <span className="cam"><Camera size={9} /></span>
        </div>
        <div className="account-info">
          <h2>{parent.name}</h2>
          <p><AtSign size={10} /> ID: @{parent.username} <b>•</b> <Phone size={10} /> WhatsApp: {parent.phone}</p>
          <span className="active-pill">{kids.length} Balita Aktif ({kids.map((k) => k.name).join(', ')})</span>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadPhoto} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn-light small" disabled={busy} onClick={() => fileRef.current?.click()}>Ubah Foto</button>
          {photo && <button type="button" className="btn-light small" disabled={busy} onClick={removePhoto}>Hapus Foto</button>}
        </div>
      </section>

      <div className="profile-cards">
        <section className="sand-card">
          <h2 className="bar-title">Data Pribadi Orang Tua</h2>
          <div className="detail-grid">
            <Info label="Nama Orang Tua" value={parent.name} />
            <Info label="NIK Orang Tua" value={parent.nik} />
            <Info label="No. WhatsApp / HP Aktif" value={parent.phone} full />
            <Info label="Alamat Domisili Sesuai KK" value={parent.addressFull} full />
          </div>
        </section>

        <section className="sand-card">
          <h2 className="bar-title">Keamanan & Kontak Darurat</h2>
          <p className="field-caption">Ubah Kata Sandi</p>
          <div className="pass-row">
            <input type="password" aria-label="Kata Sandi Lama" placeholder="Kata Sandi Lama" autoComplete="current-password" value={pass.current} onChange={(e) => setPass((p) => ({ ...p, current: e.target.value }))} />
            <input type="password" placeholder="Kata Sandi Baru" autoComplete="new-password" value={pass.next} onChange={(e) => setPass((p) => ({ ...p, next: e.target.value }))} />
            <input type="password" placeholder="Konfirmasi Sandi" autoComplete="new-password" value={pass.confirm} onChange={(e) => setPass((p) => ({ ...p, confirm: e.target.value }))} />
          </div>
        </section>
      </div>

      <section className="kids-panel">
        <div className="kids-head">
          <div>
            <h2>Daftar Anak Terdaftar Pada Akun Ini</h2>
            <p>Data balita terverifikasi untuk pemantauan tumbuh kembang KMS Online</p>
          </div>
          <button type="button" className="btn-sand" onClick={() => navigate(PATHS.addChild)}><Plus size={11} strokeWidth={3} />Tambah Data Anak</button>
        </div>
        {kids.map((k) => (
          <div className="kid-row" key={k.id}>
            <Avatar initials={initialsOf(k.name)} />
            <div className="kid-name">
              <strong>{k.name}</strong>
              <span className={`verified-pill small ${k.verified ? '' : 'pending'}`}>{k.verified ? 'Terverifikasi' : 'Menunggu Verifikasi'}</span>
            </div>
            <div className="kid-last">
              <small>Kondisi Terakhir</small>
              <b>{k.latest.nutrition} ({k.latest.weight} kg)</b>
            </div>
            <button type="button" className="btn-dark small" onClick={() => openChild(k.id)}>Kelola Data Anak</button>
          </div>
        ))}
        <p className="kids-note">Jadwal Penimbangan Posyandu berikutnya: <b>{nextScheduleText}</b></p>
      </section>
    </>
  );
}
