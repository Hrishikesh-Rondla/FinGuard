const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Not authorized, no token provided',
      error: 'Authentication required',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Not authorized, user not found',
        error: 'User associated with token no longer exists',
      });
    }

    if (!req.user.isActive) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Account suspended',
        error: 'Your account has been suspended by an administrator',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Not authorized, token invalid',
      error: 'Token verification failed',
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      data: null,
      message: 'Not authorized as admin',
      error: 'Admin privileges required',
    });
  }
};

module.exports = { protect, requireAdmin };
