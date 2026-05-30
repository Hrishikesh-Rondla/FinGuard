const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  stressLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true,
  },
  stressScore: {
    type: Number,
    required: true,
  },
  probabilities: {
    Low: { type: Number },
    Medium: { type: Number },
    High: { type: Number },
  },
  recommendations: [String],
  topRiskFactors: [String],
  featureSnapshot: {
    type: mongoose.Schema.Types.Mixed,
  },
  modelUsed: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Prediction', predictionSchema);
