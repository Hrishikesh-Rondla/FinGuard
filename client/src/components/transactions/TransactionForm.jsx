import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

const CATEGORIES = [
  'rent', 'groceries', 'utilities', 'transport', 'entertainment',
  'dining', 'shopping', 'healthcare', 'education', 'debt_payment',
  'income', 'savings', 'other',
];

const TYPES = ['income', 'expense', 'savings', 'debt'];

export default function TransactionForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount?.toString() || '',
        category: initialData.category || '',
        type: initialData.type || '',
        description: initialData.description || '',
        date: initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        amount: '',
        category: '',
        type: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        id="transaction-form-modal"
        className="relative bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl w-full max-w-md"
        style={{ animation: 'fadeInScale 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-100">
            {isEdit ? 'Update Transaction' : 'Add Transaction'}
          </h2>
          <button
            id="close-transaction-form"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label htmlFor="tx-amount" className="block text-sm font-medium text-slate-300 mb-1.5">
              Amount ($)
            </label>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              className={clsx('input-field font-mono', errors.amount && 'border-rose-500/50')}
            />
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="tx-category" className="block text-sm font-medium text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="tx-category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className={clsx('input-field', errors.category && 'border-rose-500/50')}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-rose-400 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="tx-type" className="block text-sm font-medium text-slate-300 mb-1.5">
              Type
            </label>
            <select
              id="tx-type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className={clsx('input-field', errors.type && 'border-rose-500/50')}
            >
              <option value="">Select type</option>
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="text-xs text-rose-400 mt-1">{errors.type}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="tx-description" className="block text-sm font-medium text-slate-300 mb-1.5">
              Description
            </label>
            <input
              id="tx-description"
              type="text"
              placeholder="Enter description..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="input-field"
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="tx-date" className="block text-sm font-medium text-slate-300 mb-1.5">
              Date
            </label>
            <input
              id="tx-date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={clsx('input-field', errors.date && 'border-rose-500/50')}
            />
            {errors.date && (
              <p className="text-xs text-rose-400 mt-1">{errors.date}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              id="submit-transaction"
              disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {isEdit ? 'Update Transaction' : 'Add Transaction'}
            </button>
            <button
              type="button"
              id="cancel-transaction"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
