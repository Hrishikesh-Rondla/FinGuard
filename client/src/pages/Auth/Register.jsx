import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-teal/20 rounded-2xl">
            <Shield className="w-8 h-8 text-teal" />
          </div>
          <span className="text-3xl font-bold text-gray-100 tracking-tight">
            Fin<span className="text-teal">Guard</span>
          </span>
        </div>

        {/* Register Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-gray-100 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Start monitoring your financial health
          </p>

          {error && (
            <div
              id="register-error"
              className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl mb-4"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm text-gray-400 mb-1.5">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="input-field"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-sm text-gray-400 mb-1.5">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block text-sm text-gray-400 mb-1.5">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="input-field"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="block text-sm text-gray-400 mb-1.5">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="input-field"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              id="register-submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              id="login-link"
              className="text-teal hover:text-teal-light transition-colors font-medium"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
