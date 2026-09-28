import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchApi } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // DEVELOPMENT ONLY BYPASS - DO NOT USE IN PRODUCTION
    // Used to render UI while PostgreSQL is blocked
    if (import.meta.env.MODE === 'development' || import.meta.env.VITE_DEV_AUTH_BYPASS === 'true') {
      const devRole = localStorage.getItem('DEV_ROLE') || 'CREATOR';
      console.warn(`⚠️ AUTHENTICATION BYPASSED FOR DEVELOPMENT UI TESTING (ROLE: ${devRole}) ⚠️`);
      setUser({
        id: devRole === 'ADMIN' ? 'dev-admin-id-456' : 'dev-creator-id-123',
        email: devRole === 'ADMIN' ? 'admin@codequest.dev' : 'creator@codequest.dev',
        display_name: devRole === 'ADMIN' ? 'Dev Admin' : 'Dev Creator',
        role: devRole,
      });
      setLoading(false);
      return;
    }

    fetchApi<{ user: User }>('/api/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
