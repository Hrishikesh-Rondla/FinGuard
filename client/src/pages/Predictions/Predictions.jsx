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
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 shadow-lg px-4 py-3 rounded-xl">
        <p className="text-xs font-medium text-slate-400 mb-2">{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-300">Level:</span>
          <span className={getStressBadgeClass(payload[0]?.payload?.level)}>
            {payload[0]?.payload?.level?.toUpperCase()}
          </span>
        </div>
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
    .map((p, i) => {
      const d = new Date(p.createdAt || p.created_at || p.date);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return {
        date: `${dateStr} ${timeStr}`,
        score: p.stress_score ?? p.stressScore ?? 0,
        level: p.stress_level || p.stressLevel || 'Low',
      };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      id="predictions-page" 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between flex-wrap gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Prediction History</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your financial stress predictions over time
          </p>
        </div>
        <button
          id="run-new-prediction-btn"
          onClick={handleRunPrediction}
          disabled={running}
          className="btn-primary flex items-center gap-2"
        >
          {running ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Brain className="w-5 h-5" />
          )}
          {running ? 'Analyzing...' : 'Run New Prediction'}
        </button>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      {history.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 border border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-4">
            <Brain className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">
            No predictions yet
          </h3>
          <p className="text-sm text-slate-500 max-w-md">
            Run your first prediction to analyze your financial stress level based on
            your transaction history.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stress Score Trend */}
          <motion.div variants={itemVariants} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">
              Stress Score Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="stressTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 2]}
                  ticks={[0, 0.5, 1, 1.5, 2]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#stressTrendGradient)"
                  activeDot={{ r: 5, fill: '#f59e0b', stroke: '#1e293b', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Prediction Cards */}
          <motion.div variants={containerVariants} className="space-y-6">
            {history.map((pred, idx) => {
              const predId = pred._id || pred.id || idx;
              const level = pred.stress_level || pred.stressLevel || 'Low';
              const score = pred.stress_score ?? pred.stressScore ?? 0;
              const probs = pred.probabilities || {};
              const recommendations = pred.recommendations || [];
              const date = pred.createdAt || pred.created_at || pred.date;

              const probData = [
                { name: 'Low', value: probs.Low || probs.low || probs[0] || 0, color: '#10b981' },
                { name: 'Medium', value: probs.Medium || probs.medium || probs[1] || 0, color: '#f59e0b' },
                { name: 'High', value: probs.High || probs.high || probs[2] || 0, color: '#f43f5e' },
              ];

              return (
                <motion.div
                  variants={itemVariants}
                  key={predId}
                  id={`prediction-card-${predId}`}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-400">
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
                    <h4 className="text-xs font-medium text-slate-400 mb-3">
                      Probability Distribution
                    </h4>
                    <div className="h-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={probData} layout="vertical" margin={{ left: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" horizontal={false} />
                          <XAxis
                            type="number"
                            domain={[0, 1]}
                            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'DM Sans' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
                            {probData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} style={{ outline: 'none' }} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-slate-400 mb-3">
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
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
