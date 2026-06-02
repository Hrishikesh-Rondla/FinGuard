import { useState, useEffect, useCallback } from 'react';
import { admin as adminApi } from '@/services/api';
import { Users, Activity, Loader2, Ban, Trash2, CheckCircle } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { formatDate } from '@/utils/helpers';

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
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  return (
    <div id="admin-panel" className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-100">Superadmin Dashboard</h2>
        <p className="text-sm text-gray-500">System-wide usage statistics and account management.</p>
      </div>

      {error && (
        <div className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Total Users" value={stats.totalUsers} icon={Users} trend="neutral" />
          <KPICard title="Active Accounts" value={stats.activeUsers} icon={CheckCircle} trend="positive" />
          <KPICard title="Total Transactions" value={stats.totalTransactions} icon={Activity} trend="neutral" />
          <KPICard title="Total Predictions" value={stats.totalPredictions} icon={Activity} trend="neutral" />
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-medium text-gray-300">Registered Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-navy-800/50">
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Email</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Role</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400">Joined</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-200">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{u.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${u.role === 'superadmin' ? 'bg-amber/20 text-amber' : 'bg-teal/20 text-teal'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {u.isActive ? (
                      <span className="text-teal flex items-center gap-1 text-xs">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-rose flex items-center gap-1 text-xs">
                        <Ban className="w-3 h-3" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    {u.role !== 'superadmin' && (
                      <>
                        <button
                          onClick={() => handleToggleStatus(u._id)}
                          disabled={actionLoading === u._id}
                          className="text-amber hover:text-amber/70 transition-colors disabled:opacity-50"
                          title={u.isActive ? "Suspend User" : "Reactivate User"}
                        >
                          <Ban className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          disabled={actionLoading === u._id}
                          className="text-rose hover:text-rose/70 transition-colors disabled:opacity-50"
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
                  <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
