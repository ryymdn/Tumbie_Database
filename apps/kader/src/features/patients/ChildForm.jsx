import { forwardRef, useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { emptyChildForm } from './data.js';

// Formulir registrasi balita + orang tua. onSave menerima isi form saat valid.
const ChildForm = forwardRef(function ChildForm({ onSave }, ref) {
  const [form, setForm] = useState(emptyChildForm);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const reset = () => { setForm(emptyChildForm); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    const missing = !form.name.trim() || !form.birth || !form.parent.trim() || !form.nik.trim() || !form.phone.trim() || !form.address.trim();
    if (missing) return setError('Lengkapi semua kolom bertanda * sebelum menyimpan.');
    if (!/^\d{16}$/.test(form.nik.trim())) return setError('NIK harus terdiri dari 16 digit angka.');
    setPending(true);
    setError('');
    try {
      await onSave(form);
      reset();
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
            <span>Nama Orang Tua / Ibu Kandung <b className="req">*</b></span>
            <input placeholder="Tuliskan Nama Orang Tua" value={form.parent} onChange={set('parent')} />
          </label>

          <label className="fld sand-outline">
            <span>Nomor Induk Kependudukan (NIK) <b className="req">*</b></span>
            <input placeholder="Tuliskan 16 digit NIK" inputMode="numeric" maxLength={16} value={form.nik} onChange={set('nik')} />
          </label>

          <label className="fld sand-outline">
            <span>Nomor WhatsApp / HP Aktif <b className="req">*</b></span>
            <input placeholder="08xxxxxxxxxx" inputMode="tel" value={form.phone} onChange={set('phone')} />
          </label>

          <label className="fld sand-outline">
            <span>Alamat Lengkap Domisili <b className="req">*</b></span>
            <input placeholder="Tuliskan alamat lengkap" value={form.address} onChange={set('address')} />
          </label>
        </fieldset>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-outline-plain" onClick={reset}>Batal</button>
        <button type="submit" disabled={pending} className="btn-dark"><Check size={16} /> Simpan Data Balita</button>
      </div>
    </form>
  );
});

export default ChildForm;
