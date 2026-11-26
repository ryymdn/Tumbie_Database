import { useEffect, useRef, useState } from 'react';
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
  const [children, setChildren] = useState([]);
  const [tableMessage, setTableMessage] = useState('Memuat data balita…');

  useEffect(() => {
    let active = true;
    apiRequest('cadre/children', { token: sessionStorage.getItem(STORAGE_KEY) })
      .then((rows) => {
        if (!active) return;
        setChildren(rows.map(tableRow));
        setTableMessage('');
      })
      .catch((error) => { if (active) setTableMessage(error.message); });
    return () => { active = false; };
  }, []);
  const [posFilter, setPosFilter] = useState(ALL_POS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);
  const formRef = useRef(null);
  const [verifyingId, setVerifyingId] = useState(null);

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

  const visible = children.filter((c) =>
    (posFilter === ALL_POS || c.pos === posFilter) &&
    (statusFilter === ALL_STATUS || c.status === statusFilter));

  const total = children.length;
  const posOptions = [ALL_POS, ...new Set(children.map((child) => child.pos))];
  const verified = children.filter((child) => child.status === VERIFIED).length;
  const totals = [total, verified, total - verified, posOptions.length - 1];

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formRef.current?.querySelector('input[name="childName"]')?.focus({ preventScroll: true });
  };

  const addChild = async (form) => {
    const child = await apiRequest('cadre/children', {
      token: sessionStorage.getItem(STORAGE_KEY),
      body: form,
    });
    setChildren((list) => [tableRow(child), ...list]);
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
            <select className="select-sm" value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
              {posOptions.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select className="select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <PatientTable rows={visible} message={tableMessage} onVerify={verifyChild} verifyingId={verifyingId} />

        <div className="panel-foot">
          <span>Menampilkan <b>{visible.length}</b> dari <b>{total}</b> balita terdaftar</span>
          <Pagination />
        </div>
      </div>

      <ChildForm ref={formRef} onSave={addChild} />
    </>
  );
}
