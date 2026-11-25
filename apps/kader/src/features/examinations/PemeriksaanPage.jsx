import { useRef, useState } from 'react';
import { CalendarDays, CirclePlus, Search } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import ExaminationTable from './ExaminationTable.jsx';
import ExaminationForm from './ExaminationForm.jsx';
import { BASE_TOTAL, initialExams } from './data.js';

export default function PemeriksaanPage() {
  const [rows, setRows] = useState(initialExams);
  const [query, setQuery] = useState('');
  const formRef = useRef(null);

  const keyword = query.trim().toLowerCase();
  const visible = rows.filter((r) =>
    [r.name, r.mother, r.nik, ...r.service].some((text) => text.toLowerCase().includes(keyword)));

  const added = rows.length - initialExams.length;
  const total = BASE_TOTAL + added;
  const checked = 34 + added;

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    formRef.current?.querySelector('input[name="child"]')?.focus({ preventScroll: true });
  };

  const addExam = (f) => {
    const service = [f.vaccine];
    const extras = [];
    if (f.vitA) extras.push('Vit A (Merah)');
    if (f.worm) extras.push('Obat Cacing');
    if (f.pmt.length) extras.push('PMT');
    if (extras.length) service.push(`+ ${extras.join(', ')}`);

    setRows((list) => [
      {
        id: Date.now(),
        name: f.child.trim(),
        info: '—',
        mother: '—',
        nik: '—',
        bb: Number(f.bb).toFixed(1),
        bbDelta: '—',
        tb: Number(f.tb).toFixed(1),
        tbDelta: '—',
        lk: f.lk ? Number(f.lk).toFixed(1) : '—',
        status: 'Gizi Baik',
        service,
        officer: 'Kdr. Melati 01',
      },
      ...list,
    ]);
  };

  return (
    <>
      <PageHeader
        tag="Posyandu Melati RW 02"
        meta={<span className="meta-date"><CalendarDays size={14} /> Senin, 01 Desember 2026</span>}
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
          <small>Status Gizi Baik (KMS Hijau)</small>
          <div><strong className="teal">{checked}</strong> <span>Anak</span></div>
        </div>
        <div className="exam-stat">
          <small>Imunisasi Terlaksana</small>
          <div><strong>26</strong> <span>Dosis</span></div>
          <em>Campak, DPT 3, Polio, Vit A</em>
        </div>
      </div>

      <div className="panel exam-panel">
        <h3>Daftar Antrean & Hasil Pemeriksaan</h3>
        <p>Sesi Buka: 08.00 - 12.30 WIB • Ruang Posyandu Balai Warga 02</p>

        <div className="filter sand">
          <Search size={15} />
          <input
            placeholder="Cari nama balita, NIK, nama ibu, atau jenis imunisasi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <ExaminationTable rows={visible} />

        <div className="panel-foot">
          <span>Menampilkan <b>{visible.length}</b> dari <b>{total}</b> balita terdaftar sesi ini</span>
          <Pagination variant="arrows" pages={3} />
        </div>
      </div>

      <ExaminationForm ref={formRef} onSave={addExam} childNames={rows.map((r) => r.name)} />
    </>
  );
}
