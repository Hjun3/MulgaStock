import { createContext, useContext, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../api';

interface AuthContextValue {
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = (email: string, password: string): Promise<void> => {
    return apiLogin(email, password).then(() => setIsLoggedIn(true));
  };

  const register = (email: string, password: string): Promise<void> => {
    return apiRegister(email, password).then(() => setIsLoggedIn(true));
  };

  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
