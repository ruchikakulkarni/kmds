import React, { createContext, useContext, useState } from 'react';

export type Role = 'DMA_ADMIN' | 'ULB_ADMIN' | 'AEE_CREATOR';

const CREDENTIALS: Record<string, { password: string; role: Role }> = {
  '123':  { password: '123',  role: 'DMA_ADMIN' },
  '456':  { password: '456',  role: 'ULB_ADMIN' },
  '0000': { password: '0000', role: 'AEE_CREATOR' },
};

const STORAGE_KEY = 'kmds_role';

interface AuthContextValue {
  role: Role | null;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as Role) || null;
  });

  const login = (userId: string, password: string): boolean => {
    const cred = CREDENTIALS[userId];
    if (!cred || cred.password !== password) return false;
    localStorage.setItem(STORAGE_KEY, cred.role);
    setRole(cred.role);
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
