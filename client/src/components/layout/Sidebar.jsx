import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Brain,
  User,
  Shield,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/predictions', label: 'Predictions', icon: Brain },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="sidebar-desktop"
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 glass-card rounded-none border-l-0 border-t-0 border-b-0 z-40"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="p-2 bg-teal/20 rounded-xl">
            <Shield className="w-6 h-6 text-teal" />
          </div>
          <span className="text-xl font-bold text-gray-100 tracking-tight">
            Fin<span className="text-teal">Guard</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`sidebar-nav-${item.label.toLowerCase()}`}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group',
                  isActive
                    ? 'bg-teal/10 text-teal border-l-4 border-teal'
                    : 'text-gray-400 hover:bg-navy-700/50 hover:text-gray-200'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-xs text-gray-500">FinGuard v1.0</p>
          <p className="text-xs text-gray-600">Financial Stress Predictor</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        id="sidebar-mobile"
        className="lg:hidden fixed bottom-0 left-0 right-0 glass-card rounded-none border-l-0 border-r-0 border-b-0 z-40 flex justify-around items-center px-2 py-2"
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={`mobile-nav-${item.label.toLowerCase()}`}
              className={clsx(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 relative',
                isActive
                  ? 'text-teal'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
