import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { formatDate, initialsOf, nameFromIdentity, toComma } from '../data/format.js';
import { apiRequest } from '../features/auth/authApi.js';
import { STORAGE_KEY } from '../features/auth/useAuth.js';

const ParentContext = createContext(null);

function displayChild(child) {
  const exams = (child.exams ?? []).map((exam) => {
    const services = [...exam.vaccines, ...exam.pmt.map((name) => 'PMT: ' + name)];
    if (exam.vitA) services.push('Vitamin A');
    if (exam.worm) services.push('Obat Cacing');
    return {
      ...exam,
      dateText: exam.date ? formatDate(exam.date) : '—',
      officer: exam.officer || '—',
      immunization: services.join(', '),
      nutrition: exam.weightForAge?.status ?? 'Belum dinilai',
    };
  });
  const latest = exams[0];
  return {
    ...child,
    nik: '—',
    note: child.note || 'Tidak ada catatan khusus',
    exams,
    hasHistory: Boolean(latest),
    latest: {
      weight: latest?.weight == null ? '—' : toComma(latest.weight),
      height: latest?.height == null ? '—' : toComma(latest.height),
      head: latest?.head == null ? '—' : toComma(latest.head),
      nutrition: latest?.nutrition ?? 'Belum ada data',
    },
  };
}

export function ParentProvider({ children, onLogout, user }) {
  const [kids, setKids] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem(STORAGE_KEY);
    apiRequest('schedules', { token })
      .then(({ schedules }) => { if (active) setSchedules(schedules); })
      .catch(() => { if (active) setSchedules([]); });
    apiRequest('children', { token })
      .then((rows) => { if (active) setKids(rows.map(displayChild)); })
      .catch((error) => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const addChild = useCallback(async (form) => {
    const saved = await apiRequest('children', {
      token: sessionStorage.getItem(STORAGE_KEY),
      body: {
        ...form,
        birthWeight: Number(form.birthWeight),
        birthLength: Number(form.birthLength),
        headCircumference: form.headCircumference ? Number(form.headCircumference) : null,
      },
    });
    const child = displayChild(saved);
    setKids((list) => [...list, child]);
    setSelectedId(child.id);
  }, []);

  const parent = useMemo(() => ({
    name: user.profile?.fullName || nameFromIdentity(user.username) || 'Orang Tua',
    username: user.username,
    nik: user.profile?.nik || '—',
    phone: user.profile?.phone || '—',
    addressFull: user.profile?.address || '—',
    posyandu: '—',
    village: '',
  }), [user]);

  const selectedChild = kids.find((kid) => kid.id === selectedId) ?? kids[0];
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const nextSchedule = schedules.find((item) => item.date >= today && item.posyandu === selectedChild?.posyandu);
  const nextScheduleText = nextSchedule
    ? formatDate(nextSchedule.date) + ' pukul ' + nextSchedule.start + ' WIB di ' + nextSchedule.posyandu
    : 'Belum ada jadwal mendatang';

  const value = useMemo(() => ({
    parent,
    parentInitial: initialsOf(parent.name)[0],
    kids,
    selectedChild,
    nextScheduleText,
    setSelectedId,
    addChild,
    onLogout,
  }), [parent, kids, selectedChild, nextScheduleText, addChild, onLogout]);

  if (loading) return <p role="status">Memuat data anak…</p>;
  if (error) return <div><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Coba Lagi</button> <button onClick={onLogout}>Keluar</button></div>;

  return <ParentContext.Provider value={value}>{children}</ParentContext.Provider>;
}

export function useParent() {
  const ctx = useContext(ParentContext);
  if (!ctx) throw new Error('useParent harus dipakai di dalam ParentProvider');
  return ctx;
}
