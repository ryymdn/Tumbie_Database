import { useState } from 'react';
import { Search } from 'lucide-react';
import PatientRow from './PatientRow.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { patients } from '../../data/patients.js';

export default function PatientQueue() {
  const [query, setQuery] = useState('');
  const keyword = query.trim().toLowerCase();
  const visible = patients.filter((p) =>
    [p.name, p.guardian, p.pj, p.pos].some((text) => text.toLowerCase().includes(keyword)));

  return (
    <div className="panel queue-panel">
      <h3>Antrean & Pemeriksaan Pasien Hari Ini</h3>
      <p>Kelola status anak yang terdaftar di sesi posyandu hari ini</p>

      <div className="filter">
        <Search size={16} />
        <input placeholder="Filter antrean..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="patient-list">
        {visible.map((p) => <PatientRow key={p.id} patient={p} />)}
        {visible.length === 0 && <div className="empty-note">Tidak ada anak yang cocok dengan pencarian.</div>}
      </div>

      <div className="panel-foot">
        <span>Menampilkan {visible.length} dari 10 pasien terdaftar</span>
        <Pagination variant="plain" pages={3} prevLabel="Sebelumnya" nextLabel="Berikutnya" />
      </div>
    </div>
  );
}
