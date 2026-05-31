const express = require('express');
const router = express.Router();
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  uploadTransactions,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer for memory storage (we'll parse it directly)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// All routes are protected
router.use(protect);

// Summary must be defined BEFORE /:id to avoid route conflicts
router.get('/summary', getTransactionSummary);
router.post('/upload', upload.single('file'), uploadTransactions);

router.route('/').get(getTransactions).post(addTransaction);
router.route('/:id').put(updateTransaction).delete(deleteTransaction);

module.exports = router;
