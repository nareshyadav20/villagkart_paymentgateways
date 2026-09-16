import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  FileText, 
  ShoppingBag, 
  AlertCircle,
  Loader2,
  Receipt
} from 'lucide-react';

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const merchantTxnNo = searchParams.get('merchantTxnNo') || '';
  const initialStatus = searchParams.get('status') || '';
  const initialCode = searchParams.get('code') || '';
  const orderNumber = searchParams.get('orderNumber') || '';

  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState('Sandbox test refund');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundResult, setRefundResult] = useState<any>(null);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    async function checkStatus() {
      if (!merchantTxnNo) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.checkStatus(merchantTxnNo);
        setTransactionData(res);
      } catch (err) {
        console.error('Failed to query status', err);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [merchantTxnNo]);

  const status = transactionData?.status || initialStatus || 'SUCCESS';
  const responseCode = transactionData?.responseCode || initialCode || '000';
  const isSuccess = status === 'SUCCESS' || responseCode === '000' || responseCode === '0000';
  const isPending = status === 'INITIATED' || status === 'PENDING_OTP' || status === 'PENDING_REDIRECT' || status === 'PENDING_QR' || responseCode === 'R1000';

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRefundError(null);
    setRefundResult(null);
    const amountNum = parseFloat(refundAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setRefundError('Please enter a valid refund amount.');
      return;
    }

    const capturedAmount = Number(transactionData?.amount || 0);
    if (capturedAmount > 0 && amountNum > capturedAmount) {
      setRefundError(`Refund amount cannot exceed captured amount (₹${capturedAmount}).`);
      return;
    }

    try {
      setRefundLoading(true);
      const res = await api.requestRefund({
        merchantTxnNo,
        amount: amountNum,
        reason: refundReason
      });

      if (res.status === 'SUCCESS' || res.responseCode === '000') {
        setRefundResult(res);
        // Refresh status
        const updated = await api.checkStatus(merchantTxnNo);
        setTransactionData(updated);
      } else {
        setRefundError(res.responseDescription || 'Refund was rejected by gateway.');
      }
    } catch (err: any) {
      console.error('Refund request failed', err);
      setRefundError(err.response?.data?.message || err.message || 'Failed to process refund.');
    } finally {
      setRefundLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Verifying Payment with ICICI Gateway...</h2>
        <p className="text-xs text-slate-400">Please do not refresh this window.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      
      {/* Result Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl space-y-8 relative overflow-hidden">
        
        {/* Top Status Hero */}
        <div className="text-center space-y-3">
          {isSuccess ? (
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : isPending ? (
            <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {isSuccess ? 'Payment Successful!' : isPending ? 'Payment Processing...' : 'Payment Failed'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {isSuccess
              ? 'Your transaction has been authorized and confirmed by ICICI Bank Payment Gateway.'
              : isPending
              ? 'Your payment is being confirmed with the bank. Status will update shortly.'
              : 'The transaction could not be authorized. Please try again with another payment mode.'}
          </p>
        </div>

        {/* Transaction Details Box */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="font-semibold text-slate-500">Merchant Txn No</span>
            <span className="font-mono font-bold text-slate-900">{merchantTxnNo || 'N/A'}</span>
          </div>

          {orderNumber && (
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="font-semibold text-slate-500">Order Number</span>
              <span className="font-mono font-bold text-slate-900">{orderNumber}</span>
            </div>
          )}

          {transactionData?.txnId && (
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="font-semibold text-slate-500">Gateway Txn ID</span>
              <span className="font-mono text-slate-900">{transactionData.txnId}</span>
            </div>
          )}

          {transactionData?.paymentId && (
            <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
              <span className="font-semibold text-slate-500">Payment ID</span>
              <span className="font-mono text-slate-900">{transactionData.paymentId}</span>
            </div>
          )}

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="font-semibold text-slate-500">Amount Paid</span>
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{Number(transactionData?.amount || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="font-semibold text-slate-500">Payment Mode</span>
            <span className="font-bold text-slate-800 uppercase">{transactionData?.paymentMode || 'CARD'}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
            <span className="font-semibold text-slate-500">Response Code</span>
            <span className="font-mono font-bold text-slate-800">{responseCode}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-500">Gateway Status</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              isSuccess ? 'bg-emerald-100 text-emerald-800' : isPending ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/products"
              className="py-3 px-5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>

            {orderNumber ? (
              <Link
                to={`/orders/${orderNumber}`}
                className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
              >
                <Receipt className="w-4 h-4 text-brand-400" />
                <span>View Full Invoice</span>
              </Link>
            ) : (
              <Link
                to="/dev/transactions"
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <FileText className="w-4 h-4" />
                <span>View PG Logs</span>
              </Link>
            )}
          </div>

          {/* Test Refund Trigger (Sandbox Only) */}
          {isSuccess && (
            <div className="pt-4 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setRefundAmount(String(transactionData?.amount || ''));
                  setRefundModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Test Gateway Refund API (Sandbox)</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Refund Modal */}
      {refundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-brand-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Initiate Gateway Refund</h3>
                <p className="text-xs text-slate-400 font-mono">Txn: {merchantTxnNo}</p>
              </div>
            </div>

            {refundError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{refundError}</span>
              </div>
            )}

            {refundResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Refund Successfully Executed!</span>
                </div>
                <p className="text-[11px]">Refund ID: <strong className="font-mono">{refundResult.refundTxnNo}</strong></p>
              </div>
            )}

            <form onSubmit={handleRefundSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Refund Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Maximum allowable: ₹{transactionData?.amount || 0}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reason for Refund
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={refundLoading}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
                >
                  {refundLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending to ICICI...</span>
                    </>
                  ) : (
                    <span>Confirm Refund</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
