export default function PatientRow({ patient: p }) {
  return (
    <div className="patient-row">
      <span className={`avatar lg ${p.tone}`}>{p.initial}</span>
      <div className="patient-info">
        <b>{p.name}</b>
        <small>{p.age} • {p.gender} • {p.pos}</small>
        <small>{p.guardianLabel}: <strong>{p.guardian}</strong><i /> PJ: <strong>{p.pj}</strong></small>
      </div>
      <button className="outline-btn">Lihat Rekam</button>
    </div>
  );
}
