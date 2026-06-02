import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Transactions from '@/pages/Transactions/Transactions';
import Predictions from '@/pages/Predictions/Predictions';
import Profile from '@/pages/Profile/Profile';

import AdminPanel from '@/pages/Admin/AdminPanel';
import { useAuth } from '@/context/AuthContext';

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (user?.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function UserRoute({ children }) {
  const { user } = useAuth();
  if (user?.role === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function DefaultRoute() {
  const { user } = useAuth();
  if (user?.role === 'superadmin') {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
            <Route path="/transactions" element={<UserRoute><Transactions /></UserRoute>} />
            <Route path="/predictions" element={<UserRoute><Predictions /></UserRoute>} />
            <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<DefaultRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
