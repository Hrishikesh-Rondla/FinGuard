import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getCategoryColor } from '@/utils/helpers';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="glass-card px-4 py-3 shadow-lg">
        <p className="text-sm font-medium text-gray-200">{data.name}</p>
        <p className="text-sm font-mono text-teal">
          ${data.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ExpensePieChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-full min-h-[300px]">
        <p className="text-gray-500 text-sm">No expense data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category?.charAt(0).toUpperCase() + item.category?.slice(1) || 'Other',
    value: item.amount || 0,
    color: getCategoryColor(item.category),
  }));

  return (
    <div id="expense-pie-chart" className="glass-card p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
