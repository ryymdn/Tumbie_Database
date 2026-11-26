import { useRef, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';
import { NextScheduleNote, PageHeading } from '../../components/parent/Widgets.jsx';
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
  const { selectedChild: child, nextScheduleText } = useParent();
  const latest = child?.latest;
  const dialog = useRef(null);
  const [detail, setDetail] = useState(null);

  return (
    <>
      <PageHeading title="Riwayat Pemeriksaan" description="Catatan lengkap riwayat medis, penimbangan, dan imunisasi berkala.">
        {child && <PickChild withAge />}
      </PageHeading>

      <section className="latest-exam-panel">
        <h2>Pemeriksaan Terakhir</h2>
        <p className="exam-sub">{child?.hasHistory ? "Hasil pemeriksaan " + child.exams[0].dateText + " di " + child.posyandu : 'Belum ada pemeriksaan di Posyandu.'}</p>

        {child?.exams[0]?.heightForAge && <p className="exam-sub">
          {child.exams[0].heightForAge.indicator}: {child.exams[0].heightForAge.status}
          {child.exams[0].weightForHeight && ' · ' + child.exams[0].weightForHeight.indicator + ': ' + child.exams[0].weightForHeight.status}
        </p>}
        <div className="hist-metrics">
          <Metric label="Berat Badan" value={latest?.weight ?? '—'} unit={latest?.weight && latest.weight !== "—" ? "kg" : undefined} note={child?.hasHistory ? 'Pengukuran terakhir' : 'Menunggu pemeriksaan'} />
          <Metric label="Tinggi Badan" value={latest?.height ?? '—'} unit={latest?.height && latest.height !== "—" ? "cm" : undefined} note={child?.hasHistory ? 'Pengukuran terakhir' : 'Menunggu pemeriksaan'} />
          <Metric label="Lingkar Kepala" value={latest?.head ?? '—'} unit={latest?.head && latest.head !== '-' && latest.head !== '—' ? 'cm' : ''} note={child?.hasHistory ? 'Pengukuran terakhir' : 'Menunggu pemeriksaan'} />
          <Metric label="Status BB/U" value={latest?.nutrition ?? '—'} note={child?.hasHistory ? 'Berat badan menurut umur' : 'Menunggu pemeriksaan'} />
        </div>

        {child?.hasHistory && (
          <div className="growth-panel">
            <div className="growth-copy">
              <h3><i />Grafik KMS Berat Badan menurut Umur</h3>
              <p>Berat hasil pemeriksaan dibandingkan dengan ambang WHO BB/U.</p>
              <div className="growth-legend"><span><i className="lg-weight" />Berat (kg)</span><span><i className="lg-height" />Ambang WHO (SD)</span></div>
            </div>
            <GrowthChart exams={child.exams} gender={child.gender} />
          </div>
        )}
      </section>

      <section className="exam-table-panel">
        <div className="parent-table-wrap">
          <table className="exam-table">
            <thead>
              <tr>
                <th>TANGGAL</th><th>BB (KG)</th><th>TB (CM)</th><th>LK (CM)</th><th>STATUS BB/U</th>
                <th>IMUNISASI & SUPLEMEN</th><th>PETUGAS / BIDAN</th><th>STATUS</th><th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {child?.hasHistory ? child.exams.map((row) => (
                <tr key={row.id}>
                  <td>{row.dateText}</td>
                  <td>{row.weight ?? '—'}</td>
                  <td>{row.height ?? '—'}</td>
                  <td>{row.head ?? '—'}</td>
                  <td>{row.nutrition}</td>
                  <td>{row.immunization || <i className="muted-italic">Pengukuran Rutin</i>}</td>
                  <td>{row.officer}</td>
                  <td><span className="done-pill">Selesai</span></td>
                  <td><button type="button" className="link-btn" onClick={() => { setDetail(row); dialog.current?.showModal(); }}>Detail</button></td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="table-empty">Belum ada riwayat pemeriksaan untuk {child?.name ?? "akun ini"}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <dialog ref={dialog} className="latest-exam-panel" aria-labelledby="exam-detail-title">
        <h3 id="exam-detail-title">Detail Pemeriksaan {child?.name}</h3>
        {detail && <dl>
          <dt>Tanggal</dt><dd>{detail.dateText}</dd>
          <dt>Berat badan</dt><dd>{detail.weight == null ? '—' : detail.weight + ' kg'}</dd>
          <dt>Panjang atau tinggi badan</dt><dd>{detail.height == null ? '—' : detail.height + ' cm'}</dd>
          <dt>Lingkar kepala</dt><dd>{detail.head == null ? '—' : detail.head + ' cm'}</dd>
          <dt>Posisi ukur</dt><dd>{detail.position === 'lying' ? 'Berbaring' : detail.position === 'standing' ? 'Berdiri' : 'Belum dicatat'}</dd>
          <dt>BB/U</dt><dd>{detail.nutrition}</dd>
          {detail.heightForAge && <><dt>{detail.heightForAge.indicator}</dt><dd>{detail.heightForAge.status}</dd></>}
          {detail.weightForHeight && <><dt>{detail.weightForHeight.indicator}</dt><dd>{detail.weightForHeight.status}</dd></>}
          <dt>Imunisasi & suplemen</dt><dd>{detail.immunization || '—'}</dd>
          <dt>Petugas</dt><dd>{detail.officer}</dd>
        </dl>}
        <form method="dialog"><button className="btn-dark">Tutup</button></form>
      </dialog>

      <NextScheduleNote text={nextScheduleText} />
    </>
  );
}
