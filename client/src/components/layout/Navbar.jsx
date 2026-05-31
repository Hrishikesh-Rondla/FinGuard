import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/predictions': 'Predictions',
  '/profile': 'Profile',
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || 'FinGuard';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      id="navbar"
      className="sticky top-0 z-30 glass-card rounded-none border-t-0 border-x-0 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-100">{pageTitle}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="navbar-user-dropdown"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-navy-700/50 transition-all duration-200"
            >
              <div className="w-8 h-8 bg-teal/20 rounded-lg flex items-center justify-center">
                <span className="text-sm font-semibold text-teal">
                  {userInitials}
                </span>
              </div>
              <span className="hidden sm:block text-sm text-gray-300 font-medium">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 glass-card p-2 shadow-xl shadow-black/20">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-sm font-medium text-gray-200">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                </div>
                <button
                  id="navbar-profile-btn"
                  onClick={() => {
                    navigate('/profile');
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-navy-700/50 rounded-lg transition-all duration-200"
                >
                  Profile
                </button>
                <button
                  id="navbar-logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose hover:bg-rose/10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
