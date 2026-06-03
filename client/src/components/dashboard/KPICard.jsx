import clsx from 'clsx';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({ title, value, icon: Icon, trend, color = 'blue', valueClass = '' }) {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-500/10',
      iconText: 'text-blue-500',
      valueText: 'text-slate-100',
    },
    teal: {
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-500',
      valueText: 'text-slate-100',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-500',
      valueText: 'text-slate-100',
    },
    amber: {
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-500',
      valueText: 'text-slate-100',
    },
    danger: {
      iconBg: 'bg-rose-500/10',
      iconText: 'text-rose-500',
      valueText: 'text-slate-100',
    },
    rose: {
      iconBg: 'bg-rose-500/10',
      iconText: 'text-rose-500',
      valueText: 'text-slate-100',
    },
    white: {
      iconBg: 'bg-slate-700/50',
      iconText: 'text-slate-300',
      valueText: 'text-slate-100',
    },
  };

  const colors = colorMap[color] || colorMap.blue;

  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-500';

  return (
    <div
      id={`kpi-card-${title?.toLowerCase().replace(/\s+/g, '-')}`}
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-slate-600 hover:shadow-lg transition-all duration-200 cursor-default"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('p-2.5 rounded-xl', colors.iconBg)}>
          {Icon && <Icon className={clsx('w-5 h-5', colors.iconText)} />}
        </div>
        {trend && trend !== 'none' && (
          <div className={clsx('flex items-center gap-1', trendColor)}>
            <TrendIcon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <p title={value} className={clsx('text-2xl font-bold mb-1 truncate', valueClass || colors.valueText)}>{value}</p>
        <p className="text-sm text-slate-400 font-medium">{title}</p>
      </div>
    </div>
  );
}
