import { useState, useRef } from 'react';
import { Upload, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { transactions as transactionsApi } from '@/services/api';
import { formatDate, formatCurrency, getCategoryColor } from '@/utils/helpers';

export default function BankStatementUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedTransactions, setParsedTransactions] = useState([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'application/pdf'];
      const validExtensions = ['.csv', '.xlsx', '.xls', '.pdf'];
      const ext = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
      
      if (validTypes.includes(selected.type) || validExtensions.includes(ext)) {
        setFile(selected);
        setError(null);
      } else {
        setError('Please select a valid CSV, Excel, or PDF file.');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const data = await transactionsApi.uploadTransactions(formData);
      setParsedTransactions(data);
    } catch (err) {
      setError(err.message || 'Failed to parse and categorize file.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (index, newCategory) => {
    const updated = [...parsedTransactions];
    updated[index].category = newCategory;
    setParsedTransactions(updated);
  };

  const handleSaveToDB = async () => {
    try {
      setSaving(true);
      setError(null);

      // Save each transaction one by one (or you could create a batch endpoint, but loop is fine for now)
      for (const t of parsedTransactions) {
        await transactionsApi.addTransaction({
          date: t.date,
          description: t.description,
          amount: t.amount,
          type: t.type,
          category: t.category,
        });
      }

      setParsedTransactions([]);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (onUploadComplete) onUploadComplete();
    } catch (err) {
      setError(err.message || 'Failed to save transactions.');
    } finally {
      setSaving(false);
    }
  };

  const CATEGORY_OPTIONS = [
    'rent', 'groceries', 'utilities', 'transport', 'entertainment',
    'dining', 'shopping', 'healthcare', 'education', 'debt_payment',
    'income', 'savings', 'other'
  ];

  return (
    <div className="space-y-6">
      {!parsedTransactions.length ? (
        <div className="glass-card p-6">
          <h3 className="text-lg font-medium text-gray-200 mb-4">Upload Bank Statement</h3>
          
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
            <Upload className="w-10 h-10 text-teal mx-auto mb-4" />
            <p className="text-sm text-gray-400 mb-4">
              Upload your bank statement in CSV, Excel (.xlsx/.xls), or PDF format. The ML model will automatically categorize your transactions.
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                Note: PDF parsing is experimental and may vary by bank format.
              </span>
            </p>
            
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="btn-primary inline-block cursor-pointer"
            >
              Select File
            </label>
            {file && <p className="mt-4 text-sm text-teal font-medium">Selected: {file.name}</p>}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose/10 border border-rose/30 text-rose rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Analyzing...' : 'Parse & Categorize'}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
              <Check className="w-5 h-5 text-teal" />
              Review & Save Transactions
            </h3>
            <button
              onClick={() => setParsedTransactions([])}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">
            The AI has categorized your transactions. Please review and correct any mistakes before saving.
          </p>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 rounded-tr-lg">ML Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {parsedTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]">{tx.description}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${tx.type === 'income' ? 'bg-teal/20 text-teal' : 'bg-rose/20 text-rose'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={tx.category}
                        onChange={(e) => handleCategoryChange(idx, e.target.value)}
                        className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-2 py-1 focus:ring-teal focus:border-teal w-full text-xs"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setParsedTransactions([])}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToDB}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : `Save ${parsedTransactions.length} Transactions`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
