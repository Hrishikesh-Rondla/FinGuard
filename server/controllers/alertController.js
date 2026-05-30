const Alert = require('../models/Alert');

/**
 * @desc    Get all alerts for the user
 * @route   GET /api/alerts
 * @access  Private
 */
const getAlerts = async (req, res, next) => {
  try {
    const filter = { userId: req.user._id };

    // Optional: filter unread only
    if (req.query.unread === 'true') {
      filter.isRead = false;
    }

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { alerts },
      message: 'Alerts retrieved successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single alert as read
 * @route   PUT /api/alerts/:id/read
 * @access  Private
 */
const markRead = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Alert not found',
        error: 'Resource not found',
      });
    }

    // Verify ownership
    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Not authorized to update this alert',
        error: 'Forbidden',
      });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      data: { alert },
      message: 'Alert marked as read',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Dismiss (delete) an alert
 * @route   DELETE /api/alerts/:id
 * @access  Private
 */
const dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Alert not found',
        error: 'Resource not found',
      });
    }

    // Verify ownership
    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Not authorized to delete this alert',
        error: 'Forbidden',
      });
    }

    await Alert.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Alert dismissed successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all unread alerts as read
 * @route   PUT /api/alerts/read-all
 * @access  Private
 */
const markAllRead = async (req, res, next) => {
  try {
    const result = await Alert.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount },
      message: `${result.modifiedCount} alerts marked as read`,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, markRead, dismissAlert, markAllRead };
