const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// "2024-08-12" -> "12 Agustus 2024"
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${MONTHS[m - 1]} ${y}`;
}

// Umur dihitung dari tanggal lahir. `capital` -> "2 Tahun 4 Bulan", jika tidak "2 tahun 4 bulan".
export function formatAge(iso, { capital = false, today = new Date() } = {}) {
  const [y, m, d] = iso.split('-').map(Number);
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m);
  if (today.getDate() < d) months -= 1;
  months = Math.max(months, 0);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const Y = capital ? 'Tahun' : 'tahun';
  const M = capital ? 'Bulan' : 'bulan';
  if (years === 0) return `${rest} ${M}`;
  return rest === 0 ? `${years} ${Y}` : `${years} ${Y} ${rest} ${M}`;
}

// "3.2" -> "3,2"
export const toComma = (value) => String(value).replace('.', ',');

// Nama tampilan dari identitas login: "farhan" -> "Farhan", "budi.santoso@mail.com" -> "Budi Santoso".
// Identitas berupa angka (NIK / nomor HP) tidak bisa dijadikan nama, jadi mengembalikan null.
export function nameFromIdentity(identity) {
  const raw = String(identity ?? '').trim().split('@')[0];
  if (!raw || /^[\d\s+-]+$/.test(raw)) return null;
  return raw.replace(/[._-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

export const initialsOf = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
