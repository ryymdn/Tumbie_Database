import { Menu, UserRound } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';

export default function ParentTopbar({ onToggleMenu }) {
  const { parent, parentInitial } = useParent();
  return (
    <header className="parent-topbar">
      <button className="hamb" type="button" onClick={onToggleMenu} aria-label="Buka menu">
        <Menu size={22} />
      </button>
      <div className="top-user">
        <div>
          <b>{parent.name}</b>
          <small>Orang Tua</small>
        </div>
        <span className="avatar-user"><UserRound size={19} /><em>{parentInitial}</em></span>
      </div>
    </header>
  );
}
