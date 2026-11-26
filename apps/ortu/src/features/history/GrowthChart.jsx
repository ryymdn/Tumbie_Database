import WeightForAgeChart from '../../../../shared/WeightForAgeChart.jsx';

export default function GrowthChart({ exams, gender }) {
  const measurements = exams.filter((exam) => exam.weightForAge).map((exam) => ({
    id: exam.id,
    date: exam.date,
    ageMonths: exam.weightForAge.ageMonths,
    weight: Number(exam.weight),
  }));
  return <WeightForAgeChart exams={measurements} gender={gender} />;
}