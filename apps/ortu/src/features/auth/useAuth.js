import { useCallback, useEffect, useState } from 'react';
import { authRequest } from './authApi.js';

export const STORAGE_KEY = 'tumbieParentToken';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(sessionStorage.getItem(STORAGE_KEY)));

  useEffect(() => {
    const token = sessionStorage.getItem(STORAGE_KEY);
    if (!token) return;

    let active = true;
    authRequest('me', { token }).then(({ user }) => {
      if (!active) return;
      if (user.role !== 'orang_tua') throw new Error('Peran akun tidak sesuai.');
      setUser(user);
    }).catch(() => {
      if (active) sessionStorage.removeItem(STORAGE_KEY);
    }).finally(() => {
      if (active) setChecking(false);
    });

    return () => { active = false; };
  }, []);

  const login = useCallback((token, user) => {
    sessionStorage.setItem(STORAGE_KEY, token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, isLoggedIn: Boolean(user), checking, login, logout };
}