const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  category: {
    type: String,
    enum: [
      'rent',
      'groceries',
      'utilities',
      'transport',
      'entertainment',
      'dining',
      'shopping',
      'healthcare',
      'education',
      'debt_payment',
      'income',
      'savings',
      'other',
    ],
    required: [true, 'Category is required'],
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'savings', 'debt'],
    required: [true, 'Type is required'],
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index on userId + date
transactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
