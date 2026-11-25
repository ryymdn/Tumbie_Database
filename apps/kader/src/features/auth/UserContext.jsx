import { createContext, useContext, useMemo } from 'react';
import { initialOf, nameFromUsername } from './format.js';

const UserContext = createContext({ name: 'Kader', initial: 'K' });

export function UserProvider({ username, children }) {
  const value = useMemo(() => {
    const name = nameFromUsername(username) || 'Kader';
    return { name, initial: initialOf(name) || 'K' };
  }, [username]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
