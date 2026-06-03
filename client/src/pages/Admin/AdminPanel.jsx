import { useState, useEffect, useCallback } from 'react';
import { admin as adminApi } from '@/services/api';
import { Users, Activity, Loader2, Ban, Trash2, CheckCircle } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { formatDate } from '@/utils/helpers';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // id of user being operated on

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.getUsersAndStats();
      setUsers(data.users || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading(userId);
      await adminApi.toggleUserStatus(userId);
      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user and all their data? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(userId);
      await adminApi.deleteUser(userId);
      await fetchAdminData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      id="admin-panel" 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold text-slate-100">Superadmin Dashboard</h2>
        <p className="text-sm text-slate-400 mt-1">System-wide usage statistics and account management.</p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {stats && (
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants}><KPICard title="Total Users" value={stats.totalUsers} icon={Users} trend="neutral" /></motion.div>
          <motion.div variants={itemVariants}><KPICard title="Active Accounts" value={stats.activeUsers} icon={CheckCircle} trend="positive" /></motion.div>
          <motion.div variants={itemVariants}><KPICard title="Total Transactions" value={stats.totalTransactions} icon={Activity} trend="neutral" /></motion.div>
          <motion.div variants={itemVariants}><KPICard title="Total Predictions" value={stats.totalPredictions} icon={Activity} trend="neutral" /></motion.div>
        </motion.div>
      )}

      {/* User Management */}
      <motion.div variants={itemVariants} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="px-4 py-3 text-xs uppercase font-medium text-slate-500">Name</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-slate-500">Email</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-slate-500">Role</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-slate-500">Joined</th>
                <th className="px-4 py-3 text-xs uppercase font-medium text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-200">{u.name}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${u.role === 'superadmin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {u.isActive ? (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 text-xs font-medium">
                        <Ban className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    {u.role !== 'superadmin' && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          disabled={actionLoading === u._id}
                          className="text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 p-1 bg-slate-700/50 rounded-md hover:bg-slate-700"
                          title={u.isActive ? "Suspend User" : "Reactivate User"}
                        >
                          <Ban className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          disabled={actionLoading === u._id}
                          className="text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50 p-1 bg-slate-700/50 rounded-md hover:bg-slate-700"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
