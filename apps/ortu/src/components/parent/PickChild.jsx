import { useParent } from '../../context/ParentContext.jsx';
import { formatAge } from '../../data/format.js';

// Dropdown "Pilih Anak" yang dipakai di halaman Data Anak dan Riwayat Pemeriksaan.
export default function PickChild({ withAge = false }) {
  const { kids, selectedChild, setSelectedId } = useParent();
  return (
    <label className="child-picker-label">
      Pilih Anak
      <select value={selectedChild.id} onChange={(e) => setSelectedId(e.target.value)}>
        {kids.map((k) => (
          <option key={k.id} value={k.id}>
            {k.name}{withAge ? ` (${formatAge(k.birthDate)})` : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
