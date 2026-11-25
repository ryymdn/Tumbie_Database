import KpiCards from './KpiCards.jsx';
import MonthlyChart from './MonthlyChart.jsx';
import NutritionDistribution from './NutritionDistribution.jsx';
import ReportTable from './ReportTable.jsx';

export default function LaporanPage() {
  return (
    <>
      <KpiCards />

      <div className="report-grid">
        <MonthlyChart />
        <NutritionDistribution />
      </div>

      <ReportTable />
    </>
  );
}
