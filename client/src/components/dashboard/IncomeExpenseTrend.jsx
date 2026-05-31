import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { formatCurrency } from '@/utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 shadow-lg">
        <p className="text-xs text-gray-400 mb-2">{label}</p>
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-300">{item.name}:</span>
            <span className="text-xs font-mono text-gray-200">
              {formatCurrency(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function IncomeExpenseTrend({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-500 text-sm">No trend data available</p>
      </div>
    );
  }

  return (
    <div id="income-expense-trend" className="glass-card p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Income vs Expense Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4AA" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D4AA" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#00D4AA"
            strokeWidth={2}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#F43F5E"
            strokeWidth={2}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
