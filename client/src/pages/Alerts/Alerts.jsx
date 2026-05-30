import { useState } from 'react';
import { Bell, CheckCheck, Filter } from 'lucide-react';
import { useAlerts } from '@/context/AlertContext';
import AlertBanner from '@/components/alerts/AlertBanner';
import clsx from 'clsx';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'warning', label: 'Warnings' },
  { key: 'tip', label: 'Tips' },
  { key: 'positive', label: 'Positive' },
];

export default function Alerts() {
  const { alerts, unreadCount, markRead, markAllRead, dismiss, loading } = useAlerts();
  const [activeTab, setActiveTab] = useState('all');

  const filteredAlerts = alerts.filter((alert) => {
    const type = alert.type || alert.alertType || 'tip';
    const isRead = alert.isRead || alert.is_read;

    switch (activeTab) {
      case 'unread':
        return !isRead;
      case 'warning':
        return type === 'warning' || type === 'danger';
      case 'tip':
        return type === 'tip';
      case 'positive':
        return type === 'positive';
      default:
        return true;
    }
  });

  return (
    <div id="alerts-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Alerts</h2>
          <p className="text-sm text-gray-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread alert${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllRead}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`alert-tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap',
              activeTab === tab.key
                ? 'bg-teal/20 text-teal border border-teal/30'
                : 'bg-navy-800/50 text-gray-400 border border-white/10 hover:bg-navy-700/50 hover:text-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-navy-700/50 rounded-2xl mb-4">
            <Bell className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            {activeTab === 'all' ? 'No alerts' : `No ${activeTab} alerts`}
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            {activeTab === 'all'
              ? 'Your finances are looking great! No alerts to show.'
              : `No ${activeTab} alerts to display.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => (
            <AlertBanner
              key={alert._id || alert.id}
              alert={alert}
              onMarkRead={markRead}
              onDismiss={dismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}
