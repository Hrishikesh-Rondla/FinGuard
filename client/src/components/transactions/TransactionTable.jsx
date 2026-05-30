import { useState } from 'react';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency, formatDate, capitalize, getCategoryColor } from '@/utils/helpers';

const CATEGORIES = [
  'all', 'rent', 'groceries', 'utilities', 'transport', 'entertainment',
  'dining', 'shopping', 'healthcare', 'education', 'debt_payment',
  'income', 'savings', 'other',
];

const TYPES = ['all', 'income', 'expense', 'savings', 'debt'];

export default function TransactionTable({
  transactions = [],
  onEdit,
  onDelete,
  pagination = {},
  onPageChange,
  onFilterChange,
}) {
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    search: '',
  });

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    if (onFilterChange) {
      const apiFilters = {};
      if (newFilters.category !== 'all') apiFilters.category = newFilters.category;
      if (newFilters.type !== 'all') apiFilters.type = newFilters.type;
      if (newFilters.search) apiFilters.search = newFilters.search;
      onFilterChange(apiFilters);
    }
  };

  const { page = 1, totalPages = 1, total = 0 } = pagination;

  return (
    <div id="transaction-table" className="space-y-4">
      {/* Filter Bar */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              id="transaction-search"
              type="text"
              placeholder="Search transactions..."
              value={filters.search}
              onChange={(e) => handleFilterUpdate('search', e.target.value)}
              className="input-field pl-10 py-2.5"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              id="transaction-category-filter"
              value={filters.category}
              onChange={(e) => handleFilterUpdate('category', e.target.value)}
              className="input-field py-2.5 w-auto min-w-[140px]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : capitalize(cat.replace('_', ' '))}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <select
            id="transaction-type-filter"
            value={filters.type}
            onChange={(e) => handleFilterUpdate('type', e.target.value)}
            className="input-field py-2.5 w-auto min-w-[120px]"
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : capitalize(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="glass-card overflow-hidden hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-4 font-medium">Date</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-4 font-medium">Description</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-4 font-medium">Category</th>
              <th className="text-left text-xs text-gray-500 uppercase tracking-wider px-6 py-4 font-medium">Type</th>
              <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-6 py-4 font-medium">Amount</th>
              <th className="text-right text-xs text-gray-500 uppercase tracking-wider px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const txId = tx._id || tx.id;
                const isIncome = tx.type === 'income' || tx.type === 'savings';
                return (
                  <tr
                    key={txId}
                    id={`tx-row-${txId}`}
                    className="hover:bg-navy-700/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-200">
                      {tx.description || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: getCategoryColor(tx.category) + '20',
                          color: getCategoryColor(tx.category),
                          border: `1px solid ${getCategoryColor(tx.category)}30`,
                        }}
                      >
                        {capitalize(tx.category?.replace('_', ' '))}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {capitalize(tx.type)}
                    </td>
                    <td
                      className={clsx(
                        'px-6 py-4 text-sm font-mono text-right font-medium',
                        isIncome ? 'text-teal' : 'text-rose'
                      )}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`edit-tx-${txId}`}
                          onClick={() => onEdit && onEdit(tx)}
                          className="p-2 rounded-lg hover:bg-navy-700/50 text-gray-500 hover:text-gray-300 transition-all duration-200"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          id={`delete-tx-${txId}`}
                          onClick={() => onDelete && onDelete(txId)}
                          className="p-2 rounded-lg hover:bg-rose/10 text-gray-500 hover:text-rose transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {transactions.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500 text-sm">
            No transactions found
          </div>
        ) : (
          transactions.map((tx) => {
            const txId = tx._id || tx.id;
            const isIncome = tx.type === 'income' || tx.type === 'savings';
            return (
              <div key={txId} className="glass-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      {tx.description || capitalize(tx.category?.replace('_', ' '))}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                  <p
                    className={clsx(
                      'text-sm font-mono font-medium',
                      isIncome ? 'text-teal' : 'text-rose'
                    )}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getCategoryColor(tx.category) + '20',
                        color: getCategoryColor(tx.category),
                      }}
                    >
                      {capitalize(tx.category?.replace('_', ' '))}
                    </span>
                    <span className="text-xs text-gray-500">{capitalize(tx.type)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit && onEdit(tx)}
                      className="p-1.5 rounded-lg hover:bg-navy-700/50 text-gray-500"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(txId)}
                      className="p-1.5 rounded-lg hover:bg-rose/10 text-gray-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages} ({total} transactions)
          </p>
          <div className="flex items-center gap-2">
            <button
              id="tx-prev-page"
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1}
              className={clsx(
                'p-2 rounded-lg transition-all duration-200',
                page <= 1
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:bg-navy-700/50 hover:text-gray-200'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="tx-next-page"
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages}
              className={clsx(
                'p-2 rounded-lg transition-all duration-200',
                page >= totalPages
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'text-gray-400 hover:bg-navy-700/50 hover:text-gray-200'
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
