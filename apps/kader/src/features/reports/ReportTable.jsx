import { useRef, useState } from 'react';
import { ChevronRight, ClipboardList, Search } from 'lucide-react';
import Pagination from '../../components/ui/Pagination.jsx';
import { STATUS_TABS } from './data.js';
import WeightForAgeChart from '../../../../shared/WeightForAgeChart.jsx';

const STATUS_CLASS = { 'Berat badan normal': 'green-pill', 'Berat badan kurang': 'yellow-pill', 'Berat badan sangat kurang': 'red-pill', 'Risiko berat badan lebih': 'yellow-pill' };

export default function ReportTable({ reportRows, exams, message }) {
  const [tab, setTab] = useState('Semua');
  const [query, setQuery] = useState('');
  const dialog = useRef(null);
  const [child, setChild] = useState(null);
  const measurements = exams.filter((exam) => exam.childId === child?.childId && exam.weightForAge).map((exam) => ({
    id: exam.id, date: exam.date, ageMonths: exam.weightForAge.ageMonths, weight: Number(exam.bb),
  }));

  const openChart = (record) => {
    setChild(record);
    dialog.current?.showModal();
  };

  const keyword = query.trim().toLowerCase();
  const rows = reportRows.filter((r) =>
    (tab === 'Semua' || r.status === tab) &&
    [r.name, r.mother].some((text) => text.toLowerCase().includes(keyword)));

  return (
    <div className="panel report-panel">
      <dialog ref={dialog} className="panel" aria-labelledby="kms-report-title">
        <h3 id="kms-report-title">Grafik KMS BB/U {child?.name}</h3>
        <p>Berat hasil pemeriksaan dibandingkan dengan ambang WHO BB/U.</p>
        <WeightForAgeChart exams={measurements} gender={child?.gender} />
        <form method="dialog"><button className="action-pill blue">Tutup</button></form>
      </dialog>
      <div className="report-head">
        <div className="report-title">
          <span className="report-icon"><ClipboardList size={16} /></span>
          <div>
            <h3>Data Pemeriksaan Balita</h3>
            <p>Rincian antropometri balita di wilayah tugas kader</p>
          </div>
        </div>

        <div className="report-tools">
          <div className="filter mini">
            <Search size={14} />
            <input placeholder="Cari nama balita / ibu..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="tabs" role="tablist">
            {STATUS_TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`${tab === t ? 'on' : ''} ${t === 'Berat badan sangat kurang' ? 'danger' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'Semua' ? `Semua (${reportRows.length})` : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table report-table">
          <thead>
            <tr>
              <th>IDENTITAS BALITA</th>
              <th>USIA & GENDER</th>
              <th>BERAT BADAN</th>
              <th>TINGGI BADAN</th>
              <th>STATUS BB/U</th>
              <th>TANGGAL PERIKSA</th>
              <th>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="cell-person">
                    <span className={`avatar ${r.tone}`}>{r.initial}</span>
                    <div>
                      <b>{r.name}</b>
                      <small>Wali: {r.mother} • NIK: {r.nik}</small>
                    </div>
                  </div>
                </td>
                <td>{r.age}<small>{r.gender}</small></td>
                <td><b>{r.weight}</b></td>
                <td><b>{r.height}</b>{r.heightForAge && <small>{r.heightForAge.indicator}: {r.heightForAge.status}</small>}</td>
                <td><span className={`pill dot ${STATUS_CLASS[r.status] ?? "gray-pill"}`}>{r.status}</span>{r.weightForHeight && <small>{r.weightForHeight.indicator}: {r.weightForHeight.status}</small>}</td>
                <td>{r.date}</td>
                <td>
                  <button type="button" className="action-pill blue" onClick={() => openChart(r)}>Lihat KMS <ChevronRight size={12} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="table-empty">{message || 'Tidak ada data yang cocok.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel-foot">
        <span>Menampilkan <b>{rows.length}</b> dari <b>{reportRows.length}</b> data pemeriksaan</span>
        <Pagination variant="numbered" pages={1} prevLabel="Sebelumnya" nextLabel="Berikutnya" />
      </div>
    </div>
  );
}
