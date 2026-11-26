import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeCard from './WelcomeCard.jsx';
import StatTile from './StatTile.jsx';
import PatientQueue from './PatientQueue.jsx';
import UpcomingSchedule from './UpcomingSchedule.jsx';
import LogisticsSummary from './LogisticsSummary.jsx';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';
import { dateParts } from '../schedule/data.js';
import { ageInMonths, initialsOf } from '../patients/data.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [patientMessage, setPatientMessage] = useState('Memuat pemeriksaan…');

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem(STORAGE_KEY);
    Promise.all([
      apiRequest('cadre/children', { token }),
      apiRequest('cadre/examinations', { token }),
    ]).then(([children, exams]) => {
      if (!active) return;
      setPatientData({ children, exams });
      setPatientMessage('');
    }).catch((error) => { if (active) setPatientMessage(error.message); });
    return () => { active = false; };
  }, []);
  const [scheduleMessage, setScheduleMessage] = useState('Memuat jadwal…');

  useEffect(() => {
    let active = true;
    apiRequest('schedules', { token: sessionStorage.getItem(STORAGE_KEY) })
      .then(({ schedules }) => {
        if (!active) return;
        setSchedules(schedules);
        setScheduleMessage('');
      })
      .catch((error) => { if (active) setScheduleMessage(error.message); });
    return () => { active = false; };
  }, []);

  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());
  const children = patientData?.children ?? [];
  const todayByChild = new Map();
  for (const exam of patientData?.exams ?? []) {
    if (exam.date === today && !todayByChild.has(exam.childId)) todayByChild.set(exam.childId, exam);
  }
  const examined = children.filter((child) => todayByChild.has(child.id));
  const percent = children.length ? Math.round(examined.length * 100 / children.length) : 0;
  const patients = examined.map((child) => ({
    id: child.id,
    name: child.name,
    initial: initialsOf(child.name),
    tone: child.gender === 'Perempuan' ? 'purple' : 'blue',
    age: ageInMonths(child.birthDate, new Date(today + 'T12:00:00')) + ' Bulan',
    gender: child.gender,
    pos: child.posyandu,
    guardianLabel: 'Wali',
    guardian: child.parent || '—',
    pj: todayByChild.get(child.id).officer || '—',
  }));
  const upcoming = schedules.filter((item) => item.date >= today && ['upcoming', 'ongoing'].includes(item.status));
  const preview = upcoming.slice(0, 3).map((item) => ({
    ...dateParts(item.date),
    id: item.id,
    name: item.title,
    time: item.start + ' – ' + item.end + ' WIB',
  }));

  return (
    <>
      <div className="dash-grid">
        <WelcomeCard />
        <StatTile label="TOTAL ANAK" value={patientData ? String(children.length) : "—"} sub="Wilayah tugas" subClass="green" onOpen={() => navigate('/data-anak')} />
        <StatTile label="PEMERIKSAAN" value={patientData ? String(examined.length) : "—"} total={patientData ? String(children.length) : undefined} percent={patientData ? percent : undefined} sub="Anak diperiksa hari ini" onOpen={() => navigate('/pemeriksaan')}>
          {patientData && <span className="tile-badge">{percent}%</span>}
        </StatTile>
        <StatTile label="JADWAL" value={scheduleMessage ? "—" : String(upcoming.length)} sub="Sesi mendatang" subClass="blue" onOpen={() => navigate('/jadwal')} />
      </div>

      <div className="dashboard-columns">
        <PatientQueue patients={patients} message={patientMessage} />
        <div className="right-stack">
          <UpcomingSchedule sessions={preview} message={scheduleMessage} />
          <LogisticsSummary />
        </div>
      </div>
    </>
  );
}
