import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, UserLocation } from '../types';
import { api, getToken, setToken, removeToken } from '../services/api';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; phone?: string; password: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchPersona: (role: UserRole) => Promise<void>;
  userLocation: UserLocation;
  setUserLocation: (loc: UserLocation) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const DEFAULT_LOCATIONS: UserLocation[] = [
  { name: 'North Campus Library', lat: 12.9716, lng: 77.5946 },
  { name: 'Tech Park East Hub', lat: 12.9740, lng: 77.5990 },
  { name: 'South Avenue Market', lat: 12.9690, lng: 77.5890 },
  { name: 'Downtown Central Square', lat: 12.9800, lng: 77.6000 }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_LOCATIONS[0]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
          setTokenState(storedToken);
        } catch {
          removeToken();
          setTokenState(null);
          setUser(null);
        }
      } else {
        // Auto-login as default demo User for immediate delightful exploration
        try {
          const res = await api.auth.login({ email: 'user@foodloop.org', password: 'user123' });
          setToken(res.token);
          setTokenState(res.token);
          setUser(res.user);
        } catch {
          // If login fails, continue as guest
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; phone?: string; password: string; role?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      showToast(`Account created! Welcome to FoodLoop, ${res.user.name}.`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      showToast(msg, 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const switchPersona = async (role: UserRole) => {
    setIsLoading(true);
    try {
      let email = 'user@foodloop.org';
      let pass = 'user123';
      if (role === 'PROVIDER') {
        email = 'provider@foodloop.org';
        pass = 'provider123';
      } else if (role === 'ADMIN') {
        email = 'admin@foodloop.org';
        pass = 'admin123';
      }
      const res = await api.auth.login({ email, password: pass });
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      showToast(`Switched persona to: ${role} (${res.user.name})`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Persona switch failed';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchPersona,
        userLocation,
        setUserLocation,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
