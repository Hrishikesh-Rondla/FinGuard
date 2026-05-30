const axios = require('axios');

const mlClient = axios.create({
  baseURL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get prediction from ML service
 * @param {Object} features - Computed financial features
 * @returns {Object} Prediction result
 */
const getPrediction = async (features) => {
  try {
    const response = await mlClient.post('/predict', features);
    return response.data;
  } catch (error) {
    console.error('ML Service Error (getPrediction):', error.message);
    // Return fallback response if ML service is down
    return generateFallbackPrediction(features);
  }
};

/**
 * Check ML service health
 * @returns {Object} Health status
 */
const getHealth = async () => {
  try {
    const response = await mlClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('ML Service Error (getHealth):', error.message);
    return { status: 'unavailable', message: 'ML service is not reachable' };
  }
};

/**
 * Get ML model info
 * @returns {Object} Model information
 */
const getModelInfo = async () => {
  try {
    const response = await mlClient.get('/model-info');
    return response.data;
  } catch (error) {
    console.error('ML Service Error (getModelInfo):', error.message);
    return { status: 'unavailable', message: 'ML service is not reachable' };
  }
};

/**
 * Generate a fallback prediction when ML service is unavailable.
 * Uses simple heuristic rules based on the financial features.
 */
const generateFallbackPrediction = (features) => {
  const {
    monthly_income = 0,
    total_expenses = 0,
    total_savings = 0,
    monthly_debt_payments = 0,
    discretionary_expenses = 0,
  } = features;

  let stressScore = 0;
  const recommendations = [];
  const topRiskFactors = [];

  // Expense-to-income ratio
  const expenseRatio = monthly_income > 0 ? total_expenses / monthly_income : 1;
  if (expenseRatio > 0.9) {
    stressScore += 40;
    topRiskFactors.push('Very high expense-to-income ratio');
    recommendations.push('Your expenses are consuming most of your income. Review your budget for areas to cut back.');
  } else if (expenseRatio > 0.7) {
    stressScore += 20;
    topRiskFactors.push('High expense-to-income ratio');
    recommendations.push('Consider reducing non-essential spending to build a financial buffer.');
  }

  // Savings check
  if (total_savings <= 0) {
    stressScore += 20;
    topRiskFactors.push('No savings contributions');
    recommendations.push('Try to set aside even a small amount each month for savings.');
  }

  // Debt burden
  const debtRatio = monthly_income > 0 ? monthly_debt_payments / monthly_income : 0;
  if (debtRatio > 0.3) {
    stressScore += 25;
    topRiskFactors.push('High debt-to-income ratio');
    recommendations.push('Your debt payments are significant. Consider a debt reduction strategy.');
  } else if (debtRatio > 0.15) {
    stressScore += 10;
    topRiskFactors.push('Moderate debt burden');
  }

  // Discretionary spending
  const discRatio = monthly_income > 0 ? discretionary_expenses / monthly_income : 0;
  if (discRatio > 0.3) {
    stressScore += 15;
    topRiskFactors.push('High discretionary spending');
    recommendations.push('Reduce entertainment, dining, and shopping expenses.');
  }

  // Determine stress level
  let stressLevel;
  let probabilities;
  if (stressScore >= 50) {
    stressLevel = 'High';
    probabilities = { Low: 0.1, Medium: 0.25, High: 0.65 };
  } else if (stressScore >= 25) {
    stressLevel = 'Medium';
    probabilities = { Low: 0.2, Medium: 0.55, High: 0.25 };
  } else {
    stressLevel = 'Low';
    probabilities = { Low: 0.7, Medium: 0.2, High: 0.1 };
  }

  if (recommendations.length === 0) {
    recommendations.push('Your finances look healthy! Keep maintaining your current habits.');
  }
  if (topRiskFactors.length === 0) {
    topRiskFactors.push('No significant risk factors detected');
  }

  return {
    stress_level: stressLevel,
    stress_score: stressScore,
    probabilities,
    recommendations,
    top_risk_factors: topRiskFactors,
    model_used: 'fallback-heuristic',
  };
};

module.exports = { getPrediction, getHealth, getModelInfo };
