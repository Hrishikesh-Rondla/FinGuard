import { useMemo } from 'react';
import clsx from 'clsx';
import { getStressHexColor } from '@/utils/helpers';

export default function StressGauge({ stressScore = 0, stressLevel = 'Low', probabilities = {} }) {
  const normalizedScore = useMemo(() => {
    // stressScore 0-2, normalize to 0-1
    return Math.min(1, Math.max(0, stressScore / 2));
  }, [stressScore]);

  const color = getStressHexColor(stressLevel);
  const isHigh = stressLevel?.toLowerCase() === 'high';

  // SVG semicircle gauge
  const radius = 80;
  const strokeWidth = 12;
  const cx = 100;
  const cy = 100;
  // Arc from 180 to 0 degrees (left to right semicircle)
  const circumference = Math.PI * radius;
  const filledLength = circumference * normalizedScore;
  const remainingLength = circumference - filledLength;

  const probData = [
    { label: 'Low', value: probabilities.Low || probabilities.low || probabilities[0] || 0, color: '#00D4AA' },
    { label: 'Medium', value: probabilities.Medium || probabilities.medium || probabilities[1] || 0, color: '#F59E0B' },
    { label: 'High', value: probabilities.High || probabilities.high || probabilities[2] || 0, color: '#F43F5E' },
  ];

  return (
    <div
      id="stress-gauge"
      className={clsx('glass-card p-6 flex flex-col items-center', isHigh && 'pulse-ring-animation')}
    >
      <h3 className="text-sm font-medium text-gray-400 mb-4">Financial Stress Level</h3>

      {/* SVG Gauge */}
      <div className="relative w-full max-w-[220px]">
        <svg viewBox="0 0 200 120" className="w-full">
          {/* Background arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#334155"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${remainingLength}`}
            className="transition-all duration-1000 ease-out"
          />
          {/* Center text */}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            className="font-bold"
            style={{ fontSize: '24px', fill: color }}
          >
            {stressLevel?.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* Probability bars */}
      <div className="w-full mt-4 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Probabilities</p>
        {probData.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">{item.label}</span>
              <span className="text-xs font-mono text-gray-300">
                {(item.value * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${item.value * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
