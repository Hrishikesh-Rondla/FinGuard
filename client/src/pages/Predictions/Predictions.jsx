import { useState, useEffect, useCallback } from 'react';
import {
  Brain,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import RecommendationCard from '@/components/alerts/RecommendationCard';
import { predictions as predictionsApi } from '@/services/api';
import { formatDate, getStressBadgeClass, getStressHexColor } from '@/utils/helpers';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 shadow-lg">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-mono text-gray-200">
          Score: {payload[0]?.value?.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function Predictions() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictionsApi.getPredictionHistory();
      setHistory(data.predictions || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRunPrediction = async () => {
    try {
      setRunning(true);
      setError(null);
      await predictionsApi.runPrediction();
      await fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  // Prepare trend data
  const trendData = [...history]
    .reverse()
    .map((p) => ({
      date: formatDate(p.createdAt || p.created_at || p.date),
      score: p.stress_score ?? p.stressScore ?? 0,
      level: p.stress_level || p.stressLevel || 'Low',
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  return (
    <div id="predictions-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">Prediction History</h2>
          <p className="text-sm text-gray-500">
            Track your financial stress predictions over time
          </p>
        </div>
        <button
          id="run-new-prediction-btn"
          onClick={handleRunPrediction}
          disabled={running}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {running ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          {running ? 'Analyzing...' : 'Run New Prediction'}
        </button>
      </div>

      {error && (
        <div className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-navy-700/50 rounded-2xl mb-4">
            <Brain className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            No predictions yet
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Run your first prediction to analyze your financial stress level based on
            your transaction history.
          </p>
        </div>
      ) : (
        <>
          {/* Stress Score Trend */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Stress Score Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={trendData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="stressTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#00D4AA" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 2]}
                  ticks={[0, 0.5, 1, 1.5, 2]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  fill="url(#stressTrendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Prediction Cards */}
          <div className="space-y-6">
            {history.map((pred, idx) => {
              const predId = pred._id || pred.id || idx;
              const level = pred.stress_level || pred.stressLevel || 'Low';
              const score = pred.stress_score ?? pred.stressScore ?? 0;
              const probs = pred.probabilities || {};
              const recommendations = pred.recommendations || [];
              const riskFactors = pred.risk_factors || pred.riskFactors || [];
              const date = pred.createdAt || pred.created_at || pred.date;

              const probData = [
                { name: 'Low', value: probs.low || probs[0] || 0, color: '#00D4AA' },
                { name: 'Medium', value: probs.medium || probs[1] || 0, color: '#F59E0B' },
                { name: 'High', value: probs.high || probs[2] || 0, color: '#F43F5E' },
              ];

              return (
                <div
                  key={predId}
                  id={`prediction-card-${predId}`}
                  className="glass-card p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-300 font-mono">
                        {formatDate(date)}
                      </span>
                      <span className={getStressBadgeClass(level)}>{level} Stress</span>
                    </div>
                    <span className="text-lg font-mono font-semibold" style={{ color: getStressHexColor(level) }}>
                      Score: {score.toFixed(2)}
                    </span>
                  </div>

                  {/* Probability Bars */}
                  <div className="mb-6">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
                      Probability Distribution
                    </h4>
                    <div className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={probData} layout="vertical" margin={{ left: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                          <XAxis
                            type="number"
                            domain={[0, 1]}
                            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                            {probData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
                        Recommendations
                      </h4>
                      <div className="space-y-2">
                        {recommendations.map((rec, i) => (
                          <RecommendationCard
                            key={i}
                            recommendation={rec}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Risk Factors */}
                  {riskFactors.length > 0 && (
                    <div>
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
                        Risk Factors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {riskFactors.map((factor, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose/10 border border-rose/20 rounded-lg text-xs text-rose"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
