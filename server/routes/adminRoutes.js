const express = require('express');
const router = express.Router();
const { getUsersAndStats, toggleUserStatus, deleteUser } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(requireAdmin);

router.get('/users', getUsersAndStats);
router.put('/users/:id/suspend', toggleUserStatus);
router.delete('/users/:id', deleteUser);

module.exports = router;
