import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from 'recharts';
import { getCategoryColor, formatCurrency } from '@/utils/helpers';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-800 border border-slate-700 shadow-lg px-4 py-3 rounded-xl">
        <p className="text-xs font-medium text-slate-400 mb-1">{data.name}</p>
        <p className="text-sm font-semibold text-rose-400">
          {formatCurrency(data.value)}
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
        <div key={index} className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full border border-slate-700">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-slate-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="font-display font-bold text-sm">
        {payload.name}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#f43f5e" className="font-mono text-xs">
        {formatCurrency(value)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export default function ExpensePieChart({ data = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex items-center justify-center h-full min-h-[300px]">
        <p className="text-sm text-slate-500">No expense data available</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category?.charAt(0).toUpperCase() + item.category?.slice(1) || 'Other',
    value: item.amount || 0,
    color: getCategoryColor(item.category),
  }));

  return (
    <div id="expense-pie-chart" className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-slate-400 mb-4">Expenses by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={onPieEnter}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
            animationBegin={200}
            animationDuration={1200}
            animationEasing="ease-out"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="none"
                style={{ outline: 'none' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
