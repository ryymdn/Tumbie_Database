import { useNavigate } from 'react-router-dom';
import WelcomeCard from './WelcomeCard.jsx';
import StatTile from './StatTile.jsx';
import PatientQueue from './PatientQueue.jsx';
import UpcomingSchedule from './UpcomingSchedule.jsx';
import LogisticsSummary from './LogisticsSummary.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="dash-grid">
        <WelcomeCard />
        <StatTile label="TOTAL ANAK" value="12" sub="+2 bulan ini" subClass="green" onOpen={() => navigate('/data-anak')} />
        <StatTile label="PEMERIKSAAN" value="10" total="12" percent={83} onOpen={() => navigate('/pemeriksaan')}>
          <span className="tile-badge">83%</span>
        </StatTile>
        <StatTile label="JADWAL" value="4" sub="Bulan Okt - Nov" subClass="blue" onOpen={() => navigate('/jadwal')} />
      </div>

      <div className="dashboard-columns">
        <PatientQueue />
        <div className="right-stack">
          <UpcomingSchedule />
          <LogisticsSummary />
        </div>
      </div>
    </>
  );
}
