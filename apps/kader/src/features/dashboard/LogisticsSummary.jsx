import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../auth/authApi.js';
import { STORAGE_KEY } from '../auth/useAuth.js';

const inventoryItems = [
  { id: 'vitamin_a', name: 'Vitamin A', unit: 'kapsul', tone: 'teal' },
  { id: 'immunization', name: 'Vaksin', unit: 'dosis', tone: 'green' },
  { id: 'pmt', name: 'PMT', unit: 'porsi', tone: 'orange' },
];

function request(body) {
  return apiRequest('cadre/inventory', {
    token: sessionStorage.getItem(STORAGE_KEY),
    method: body ? 'PUT' : 'GET',
    body,
  });
}

export default function LogisticsSummary() {
  const [locations, setLocations] = useState([]);
  const [locationId, setLocationId] = useState('');
  const [itemId, setItemId] = useState(inventoryItems[0].id);
  const [quantity, setQuantity] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const dialog = useRef(null);

  useEffect(() => {
    let active = true;
    request().then((result) => {
      if (!active) return;
      setLocations(result);
      setLocationId(result[0]?.id ?? '');
    }).catch((error) => { if (active) setLoadError(error.message); });
    return () => { active = false; };
  }, []);

  const location = locations.find((entry) => entry.id === locationId);
  const stock = location?.stock ?? {};
  const scale = Math.max(1, ...Object.values(stock));
  const item = inventoryItems.find((entry) => entry.id === itemId);

  const change = (nextLocation, nextItem) => {
    setLocationId(nextLocation);
    setItemId(nextItem);
    setQuantity(String(locations.find((entry) => entry.id === nextLocation)?.stock[nextItem] ?? ''));
    setMessage('');
  };

  const save = async (event) => {
    event.preventDefault();
    if (pending || !location) return;
    if (!/^\d+$/.test(quantity) || Number(quantity) > 1000000) {
      setMessage('Masukkan jumlah stok bulat dari 0 sampai 1.000.000.');
      return;
    }
    setPending(true);
    setMessage('');
    try {
      const updated = await request({ posyanduId: location.id, item: itemId, quantity: Number(quantity) });
      setLocations((list) => list.map((entry) => entry.id === location.id
        ? { ...entry, stock: { ...entry.stock, [updated.item]: updated.quantity } }
        : entry));
      dialog.current?.close();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="panel logistics">
      <div className="logistics-head">
        <h3>Ringkasan Logistik & PMT</h3>
        <button type="button" className="pill green-pill small" disabled={!location}
          onClick={() => { change(locationId, itemId); dialog.current?.showModal(); }}>Kelola Stok</button>
      </div>
      <p>{loadError || (location ? 'Stok fisik tercatat di ' + location.name : 'Stok Posyandu belum tersedia.')}</p>

      {inventoryItems.map((entry) => {
        const count = stock[entry.id];
        return (
          <div className="progress-item" key={entry.id}>
            <div><span>{entry.name}</span><b className={entry.tone}>{count == null ? 'Belum dicatat' : count + ' ' + entry.unit}</b></div>
            <div className="progress"><i className={entry.tone} style={{ width: ((count ?? 0) * 100 / scale) + '%' }} /></div>
          </div>
        );
      })}

      <dialog ref={dialog} className="panel" aria-labelledby="inventory-title">
        <h3 id="inventory-title">Kelola Stok Posyandu</h3>
        <form onSubmit={save} noValidate>
          <p>Masukkan saldo fisik hasil penghitungan.</p>
          <label className="fld">Posyandu
            <select value={locationId} disabled={pending} onChange={(event) => change(event.target.value, itemId)}>
              {locations.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </select>
          </label>
          <label className="fld">Jenis barang
            <select value={itemId} disabled={pending} onChange={(event) => change(locationId, event.target.value)}>
              {inventoryItems.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </select>
          </label>
          <label className="fld">Jumlah ({item.unit})
            <input type="number" min="0" max="1000000" step="1" value={quantity}
              disabled={pending} onChange={(event) => setQuantity(event.target.value)} />
          </label>
          {message && <p role="alert">{message}</p>}
          <div className="panel-foot">
            <button type="button" className="outline-btn" disabled={pending} onClick={() => dialog.current?.close()}>Tutup</button>
            <button type="submit" className="primary" disabled={pending || !location}>Simpan Stok</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
