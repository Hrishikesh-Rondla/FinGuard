import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, LayoutDashboard, Receipt, Brain, User, Shield as ShieldIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/predictions', label: 'Predictions', icon: Brain },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = user?.role === 'superadmin' 
    ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldIcon }]
    : baseNavItems;

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
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header id="navbar" className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 lg:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 mr-4">
          <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <ShieldIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
          </div>
          <span className="text-lg sm:text-xl font-display font-bold text-slate-100 hidden sm:block">
            Fin<span className="text-blue-400">Guard</span>
          </span>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center justify-center gap-2 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium',
                  isActive
                    ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Right side - User Dropdown */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2 sm:pr-3 rounded-xl hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all duration-200"
          >
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
              <span className="text-sm font-display font-medium text-blue-400">
                {userInitials}
              </span>
            </div>
            <span className="hidden sm:block text-sm text-slate-300 font-sans">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 p-2 shadow-xl rounded-xl">
              <div className="px-3 py-2 border-b border-slate-700 mb-1">
                <p className="text-sm font-sans text-slate-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs font-sans text-slate-400 truncate">{user?.email || ''}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-sans text-slate-300 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg transition-all duration-200"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-sans text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 mt-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-40 flex justify-around items-center px-2 py-2 pb-safe">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200',
                isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
