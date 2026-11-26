import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';
import { PATHS } from '../../data/routes.js';
import { formatAge, formatDate, initialsOf } from '../../data/format.js';
import { Avatar, NextScheduleNote, PageHeading } from '../../components/parent/Widgets.jsx';
import PickChild from '../../components/parent/PickChild.jsx';

function Field({ label, children, full = false }) {
  return <div className={full ? 'detail-full' : ''}><span>{label}</span><strong>{children}</strong></div>;
}

export default function ChildrenPage() {
  const navigate = useNavigate();
  const { parent, selectedChild: child, nextScheduleText } = useParent();
  const latest = child?.latest;

  return (
    <>
      <PageHeading title="Data Anak" description="Informasi anak yang terdaftar atas nama Anda.">
        {child && <PickChild />}
      </PageHeading>

      <div className="child-details-grid">
        <section className="sand-card child-detail-panel">
          <div className="child-profile-heading">
            <Avatar initials={child ? initialsOf(child.name) : "—"} size="large" />
            <div>
              <h2>{child?.name ?? "Belum ada anak terdaftar"}</h2>
              {child ? (
                <span className={`verified-pill ${child.verified ? '' : 'pending'}`}>{child.verified ? 'Terverifikasi' : 'Menunggu Verifikasi'}</span>
              ) : <p>Tambahkan data anak untuk mulai memantau tumbuh kembang.</p>}
            </div>
          </div>
          <div className="detail-grid">
            <Field label="Tanggal Lahir">{child ? formatDate(child.birthDate) : "—"}</Field>
            <Field label="Umur">{child ? formatAge(child.birthDate) : "—"}</Field>
            <Field label="Jenis Kelamin">{child?.gender ?? '—'}</Field>
            <Field label="NIK Anak">{child?.nik ?? '—'}</Field>
            <Field label="Posyandu">{child?.posyandu ?? '—'}</Field>
            <Field label="Catatan">{child?.note ?? '—'}</Field>
          </div>
        </section>

        <section className="sand-card parent-detail-panel">
          <div className="sand-card-head">
            <h2>Data Orang Tua</h2>
            <button className="outline-btn" type="button" onClick={() => navigate(PATHS.profile)}>Ubah Data</button>
          </div>
          <div className="detail-grid">
            <Field label="Nama Orang Tua">{parent.name}</Field>
            <Field label="NIK Orang Tua">{parent.nik}</Field>
            <Field label="No. HP">{parent.phone}</Field>
            <Field label="Alamat" full>{parent.addressFull}</Field>
          </div>
        </section>
      </div>

      <Link to={PATHS.addChild} className="add-child-btn"><Plus size={12} strokeWidth={3} />Tambah Data Anak</Link>

      <div className="parent-section-title">
        <h2>Perkembangan Terakhir</h2>
        <button className="text-action" type="button" onClick={() => navigate(PATHS.history)}>Lihat Riwayat <ChevronRight size={13} /></button>
      </div>

      <div className="child-metrics">
        <article><span>Berat Badan</span><strong>{latest?.weight && latest.weight !== '—' ? latest.weight + ' kg' : '—'}</strong><em>{child?.hasHistory ? 'Pengukuran terakhir' : 'Menunggu pemeriksaan pertama'}</em></article>
        <article><span>Tinggi Badan</span><strong>{latest?.height && latest.height !== '—' ? latest.height + ' cm' : '—'}</strong><em>{child?.hasHistory ? 'Pengukuran terakhir' : 'Menunggu pemeriksaan pertama'}</em></article>
        <article><span>Lingkar Kepala</span><strong>{latest?.head && latest.head !== '—' && latest.head !== '-' ? latest.head + ' cm' : '—'}</strong><em>{child?.hasHistory ? 'Pengukuran terakhir' : 'Menunggu pemeriksaan pertama'}</em></article>
        <article><span>Status BB/U</span><strong className="muted">{latest?.nutrition ?? "Belum ada data"}</strong><em>{child?.hasHistory ? 'Berat badan menurut umur' : 'Menunggu pemeriksaan pertama'}</em></article>
      </div>

      <div className="dark-table">
        <div className="dark-table-row head"><span>Tanggal</span><span>Berat Badan</span><span>Tinggi Badan</span><span>Status BB/U</span><span>Petugas</span></div>
        {child?.hasHistory ? child.exams.slice(0, 3).map((row) => (
          <div className="dark-table-row" key={row.id}>
            <span>{row.dateText}</span><span>{row.weight ?? '—'}</span><span>{row.height ?? '—'}</span>
            <span>{row.nutrition}</span><span>{row.officer}</span>
          </div>
        )) : <p className="dark-table-empty">Belum ada riwayat pemeriksaan. Datang ke Posyandu untuk penimbangan pertama.</p>}
      </div>

      {child?.hasHistory && <NextScheduleNote text={nextScheduleText} />}
    </>
  );
}
