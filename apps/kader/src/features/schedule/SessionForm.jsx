import { forwardRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { SERVICE_OPTIONS, initialSessionForm } from './data.js';

// Formulir pembuatan sesi. onSubmit menerima isi form saat valid.
const SessionForm = forwardRef(function SessionForm({ onSubmit, locations, monthName, editing, onCancel }, ref) {
  const initial = editing ? {
    name: editing.title, date: editing.date, time: editing.start + ' – ' + editing.end + ' WIB',
    place: editing.place, quota: String(editing.quota ?? ''), bidan: editing.midwife ?? '',
    services: editing.services, kaders: editing.staff, posyanduId: String(editing.posyanduId),
  } : { ...initialSessionForm, posyanduId: '' };
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const locationId = form.posyanduId || (locations.length === 1 ? String(locations[0].id) : '');
  const location = locations.find((item) => String(item.id) === locationId);
  const staff = location?.staff ?? [];
  const selected = form.kaders.map(String).filter((id) => staff.some((item) => String(item.id) === id));

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggleService = (item) => setForm((f) => ({
    ...f,
    services: f.services.includes(item) ? f.services.filter((x) => x !== item) : [...f.services, item],
  }));
  const changeLocation = (event) => {
    const posyanduId = event.target.value;
    setError('');
    setForm((current) => ({ ...current, posyanduId, kaders: [] }));
  };
  const removeKader = (id) => setForm((f) => ({ ...f, kaders: f.kaders.filter((k) => String(k) !== String(id)) }));
  const availableStaff = staff.filter((item) => !selected.includes(String(item.id)));
  const addKader = (event) => {
    const id = event.target.value;
    if (id) setForm((current) => ({ ...current, kaders: [...new Set([...current.kaders.map(String), id])] }));
  };
  const reset = () => { setForm({ ...initialSessionForm, posyanduId: '' }); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    if (pending) return;
    if (!form.name.trim() || !form.date || !form.place.trim()) {
      return setError('Nama sesi, tanggal, dan lokasi kegiatan wajib diisi.');
    }
    if (!Number(form.quota)) return setError('Batas kuota harus berupa angka lebih dari 0.');
    if (!location) return setError(locations.length ? 'Pilih Posyandu untuk sesi ini.' : 'Posyandu wilayah tugas belum tersedia.');
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
        <span>Nama Sesi</span>
        <input name="sessionName" placeholder="Contoh: Penimbangan Bulanan" value={form.name} onChange={set('name')} />
      </label>

      <label className="fld plain">
        <span>Posyandu</span>
        <select className="select-sm" value={locationId} onChange={changeLocation} disabled={pending || !locations.length}>
          <option value="">{locations.length ? 'Pilih Posyandu' : 'Posyandu belum tersedia'}</option>
          {locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
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
          {staff.filter((k) => selected.includes(String(k.id))).map((k) => (
            <span key={k.id} className="kader-chip">
              {k.name}
              <button type="button" aria-label={`Hapus ${k.name}`} onClick={() => removeKader(k.id)}><X size={10} /></button>
            </span>
          ))}
          <select aria-label="Tambah Kader" className="select-sm" value="" onChange={addKader} disabled={!availableStaff.length}>
            <option value="">{!location ? 'Pilih Posyandu terlebih dahulu' : !staff.length ? 'Belum ada kader di Posyandu ini' : availableStaff.length ? '+ Tambah Kader' : 'Semua kader sudah dipilih'}</option>
            {availableStaff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
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
