import { Link } from 'react-router-dom';
import AlertBanner from '@/components/alerts/AlertBanner';
import { Bell } from 'lucide-react';

export default function RecentAlerts({ alerts = [], onMarkRead, onDismiss }) {
  return (
    <div id="recent-alerts" className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Recent Alerts</h3>
        <Link
          to="/alerts"
          id="view-all-alerts-link"
          className="text-xs text-teal hover:text-teal-light transition-colors"
        >
          View All →
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-3 bg-navy-700/50 rounded-full mb-3">
            <Bell className="w-6 h-6 text-gray-500" />
          </div>
          <p className="text-sm text-gray-500">No recent alerts</p>
          <p className="text-xs text-gray-600 mt-1">
            Your finances are looking great!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.slice(0, 3).map((alert) => (
            <AlertBanner
              key={alert._id || alert.id}
              alert={alert}
              onMarkRead={onMarkRead}
              onDismiss={onDismiss}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
