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
 * @desc    Get transaction summary for the last 30 days and 6-month trend
 * @route   GET /api/transactions/summary
 * @access  Private
 */
const getTransactionSummary = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 12);
    sixMonthsAgo.setDate(1); // Start of the month

    // 1. Category aggregation for expenses (all-time)
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
        },
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          amount: 1,
        },
      },
    ]);

    // 2. Type aggregation for totals (all-time)
    const typeAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    // 3. Monthly trend aggregation (All-Time)
    const trendAgg = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: { $in: ['income', 'expense'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Build type totals
    const typeTotals = { income: 0, expense: 0, savings: 0, debt: 0 };
    typeAgg.forEach((item) => {
      typeTotals[item._id] = item.total;
    });

    // Build dynamic monthly trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap = {};

    trendAgg.forEach((item) => {
      const year = item._id.year;
      const month = item._id.month;
      const key = `${year}-${month.toString().padStart(2, '0')}`; // YYYY-MM for sorting

      if (!trendMap[key]) {
        trendMap[key] = {
          month: monthNames[month - 1],
          year: year,
          income: 0,
          expenses: 0,
          sortKey: key,
        };
      }

      if (item._id.type === 'income') {
        trendMap[key].income = item.total;
      } else if (item._id.type === 'expense') {
        trendMap[key].expenses = item.total;
      }
    });

    // Sort chronologically and take the last 12 months (or keep all, Recharts handles it)
    let monthlyTrend = Object.values(trendMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    // If they have more than 12 months, just show the most recent 12 to prevent overcrowding
    if (monthlyTrend.length > 12) {
      monthlyTrend = monthlyTrend.slice(monthlyTrend.length - 12);
    }


    res.status(200).json({
      success: true,
      data: {
        period: {
          from: thirtyDaysAgo,
          to: new Date(),
        },
        expensesByCategory: categoryAgg,
        monthlyTrend: monthlyTrend,
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

const axios = require('axios');
const { parse } = require('csv-parse/sync');

const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');

/**
 * @desc    Upload and parse bank statement (CSV, Excel, PDF)
 * @route   POST /api/transactions/upload
 * @access  Private
 */
const uploadTransactions = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const originalName = req.file.originalname.toLowerCase();
    let records = [];

    if (originalName.endsWith('.csv') || req.file.mimetype === 'text/csv') {
      const fileContent = req.file.buffer.toString('utf-8');
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } else if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Parse as 2D array with formatted strings
      const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });
      let headerRowIndex = -1;
      let headers = [];

      for (let i = 0; i < rawRows.length; i++) {
        const row = rawRows[i] || [];
        const rowString = row.join(' ').toLowerCase();
        if (rowString.includes('date') && (rowString.includes('desc') || rowString.includes('particular') || rowString.includes('narration') || rowString.includes('amount') || rowString.includes('withdrawal') || rowString.includes('deposit'))) {
          headerRowIndex = i;
          headers = row.map(h => String(h || '').trim());
          break;
        }
      }

      if (headerRowIndex !== -1 && headers.length > 0) {
        // Map subsequent rows into objects using the found headers
        for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (!row || row.length === 0) continue;
          
          let obj = {};
          let hasData = false;
          for (let j = 0; j < headers.length; j++) {
            if (headers[j]) {
              obj[headers[j]] = row[j];
              if (row[j] !== undefined && row[j] !== '') hasData = true;
            }
          }
          if (hasData) records.push(obj);
        }
      } else {
        // Fallback to default if no clear header row found
        records = xlsx.utils.sheet_to_json(sheet, { raw: false });
      }
    } else if (originalName.endsWith('.pdf') || req.file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(req.file.buffer);
      const lines = pdfData.text.split('\n');
      
      // Heuristic regex: matches Date, Description, and Amount (with optional CR/DR)
      // e.g., "12/05/2023 Grocery Store 150.00"
      const pdfRegex = /(\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4})\s+(.+?)\s+([-+]?[\d,]*\.\d{2})(?:\s+(CR|DR|cr|dr))?/i;
      
      for (const line of lines) {
        const match = line.match(pdfRegex);
        if (match) {
          records.push({
            Date: match[1],
            Description: match[2].trim(),
            Amount: match[3],
            Type: match[4] || ''
          });
        }
      }
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported file format. Please upload CSV, Excel, or PDF.' });
    }

    if (records.length === 0) {
      return res.status(400).json({ success: false, message: 'File is empty, invalid, or no transactions could be parsed.' });
    }

    // Flexible column mapping
    const parsedTransactions = [];
    const descriptions = [];

    for (const record of records) {
      const keys = Object.keys(record);
      // Find possible column names (case-insensitive)
      const dateKey = keys.find(k => k.toLowerCase().includes('date'));
      const descKey = keys.find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('particular') || k.toLowerCase().includes('narration'));
      
      const withdrawalKey = keys.find(k => k.toLowerCase().includes('withdrawal') || k.toLowerCase().includes('dr') || k.toLowerCase().includes('debit'));
      const depositKey = keys.find(k => k.toLowerCase().includes('deposit') || k.toLowerCase().includes('cr') || k.toLowerCase().includes('credit'));
      const amtKey = keys.find(k => k.toLowerCase().includes('amount') || k.toLowerCase().includes('value') || k.toLowerCase().includes('txn'));
      const typeKey = keys.find(k => k.toLowerCase().includes('type'));

      if (!dateKey || !descKey) continue;

      let amount = NaN;
      let type = 'expense';

      // Handle split withdrawal/deposit columns
      if (withdrawalKey && record[withdrawalKey] && String(record[withdrawalKey]).trim() !== '') {
        amount = parseFloat(String(record[withdrawalKey]).replace(/,/g, ''));
        type = 'expense';
      } else if (depositKey && record[depositKey] && String(record[depositKey]).trim() !== '') {
        amount = parseFloat(String(record[depositKey]).replace(/,/g, ''));
        type = 'income';
      } else if (amtKey && record[amtKey] && String(record[amtKey]).trim() !== '') {
        amount = parseFloat(String(record[amtKey]).replace(/,/g, ''));
        let rawType = record[typeKey] ? String(record[typeKey]).toLowerCase() : '';
        if (amount < 0 || rawType.includes('dr') || rawType.includes('debit') || String(record[amtKey]).toLowerCase().includes('dr')) {
          type = 'expense';
          amount = Math.abs(amount);
        } else if (rawType.includes('cr') || rawType.includes('credit') || String(record[amtKey]).toLowerCase().includes('cr') || String(record[amtKey]).toLowerCase().includes('deposit')) {
          type = 'income';
        }
      }

      if (isNaN(amount)) continue;

      parsedTransactions.push({
        date: new Date(record[dateKey]),
        description: record[descKey],
        amount,
        type,
      });
      descriptions.push(record[descKey]);
    }

    // Call ML service to categorize
    let categories = [];
    try {
      const mlResponse = await axios.post('http://localhost:8000/categorize-batch', {
        descriptions
      });
      categories = mlResponse.data.categories;
    } catch (mlError) {
      console.error('ML Categorization failed:', mlError.message);
      // Fallback
      categories = parsedTransactions.map(() => 'other');
    }

    // Merge categories and fix types
    const finalTransactions = parsedTransactions.map((t, idx) => {
      const category = categories[idx] || 'other';
      let type = t.type;
      
      // Override type based on ML category to prevent savings/debt from being classed as generic expenses
      if (category === 'savings') {
        type = 'savings';
      } else if (category === 'debt_payment') {
        type = 'debt';
      }

      return {
        userId: req.user._id,
        ...t,
        category,
        type,
      };
    });

    res.status(200).json({
      success: true,
      data: finalTransactions,
      message: 'Transactions parsed and categorized successfully',
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
  uploadTransactions,
};
