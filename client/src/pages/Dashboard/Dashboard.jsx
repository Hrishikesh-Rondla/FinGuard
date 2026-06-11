import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingDown,
  PiggyBank,
  Activity,
  Brain,
  Loader2,
} from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import StressGauge from '@/components/dashboard/StressGauge';
import ExpensePieChart from '@/components/dashboard/ExpensePieChart';
import IncomeExpenseTrend from '@/components/dashboard/IncomeExpenseTrend';
import { predictions as predictionsApi, transactions as transactionsApi } from '@/services/api';
import { formatCurrency, getStressBadgeClass } from '@/utils/helpers';
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

export default function Dashboard() {
  const [prediction, setPrediction] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningPrediction, setRunningPrediction] = useState(false);
  const [error, setError] = useState(null);
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [predData, summData] = await Promise.allSettled([
        predictionsApi.getLatestPrediction(),
        transactionsApi.getTransactionSummary(),
      ]);

      if (predData.status === 'fulfilled') {
        setPrediction(predData.value.prediction || predData.value);
      }
      if (summData.status === 'fulfilled') {
        setSummary(summData.value.summary || summData.value);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRunPrediction = async () => {
    try {
      setRunningPrediction(true);
      await predictionsApi.runPrediction();
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningPrediction(false);
    }
  };

  // Extract data with fallbacks
  const monthlyIncome = summary?.totalIncome || summary?.monthly_income || 0;
  const totalExpenses = summary?.totalExpenses || summary?.total_expenses || 0;
  const savingsRate = monthlyIncome > 0
    ? (((monthlyIncome - totalExpenses) / monthlyIncome) * 100).toFixed(1)
    : '0.0';
  const stressLevel = prediction?.stress_level || prediction?.stressLevel || 'Low';
  const stressScore = prediction?.stress_score ?? prediction?.stressScore ?? 0;
  const probabilities = prediction?.probabilities || {};
  const expensesByCategory = summary?.expensesByCategory || summary?.expenses_by_category || [];
  const trendData = summary?.monthlyTrend || summary?.monthly_trend || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-page" className="space-y-6">
      {error && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      {/* Row 1: KPI Cards */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="min-w-0">
          <KPICard
            title="Total Income"
            value={formatCurrency(monthlyIncome)}
            icon={DollarSign}
            trend="up"
            color="emerald"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="min-w-0">
          <KPICard
            title="Total Expenses"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            trend="down"
            color="rose"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="min-w-0">
          <KPICard
            title="Savings Rate"
            value={`${savingsRate}%`}
            icon={PiggyBank}
            trend="up"
            color="blue"
          />
        </motion.div>
        <motion.div variants={itemVariants} className="min-w-0">
          <KPICard
            title="Stress Level"
            value={stressLevel.toUpperCase()}
            icon={Activity}
            trend={stressLevel.toLowerCase() === 'low' ? 'up' : 'down'}
            color={stressLevel.toLowerCase() === 'low' ? 'emerald' : stressLevel.toLowerCase() === 'high' ? 'rose' : 'amber'}
          />
        </motion.div>
      </motion.div>

      {/* Row 2: Charts & AI */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="min-w-0">
          <StressGauge stressScore={stressScore} stressLevel={stressLevel} probabilities={probabilities} />
        </motion.div>
        <motion.div variants={itemVariants} className="min-w-0">
          <ExpensePieChart data={expensesByCategory} />
        </motion.div>
      </motion.div>

      {/* Row 3: Trends & Recommendations */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="lg:col-span-3 min-w-0">
          <IncomeExpenseTrend data={trendData} />
        </motion.div>
        
        {/* Run Prediction */}
        <motion.div variants={itemVariants} className="lg:col-span-2 min-w-0">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-full">
            <div className="p-4 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
              <Brain className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              AI Prediction
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              Run the AI model to analyze your financial stress level based on recent transactions.
            </p>
            {prediction && (
              <div className="mb-6">
                <span className={getStressBadgeClass(stressLevel)}>
                  Current: {stressLevel}
                </span>
              </div>
            )}
            <button
              id="run-prediction-btn"
              onClick={handleRunPrediction}
              disabled={runningPrediction}
              className="btn-primary flex items-center gap-2"
            >
              {runningPrediction ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Brain className="w-5 h-5" />
              )}
              {runningPrediction ? 'Analyzing...' : 'Run Prediction'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
