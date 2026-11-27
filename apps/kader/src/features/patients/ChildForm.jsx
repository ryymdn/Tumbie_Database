import { forwardRef, useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';
import { emptyChildForm } from './data.js';

// Formulir registrasi balita + orang tua. onSave menerima isi form saat valid.
const ChildForm = forwardRef(function ChildForm({ onSave }, ref) {
  const [form, setForm] = useState(emptyChildForm);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [nik, setNik] = useState('');
  const [match, setMatch] = useState(null);
  const [posyanduId, setPosyanduId] = useState('');
  const [notice, setNotice] = useState('');

  const findParent = async () => {
    if (lookingUp || pending) return;
    setMatch(null);
    setError('');
    setNotice('');
    if (!/^[0-9]{16}$/.test(nik.trim())) return setError('NIK orang tua harus terdiri dari 16 digit angka.');
    setLookingUp(true);
    try {
      const result = await apiRequest('cadre/guardian-lookup', {
        token: sessionStorage.getItem(STORAGE_KEY),
        body: { nik: nik.trim() },
      });
      setMatch(result);
      setPosyanduId(result.locations.length === 1 ? result.locations[0].id : '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLookingUp(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const reset = () => {
    setForm(emptyChildForm);
    setNik('');
    setMatch(null);
    setPosyanduId('');
    setNotice('');
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (pending || lookingUp) return;
    if (!match) return setError('Cari akun orang tua menggunakan NIK terlebih dahulu.');
    if (!posyanduId) return setError('Pilih Posyandu untuk anak.');
    if (!form.name.trim() || !form.birth) return setError('Isi nama dan tanggal lahir anak.');
    setPending(true);
    setError('');
    setNotice('');
    try {
      await onSave({ ...form, nik: nik.trim(), posyanduId });
      setNotice(form.name.trim() + ' berhasil ditambahkan untuk ' + match.parent.name + '.');
      setForm(emptyChildForm);
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="panel child-form" onSubmit={submit} ref={ref} noValidate>
      <div className="form-title">
        <span className="form-title-icon"><UserPlus size={18} /></span>
        <div>
          <h3>Tambah Data Ibu & Balita</h3>
          <p>Lengkapi formulir registrasi anak dan identitas orang tua secara akurat</p>
        </div>
        <small className="required-note">* Wajib diisi untuk pembuatan KMS</small>
      </div>

      <div className="form-columns">
        <fieldset className="form-box">
          <legend><span className="legend-dot" /> A. DATA ANAK (BALITA)</legend>

          <label className="fld sand-outline">
            <span>Nama Lengkap Anak <b className="req">*</b></span>
            <input name="childName" placeholder="Tuliskan Nama Anak" value={form.name} onChange={set('name')} />
          </label>

          <label className="fld sand-outline">
            <span>Tanggal Lahir <b className="req">*</b></span>
            <input type="date" value={form.birth} onChange={set('birth')} />
          </label>

          <div className="fld">
            <span>Jenis Kelamin <b className="req">*</b></span>
            <div className="gender-toggle" role="radiogroup">
              {['Laki-laki', 'Perempuan'].map((value) => (
                <label key={value} className={form.gender === value ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={form.gender === value}
                    onChange={set('gender')}
                  />
                  <i /> {value}
                </label>
              ))}
            </div>
          </div>

          <label className="fld sand-outline">
            <span>Catatan Khusus / Riwayat Alergi (Opsional)</span>
            <input placeholder="Alergi obat atau lainnya" value={form.notes} onChange={set('notes')} />
          </label>
        </fieldset>

        <fieldset className="form-box">
          <legend><span className="legend-dot" /> B. DATA ORANG TUA / WALI</legend>

          <label className="fld sand-outline">
            <span>NIK Orang Tua Terdaftar <b className="req">*</b></span>
            <input placeholder="Tuliskan 16 digit NIK" inputMode="numeric" maxLength={16}
              value={nik} disabled={lookingUp || pending} onChange={(event) => {
                setNik(event.target.value);
                setMatch(null);
                setNotice('');
                setError('');
              }} onKeyDown={(event) => {
                if (event.key === 'Enter') { event.preventDefault(); findParent(); }
              }} />
          </label>
          <button type="button" className="btn-outline-plain" disabled={lookingUp || pending} onClick={findParent}>
            {lookingUp ? 'Mencari…' : 'Cari Orang Tua'}
          </button>
          {match && (
            <>
              <p role="status">Orang tua terpilih: <strong>{match.parent.name}</strong></p>
              <label className="fld sand-outline">
                <span>Posyandu Anak <b className="req">*</b></span>
                <select className="select-sm" value={posyanduId} disabled={pending} onChange={(event) => setPosyanduId(event.target.value)}>
                  <option value="">Pilih Posyandu</option>
                  {match.locations.map((location) => (
                    <option key={location.id} value={location.id}>{location.name}{location.rw ? ' (RW ' + location.rw + ')' : ''}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </fieldset>
      </div>

      {notice && <p role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-outline-plain" disabled={pending || lookingUp} onClick={reset}>Batal</button>
        <button type="submit" disabled={pending || lookingUp} className="btn-dark"><Check size={16} /> Simpan Data Balita</button>
      </div>
    </form>
  );
});

export default ChildForm;
