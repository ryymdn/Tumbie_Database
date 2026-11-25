import { useRef, useState } from 'react';
import { CirclePlus } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import SummaryCard from './SummaryCard.jsx';
import PatientTable from './PatientTable.jsx';
import ChildForm from './ChildForm.jsx';
import {
  ALL_POS, POS_OPTIONS, ALL_STATUS, STATUS_OPTIONS, BASE_TOTAL, PENDING,
  summaryCards, initialChildren, formatDateID, ageInMonths, initialsOf,
} from './data.js';

export default function DataAnakPage() {
  const [children, setChildren] = useState(initialChildren);
  const [posFilter, setPosFilter] = useState(ALL_POS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS);
  const formRef = useRef(null);

  const visible = children.filter((c) =>
    (posFilter === ALL_POS || c.pos === posFilter) &&
    (statusFilter === ALL_STATUS || c.status === statusFilter));

  const total = BASE_TOTAL + (children.length - initialChildren.length);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formRef.current?.querySelector('input[name="childName"]')?.focus({ preventScroll: true });
  };

  const addChild = (form) => {
    const months = ageInMonths(form.birth);
    const nik = form.nik.trim();
    setChildren((list) => [
      {
        id: Date.now(),
        initial: initialsOf(form.name),
        tone: form.gender === 'Perempuan' ? 'pink' : 'blue',
        name: form.name.trim(),
        age: `${months} Bulan`,
        birth: formatDateID(form.birth),
        gender: form.gender === 'Perempuan' ? 'Perempuan' : 'Laki-Laki',
        parent: form.parent.trim(),
        nik: `${nik.slice(0, 4)}************`,
        phone: form.phone.trim(),
        status: PENDING,
        pos: 'Posyandu Melati',
      },
      ...list,
    ]);
    setPosFilter(ALL_POS);
    setStatusFilter(ALL_STATUS);
  };

  return (
    <>
      <PageHeader
        title="Data Balita & Orang Tua"
        subtitle="Kelola registrasi data balita dan ibu/orang tua terdaftar di Posyandu Melati."
      >
        <button className="btn-dark" onClick={scrollToForm}><CirclePlus size={16} /> Tambah Data Balita</button>
      </PageHeader>

      <div className="sum-row">
        {summaryCards.map((card) => <SummaryCard key={card.label} {...card} />)}
      </div>

      <div className="panel">
        <div className="table-head">
          <div>
            <h3>Daftar Registrasi Balita & Ibu</h3>
            <p>Data rekapitulasi balita untuk penimbangan & imunisasi rutin</p>
          </div>
          <div className="table-filters">
            <select className="select-sm" value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
              {POS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
            <select className="select-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <PatientTable rows={visible} />

        <div className="panel-foot">
          <span>Menampilkan <b>{visible.length}</b> dari <b>{total}</b> balita terdaftar</span>
          <Pagination pages={3} />
        </div>
      </div>

      <ChildForm ref={formRef} onSave={addChild} />
    </>
  );
}
