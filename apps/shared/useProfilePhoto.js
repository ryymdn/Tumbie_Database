import { useEffect, useState } from 'react';

async function jpeg(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
    throw new Error('Gunakan JPG, PNG, atau WebP dengan ukuran maksimal 8 MB.');
  }
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error('File foto tidak bisa dibaca.'); });
  try {
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 256 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  } finally {
    bitmap.close();
  }
}

export function useProfilePhoto(request, token, setMessage) {
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    setBusy(true);
    request('photo', { token }).then((data) => {
      if (active) setPhoto(data.photo);
    }).catch((error) => {
      if (active) setMessage({ type: 'error', text: error.message });
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => { active = false; };
  }, [request, token, setMessage]);

  const uploadPhoto = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file || busy) return;
    setBusy(true);
    try {
      const result = await request('photo', { token, body: { image: await jpeg(file) } });
      setPhoto(result.photo);
      setMessage({ type: 'ok', text: 'Foto profil tersimpan.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  const removePhoto = async () => {
    if (!photo || busy || !window.confirm('Hapus foto profil ini?')) return;
    setBusy(true);
    try {
      const result = await request('photo', { token, method: 'DELETE' });
      setPhoto(result.photo);
      setMessage({ type: 'ok', text: 'Foto profil dihapus.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  };

  return { photo, busy, uploadPhoto, removePhoto };
}
