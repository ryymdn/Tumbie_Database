import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ChevronDown, ClipboardList, HeartPulse, Ruler, Save } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';
import { PATHS } from '../../data/routes.js';
import { BLOOD_TYPES } from '../../data/parentData.js';
import { formatAge, initialsOf } from '../../data/format.js';

const EMPTY = {
  name: '', birthDate: '', gender: 'Laki-laki',
  birthWeight: '', birthLength: '', headCircumference: '',
  posyandu: '', bloodType: BLOOD_TYPES[0], note: '',
};

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Nama lengkap anak wajib diisi.';
  if (!f.birthDate) e.birthDate = 'Tanggal lahir wajib diisi.';
  else if (new Date(f.birthDate) > new Date()) e.birthDate = 'Tanggal lahir tidak boleh melebihi hari ini.';
  if (!(Number(f.birthWeight) > 0)) e.birthWeight = 'Berat lahir wajib diisi.';
  if (!(Number(f.birthLength) > 0)) e.birthLength = 'Panjang lahir wajib diisi.';
  if (f.headCircumference && !(Number(f.headCircumference) > 0)) e.headCircumference = 'Isi dengan angka yang valid.';
  return e;
}

function Card({ icon: Icon, title, children, className = '' }) {
  return (
    <section className={`form-card ${className}`}>
      <header><span className="form-card-icon"><Icon size={14} /></span><h2>{title}</h2></header>
      {children}
    </section>
  );
}

function Field({ label, required, error, children }) {
  return (
    <label className="form-field">
      <span>{label}{required && ' *'}</span>
      {children}
      {error && <small className="form-error" role="alert">{error}</small>}
    </label>
  );
}

export default function AddChildPage() {
  const navigate = useNavigate();
  const { kids, addChild } = useParent();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [pending, setPending] = useState(false);
  const [posyandu, setPosyandu] = useState([]);
  const [posyanduStatus, setPosyanduStatus] = useState('Memuat daftar Posyandu…');

  useEffect(() => {
    const controller = new AbortController();
    const api = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');
    fetch(`${api}/posyandu`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const { data } = await response.json();
        setPosyandu(data);
        setPosyanduStatus(data.length ? '' : 'Belum ada Posyandu aktif.');
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setPosyanduStatus('Daftar Posyandu gagal dimuat. Periksa backend, lalu muat ulang halaman.');
        }
      });
    return () => controller.abort();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    const found = validate(form);
    if (!form.posyandu) found.posyandu = 'Pilih Posyandu terlebih dahulu.';
    setErrors(found);
    if (Object.keys(found).length) return;
    const selected = posyandu.find((item) => item.id === form.posyandu);
    if (!selected) return;
    setPending(true);
    try {
      await addChild(form);
      navigate(PATHS.children);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="add-child-shell">
      <header className="add-child-topbar">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to={PATHS.children}>Data Anak</Link>
          <ChevronRight size={12} />
          <span aria-current="page">Tambah Data Anak</span>
        </nav>
      </header>

      <form className="add-child-content" onSubmit={handleSubmit} noValidate>
        <div className="add-child-heading">
          <div>
            <h1>Tambah Data Anak</h1>
            <p>Daftarkan anak ke akun Orang Tua untuk memantau KMS, imunisasi, dan jadwal Posyandu.</p>
          </div>
          <Link to={PATHS.children} className="back-pill"><ArrowLeft size={13} />Kembali ke Data Anak</Link>
        </div>

        <div className="add-child-row top">
          <Card icon={ClipboardList} title="Identitas Anak">
            <Field label="Nama Lengkap Anak" required error={errors.name}>
              <input type="text" placeholder="Contoh: Nadia Putri Wijaya" value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field label="Tanggal Lahir" required error={errors.birthDate}>
              <input type="date" value={form.birthDate} onChange={set('birthDate')} max={new Date().toISOString().slice(0, 10)} aria-invalid={Boolean(errors.birthDate)} />
            </Field>
            <fieldset className="form-field">
              <legend>Jenis Kelamin *</legend>
              <div className="gender-row">
                {['Laki-laki', 'Perempuan'].map((g) => (
                  <label key={g} className={`gender-option ${form.gender === g ? 'selected' : ''}`}>
                    <input type="radio" name="gender" value={g} checked={form.gender === g} onChange={set('gender')} />
                    <i className="radio-dot" />{g}
                  </label>
                ))}
              </div>
            </fieldset>
          </Card>

          <aside className="form-card registered-card">
            <h2>Anak Terdaftar di Akun Anda</h2>
            <div className="registered-list">
              {kids.map((k) => (
                <div className="registered-item" key={k.id}>
                  <div className="child-avatar">{initialsOf(k.name)}</div>
                  <div>
                    <strong>{k.name}</strong>
                    <small>{formatAge(k.birthDate, { capital: true })} • {k.latest.nutrition}</small>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <Card icon={Ruler} title="Data Kelahiran & Pengukuran Awal">
          <div className="form-grid three">
            <Field label="Berat Lahir (kg)" required error={errors.birthWeight}>
              <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="3.2" value={form.birthWeight} onChange={set('birthWeight')} aria-invalid={Boolean(errors.birthWeight)} />
            </Field>
            <Field label="Panjang Lahir (cm)" required error={errors.birthLength}>
              <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="49.0" value={form.birthLength} onChange={set('birthLength')} aria-invalid={Boolean(errors.birthLength)} />
            </Field>
            <Field label="Lingkar Kepala (cm)" error={errors.headCircumference}>
              <input type="number" step="0.1" min="0" inputMode="decimal" placeholder="34.0" value={form.headCircumference} onChange={set('headCircumference')} aria-invalid={Boolean(errors.headCircumference)} />
            </Field>
          </div>
        </Card>

        <Card icon={HeartPulse} title="Posyandu & Catatan Kesehatan">
          <div className="form-grid two">
            <Field label="Posyandu Wilayah" required error={errors.posyandu}>
              <span className="select-wrap">
                <select value={form.posyandu} onChange={set('posyandu')} disabled={!posyandu.length} aria-invalid={Boolean(errors.posyandu)}>
                  <option value="">{posyanduStatus || 'Pilih Posyandu'}</option>
                  {posyandu.map(({ id, name, rw }) => (
                    <option key={id} value={id}>{rw ? `${name} (RW ${rw})` : name}</option>
                  ))}
                </select>
                <ChevronDown size={14} />
              </span>
            </Field>
            <Field label="Golongan Darah">
              <span className="select-wrap">
                <select value={form.bloodType} onChange={set('bloodType')}>
                  {BLOOD_TYPES.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} />
              </span>
            </Field>
          </div>
          <Field label="Riwayat Alergi atau Catatan Khusus">
            <textarea rows={3} placeholder="Contoh: Alergi susu sapi atau catatan kelahiran khusus (opsional)" value={form.note} onChange={set('note')} />
          </Field>
        </Card>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate(PATHS.children)}>Batal</button>
          {errors.submit && <p className="form-error" role="alert">{errors.submit}</p>}
          <button type="submit" className="btn-save" disabled={pending || !posyandu.length}>
            <Save size={13} />{pending ? 'Menyimpan…' : 'Simpan Data Anak'}
          </button>
        </div>
      </form>
    </div>
  );
}
