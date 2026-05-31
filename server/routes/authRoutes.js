const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/password', protect, updateProfile);

module.exports = router;
