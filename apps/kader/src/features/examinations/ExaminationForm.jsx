import { forwardRef, useState } from 'react';
import { Search } from 'lucide-react';
import { VACCINES, PMT_OPTIONS, emptyExamForm } from './data.js';

// Formulir input pemeriksaan. onSave menerima isi form saat valid.
const ExaminationForm = forwardRef(function ExaminationForm({ onSave, childNames }, ref) {
  const [form, setForm] = useState(emptyExamForm);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const toggle = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.checked }));
  const togglePmt = (item) => setForm((f) => ({
    ...f,
    pmt: f.pmt.includes(item) ? f.pmt.filter((x) => x !== item) : [...f.pmt, item],
  }));
  const reset = () => { setForm(emptyExamForm); setError(''); };

  const submit = (e) => {
    e.preventDefault();
    if (!form.child.trim() || !form.date) return setError('Pilih balita dan isi tanggal pemeriksaan.');
    if (!form.bb || !form.tb) return setError('Berat badan dan tinggi badan wajib diisi.');
    onSave(form);
    reset();
  };

  return (
    <form className="panel exam-form" onSubmit={submit} ref={ref} noValidate>
      <div className="exam-form-head">
        <h3>Input Pemeriksaan Anak</h3>
        <span className="pill teal-pill dot">Kader Aktif: Kader Melati 01 (Balai RW 02)</span>
      </div>

      <h4 className="step">1. DATA BALITA & WAKTU PEMERIKSAAN</h4>
      <div className="row-2 wide-left">
        <label className="fld sand">
          <span>Pilih Balita (Nama atau NIK)</span>
          <div className="input-icon">
            <Search size={15} />
            <input
              name="child"
              list="exam-children"
              placeholder="Ketik nama anak, contoh: Bima Satria atau 320101..."
              value={form.child}
              onChange={set('child')}
            />
          </div>
          <datalist id="exam-children">
            {childNames.map((name) => <option key={name} value={name} />)}
          </datalist>
        </label>
        <label className="fld sand">
          <span>Tanggal Pemeriksaan</span>
          <input type="date" value={form.date} onChange={set('date')} />
        </label>
      </div>

      <h4 className="step">2. PENGUKURAN ANTROPOMETRI FISIK</h4>
      <div className="row-3">
        {[
          ['bb', 'Berat Badan (BB)', 'kg', '12.4'],
          ['tb', 'Tinggi Badan (TB/PB)', 'cm', '88.0'],
          ['lk', 'Lingkar Kepala (LK)', 'cm', '48.0'],
        ].map(([key, label, unit, placeholder]) => (
          <label key={key} className="measure">
            <span>{label}</span>
            <div>
              <input type="number" step="0.1" min="0" placeholder={placeholder} value={form[key]} onChange={set(key)} />
              <em>{unit}</em>
            </div>
          </label>
        ))}
      </div>

      <h4 className="step">3. IMUNISASI, VITAMIN, & INTERVENSI PMT</h4>
      <div className="row-2 imun-grid">
        <div className="imun-left">
          <label className="fld sand">
            <span>Jenis Vaksin / Imunisasi Diberikan</span>
            <select value={form.vaccine} onChange={set('vaccine')}>
              {VACCINES.map((v) => <option key={v}>{v}</option>)}
            </select>
          </label>

          <div className="fld">
            <span>Pemberian Kapsul Vitamin A & Obat Cacing</span>
            <div className="check-row">
              <label className="check-box">
                <input type="checkbox" checked={form.vitA} onChange={toggle('vitA')} />
                <i /> Vit A Merah (200.000 IU)
              </label>
              <label className="check-box">
                <input type="checkbox" checked={form.worm} onChange={toggle('worm')} />
                <i /> Obat Cacing Albendazole
              </label>
            </div>
          </div>

          <div className="fld">
            <span>Pemberian Makanan Tambahan (PMT) Pemulihan / Penyuluhan</span>
            <div className="chip-row">
              {PMT_OPTIONS.map((item) => (
                <label key={item} className="check-chip">
                  <input type="checkbox" checked={form.pmt.includes(item)} onChange={() => togglePmt(item)} />
                  <i /> {item}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="imun-right">
          <label className="fld sand">
            <span>Catatan Perkembangan Anak / Gejala Klinis</span>
            <textarea
              placeholder="Contoh: Balita aktif, nafsu makan baik, gigi seri atas baru tumbuh, tidak ada demam atau alergi..."
              value={form.notes}
              onChange={set('notes')}
            />
          </label>
          <label className="fld sand">
            <span>Bidan / Nakes Pendamping</span>
            <input value={form.nakes} onChange={set('nakes')} />
          </label>
        </div>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn-sand" onClick={reset}>Batal</button>
        <button type="submit" className="primary">Simpan Pemeriksaan</button>
      </div>
    </form>
  );
});

export default ExaminationForm;
