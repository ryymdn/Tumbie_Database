import { CircleCheck, Hospital, UsersRound } from 'lucide-react';

const FOOT_ICONS = { check: CircleCheck, users: UsersRound, clinic: Hospital };

export default function StatCard({ label, value, sub, footIcon, foot }) {
  const Icon = FOOT_ICONS[footIcon];
  return (
    <div className="sched-stat">
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{sub}</span>
      <em>{Icon && <Icon size={12} />} {foot}</em>
    </div>
  );
}
