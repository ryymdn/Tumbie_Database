import NotificationMenu from '../../../../shared/NotificationMenu.jsx';
import { apiRequest } from '../../features/auth/authApi.js';
import { STORAGE_KEY } from '../../features/auth/useAuth.js';
import { PATHS } from '../../data/routes.js';
import { Menu, UserRound } from 'lucide-react';
import { useParent } from '../../context/ParentContext.jsx';

export default function ParentTopbar({ onToggleMenu }) {
  const { parent, parentInitial, kids, setSelectedId } = useParent();
  return (
    <header className="parent-topbar">
      <button className="hamb" type="button" onClick={onToggleMenu} aria-label="Buka menu">
        <Menu size={22} />
      </button>
      <div className="top-user">
        <NotificationMenu request={apiRequest} token={sessionStorage.getItem(STORAGE_KEY)}
          destination={(item) => item.type === 'exam' ? PATHS.history : item.type === 'verified' ? PATHS.children : PATHS.schedule}
          onSelect={(item) => {
            const child = kids.find((kid) => String(kid.id) === item.childId);
            if (child) setSelectedId(child.id);
          }} />
        <div>
          <b>{parent.name}</b>
          <small>Orang Tua</small>
        </div>
        <span className="avatar-user"><UserRound size={19} /><em>{parentInitial}</em></span>
      </div>
    </header>
  );
}
