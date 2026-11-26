import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { CalendarDays, CirclePlus, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ExaminationTable from './ExaminationTable.jsx';
import ExaminationForm from './ExaminationForm.jsx';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';

function cadreRequest(path, body) {
  return apiRequest('cadre/' + path, { body, token: sessionStorage.getItem(STORAGE_KEY) });
}

function childLabel(child) {
  return child.name + ' (#' + child.id + ')';
}

function tableRow(exam) {
  const service = [...exam.vaccines, ...exam.pmt.map((name) => 'PMT: ' + name)];
  if (exam.vitA) service.push('Vitamin A');
  if (exam.worm) service.push('Obat Cacing');
  return {
    ...exam,
    info: exam.date || '—',
    mother: exam.mother || '—',
    nik: exam.nik || '—',
    bb: exam.bb ?? '—',
    tb: exam.tb ?? '—',
    lk: exam.lk ?? '—',
    bbDelta: '—',
    tbDelta: '—',
    officer: exam.officer || '—',
    status: exam.weightForAge?.status ?? 'Belum dinilai',
    service: service.length ? service : ['—'],
  };
}

export default function PemeriksaanPage() {
  const [rows, setRows] = useState([]);
  const [children, setChildren] = useState([]);
  const [immunizations, setImmunizations] = useState([]);
  const [pmtTypes, setPmtTypes] = useState([]);
  const [message, setMessage] = useState('');
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());

  useEffect(() => {
    let active = true;
    Promise.all([cadreRequest('children'), cadreRequest('examinations'), cadreRequest('examinations/immunization-types'), cadreRequest('examinations/pmt-types')])
      .then(([children, exams, immunizations, pmtTypes]) => {
        if (!active) return;
        setChildren(children);
        setImmunizations(immunizations);
        setPmtTypes(pmtTypes);
        setRows(exams.map(tableRow));
      })
      .catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);
  const [params] = useSearchParams();
  const childId = params.get('anak');
  const [query, setQuery] = useState('');
  const formRef = useRef(null);
  const editDialog = useRef(null);
  const [edit, setEdit] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const openEdit = (row) => {
    const value = (item) => item === '—' || item == null ? '' : String(item);
    setEdit({ id: row.id, name: row.name, bb: value(row.bb), tb: value(row.tb), lk: value(row.lk), position: row.position ?? '' });
    setEditError('');
    editDialog.current?.showModal();
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!edit || savingEdit) return;
    setSavingEdit(true);
    setEditError('');
    try {
      await apiRequest('cadre/examinations/' + edit.id + '/measurements', {
        token: sessionStorage.getItem(STORAGE_KEY),
        method: 'PATCH',
        body: { bb: Number(edit.bb), tb: Number(edit.tb), lk: edit.lk ? Number(edit.lk) : null, position: edit.position },
      });
      editDialog.current?.close();
      try {
        setRows((await cadreRequest('examinations')).map(tableRow));
        setMessage('');
      } catch {
        setMessage('Pengukuran tersimpan. Muat ulang halaman untuk memuat daftar terbaru.');
      }
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const keyword = query.trim().toLowerCase();
  const visible = rows.filter((r) =>
    (!childId || r.childId === childId) && [r.name, r.mother, r.nik, ...r.service].some((text) => text.toLowerCase().includes(keyword)));

  const todayRows = rows.filter((row) => row.date === today);
  const total = new Set(todayRows.map((row) => row.childId)).size;
  const latestToday = new Map();
  for (const row of todayRows) if (!latestToday.has(row.childId)) latestToday.set(row.childId, row);
  const normal = [...latestToday.values()].filter((row) => row.status === 'Berat badan normal').length;
  const doses = todayRows.reduce((count, row) => count + row.vaccines.length, 0);
  const verified = children.filter((child) => child.registrationStatus === 'verified');

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formRef.current?.querySelector('input[name="child"]')?.focus({ preventScroll: true });
  };

  const addExam = async (form) => {
    const child = verified.find((item) => childLabel(item) === form.child.trim());
    if (!child) throw new Error('Pilih anak terverifikasi dari daftar.');
    await cadreRequest('examinations', {
      ...form,
      childId: child.id,
      bb: Number(form.bb),
      tb: Number(form.tb),
      lk: form.lk ? Number(form.lk) : null,
    });
    try {
      setRows((await cadreRequest('examinations')).map(tableRow));
      setMessage('');
    } catch {
      setMessage('Pemeriksaan tersimpan. Muat ulang halaman untuk memuat daftar terbaru.');
    }
  };

  return (
    <>
      <PageHeader
        tag={[...new Set(children.map((child) => child.posyandu))].join(", ") || "Wilayah Posyandu"}
        meta={<span className="meta-date"><CalendarDays size={14} /> {new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeZone: "Asia/Jakarta" }).format(new Date())}</span>}
        title="Pemeriksaan Bayi, Balita dan Batita"
      >
        <button className="btn-dark" onClick={scrollToForm}><CirclePlus size={16} /> Input Pemeriksaan Baru</button>
      </PageHeader>

      <div className="exam-stats">
        <div className="exam-stat">
          <small>Total Diperiksa Hari Ini</small>
          <div><strong>{total}</strong> <span>Balita</span></div>
        </div>
        <div className="exam-stat">
          <small>Berat Badan Normal (BB/U)</small>
          <div><strong className="teal">{normal}</strong> <span>Anak</span></div>
        </div>
        <div className="exam-stat">
          <small>Imunisasi Terlaksana</small>
          <div><strong>{doses}</strong> <span>Dosis</span></div>
          <em>Imunisasi tercatat hari ini</em>
        </div>
      </div>

      <div className="panel exam-panel">
        <h3>Daftar Antrean & Hasil Pemeriksaan</h3>
        <p>Hasil pemeriksaan di wilayah tugas kader</p>

        <div className="filter sand">
          <Search size={15} />
          <input
            placeholder="Cari nama balita, NIK, nama ibu, atau jenis imunisasi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {message && <p role="status">{message}</p>}
        <ExaminationTable rows={visible} onEdit={openEdit} />

        <div className="panel-foot">
          <span>Menampilkan <b>{visible.length}</b> dari <b>{rows.length}</b> hasil pemeriksaan</span>
          <Pagination variant="arrows" />
        </div>
      </div>

      <dialog ref={editDialog} className="panel" aria-labelledby="exam-edit-title">
        {edit && <form onSubmit={saveEdit}>
          <h3 id="exam-edit-title">Ubah Pengukuran {edit.name}</h3>
          {[
            ['bb', 'Berat badan (kg)', true],
            ['tb', 'Panjang atau tinggi badan (cm)', true],
            ['lk', 'Lingkar kepala (cm)', false],
          ].map(([key, label, required]) => (
            <label className="fld" key={key}>{label}
              <input type="number" min="0.1" step="0.1" required={required} value={edit[key]}
                disabled={savingEdit} onChange={(event) => setEdit((current) => ({ ...current, [key]: event.target.value }))} />
            </label>
          ))}
          <label className="fld">Posisi ukur
            <select required value={edit.position} disabled={savingEdit}
              onChange={(event) => setEdit((current) => ({ ...current, position: event.target.value }))}>
              <option value="">Pilih posisi pengukuran</option>
              <option value="lying">Berbaring</option>
              <option value="standing">Berdiri</option>
            </select>
          </label>
          {editError && <p role="alert">{editError}</p>}
          <div className="panel-foot">
            <button type="button" className="outline-btn" disabled={savingEdit} onClick={() => editDialog.current?.close()}>Batal</button>
            <button type="submit" className="primary" disabled={savingEdit}>Simpan Pengukuran</button>
          </div>
        </form>}
      </dialog>

      <ExaminationForm ref={formRef} onSave={addExam} childNames={verified.map(childLabel)} immunizations={immunizations} pmtTypes={pmtTypes} />
    </>
  );
}
