const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Summary must be defined BEFORE /:id to avoid route conflicts
router.get('/summary', getTransactionSummary);

router.route('/').get(getTransactions).post(addTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;
