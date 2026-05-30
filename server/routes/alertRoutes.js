const express = require('express');
const router = express.Router();
const {
  getAlerts,
  markRead,
  dismissAlert,
  markAllRead,
} = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/', getAlerts);

// read-all must be defined BEFORE /:id/read to avoid route conflicts
router.put('/read-all', markAllRead);

router.put('/:id/read', markRead);
router.delete('/:id', dismissAlert);

module.exports = router;
