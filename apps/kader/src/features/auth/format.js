// Nama tampilan dari username login: "dian_sastro" -> "Dian Sastro".
export function nameFromUsername(username) {
  const raw = String(username ?? '').trim().split('@')[0];
  if (!raw) return '';
  return raw.replace(/[._-]+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

export const initialOf = (name) => (name.trim()[0] ?? '').toUpperCase();
