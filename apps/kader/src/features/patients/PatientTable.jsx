import { Pencil, Phone } from 'lucide-react';

const COLUMNS = ['NAMA BALITA', 'TANGGAL LAHIR', 'JENIS KELAMIN', 'NAMA ORANG TUA', 'NO. HP', 'STATUS VERIFIKASI', 'AKSI'];

export default function PatientTable({ rows, message, onVerify, verifyingId }) {
  return (
    <div className="table-wrap">
      <table className="data-table child-table">
        <thead>
          <tr>{COLUMNS.map((col) => <th key={col}>{col}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className={c.status === 'Terverifikasi' ? '' : 'row-pending'}>
              <td>
                <div className="cell-person">
                  <span className={`avatar ${c.tone}`}>{c.initial}</span>
                  <div><b>{c.name}</b><small>Usia: {c.age}</small></div>
                </div>
              </td>
              <td className="nowrap-date">{c.birth}</td>
              <td>
                <span className={`pill gender ${c.gender === 'Perempuan' ? 'pink-pill' : 'blue-pill'}`}>
                  {c.gender === 'Perempuan' ? '♀' : '♂'} {c.gender}
                </span>
              </td>
              <td><b>{c.parent}</b><small>NIK: {c.nik}</small></td>
              <td><span className="phone"><Phone size={12} /> {c.phone}</span></td>
              <td>
                <span className={`pill dot ${c.status === 'Terverifikasi' ? 'green-pill' : 'yellow-pill'}`}>{c.status}</span>
              </td>
              <td><button className="icon-btn" type="button" title="Verifikasi data anak" aria-label={`Verifikasi ${c.name}`} disabled={Boolean(verifyingId) || c.status === 'Terverifikasi'} onClick={() => onVerify(c)}><Pencil size={15} /></button></td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={COLUMNS.length} className="table-empty">{message || 'Belum ada data yang cocok dengan filter.'}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
