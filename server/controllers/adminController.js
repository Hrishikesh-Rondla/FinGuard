const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Prediction = require('../models/Prediction');

// @desc    Get all users and system stats
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsersAndStats = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    
    // Calculate some basic stats without exposing PII
    const activeUsers = users.filter(u => u.isActive).length;
    
    res.json({
      success: true,
      data: {
        users,
        stats: {
          totalUsers,
          activeUsers,
          totalTransactions,
          totalPredictions
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend a superadmin' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.role === 'superadmin') {
      return res.status(400).json({ success: false, message: 'Cannot delete a superadmin' });
    }
    
    // Cascade delete transactions and predictions
    await Transaction.deleteMany({ user: user._id });
    await Prediction.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });
    
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsersAndStats,
  toggleUserStatus,
  deleteUser
};
