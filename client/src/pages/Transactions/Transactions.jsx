import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Upload, FileText } from 'lucide-react';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
import BankStatementUpload from '@/components/transactions/BankStatementUpload';
import { transactions as txApi } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Transactions() {
  const [transactionList, setTransactionList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'upload'

  const fetchTransactions = useCallback(async (page = 1, filterOverrides) => {
    try {
      setLoading(true);
      setError(null);
      const activeFilters = filterOverrides || filters;
      const data = await txApi.getTransactions(page, 10, activeFilters);
      setTransactionList(data.transactions || data.data || []);
      const pageInfo = data.pagination || {};
      setPagination({
        page: pageInfo.page || data.page || page,
        totalPages: pageInfo.pages || data.totalPages || 1,
        total: pageInfo.total || data.total || 0,
      });
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleAdd = async (data) => {
    try {
      await txApi.addTransaction(data);
      setSuccess('Transaction added successfully');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTransactions(currentPage);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleEdit = (tx) => {
    setEditData(tx);
    setFormOpen(true);
  };

  const handleUpdate = async (data) => {
    try {
      const id = editData._id || editData.id;
      await txApi.updateTransaction(id, data);
      setSuccess('Transaction updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setEditData(null);
      await fetchTransactions(currentPage);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await txApi.deleteTransaction(id);
      setSuccess('Transaction deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTransactions(currentPage);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePageChange = (page) => {
    fetchTransactions(page);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchTransactions(1, newFilters);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditData(null);
  };

  const handleUploadComplete = () => {
    setSuccess('Bank statement uploaded and saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
    setActiveTab('manual');
    fetchTransactions(1);
  };

  return (
    <div id="transactions-page" className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-xl font-semibold text-slate-100">All Transactions</h2>
          <p className="text-sm text-slate-400 mt-1">Manage your income and expenses</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200 ${
              activeTab === 'manual' 
                ? 'bg-slate-700 text-slate-100' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200 ${
              activeTab === 'upload' 
                ? 'bg-slate-700 text-slate-100' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Bank Upload</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </motion.div>

      {/* Feedback */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content based on Tab */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab === 'manual' ? (
          <>
            <div className="flex justify-end mb-4">
              <button
                id="add-transaction-btn"
                onClick={() => {
                  setEditData(null);
                  setFormOpen(true);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Transaction
              </button>
            </div>

          {/* Loading */}
            {loading && transactionList.length === 0 ? (
              <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            ) : (
              <TransactionTable
                transactions={transactionList}
                onEdit={handleEdit}
                onDelete={handleDelete}
                pagination={pagination}
                onPageChange={handlePageChange}
                onFilterChange={handleFilterChange}
              />
            )}

            {/* Transaction Form Modal */}
            <TransactionForm
              isOpen={formOpen}
              onClose={handleFormClose}
              onSubmit={editData ? handleUpdate : handleAdd}
              initialData={editData}
            />
          </>
        ) : (
          <BankStatementUpload onUploadComplete={handleUploadComplete} />
        )}
      </motion.div>
    </div>
  );
}
