import { useProfilePhoto } from '../../../../shared/useProfilePhoto.js';
import { useEffect, useRef, useState } from 'react';
import { Camera, CircleCheck, IdCard, ImageUp, Lock, Phone, UserRound } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import { initialProfile, initialPassword } from './data.js';
import { apiRequest, authRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';

function profileRequest(body) {
  return apiRequest('cadre/profile', {
    token: sessionStorage.getItem(STORAGE_KEY),
    method: body ? 'PATCH' : 'GET',
    body,
  });
}

export default function ProfilPage({ onLogout }) {
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    profileRequest().then((account) => {
      if (!active) return;
      const values = { ...initialProfile, ...account, phone: account.phone ?? '', area: account.areas.join(', ') };
      setProfile(values);
      setSaved(values);
    }).catch((error) => { if (active) setMessage({ type: 'error', text: error.message }); });
    return () => { active = false; };
  }, []);
  const [password, setPassword] = useState(initialPassword);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }
  const fileRef = useRef(null);
  const { photo, busy, uploadPhoto, removePhoto } = useProfilePhoto(authRequest, sessionStorage.getItem(STORAGE_KEY), setMessage);


  const setField = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
  const setPass = (key) => (e) => setPassword((p) => ({ ...p, [key]: e.target.value }));


  const reset = () => {
    setProfile(saved ?? initialProfile);
    setPassword(initialPassword);
    setMessage(null);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!saved || pending) return;
    const changingPassword = password.current || password.next || password.confirm;
    if (changingPassword && (!password.current || password.next.length < 8 || password.next !== password.confirm)) {
      return setMessage({ type: 'error', text: 'Isi kata sandi lama, kata sandi baru minimal 8 karakter, dan konfirmasi yang sama.' });
    }
    setPending(true);
    try {
      const updated = await profileRequest({ name: profile.name, phone: profile.phone });
      const values = { ...saved, ...updated, phone: updated.phone ?? '' };
      setProfile(values);
      setSaved(values);
      if (changingPassword) {
        await apiRequest('auth/change-password', {
          token: sessionStorage.getItem(STORAGE_KEY),
          body: { currentPassword: password.current, newPassword: password.next },
        });
        onLogout();
        return;
      }
      setMessage({ type: 'ok', text: 'Profil berhasil disimpan.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PageHeader
        tag={profile.area || "Posyandu"}
        meta={<span className="meta-region"><i /> {profile.area || "Wilayah Penugasan"}</span>}
        title="Profil Petugas"
        subtitle="Informasi biodata kader pendamping dan kontak operasional Posyandu."
      />

      <form className="profile-panel" onSubmit={save} noValidate>
        <div className="profile-hero">
          <div className="profile-photo">
            {photo ? <img src={photo} alt="Foto petugas" /> : <UserRound size={34} />}
            <button type="button" className="photo-cam" disabled={busy} onClick={() => fileRef.current?.click()} aria-label="Ganti foto">
              <Camera size={11} />
            </button>
          </div>

          <div className="profile-id">
            <h3>{profile.name}</h3>
            <small>Kader Posyandu</small>
            <div>
              <span className="pill teal-pill"><CircleCheck size={12} /> Kader / Bidan Aktif</span>
              <span className="pill gray-pill">ID Petugas: {profile.username ?? "—"}</span>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="photo-btn" disabled={busy} onClick={() => fileRef.current?.click()}>
              <ImageUp size={14} /> Ubah Foto
            </button>
            {photo && <button type="button" className="photo-btn" disabled={busy} onClick={removePhoto}>Hapus Foto</button>}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={uploadPhoto} />
        </div>

        <h4 className="section-title"><IdCard size={16} /> Biodata & Penugasan</h4>
        <div className="profile-grid">
          <label className="fld sand">
            <span>Nama Lengkap & Gelar</span>
            <input value={profile.name} onChange={setField('name')} />
          </label>
          <label className="fld sand">
            <span>Peran / Jabatan</span>
            <input value={profile.role} readOnly />
          </label>
          <label className="fld sand">
            <span>NIK / NIP</span>
            <div className="field-icon">
              <input value={profile.nik} readOnly inputMode="numeric" />
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
            <input value={profile.area} readOnly />
          </label>
          <label className="fld sand">
            <span>Puskesmas Pembina</span>
            <input value={profile.puskesmas} readOnly />
          </label>
        </div>

        <h4 className="section-title"><Lock size={16} /> Keamanan Akun</h4>
        <div className="security-box">
          <label className="fld">
            <span>Kata Sandi Lama</span>
            <input type="password" autoComplete="current-password" placeholder="Masukkan kata sandi lama" value={password.current} onChange={setPass('current')} />
          </label>
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
          <button type="submit" disabled={pending || !saved} className="primary save-btn">Simpan Profil</button>
        </div>
      </form>
    </>
  );
}
