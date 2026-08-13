import React, { createContext, useContext, useState } from 'react';
import type { User } from '../../lib/types';
import { mockUser } from '../../lib/mock-data';

// TODO: Replace with Supabase Auth
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock: start as authenticated for dev
  const [user, setUser] = useState<User | null>(mockUser);

  const login = () => setUser(mockUser);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
