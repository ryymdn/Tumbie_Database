import { useCallback, useState } from 'react';

const STORAGE_KEY = 'tumbieParent';

// Sesi login orang tua (disimpan di sessionStorage).
export function useAuth() {
  const [identity, setIdentity] = useState(() => sessionStorage.getItem(STORAGE_KEY));

  const login = useCallback((value) => {
    sessionStorage.setItem(STORAGE_KEY, value);
    setIdentity(value);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIdentity(null);
  }, []);

  return { identity, isLoggedIn: Boolean(identity), login, logout };
}
