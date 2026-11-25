import { MIN_PASSWORD_NEW } from './data.js';

// Setiap validator mengembalikan pesan error (string) atau '' jika valid.
export const required = (value, label) => (String(value).trim() ? '' : `${label} wajib diisi.`);

export const nik = (value) => {
  if (!value.trim()) return 'NIK wajib diisi.';
  return /^\d{16}$/.test(value.trim()) ? '' : 'NIK harus 16 digit angka.';
};

export const phone = (value) => {
  if (!value.trim()) return 'No. WhatsApp wajib diisi.';
  const digits = value.replace(/[\s-]/g, '');
  return /^08\d{8,12}$/.test(digits) ? '' : 'Gunakan format 08xxxxxxxxxx.';
};

export const username = (value) => {
  if (!value.trim()) return 'Nama pengguna wajib diisi.';
  return /^[a-z0-9_.]{4,20}$/i.test(value.trim()) ? '' : '4–20 karakter: huruf, angka, titik, atau garis bawah.';
};

export const newPassword = (value) => {
  if (!value) return 'Kata sandi wajib diisi.';
  return value.length >= MIN_PASSWORD_NEW ? '' : `Minimal ${MIN_PASSWORD_NEW} karakter.`;
};

export const sameAs = (value, other) => {
  if (!value) return 'Ulangi kata sandi.';
  return value === other ? '' : 'Kata sandi tidak sama.';
};

// Buang entri kosong agar mudah dicek: Object.keys(errors).length === 0
export const compact = (errors) =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
