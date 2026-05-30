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
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import { predictions as predictionsApi, transactions as transactionsApi } from '@/services/api';
import { useAlerts } from '@/context/AlertContext';
import { formatCurrency, getStressBadgeClass } from '@/utils/helpers';

export default function Dashboard() {
  const [prediction, setPrediction] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningPrediction, setRunningPrediction] = useState(false);
  const [error, setError] = useState(null);
  const { alerts, markRead, dismiss } = useAlerts();

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
          <Loader2 className="w-8 h-8 text-teal animate-spin" />
          <p className="text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="dashboard-page" className="space-y-6">
      {error && (
        <div className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome)}
          icon={DollarSign}
          trend="up"
          color="teal"
        />
        <KPICard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          trend="down"
          color="rose"
        />
        <KPICard
          title="Savings Rate"
          value={`${savingsRate}%`}
          icon={PiggyBank}
          trend={parseFloat(savingsRate) >= 20 ? 'up' : 'down'}
          color={parseFloat(savingsRate) >= 20 ? 'teal' : 'amber'}
        />
        <KPICard
          title="Stress Level"
          value={stressLevel}
          icon={Activity}
          color={stressLevel.toLowerCase() === 'low' ? 'teal' : stressLevel.toLowerCase() === 'medium' ? 'amber' : 'rose'}
        />
      </div>

      {/* Row 2: Stress Gauge + Expense Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <StressGauge
            stressScore={stressScore}
            stressLevel={stressLevel}
            probabilities={probabilities}
          />
        </div>
        <div className="lg:col-span-3">
          <ExpensePieChart data={expensesByCategory} />
        </div>
      </div>

      {/* Row 3: Income vs Expense Trend */}
      <IncomeExpenseTrend data={trendData} />

      {/* Row 4: Recent Alerts + Run Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentAlerts alerts={alerts} onMarkRead={markRead} onDismiss={dismiss} />
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="p-4 bg-teal/10 rounded-2xl mb-4">
            <Brain className="w-10 h-10 text-teal" />
          </div>
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            AI Prediction
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Run the AI model to analyze your financial stress level based on recent transactions.
          </p>
          {prediction && (
            <div className="mb-4">
              <span className={getStressBadgeClass(stressLevel)}>
                Current: {stressLevel}
              </span>
            </div>
          )}
          <button
            id="run-prediction-btn"
            onClick={handleRunPrediction}
            disabled={runningPrediction}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {runningPrediction ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            {runningPrediction ? 'Analyzing...' : 'Run Prediction'}
          </button>
        </div>
      </div>
    </div>
  );
}
