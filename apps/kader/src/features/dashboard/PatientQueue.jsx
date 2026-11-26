import { useState } from 'react';
import { Search } from 'lucide-react';
import PatientRow from './PatientRow.jsx';
import Pagination from '../../components/ui/Pagination.jsx';

export default function PatientQueue({ patients, message }) {
  const [query, setQuery] = useState('');
  const keyword = query.trim().toLowerCase();
  const visible = patients.filter((p) =>
    [p.name, p.guardian, p.pj, p.pos].some((text) => text.toLowerCase().includes(keyword)));

  return (
    <div className="panel queue-panel">
      <h3>Antrean & Pemeriksaan Pasien Hari Ini</h3>
      <p>Anak dengan pemeriksaan tercatat hari ini di wilayah tugas kader</p>

      <div className="filter">
        <Search size={16} />
        <input placeholder="Filter antrean..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="patient-list">
        {visible.map((p) => <PatientRow key={p.id} patient={p} />)}
        {visible.length === 0 && <div className="empty-note">{message || (keyword ? 'Tidak ada anak yang cocok dengan pencarian.' : 'Belum ada pemeriksaan tercatat hari ini.')}</div>}
      </div>

      <div className="panel-foot">
        <span>Menampilkan {visible.length} dari {patients.length} anak diperiksa</span>
        <Pagination variant="plain" pages={1} prevLabel="Sebelumnya" nextLabel="Berikutnya" />
      </div>
    </div>
  );
}
