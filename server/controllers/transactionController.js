const Transaction = require('../models/Transaction');

/**
 * @desc    Get all transactions for the logged-in user (paginated)
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await Transaction.countDocuments({ userId: req.user._id });
    const transactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'Transactions retrieved successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const addTransaction = async (req, res, next) => {
  try {
    const { amount, category, type, description, date } = req.body;

    if (!amount || !category || !type || !date) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Please provide amount, category, type, and date',
        error: 'Missing required fields',
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      amount,
      category,
      type,
      description,
      date,
    });

    res.status(201).json({
      success: true,
      data: { transaction },
      message: 'Transaction added successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Transaction not found',
        error: 'Resource not found',
      });
    }

    // Verify ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Not authorized to update this transaction',
        error: 'Forbidden',
      });
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: { transaction },
      message: 'Transaction updated successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Transaction not found',
        error: 'Resource not found',
      });
    }

    // Verify ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        data: null,
        message: 'Not authorized to delete this transaction',
        error: 'Forbidden',
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
      message: 'Transaction deleted successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction summary for the last 30 days
 * @route   GET /api/transactions/summary
 * @access  Private
 */
const getTransactionSummary = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate by category and type
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregate totals by type
    const typeAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build category totals map
    const categoryTotals = {};
    categoryAgg.forEach((item) => {
      const cat = item._id.category;
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, count: 0 };
      }
      categoryTotals[cat].total += item.total;
      categoryTotals[cat].count += item.count;
    });

    // Build type totals
    const typeTotals = { income: 0, expense: 0, savings: 0, debt: 0 };
    typeAgg.forEach((item) => {
      typeTotals[item._id] = item.total;
    });

    res.status(200).json({
      success: true,
      data: {
        period: {
          from: thirtyDaysAgo,
          to: new Date(),
        },
        categoryTotals,
        totalIncome: typeTotals.income,
        totalExpenses: typeTotals.expense,
        totalSavings: typeTotals.savings,
        totalDebtPayments: typeTotals.debt,
      },
      message: 'Transaction summary retrieved successfully',
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
};
