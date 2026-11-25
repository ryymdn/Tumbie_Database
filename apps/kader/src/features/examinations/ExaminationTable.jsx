import { SquarePen } from 'lucide-react';

const COLUMNS = ['NAMA BALITA', 'NAMA IBU & NIK', 'BB (KG) & ΔBB', 'TB (CM)', 'LK (CM)', 'STATUS GIZI (KMS)', 'IMUNISASI / PMT', 'PETUGAS', 'AKSI'];

const STATUS_CLASS = { 'Gizi Baik': 'teal-pill', 'Gizi Kurang': 'yellow-pill', Stunting: 'red-pill' };

export default function ExaminationTable({ rows }) {
  return (
    <div className="table-wrap">
      <table className="data-table exam-table">
        <thead>
          <tr>{COLUMNS.map((col) => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><b>{r.name}</b><small>{r.info}</small></td>
              <td>{r.mother}<small className="mono">{r.nik}</small></td>
              <td><b>{r.bb} kg</b><small className={r.bbDelta.startsWith('+') ? 'delta up' : 'delta'}>{r.bbDelta}{r.bbDelta.startsWith('+') ? ' ↑' : ''}</small></td>
              <td><b>{r.tb} cm</b><small>{r.tbDelta}</small></td>
              <td className="lk">{r.lk}</td>
              <td><span className={`pill dot small-pill ${STATUS_CLASS[r.status] ?? 'gray-pill'}`}>{r.status}</span></td>
              <td className="service">
                {r.service.map((line) => <span key={line}>{line}</span>)}
              </td>
              <td className="officer">{r.officer}</td>
              <td><button className="icon-btn sand" aria-label={`Ubah pemeriksaan ${r.name}`}><SquarePen size={14} /></button></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={COLUMNS.length} className="table-empty">Tidak ada hasil yang cocok dengan pencarian.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
