import { Eye, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../auth/UserContext.jsx';

export default function WelcomeCard() {
  const navigate = useNavigate();
  const { name } = useUser();

  return (
    <div className="welcome">
      <h2>Halo, {name}</h2>
      <p>Ringkasan Posyandu siap pantau. Periksa antrean anak & validasi logistik hari ini.</p>
      <div>
        <button className="primary small" onClick={() => navigate('/pemeriksaan')}><Plus size={16} /> Pemeriksaan Baru</button>
        <button className="ghost small" onClick={() => navigate('/data-anak')}><Eye size={16} /> Data Anak</button>
      </div>
    </div>
  );
}
