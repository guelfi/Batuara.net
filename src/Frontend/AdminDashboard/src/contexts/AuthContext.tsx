import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, LoginRequest, LoginResponse, RevokeTokenRequest } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session timeout configuration (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);

  const isAuthenticated = !!user;

  const updateLastActivity = useCallback(() => {
    setLastActivity(Date.now());
    if (warningShown) {
      setWarningShown(false);
    }
  }, [warningShown]);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      // If no token exists, clear everything and finish loading
      if (!token || !userData) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Try to verify the token before setting user
      try {
        const parsedUser = JSON.parse(userData);
        await apiService.get('/auth/verify');

        // Token is valid, set the user
        setUser(parsedUser);
      } catch (error) {
        // Invalid token or verification failed, clear everything
        console.warn('Token verification failed, clearing auth data');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Error initializing authentication:', error);
      // On any error, clear auth data to be safe
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionTimeout = async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Error during session timeout logout:', error);
    } finally {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } catch (_) {}
      setUser(null);
      document.cookie = 'token=; Max-Age=0; path=/';
      document.cookie = 'session=; Max-Age=0; path=/';
      window.location.href = '/login';
    }
  };

  // Effect 1: Initialize authentication ONCE on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Effect 2: Handle activity listeners and timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    // Add event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => updateLastActivity();

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check for inactivity periodically
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // Show warning 5 minutes before timeout
      if (timeSinceLastActivity > (SESSION_TIMEOUT - WARNING_TIME) && !warningShown && isAuthenticated) {
        setWarningShown(true);
        // Here you could show a warning notification to the user
        console.warn('Session will expire in 5 minutes due to inactivity');
      }

      // Logout if session has expired
      if (timeSinceLastActivity > SESSION_TIMEOUT && isAuthenticated) {
        handleSessionTimeout();
      }
    }, 1000); // Check every second

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [lastActivity, warningShown, isAuthenticated, updateLastActivity]);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      // Use the real API instead of mock
      const response = await apiService.post<LoginResponse>('/auth/login', credentials);

      if (response.success && response.data) {
        const { token, refreshToken, user: userData } = response.data;

        // Store token and user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify({
          ...userData,
          refreshToken: refreshToken
        }));
        setUser(userData);

        // Reset activity tracking
        updateLastActivity();
      } else {
        throw new Error(response.message || 'Error logging in');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } catch (_) {}
      setUser(null);
      document.cookie = 'token=; Max-Age=0; path=/';
      document.cookie = 'session=; Max-Age=0; path=/';
      setLastActivity(Date.now());
      setWarningShown(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.get<User>('/auth/me');
      if (response.success && response.data) {
        const userData = response.data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
