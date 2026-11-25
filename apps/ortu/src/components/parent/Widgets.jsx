import { Clock3 } from 'lucide-react';

export function PageHeading({ title, description, children }) {
  return (
    <div className="page-header parent-page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children && <div className="page-heading-actions">{children}</div>}
    </div>
  );
}

export function NutritionPill({ label = 'Gizi Baik', variant = '' }) {
  return <span className={`nutrition-pill ${variant}`}>{label}</span>;
}

export function Avatar({ initials, size = '' }) {
  return <div className={`child-avatar ${size}`}>{initials}</div>;
}

export function NextScheduleNote({ text }) {
  return <p className="next-schedule-note"><b>Jadwal Posyandu berikutnya:</b> {text}</p>;
}

export function ClockText({ children }) {
  return <span className="clock-text"><Clock3 size={12} /> {children}</span>;
}
