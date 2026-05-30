import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { alerts as alertsApi } from '@/services/api';
import { useAuth } from './AuthContext';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await alertsApi.getAlerts();
      const alertList = data.alerts || data || [];
      setAlerts(alertList);
      const unread = alertList.filter((a) => !a.isRead && !a.is_read).length;
      setUnreadCount(unread);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated, fetchAlerts]);

  const markRead = useCallback(async (id) => {
    try {
      await alertsApi.markAlertRead(id);
      setAlerts((prev) =>
        prev.map((a) =>
          a._id === id || a.id === id ? { ...a, isRead: true, is_read: true } : a
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await alertsApi.markAllRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    }
  }, []);

  const dismiss = useCallback(async (id) => {
    try {
      await alertsApi.dismissAlert(id);
      setAlerts((prev) => {
        const alert = prev.find((a) => a._id === id || a.id === id);
        const newAlerts = prev.filter((a) => a._id !== id && a.id !== id);
        if (alert && !alert.isRead && !alert.is_read) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return newAlerts;
      });
    } catch {
      // silently fail
    }
  }, []);

  const value = {
    alerts,
    unreadCount,
    loading,
    fetchAlerts,
    markRead,
    markAllRead,
    dismiss,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlerts() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}

export default AlertContext;
