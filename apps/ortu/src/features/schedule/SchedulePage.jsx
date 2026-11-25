import { useState } from 'react';
import { ChevronDown, Clock3, Info, MapPin } from 'lucide-react';
import { PageHeading } from '../../components/parent/Widgets.jsx';
import { REGION_SCHEDULES } from '../../data/parentData.js';

const PREP_STEPS = [
  ['1. Bawa Buku KIA', 'Wajib dibawa agar data perkembangan si kecil tercatat dengan akurat.'],
  ['2. Pakaian Praktis', 'Gunakan pakaian yang mudah dibuka saat pengukuran antropometri.'],
  ['3. Sarapan / Menyusu', 'Pastikan balita dalam kondisi kenyang dan cukup tidur agar tenang.'],
  ['4. Datang Tepat Waktu', 'Hadirlah sesuai jam pendaftaran guna menghindari antrean padat.'],
];

function SelectBox({ label, value }) {
  return (
    <label className="sched-select">
      <span>{label}</span>
      <span className="select-wrap">
        <select defaultValue={value}><option>{value}</option></select>
        <ChevronDown size={13} />
      </span>
    </label>
  );
}

export default function SchedulePage() {
  const [chosen, setChosen] = useState(null);

  return (
    <>
      <PageHeading title="Jadwal Posyandu" description="Informasi agenda penimbangan, imunisasi rutin, dan lokasi Posyandu terdekat.">
        <SelectBox label="Pilih Posyandu / Wilayah" value="Posyandu Melati (RW 02)" />
        <SelectBox label="Bulan Pelaksanaan" value="Desember 2026" />
      </PageHeading>

      <section className="next-session-panel">
        <span className="section-eyebrow"><i />Jadwal Si Kecil Berikutnya</span>
        <h2>Senin, 01 Desember 2026</h2>
        <div className="session-meta">
          <span><Clock3 size={13} /> 08.00 - 11.30 WIB</span>
          <span><MapPin size={13} /> Balai Warga RW 02, Posyandu Melati</span>
        </div>
        <div className="service-block">
          <small>Rangkaian Layanan:</small>
          <div className="service-tags">
            <span>Penimbangan BB/TB/LK</span><span>Imunisasi Lanjutan</span><span>Konsultasi Gizi</span><span className="green">PMT Balita</span>
          </div>
        </div>
        <p>Petugas Bertugas: <strong>Bidan Dian Sastro</strong></p>
      </section>

      <section className="region-panel">
        <h2>Daftar Jadwal Posyandu Wilayah</h2>
        <p className="region-sub">Pilih sesi penimbangan alternatif jika Anda berhalangan hadir pada tanggal utama.</p>
        <div className="region-list">
          {REGION_SCHEDULES.map((s) => (
            <article key={s.id} className={`region-item ${s.main ? 'main' : ''}`}>
              <div className="region-date">
                <small>{s.month}</small><strong>{s.day}</strong><small>{s.weekday}</small>
              </div>
              <div className="region-info">
                <div className="region-title">
                  <strong>{s.title}</strong>
                  <span className={`region-badge ${s.badgeTone}`}>{s.badge}</span>
                </div>
                <p>{s.description}</p>
                <div className="region-meta">
                  <span><Clock3 size={10} /> {s.time}</span>
                  <span><MapPin size={10} /> {s.place}</span>
                  <span className="quota">• Kuota: {s.quota}</span>
                </div>
              </div>
              {s.main ? (
                <span className="region-btn filled">Sesi Utama</span>
              ) : (
                <button type="button" className={`region-btn ${chosen === s.id ? 'picked' : ''}`} onClick={() => setChosen(chosen === s.id ? null : s.id)}>
                  {chosen === s.id ? 'Sesi Dipilih' : 'Daftar Sesi Alternatif'}
                </button>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="prep-panel">
        <h2><Info size={13} /> Panduan Persiapan Sebelum Datang ke Posyandu</h2>
        <div className="prep-grid">
          {PREP_STEPS.map(([title, text]) => (
            <div key={title}><b>{title}</b><p>{text}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
