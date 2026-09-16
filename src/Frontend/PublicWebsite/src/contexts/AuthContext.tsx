import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, UserRole } from '../types';
import { publicApi } from '../services/api';
import { resolvePublicSiteUrl } from '../utils/publicSite';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  role: UserRole | null;
  loginUrl: string;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeRole = (role: AuthUser['role']): UserRole | null => {
  if (typeof role === 'number' && role in UserRole) {
    return role as UserRole;
  }
  if (typeof role === 'string') {
    const asNumber = Number(role);
    if (!Number.isNaN(asNumber) && asNumber in UserRole) {
      return asNumber as UserRole;
    }
    const key = role as keyof typeof UserRole;
    if (key in UserRole && typeof UserRole[key] === 'number') {
      return UserRole[key] as UserRole;
    }
  }
  return null;
};

export const resolveAdminLoginUrl = (): string => {
  const fromEnv = process.env.REACT_APP_ADMIN_LOGIN_URL?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '';
    if (path.startsWith('/batuara-public') || path.startsWith('/batuara-admin')) {
      return '/batuara-admin/login';
    }
  }

  return '/admin/login';
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginUrl] = useState(resolveAdminLoginUrl);

  const refreshSession = useCallback(async () => {
    try {
      const me = await publicApi.getCurrentUser();
      if (me) {
        setUser(me);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await publicApi.getCurrentUser();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await publicApi.logout();
    } catch {
      // Cookie clear may still succeed server-side; ignore network errors
    } finally {
      setUser(null);
      window.location.assign(resolvePublicSiteUrl());
    }
  }, []);

  const role = user ? normalizeRole(user.role) : null;

  const value: AuthContextType = {
    isAuthenticated: !!user,
    isLoading,
    user,
    role,
    loginUrl,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
