export async function apiRequest(path, { body, token, method = body ? 'POST' : 'GET' } = {}) {
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  let response;
  try {
    response = await fetch(`${baseUrl}/${path}`, {
      method,
      headers: {
        ...(body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Gagal menghubungi server. Periksa koneksi backend.');
  }

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(result?.message || 'Server mengembalikan respons yang tidak valid.');
  }
  return result.data;
}

export function authRequest(path, options) {
  return apiRequest('auth/' + path, options);
}
