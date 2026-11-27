import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CirclePlus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import SummaryCard from './SummaryCard.jsx';
import PatientTable from './PatientTable.jsx';
import ChildForm from './ChildForm.jsx';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';
import {
  ALL_POS, ALL_STATUS, STATUS_OPTIONS, VERIFIED, PENDING,
  summaryCards, formatDateID, ageInMonths, initialsOf,
} from './data.js';

function tableRow(child) {
  return {
    ...child,
    initial: initialsOf(child.name),
    tone: child.gender === 'Perempuan' ? 'pink' : 'blue',
    age: ageInMonths(child.birthDate) + ' Bulan',
    birth: formatDateID(child.birthDate),
    status: child.registrationStatus === 'verified' ? VERIFIED : PENDING,
    pos: child.posyandu,
    parent: child.parent ?? '—',
    nik: child.nik ?? '—',
    phone: child.phone ?? '—',
  };
}

export default function DataAnakPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const childId = searchParams.get('anak');
  const [children, setChildren] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tableMessage, setTableMessage] = useState('Memuat data balita…');

  useEffect(() => {
    let active = true;
    const options = { token: sessionStorage.getItem(STORAGE_KEY) };
    Promise.all([apiRequest('cadre/children', options), apiRequest('cadre/locations', options)])
      .then(([rows, locations]) => {
        if (!active) return;
        setChildren(rows.map(tableRow));
        setLocations(locations);
        setTableMessage('');
      })
      .catch((error) => { if (active) setTableMessage(error.message); });
    return () => { active = false; };
  }, []);
  const [posFilter, setPosFilter] = useState(ALL_POS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);
  const formRef = useRef(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const editDialog = useRef(null);
  const [draft, setDraft] = useState(null);
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState(false);

  const deleteChild = async (child) => {
    if (deleting || verifyingId || !window.confirm('Hapus data ' + child.name + ' secara permanen?')) return;
    setDeleting(true);
    setNotice('');
    try {
      await apiRequest('cadre/children/' + child.id, { token: sessionStorage.getItem(STORAGE_KEY), method: 'DELETE' });
      setChildren((list) => list.filter((item) => String(item.id) !== String(child.id)));
      setNotice('Data anak dihapus.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = ({ id, name, birthDate, gender }) => {
    setDraft({ id, name, birthDate, gender });
    setEditError('');
    setNotice('');
    editDialog.current?.showModal();
  };

  const setField = (key) => (event) => {
    const value = event.target.value;
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    if (saving || !draft) return;
    setSaving(true);
    setEditError('');
    try {
      const { id, ...body } = draft;
      const updated = await apiRequest('cadre/children/' + id, {
        token: sessionStorage.getItem(STORAGE_KEY),
        method: 'PATCH',
        body,
      });
      setChildren((list) => list.map((item) => item.id === updated.id ? tableRow({ ...item, ...updated }) : item));
      setNotice('Perubahan data anak tersimpan.');
      editDialog.current?.close();
    } catch (error) {
      setEditError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const verifyChild = async (child) => {
    if (verifyingId || !window.confirm('Verifikasi data ' + child.name + '?')) return;
    setVerifyingId(child.id);
    try {
      const result = await apiRequest('cadre/children/' + child.id + '/verify', {
        token: sessionStorage.getItem(STORAGE_KEY),
        method: 'PATCH',
      });
      setChildren((list) => list.map((item) => item.id === result.id ? { ...item, status: VERIFIED } : item));
    } catch (error) {
      window.alert(error.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const visible = children.filter((c) => childId ? String(c.id) === childId : (
    (posFilter === ALL_POS || String(c.posyanduId) === posFilter) &&
    (statusFilter === ALL_STATUS || c.status === statusFilter)));

  const total = children.length;
  const verified = children.filter((child) => child.status === VERIFIED).length;
  const totals = [total, verified, total - verified, new Set(children.map((child) => child.posyanduId)).size];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formRef.current?.querySelector('input[name="childName"]')?.focus({ preventScroll: true });
  };

  const addChild = async (form) => {
    const child = await apiRequest('cadre/children', {
      token: sessionStorage.getItem(STORAGE_KEY),
      body: form,
    });
    setChildren((list) => [tableRow(child), ...list.filter((item) => String(item.id) !== String(child.id))]);
    setTableMessage('');
    if (childId) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('anak');
      setSearchParams(nextParams, { replace: true });
    }
    setPosFilter(ALL_POS);
    setStatusFilter(ALL_STATUS);
  };

  return (
    <>
      <PageHeader
        title="Data Balita & Orang Tua"
        subtitle="Kelola registrasi data balita dan ibu/orang tua terdaftar di wilayah tugas kader."
      >
        <button className="btn-dark" onClick={scrollToForm}><CirclePlus size={16} /> Tambah Data Balita</button>
      </PageHeader>

      <div className="sum-row">
        {summaryCards.map((card, index) => <SummaryCard key={card.label} {...card} value={tableMessage ? "—" : String(totals[index])} note={index === 0 ? "Wilayah tugas" : index === 3 ? "Memiliki data balita" : card.note} />)}
      </div>

      <div className="panel">
        <div className="table-head">
          <div>
            <h3>Daftar Registrasi Balita & Ibu</h3>
            <p>Data rekapitulasi balita untuk penimbangan & imunisasi rutin</p>
          </div>
          <div className="table-filters">
            <select aria-label="Filter Posyandu" className="select-sm" value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
              <option value={ALL_POS}>{ALL_POS}</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            <select className="select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        {childId && <Link to="/data-anak">Tampilkan semua balita</Link>}
        {notice && <p role="status">{notice}</p>}
        <PatientTable rows={visible} message={tableMessage} onEdit={openEdit} onDelete={deleteChild} deleting={deleting} onVerify={verifyChild} verifyingId={verifyingId} />

        <div className="panel-foot">
          <span>Menampilkan <b>{visible.length}</b> dari <b>{total}</b> balita terdaftar</span>
          <Pagination />
        </div>
      </div>

      <dialog className="panel" ref={editDialog} aria-labelledby="edit-child-title"
        onCancel={(event) => { if (saving) event.preventDefault(); }}>
        <h3 id="edit-child-title">Edit Data Anak</h3>
        {draft && (
          <form onSubmit={saveEdit}>
            <label className="fld">Nama Anak
              <input value={draft.name} onChange={setField('name')} maxLength={150} required />
            </label>
            <label className="fld">Tanggal Lahir
              <input type="date" value={draft.birthDate} onChange={setField('birthDate')} required />
            </label>
            <label className="fld">Jenis Kelamin
              <select value={draft.gender} onChange={setField('gender')} required>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </label>
            {editError && <p role="alert">{editError}</p>}
            <div className="form-actions">
              <button type="button" className="btn-text" disabled={saving} onClick={() => editDialog.current?.close()}>Batal</button>
              <button type="submit" className="primary" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan Perubahan'}</button>
            </div>
          </form>
        )}
      </dialog>
      <ChildForm ref={formRef} onSave={addChild} />
    </>
  );
}
