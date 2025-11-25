import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [warningShown, setWarningShown] = useState(false);

  // Session timeout configuration (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  const isAuthenticated = !!user;

  // Update last activity on user interaction
  const updateLastActivity = () => {
    setLastActivity(Date.now());
    setWarningShown(false);
  };

  useEffect(() => {
    initializeAuth();
    
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
  }, [lastActivity, warningShown, isAuthenticated]);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Verify if the token is still valid
        try {
          await apiService.get('/auth/verify');
        } catch (error) {
          // Invalid token, clear data
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error initializing authentication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionTimeout = async () => {
    try {
      // Revoke refresh token before logout
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData.refreshToken) {
          const revokeRequest: RevokeTokenRequest = { refreshToken: userData.refreshToken };
          await apiService.post('/auth/revoke', revokeRequest);
        }
      }
    } catch (error) {
      console.error('Error revoking token on session timeout:', error);
    } finally {
      // Clear local storage and update state
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

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
      // Get refresh token from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        // Call revoke endpoint with refresh token if it exists
        if (userData.refreshToken) {
          const revokeRequest: RevokeTokenRequest = { refreshToken: userData.refreshToken };
          await apiService.post('/auth/revoke', revokeRequest);
        }
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      
      // Reset activity tracking
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