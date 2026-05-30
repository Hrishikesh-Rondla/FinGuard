import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionForm from '@/components/transactions/TransactionForm';
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

  const fetchTransactions = useCallback(async (page = 1, filterOverrides) => {
    try {
      setLoading(true);
      setError(null);
      const activeFilters = filterOverrides || filters;
      const data = await txApi.getTransactions(page, 10, activeFilters);
      setTransactionList(data.transactions || data.data || []);
      setPagination({
        page: data.page || data.currentPage || page,
        totalPages: data.totalPages || data.total_pages || 1,
        total: data.total || data.totalCount || 0,
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
  }, []);

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

  return (
    <div id="transactions-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-100">All Transactions</h2>
          <p className="text-sm text-gray-500">Manage your income and expenses</p>
        </div>
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
    </div>
  );
}
