import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Calendar, DollarSign, Lock, Loader2, Save } from 'lucide-react';
import { formatDate } from '@/utils/helpers';
import api from '@/services/api';

export default function Profile() {
  const { user } = useAuth();

  const [income, setIncome] = useState(user?.monthlyIncome || user?.monthly_income || '');
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeSuccess, setIncomeSuccess] = useState('');
  const [incomeError, setIncomeError] = useState('');

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    setIncomeError('');
    setIncomeSuccess('');

    if (!income || parseFloat(income) < 0) {
      setIncomeError('Please enter a valid income amount');
      return;
    }

    try {
      setIncomeLoading(true);
      await api.put('/auth/profile', { monthlyIncome: parseFloat(income) });
      setIncomeSuccess('Monthly income updated successfully');
      setTimeout(() => setIncomeSuccess(''), 3000);
    } catch (err) {
      setIncomeError(err.message);
    } finally {
      setIncomeLoading(false);
    }
  };

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
    <div id="profile-page" className="max-w-2xl mx-auto space-y-6">
      {/* User Info */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-6">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-teal">
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
              <h4 className="text-lg font-medium text-gray-100">{user?.name || 'User'}</h4>
              <p className="text-sm text-gray-500">Member</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm text-gray-200">{user?.name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-200">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm text-gray-200">
                  {formatDate(user?.createdAt || user?.created_at) || '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Monthly Income</p>
                <p className="text-sm text-gray-200">
                  ${(user?.monthlyIncome || user?.monthly_income || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Income */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal" />
          Update Monthly Income
        </h3>

        {incomeError && (
          <div className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl mb-4">
            {incomeError}
          </div>
        )}
        {incomeSuccess && (
          <div className="bg-teal/10 border border-teal/30 text-teal text-sm px-4 py-3 rounded-xl mb-4">
            {incomeSuccess}
          </div>
        )}

        <form onSubmit={handleIncomeSubmit} className="flex gap-3">
          <input
            id="profile-income"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter monthly income"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="input-field font-mono flex-1"
          />
          <button
            type="submit"
            id="save-income-btn"
            disabled={incomeLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {incomeLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber" />
          Change Password
        </h3>

        {pwError && (
          <div className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl mb-4">
            {pwError}
          </div>
        )}
        {pwSuccess && (
          <div className="bg-teal/10 border border-teal/30 text-teal text-sm px-4 py-3 rounded-xl mb-4">
            {pwSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm text-gray-400 mb-1.5">
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
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm text-gray-400 mb-1.5">
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
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password" className="block text-sm text-gray-400 mb-1.5">
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
              className="input-field"
            />
          </div>
          <button
            type="submit"
            id="change-password-btn"
            disabled={pwLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {pwLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
