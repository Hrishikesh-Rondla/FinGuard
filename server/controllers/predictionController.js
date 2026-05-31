const Transaction = require('../models/Transaction');
const Prediction = require('../models/Prediction');
const mlService = require('../services/mlService');

/**
 * @desc    Run a financial stress prediction
 * @route   POST /api/predictions/run
 * @access  Private
 */
const runPrediction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // --- 1. Fetch All-Time Transactions for the User ---
    const allTransactions = await Transaction.find({ userId }).sort({ date: 1 }); // Oldest first
    
    if (allTransactions.length === 0) {
      return res.status(400).json({ success: false, message: 'No transactions found to generate a prediction.' });
    }

    // --- 2. Calculate Account Age in Months ---
    const firstTxDate = new Date(allTransactions[0].date);
    const lastTxDate = new Date(allTransactions[allTransactions.length - 1].date);
    
    // Difference in months
    let active_months = (lastTxDate.getFullYear() - firstTxDate.getFullYear()) * 12;
    active_months -= firstTxDate.getMonth();
    active_months += lastTxDate.getMonth();
    
    // If transactions span less than a month (e.g. same day), set active_months to 1 to avoid div by 0
    active_months = Math.max(1, active_months);

    // --- 3. Compute All-Time Aggregated Totals ---
    let total_all_time_income = 0;
    let total_all_time_expenses = 0;
    let total_all_time_debt_payments = 0;
    let total_all_time_discretionary = 0;
    let total_all_time_essential = 0;
    let num_transactions = allTransactions.length;

    allTransactions.forEach((t) => {
      switch (t.type) {
        case 'income':
          total_all_time_income += t.amount;
          break;
        case 'expense':
          total_all_time_expenses += t.amount;
          if (['entertainment', 'dining', 'shopping'].includes(t.category)) {
            total_all_time_discretionary += t.amount;
          }
          if (['rent', 'groceries', 'utilities', 'transport'].includes(t.category)) {
            total_all_time_essential += t.amount;
          }
          break;
        case 'debt':
          total_all_time_debt_payments += t.amount;
          break;
      }
    });

    // Estimate total accumulated savings as the difference between all-time income and all-time expenses
    const total_all_time_savings = Math.max(0, total_all_time_income - total_all_time_expenses);

    // --- 4. Convert to Average Monthly Metrics for the ML Model ---
    const monthly_income = total_all_time_income / active_months;
    const total_expenses = total_all_time_expenses / active_months; // monthly average
    const total_savings = total_all_time_savings; // ML model expects the total accumulated emergency fund
    const discretionary_expenses = total_all_time_discretionary / active_months;
    const essential_expenses = total_all_time_essential / active_months;
    const monthly_debt_payments = total_all_time_debt_payments / active_months;
    const avg_transaction_value = total_all_time_expenses > 0 ? (total_all_time_expenses / num_transactions) : 0;
    
    // For income_last_3_months, we can just feed the average to keep it stable
    const income_last_3_months = [monthly_income, monthly_income, monthly_income];

    const features = {
      monthly_income,
      total_expenses,
      total_savings,
      discretionary_expenses,
      essential_expenses,
      monthly_debt_payments,
      num_transactions,
      avg_transaction_value,
      income_last_3_months,
      avg_monthly_expenses: total_expenses,
    };

    // --- 3. Call ML service ---
    const mlResult = await mlService.getPrediction(features);

    // --- 4. Save Prediction document ---
    const prediction = await Prediction.create({
      userId,
      stressLevel: mlResult.stress_level,
      stressScore: mlResult.stress_score,
      probabilities: mlResult.probabilities,
      recommendations: mlResult.recommendations || [],
      featureSnapshot: features,
      modelUsed: mlResult.model_used || 'unknown',
    });

    // --- 5. Return prediction result ---
    res.status(200).json({
      success: true,
      data: {
        prediction,
      },
      message: 'Prediction completed successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get prediction history for the user
 * @route   GET /api/predictions/history
 * @access  Private
 */
const getPredictionHistory = async (req, res, next) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: { predictions },
      message: 'Prediction history retrieved successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get the latest prediction for the user
 * @route   GET /api/predictions/latest
 * @access  Private
 */
const getLatestPrediction = async (req, res, next) => {
  try {
    const prediction = await Prediction.findOne({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    if (!prediction) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'No predictions found. Run a prediction first.',
        error: 'No predictions available',
      });
    }

    res.status(200).json({
      success: true,
      data: { prediction },
      message: 'Latest prediction retrieved successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { runPrediction, getPredictionHistory, getLatestPrediction };
