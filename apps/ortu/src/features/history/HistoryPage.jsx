import { ArrowUp } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';
import { EXAMINATIONS, NEXT_SCHEDULE_TEXT } from '../../data/parentData.js';
import { NextScheduleNote, NutritionPill, PageHeading } from '../../components/parent/Widgets.jsx';
import PickChild from '../../components/parent/PickChild.jsx';
import GrowthChart from './GrowthChart.jsx';

function Metric({ label, value, unit, note, up = false, good = false }) {
  return (
    <article className="hist-metric">
      <span>{label}</span>
      <strong className={good ? 'good' : ''}>{value}{unit && <small>{unit}</small>}</strong>
      <em>{up && <ArrowUp size={9} strokeWidth={3} />}{note}</em>
    </article>
  );
}

export default function HistoryPage() {
  const { selectedChild: child } = useParent();
  const { latest } = child;

  return (
    <>
      <PageHeading title="Riwayat Pemeriksaan" description="Catatan lengkap riwayat medis, penimbangan, dan imunisasi berkala.">
        <PickChild withAge />
      </PageHeading>

      <section className="latest-exam-panel">
        <h2>Pemeriksaan Terakhir</h2>
        <p className="exam-sub">{child.hasHistory ? 'Hasil pemeriksaan 03 November 2026 di Posyandu Melati' : 'Belum ada pemeriksaan di Posyandu. Menampilkan data awal saat lahir.'}</p>

        <div className="hist-metrics">
          <Metric label="Berat Badan" value={latest.weight} unit="kg" up={child.hasHistory} note={child.hasHistory ? '+0,3 kg dari bulan lalu' : 'Data awal saat lahir'} />
          <Metric label="Tinggi Badan" value={latest.height} unit="cm" up={child.hasHistory} note={child.hasHistory ? '+1 cm dari bulan lalu' : 'Panjang badan saat lahir'} />
          <Metric label="Lingkar Kepala" value={latest.head} unit={latest.head !== '-' ? 'cm' : ''} note={child.hasHistory ? 'Normal sesuai usia' : 'Data awal saat lahir'} />
          <Metric label="Status Gizi" value={latest.nutrition} good={child.hasHistory} note={child.hasHistory ? 'Garis Hijau KMS' : 'Menunggu pemeriksaan'} />
        </div>

        {child.hasHistory && (
          <div className="growth-panel">
            <div className="growth-copy">
              <h3><i />Tren Pertumbuhan (KMS 6 Bulan)</h3>
              <p>Pertumbuhan fisik anak Anda konsisten naik mengikuti pita hijau standar KMS Kemenkes.</p>
              <div className="growth-legend"><span><i className="lg-weight" />Berat (kg)</span><span><i className="lg-height" />Tinggi (cm)</span></div>
            </div>
            <GrowthChart />
          </div>
        )}
      </section>

      <section className="exam-table-panel">
        <div className="parent-table-wrap">
          <table className="exam-table">
            <thead>
              <tr>
                <th>TANGGAL</th><th>BB (KG)</th><th>TB (CM)</th><th>LK (CM)</th><th>STATUS GIZI</th>
                <th>IMUNISASI & SUPLEMEN</th><th>PETUGAS / BIDAN</th><th>STATUS</th><th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {child.hasHistory ? EXAMINATIONS.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.weight}</td>
                  <td>{row.height}</td>
                  <td>{row.head}</td>
                  <td><NutritionPill variant="green" label="Gizi Baik" /></td>
                  <td>{row.immunization ?? <i className="muted-italic">Pengukuran Rutin</i>}</td>
                  <td>{row.officer}</td>
                  <td><span className="done-pill">Selesai</span></td>
                  <td><button type="button" className="link-btn">Detail</button></td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="table-empty">Belum ada riwayat pemeriksaan untuk {child.name}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <NextScheduleNote text={NEXT_SCHEDULE_TEXT} />
    </>
  );
}
