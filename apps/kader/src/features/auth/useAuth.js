import { useCallback, useState } from 'react';

const STORAGE_KEY = 'tumbieLogin';
const USER_KEY = 'tumbieKaderUser';

// Sesi login kader (disimpan di sessionStorage).
export function useAuth() {
  const [username, setUsername] = useState(() => sessionStorage.getItem(USER_KEY) ?? '');
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem(STORAGE_KEY) === 'yes');

  const login = useCallback((name) => {
    const value = String(name ?? '').trim();
    sessionStorage.setItem(STORAGE_KEY, 'yes');
    sessionStorage.setItem(USER_KEY, value);
    setUsername(value);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUsername('');
    setIsLoggedIn(false);
  }, []);

  return { isLoggedIn, username, login, logout };
}
