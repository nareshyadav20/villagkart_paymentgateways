import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Terminal, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Search, 
  Server, 
  ExternalLink,
  Code
} from 'lucide-react';

export const DevTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [gatewayConfig, setGatewayConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getTransactionLogs(50);
      setTransactions(res.data || []);
      setGatewayConfig(res.gatewayConfig || null);
    } catch (err) {
      console.error('Failed to load dev logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = transactions.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.merchantTxnNo?.toLowerCase().includes(q) ||
      t.order?.orderNumber?.toLowerCase().includes(q) ||
      t.paymentMode?.toLowerCase().includes(q) ||
      t.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-amber-400 rounded-lg text-xs font-mono mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>ICICI GATEWAY AUDIT & DEV CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Payment Transaction Inspector
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time audit log of ICICI API requests, SecureHash validation & response codes
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Gateway Environment Status Card */}
      {gatewayConfig && (
        <div className="bg-slate-900 text-slate-300 rounded-3xl p-6 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-500 block">PROVIDER MODE</span>
            <span className="text-amber-400 font-bold uppercase text-sm">
              {gatewayConfig.provider} ({gatewayConfig.isTest ? 'SANDBOX' : 'PRODUCTION'})
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 block">MERCHANT ID</span>
            <span className="text-white font-bold">{gatewayConfig.merchantId}</span>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <span className="text-slate-500 block">ICICI API BASE URL</span>
            <span className="text-slate-300 truncate block">{gatewayConfig.apiBaseUrl}</span>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Filter by Merchant Txn No, Order Number, Status, or Mode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Merchant Txn No</th>
                <th className="px-6 py-4">Order #</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4">Response Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">SecureHash</th>
                <th className="px-6 py-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No payment transactions recorded yet. Initiate an order from checkout!
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {t.merchantTxnNo}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {t.order?.orderNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-md font-bold text-slate-700">
                        {t.paymentMode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <span className={t.responseCode === '000' || t.responseCode === '0000' ? 'text-emerald-600 font-bold' : 'text-slate-600'}>
                        {t.responseCode || 'INIT'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        t.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.status === 'REFUNDED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {t.hashVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                          <span>Standard</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTxn(t)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                        title="View Masked Gateway Payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-950 text-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">
                  Gateway Raw Response ({selectedTxn.merchantTxnNo})
                </span>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-white text-sm font-sans"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 block font-bold">Masked Gateway Response:</span>
              <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-800 overflow-x-auto text-emerald-400">
                {JSON.stringify(selectedTxn.rawResponse || {}, null, 2)}
              </pre>
            </div>

            {selectedTxn.attempts && selectedTxn.attempts.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-slate-400 block font-bold">API Attempt Logs:</span>
                <div className="space-y-2">
                  {selectedTxn.attempts.map((att: any) => (
                    <div key={att.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] space-y-1">
                      <div className="flex justify-between text-amber-400">
                        <span className="font-bold">{att.attemptType}</span>
                        <span>{new Date(att.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <pre className="text-slate-300 overflow-x-auto">
                        {JSON.stringify(att.responsePayload || {}, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTxn(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-sans font-bold"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
