import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('finguard_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, validate existing token
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('finguard_token');
      if (savedToken) {
        try {
          const data = await auth.getMe();
          setUser(data.user || data);
          setToken(savedToken);
        } catch {
          localStorage.removeItem('finguard_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await auth.login(email, password);
      const newToken = data.token || data.access_token;
      localStorage.setItem('finguard_token', newToken);
      setToken(newToken);
      setUser(data.user || data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await auth.register(name, email, password);
      const newToken = data.token || data.access_token;
      localStorage.setItem('finguard_token', newToken);
      setToken(newToken);
      setUser(data.user || data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('finguard_token');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
