import { forwardRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { SERVICE_OPTIONS, KADER_POOL, initialSessionForm } from './data.js';

// Formulir pembuatan sesi. onSubmit menerima isi form saat valid.
const SessionForm = forwardRef(function SessionForm({ onSubmit }, ref) {
  const [form, setForm] = useState(initialSessionForm);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleService = (item) => setForm((f) => ({
    ...f,
    services: f.services.includes(item) ? f.services.filter((x) => x !== item) : [...f.services, item],
  }));
  const removeKader = (name) => setForm((f) => ({ ...f, kaders: f.kaders.filter((k) => k !== name) }));
  const nextKader = KADER_POOL.find((k) => !form.kaders.includes(k));
  const addKader = () => nextKader && setForm((f) => ({ ...f, kaders: [...f.kaders, nextKader] }));
  const reset = () => { setForm(initialSessionForm); setError(''); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.place.trim()) {
      return setError('Nama sesi, tanggal, dan lokasi kegiatan wajib diisi.');
    }
    if (!Number(form.quota)) return setError('Batas kuota harus berupa angka lebih dari 0.');
    onSubmit(form);
    setForm(initialSessionForm);
    setError('');
  };

  return (
    <form className="panel session-form" onSubmit={submit} ref={ref} noValidate>
      <div className="session-form-head">
        <h3>Buat Sesi Posyandu</h3>
        <span className="gray-pill pill">Desember 2026</span>
      </div>

      <label className="fld plain">
        <span>Nama Sesi & Pos Posyandu</span>
        <input name="sessionName" value={form.name} onChange={set('name')} />
      </label>

      <div className="session-row">
        <label className="fld plain">
          <span>Tanggal Pelaksanaan</span>
          <input type="date" value={form.date} onChange={set('date')} />
        </label>
        <label className="fld plain">
          <span>Rentang Waktu</span>
          <input value={form.time} onChange={set('time')} />
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
          {form.kaders.map((k) => (
            <span key={k} className="kader-chip">
              {k}
              <button type="button" aria-label={`Hapus ${k}`} onClick={() => removeKader(k)}><X size={10} /></button>
            </span>
          ))}
          <button type="button" className="kader-add" onClick={addKader} disabled={!nextKader}>+ Tambah Kader</button>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-text" onClick={reset}>Reset Form</button>
        <button type="submit" className="primary publish">Simpan & Publikasikan Jadwal</button>
      </div>
    </form>
  );
});

export default SessionForm;
