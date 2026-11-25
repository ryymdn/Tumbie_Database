import { useState } from 'react';
import { ArrowUp, ChevronRight, ClipboardList, Minus, Search, TriangleAlert, Syringe } from 'lucide-react';
import Pagination from '../../components/ui/Pagination.jsx';
import { STATUS_TABS, TOTAL_EXAMINED, reportRows } from './data.js';

const STATUS_CLASS = { 'Gizi Baik': 'green-pill', 'Gizi Kurang': 'yellow-pill', Stunting: 'red-pill' };

function TrendMark({ trend }) {
  if (trend === 'up') return <ArrowUp size={12} className="trend up" />;
  if (trend === 'flat') return <Minus size={12} className="trend flat" />;
  return <TriangleAlert size={12} className="trend alert" />;
}

export default function ReportTable() {
  const [tab, setTab] = useState('Semua');
  const [query, setQuery] = useState('');

  const keyword = query.trim().toLowerCase();
  const rows = reportRows.filter((r) =>
    (tab === 'Semua' || r.status === tab) &&
    [r.name, r.mother].some((text) => text.toLowerCase().includes(keyword)));

  return (
    <div className="panel report-panel">
      <div className="report-head">
        <div className="report-title">
          <span className="report-icon"><ClipboardList size={16} /></span>
          <div>
            <h3>Data Pemeriksaan Balita Periode November</h3>
            <p>Rincian antropometri lengkap balita RW 05 dengan status kurva pertumbuhan</p>
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
                className={`${tab === t ? 'on' : ''} ${t === 'Stunting' ? 'danger' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'Semua' ? `Semua (${TOTAL_EXAMINED})` : t}
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
              <th>STATUS GIZI</th>
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
                      <b>{r.name}{r.priority && <em className="priority">PRIORITAS</em>}</b>
                      <small>Ibu: {r.mother} • NIK: {r.nik}</small>
                    </div>
                  </div>
                </td>
                <td>{r.age}<small>{r.gender}</small></td>
                <td className={r.trend === 'flat' ? 'warn' : ''}>
                  <b>{r.weight} kg <TrendMark trend={r.trend === 'alert' ? 'up' : r.trend} /></b>
                  <small className={r.trend === 'flat' ? 'orange' : 'green'}>{r.weightDelta}</small>
                </td>
                <td className={r.trend === 'alert' ? 'bad' : ''}>
                  <b>{r.height} cm <TrendMark trend={r.trend === 'flat' ? 'up' : r.trend} /></b>
                  <small className={r.trend === 'alert' ? 'red' : 'green'}>{r.heightDelta}</small>
                </td>
                <td><span className={`pill dot ${STATUS_CLASS[r.status]}`}>{r.status}</span></td>
                <td>{r.date}</td>
                <td>
                  {r.action === 'kms'
                    ? <button className="action-pill blue">Lihat KMS <ChevronRight size={12} /></button>
                    : <button className="action-pill orange"><Syringe size={12} /> Intervensi</button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="table-empty">Tidak ada data yang cocok.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel-foot">
        <span>Menampilkan <b>{rows.length}</b> dari <b>{TOTAL_EXAMINED}</b> data balita terperiksa (Bulan November 2026)</span>
        <Pagination variant="numbered" pages={2} prevLabel="Sebelumnya" nextLabel="Berikutnya" />
      </div>
    </div>
  );
}
