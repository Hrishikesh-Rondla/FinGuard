import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, trend, color = 'teal' }) {
  const colorMap = {
    teal: {
      iconBg: 'bg-teal/20',
      iconText: 'text-teal',
      valueText: 'text-teal',
    },
    amber: {
      iconBg: 'bg-amber/20',
      iconText: 'text-amber',
      valueText: 'text-amber',
    },
    rose: {
      iconBg: 'bg-rose/20',
      iconText: 'text-rose',
      valueText: 'text-rose',
    },
    white: {
      iconBg: 'bg-white/10',
      iconText: 'text-gray-300',
      valueText: 'text-gray-100',
    },
  };

  const colors = colorMap[color] || colorMap.teal;

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-teal' : trend === 'down' ? 'text-rose' : 'text-gray-500';

  return (
    <div
      id={`kpi-card-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      className="glass-card-hover p-6 group cursor-default overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('p-2.5 rounded-xl', colors.iconBg)}>
          {Icon && <Icon className={clsx('w-5 h-5', colors.iconText)} />}
        </div>
        {trend && (
          <div className={clsx('flex items-center gap-1', trendColor)}>
            <TrendIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      <p title={value} className={clsx('stat-value mb-1 truncate', colors.valueText)}>{value}</p>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
    </div>
  );
}
