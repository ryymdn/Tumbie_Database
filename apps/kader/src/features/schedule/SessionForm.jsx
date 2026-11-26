import { forwardRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { SERVICE_OPTIONS, initialSessionForm } from './data.js';

// Formulir pembuatan sesi. onSubmit menerima isi form saat valid.
const SessionForm = forwardRef(function SessionForm({ onSubmit, locations, monthName, editing, onCancel }, ref) {
  const initial = editing ? {
    name: editing.title, date: editing.date, time: editing.start + ' – ' + editing.end + ' WIB',
    place: editing.place, quota: String(editing.quota ?? ''), bidan: editing.midwife ?? '',
    services: editing.services, kaders: editing.staff,
  } : initialSessionForm;
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const name = form.name.trim().toLowerCase();
  const location = editing ? locations.find((item) => item.id === editing.posyanduId) : locations.length === 1 ? locations[0] : locations
    .filter((item) => name === item.name.toLowerCase() || name.startsWith(item.name.toLowerCase() + ' '))
    .sort((a, b) => b.name.length - a.name.length)[0];
  const staff = location?.staff ?? [];
  const selected = form.kaders.filter((id) => staff.some((item) => item.id === id));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleService = (item) => setForm((f) => ({
    ...f,
    services: f.services.includes(item) ? f.services.filter((x) => x !== item) : [...f.services, item],
  }));
  const removeKader = (name) => setForm((f) => ({ ...f, kaders: f.kaders.filter((k) => k !== name) }));
  const nextKader = staff.find((k) => !selected.includes(k.id));
  const addKader = () => nextKader && setForm((f) => ({ ...f, kaders: [...selected, nextKader.id] }));
  const reset = () => { setForm(initialSessionForm); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    if (!form.name.trim() || !form.date || !form.place.trim()) {
      return setError('Nama sesi, tanggal, dan lokasi kegiatan wajib diisi.');
    }
    if (!Number(form.quota)) return setError('Batas kuota harus berupa angka lebih dari 0.');
    if (!location) return setError(locations.length ? 'Awali nama sesi dengan nama Posyandu wilayah tugas.' : 'Posyandu wilayah tugas belum tersedia.');
    setPending(true);
    setError('');
    try {
      await onSubmit({ ...form, kaders: selected }, location);
      reset();
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="panel session-form" onSubmit={submit} ref={ref} noValidate>
      <div className="session-form-head">
        <h3>{editing ? "Ubah Sesi Posyandu" : "Buat Sesi Posyandu"}</h3>
        <span className="gray-pill pill">{monthName}</span>
      </div>

      <label className="fld plain">
        <span>Nama Sesi & Pos Posyandu</span>
        <input name="sessionName" placeholder={locations.map((item) => item.name).join(" / ")} value={form.name} onChange={set('name')} />
      </label>

      <div className="session-row">
        <label className="fld plain">
          <span>Tanggal Pelaksanaan</span>
          <input type="date" value={form.date} onChange={set('date')} />
        </label>
        <label className="fld plain">
          <span>Rentang Waktu</span>
          <input placeholder="08.00 - 11.00 WIB" value={form.time} onChange={set('time')} />
        </label>
      </div>

      <label className="fld plain">
        <span>Lokasi Kegiatan</span>
        <input value={form.place} onChange={set('place')} />
      </label>

      <div className="fld">
        <span>Layanan Posyandu Disediakan</span>
        <div className="toggle-chips">
          {SERVICE_OPTIONS.map((item) => {
            const on = form.services.includes(item);
            return (
              <button
                key={item}
                type="button"
                className={on ? 'on' : ''}
                aria-pressed={on}
                onClick={() => toggleService(item)}
              >
                {on && <Check size={12} />} {item}
              </button>
            );
          })}
        </div>
      </div>

      <div className="session-row">
        <label className="fld plain">
          <span>Batas Kuota Balita</span>
          <div className="suffix-input">
            <input type="number" min="1" value={form.quota} onChange={set('quota')} />
            <em>Anak</em>
          </div>
        </label>
        <label className="fld plain">
          <span>Bidan Puskesmas PJ</span>
          <input value={form.bidan} onChange={set('bidan')} />
        </label>
      </div>

      <div className="fld">
        <span>Kader Jaga Ditugaskan</span>
        <div className="kader-box">
          {staff.filter((k) => selected.includes(k.id)).map((k) => (
            <span key={k.id} className="kader-chip">
              {k.name}
              <button type="button" aria-label={`Hapus ${k.name}`} onClick={() => removeKader(k.id)}><X size={10} /></button>
            </span>
          ))}
          <button type="button" className="kader-add" onClick={addKader} disabled={!nextKader}>+ Tambah Kader</button>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-text" onClick={editing ? onCancel : reset}>{editing ? "Batal" : "Reset Form"}</button>
        <button type="submit" className="primary publish" disabled={pending}>{editing ? "Simpan Perubahan" : "Simpan & Publikasikan Jadwal"}</button>
      </div>
    </form>
  );
});

export default SessionForm;
