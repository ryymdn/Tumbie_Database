import { useEffect, useState } from 'react';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';
import { ageInMonths, formatDateID, initialsOf } from '../patients/data.js';
import KpiCards from './KpiCards.jsx';
import MonthlyChart from './MonthlyChart.jsx';
import NutritionDistribution from './NutritionDistribution.jsx';
import ReportTable from './ReportTable.jsx';

const monthId = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit' });
const monthName = new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', month: 'short' });
const number = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

export default function LaporanPage() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState('Memuat laporan…');

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem(STORAGE_KEY);
    Promise.all([
      apiRequest('cadre/children', { token }),
      apiRequest('cadre/examinations', { token }),
    ]).then(([children, exams]) => {
      if (!active) return;
      setData({ children, exams });
      setMessage('');
    }).catch((error) => { if (active) setMessage(error.message); });
    return () => { active = false; };
  }, []);

  const currentMonth = monthId.format(new Date());
  const [year, month] = currentMonth.split('-').map(Number);
  const exams = data?.exams ?? [];
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(year, month - 6 + index, 1));
    const key = date.toISOString().slice(0, 7);
    return { key, month: monthName.format(date), value: exams.filter((exam) => exam.date?.startsWith(key)).length, active: index === 5 };
  });
  const examined = new Set(exams.filter((exam) => exam.date?.startsWith(currentMonth)).map((exam) => exam.childId)).size;
  const latest = new Map();
  for (const exam of exams) if (!latest.has(exam.childId)) latest.set(exam.childId, exam);
  const assessed = [...latest.values()].flatMap((exam) => exam.weightForAge ? [exam.weightForAge.status] : []);
  const normal = assessed.filter((status) => status === 'Berat badan normal').length;
  const rows = exams.map((exam) => ({
    id: exam.id,
    childId: exam.childId,
    initial: initialsOf(exam.name),
    tone: 'mint',
    name: exam.name,
    mother: exam.mother ?? '—',
    nik: exam.nik ?? '—',
    age: exam.date && exam.birthDate ? ageInMonths(exam.birthDate, new Date(exam.date + 'T12:00:00')) + ' bulan' : '—',
    gender: exam.gender,
    weight: exam.bb == null ? '—' : number.format(Number(exam.bb)) + ' kg',
    height: exam.tb == null ? '—' : number.format(Number(exam.tb)) + ' cm',
    heightForAge: exam.heightForAge,
    weightForHeight: exam.weightForHeight,
    status: exam.weightForAge?.status ?? 'Belum dinilai',
    date: exam.date ? formatDateID(exam.date) : '—',
  }));

  return (
    <>
      {message && <p role="status">{message}</p>}
      <KpiCards total={data?.children.length} examined={data ? examined : null} normal={data ? normal : null} attention={data ? assessed.length - normal : null} />

      <div className="report-grid">
        <MonthlyChart monthly={monthly} ready={Boolean(data)} />
        <NutritionDistribution assessed={assessed} normal={normal} />
      </div>

      <ReportTable reportRows={rows} exams={exams} message={message} />
    </>
  );
}