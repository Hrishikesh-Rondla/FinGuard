import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Upload, FileText } from 'lucide-react';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
import BankStatementUpload from '@/components/transactions/BankStatementUpload';
import { transactions as txApi } from '@/services/api';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">All Transactions</h2>
          <p className="text-sm text-gray-500">Manage your income and expenses</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-900 rounded-lg p-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'manual' 
                ? 'bg-gray-800 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === 'upload' 
                ? 'bg-gray-800 text-teal shadow-sm' 
                : 'text-gray-400 hover:text-teal'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Bank Upload</span>
            <span className="sm:hidden">Upload</span>
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="bg-rose/10 border border-rose/30 text-rose text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-teal/10 border border-teal/30 text-teal text-sm px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {/* Content based on Tab */}
      {activeTab === 'manual' ? (
        <>
          <div className="flex justify-end">
            <button
              id="add-transaction-btn"
              onClick={() => {
                setEditData(null);
                setFormOpen(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>

          {/* Loading */}
          {loading && transactionList.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <Loader2 className="w-8 h-8 text-teal animate-spin" />
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
    </div>
  );
}
