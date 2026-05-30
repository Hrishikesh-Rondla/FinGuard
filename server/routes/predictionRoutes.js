const express = require('express');
const router = express.Router();
const {
  runPrediction,
  getPredictionHistory,
  getLatestPrediction,
} = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.post('/run', runPrediction);
router.get('/history', getPredictionHistory);
router.get('/latest', getLatestPrediction);

module.exports = router;
