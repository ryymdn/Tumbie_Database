import { useNavigate } from 'react-router-dom';

export default function PatientRow({ patient: p }) {
  const navigate = useNavigate();
  return (
    <div className="patient-row">
      <span className={`avatar lg ${p.tone}`}>{p.initial}</span>
      <div className="patient-info">
        <b>{p.name}</b>
        <small>{p.age} • {p.gender} • {p.pos}</small>
        <small>{p.guardianLabel}: <strong>{p.guardian}</strong><i /> PJ: <strong>{p.pj}</strong></small>
      </div>
      <button type="button" className="outline-btn" onClick={() => navigate('/pemeriksaan?anak=' + encodeURIComponent(p.id))}>Lihat Rekam</button>
    </div>
  );
}
