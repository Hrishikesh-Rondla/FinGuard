const Transaction = require('../models/Transaction');
const Prediction = require('../models/Prediction');
const Alert = require('../models/Alert');
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

    // --- 1. Get transactions from the last 30 days ---
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo, $lte: now },
    });

    // --- 2. Compute aggregated features ---
    let monthly_income = 0;
    let total_expenses = 0;
    let total_savings = 0;
    let discretionary_expenses = 0;
    let essential_expenses = 0;
    let monthly_debt_payments = 0;
    let num_transactions = recentTransactions.length;

    recentTransactions.forEach((t) => {
      switch (t.type) {
        case 'income':
          monthly_income += t.amount;
          break;
        case 'expense':
          total_expenses += t.amount;
          // Discretionary categories
          if (['entertainment', 'dining', 'shopping'].includes(t.category)) {
            discretionary_expenses += t.amount;
          }
          // Essential categories
          if (['rent', 'groceries', 'utilities', 'transport'].includes(t.category)) {
            essential_expenses += t.amount;
          }
          break;
        case 'savings':
          total_savings += t.amount;
          break;
        case 'debt':
          monthly_debt_payments += t.amount;
          break;
      }
    });

    const avg_transaction_value =
      num_transactions > 0 ? total_expenses / num_transactions : 0;

    // Income from last 3 months (array of 3 floats)
    const income_last_3_months = [];
    for (let i = 0; i < 3; i++) {
      const monthStart = new Date(now);
      monthStart.setMonth(monthStart.getMonth() - (i + 1));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthIncome = await Transaction.aggregate([
        {
          $match: {
            userId,
            type: 'income',
            date: { $gte: monthStart, $lt: monthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      income_last_3_months.push(
        monthIncome.length > 0 ? monthIncome[0].total : (req.user.monthlyIncome || 0)
      );
    }

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
      topRiskFactors: mlResult.top_risk_factors || [],
      featureSnapshot: features,
      modelUsed: mlResult.model_used || 'unknown',
    });

    // --- 5. Auto-create alerts based on stress level ---
    const alertsToCreate = [];

    // Main alert based on stress level
    if (prediction.stressLevel === 'High') {
      alertsToCreate.push({
        userId,
        predictionId: prediction._id,
        type: 'warning',
        message:
          'Your financial stress level is HIGH. Immediate attention is recommended to review your spending and debt.',
      });
    } else if (prediction.stressLevel === 'Medium') {
      const tipMsg =
        prediction.recommendations.length > 0
          ? prediction.recommendations[0]
          : 'Consider reviewing your spending habits to reduce financial stress.';
      alertsToCreate.push({
        userId,
        predictionId: prediction._id,
        type: 'tip',
        message: tipMsg,
      });
    } else {
      alertsToCreate.push({
        userId,
        predictionId: prediction._id,
        type: 'positive',
        message:
          'Great job! Your financial stress level is LOW. Keep up your healthy financial habits!',
      });
    }

    // Create alerts for each recommendation
    if (prediction.recommendations && prediction.recommendations.length > 0) {
      prediction.recommendations.forEach((rec) => {
        alertsToCreate.push({
          userId,
          predictionId: prediction._id,
          type: 'tip',
          message: rec,
        });
      });
    }

    await Alert.insertMany(alertsToCreate);

    // --- 6. Return prediction result ---
    res.status(200).json({
      success: true,
      data: {
        prediction,
        alertsCreated: alertsToCreate.length,
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
