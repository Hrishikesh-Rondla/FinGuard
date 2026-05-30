import { AlertTriangle, Lightbulb, CheckCircle, X, Eye } from 'lucide-react';
import clsx from 'clsx';
import { formatDateRelative } from '@/utils/helpers';

const alertConfig = {
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber',
    iconColor: 'text-amber',
    bgActive: 'bg-amber/5',
  },
  tip: {
    icon: Lightbulb,
    borderColor: 'border-l-teal',
    iconColor: 'text-teal',
    bgActive: 'bg-teal/5',
  },
  positive: {
    icon: CheckCircle,
    borderColor: 'border-l-green-500',
    iconColor: 'text-green-500',
    bgActive: 'bg-green-500/5',
  },
  danger: {
    icon: AlertTriangle,
    borderColor: 'border-l-rose',
    iconColor: 'text-rose',
    bgActive: 'bg-rose/5',
  },
};

export default function AlertBanner({ alert, onMarkRead, onDismiss, compact = false }) {
  const type = alert.type || alert.alertType || 'tip';
  const isRead = alert.isRead || alert.is_read;
  const config = alertConfig[type] || alertConfig.tip;
  const Icon = config.icon;
  const alertId = alert._id || alert.id;

  return (
    <div
      id={`alert-banner-${alertId}`}
      className={clsx(
        'rounded-xl border-l-4 transition-all duration-200',
        config.borderColor,
        isRead
          ? 'bg-navy-800/30 opacity-70'
          : clsx(config.bgActive, 'bg-navy-800/60'),
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={clsx('text-gray-200', compact ? 'text-xs' : 'text-sm')}>
            {alert.message || alert.text}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDateRelative(alert.createdAt || alert.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isRead && onMarkRead && (
            <button
              id={`mark-read-${alertId}`}
              onClick={() => onMarkRead(alertId)}
              className="p-1.5 rounded-lg hover:bg-navy-700/50 text-gray-500 hover:text-gray-300 transition-all duration-200"
              title="Mark as read"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
          {onDismiss && (
            <button
              id={`dismiss-alert-${alertId}`}
              onClick={() => onDismiss(alertId)}
              className="p-1.5 rounded-lg hover:bg-navy-700/50 text-gray-500 hover:text-gray-300 transition-all duration-200"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
