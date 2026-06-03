import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Calendar, DollarSign, Lock, Loader2, Save } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
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

export default function Profile() {
  const { user } = useAuth();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    const { currentPassword, newPassword, confirmPassword } = passwords;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }

    try {
      setPwLoading(true);
      await api.put('/auth/password', { currentPassword, newPassword });
      setPwSuccess('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <motion.div 
      id="profile-page" 
      className="max-w-2xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* User Info */}
      <motion.div variants={itemVariants} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-6">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <span className="text-2xl font-bold text-blue-400">
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'U'}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-medium text-slate-100">{user?.name || 'User'}</h4>
              <p className="text-xs text-slate-500">Member</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg border border-slate-700">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="text-sm text-slate-200">{user?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg border border-slate-700">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm text-slate-200">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg border border-slate-700">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Joined</p>
                <p className="text-sm text-slate-200">
                  {formatDate(user?.createdAt || user?.created_at) || '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div variants={itemVariants} className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-400" />
          Change Password
        </h3>

        <AnimatePresence>
          {pwError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-4"
            >
              {pwError}
            </motion.div>
          )}
          {pwSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-4"
            >
              {pwSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-xs text-slate-400 mb-1.5">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              placeholder="••••••••"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
              className="input-field py-2.5"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-xs text-slate-400 mb-1.5">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              placeholder="••••••••"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
              }
              className="input-field py-2.5"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-xs text-slate-400 mb-1.5">
              Confirm New Password
            </label>
            <input
              id="confirm-new-password"
              type="password"
              placeholder="••••••••"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
              className="input-field py-2.5"
            />
          </div>
          <button
            type="submit"
            id="change-password-btn"
            disabled={pwLoading}
            className="btn-primary flex items-center gap-2 mt-4"
          >
            {pwLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
