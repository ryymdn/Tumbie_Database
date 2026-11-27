import { useEffect, useState } from 'react';
import { ChevronDown, Clock3, Info, MapPin } from 'lucide-react';
import { PageHeading } from '../../components/parent/Widgets.jsx';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';
import { useParent } from '../../context/ParentContext.jsx';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' });

function localDate(iso) {
  return new Date(iso + 'T12:00:00');
}

const PREP_STEPS = [
  ['1. Bawa Buku KIA', 'Wajib dibawa agar data perkembangan si kecil tercatat dengan akurat.'],
  ['2. Pakaian Praktis', 'Gunakan pakaian yang mudah dibuka saat pengukuran antropometri.'],
  ['3. Sarapan / Menyusu', 'Pastikan balita dalam kondisi kenyang dan cukup tidur agar tenang.'],
  ['4. Datang Tepat Waktu', 'Hadirlah sesuai jam pendaftaran guna menghindari antrean padat.'],
];

function SelectBox({ label, value, options, onChange }) {
  return (
    <label className="sched-select">
      <span>{label}</span>
      <span className="select-wrap">
        <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select>
        <ChevronDown size={13} />
      </span>
    </label>
  );
}

export default function SchedulePage() {
  const [joining, setJoining] = useState(false);
  const [data, setData] = useState({ locations: [], schedules: [] });
  const [message, setMessage] = useState('Memuat jadwal…');
  const [location, setLocation] = useState('');
  const [month, setMonth] = useState('');
  const { kids, selectedChild, setSelectedId, refreshChildren } = useParent();
  const [signupMessage, setSignupMessage] = useState('');
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());

  useEffect(() => {
    let active = true;
    refreshChildren().catch((error) => {
      if (active) setSignupMessage(error.message);
    });
    apiRequest('schedules', { token: sessionStorage.getItem(STORAGE_KEY) })
      .then((result) => {
        if (!active) return;
        setData(result);
        setMessage('');
      })
      .catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, [refreshChildren]);

  const defaultLocation = data.locations.find((item) => item.name === selectedChild?.posyandu) ?? data.locations[0];
  const locationId = location || String(defaultLocation?.id ?? '');
  const future = data.schedules.filter((item) => String(item.posyanduId) === locationId && item.date >= today);
  const months = [...new Set(future.map((item) => item.date.slice(0, 7)))];
  const sessions = future.filter((item) => !month || item.date.startsWith(month)).map((item, index) => {
    const date = localDate(item.date);
    return {
      ...item,
      main: index === 0,
      day: item.date.slice(8, 10),
      weekday: date.toLocaleDateString('id-ID', { weekday: 'short' }),
      month: date.toLocaleDateString('id-ID', { month: 'short' }),
      time: item.start + ' – ' + item.end + ' WIB',
      badge: item.status === 'ongoing' ? 'Sedang Berlangsung' : 'Terjadwal',
      badgeTone: index === 0 ? 'green' : '',
    };
  });
  const next = sessions[0];
  const join = async (session) => {
    if (joining || !selectedChild?.verified || session.posyandu !== selectedChild.posyandu) return;
    setJoining(true);
    setSignupMessage('');
    try {
      const token = sessionStorage.getItem(STORAGE_KEY);
      const { queueCount } = await apiRequest('schedules/' + session.id + '/queue/' + selectedChild.id, { token, body: {} });
      setData((current) => ({
        ...current,
        schedules: current.schedules.map((item) => item.id === session.id ? {
          ...item,
          queueCount,
          registeredChildIds: [...new Set([...item.registeredChildIds, String(selectedChild.id)])],
        } : item),
      }));
      setSignupMessage(selectedChild.name + ' berhasil didaftarkan.');
    } catch (error) {
      setSignupMessage(error.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      <PageHeading title="Jadwal Posyandu" description="Informasi agenda penimbangan, imunisasi rutin, dan lokasi Posyandu terdekat.">
        <SelectBox label="Pilih Anak" value={String(selectedChild?.id ?? '')}
          options={kids.length ? kids : [{ id: '', name: 'Belum ada anak' }]}
          onChange={(id) => {
            setSelectedId(kids.find((kid) => String(kid.id) === id)?.id);
            setLocation('');
            setMonth('');
            setSignupMessage('');
          }} />
        <SelectBox label="Pilih Posyandu / Wilayah" value={locationId}
          options={data.locations.length ? data.locations.map((item) => ({ ...item, name: item.rw ? item.name + ' (RW ' + item.rw + ')' : item.name })) : [{ id: '', name: 'Belum ada wilayah' }]}
          onChange={(id) => { setLocation(id); setMonth(''); }} />
        <SelectBox label="Bulan Pelaksanaan" value={month}
          options={[{ id: '', name: 'Semua bulan' }, ...months.map((id) => ({ id, name: monthFormatter.format(localDate(id + '-01')) }))]}
          onChange={setMonth} />
      </PageHeading>

      <section className="next-session-panel">
        <span className="section-eyebrow"><i />Jadwal Si Kecil Berikutnya</span>
        <h2>{next ? dateFormatter.format(localDate(next.date)) : message || "Belum ada jadwal mendatang"}</h2>
        <div className="session-meta">
          <span><Clock3 size={13} /> {next?.time ?? "—"}</span>
          <span><MapPin size={13} /> {next?.place ?? "—"}</span>
        </div>
        <div className="service-block">
          <small>Rangkaian Layanan:</small>
          <div className="service-tags">
            {next?.services.length ? next.services.map((service) => <span key={service}>{service}</span>) : <span>—</span>}
          </div>
        </div>
        <p>Petugas Bertugas: <strong>{next?.midwife ?? "—"}</strong></p>
      </section>

      <section className="region-panel">
        <h2>Daftar Jadwal Posyandu Wilayah</h2>
        <p className="region-sub">Pilih sesi penimbangan alternatif jika Anda berhalangan hadir pada tanggal utama.</p>
        {signupMessage && <p role="status">{signupMessage}</p>}
        {!selectedChild && <p>Tambahkan data anak terlebih dahulu untuk mendaftar.</p>}
        {selectedChild && !selectedChild.verified && <p>Data {selectedChild.name} masih menunggu verifikasi kader.</p>}
        {selectedChild?.verified && defaultLocation && locationId !== String(defaultLocation.id) && (
          <p>Pilih jadwal di {selectedChild.posyandu} untuk mendaftarkan {selectedChild.name}.</p>
        )}
        {!message && sessions.length === 0 && <p>Belum ada jadwal mendatang di wilayah dan bulan yang dipilih.</p>}
        <div className="region-list">
          {sessions.map((s) => {
            const registered = s.registeredChildIds.includes(String(selectedChild?.id));
            const full = s.quota != null && s.queueCount >= s.quota;
            return (
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
                  <span className="quota">• Kuota: {s.quota ?? "—"}</span>
                </div>
              </div>
              <button type="button" className={`region-btn ${s.main ? 'filled' : ''} ${registered ? 'picked' : ''}`}
                disabled={joining || !selectedChild?.verified || selectedChild.posyandu !== s.posyandu || registered || full}
                onClick={() => join(s)}>
                {registered ? 'Sudah Terdaftar' : full ? 'Kuota Penuh' : s.main ? 'Daftar Sesi Utama' : 'Daftar Sesi Alternatif'}
              </button>
            </article>
            );
          })}
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
