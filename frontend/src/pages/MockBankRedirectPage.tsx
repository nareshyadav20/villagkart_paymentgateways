import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

export const MockBankRedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const merchantTxnNo = searchParams.get('merchantTxnNo') || '';
  const amount = searchParams.get('amount') || '0';
  const mode = searchParams.get('mode') || 'NB';

  const [loading, setLoading] = useState(false);

  const handleAction = async (approve: boolean) => {
    try {
      setLoading(true);
      const payload = {
        merchantTxnNo,
        amount,
        responseCode: approve ? '000' : '101',
        responseDescription: approve ? 'Bank Payment Authorized' : 'Customer Cancelled Payment',
        txnId: `ICICI_REDIRECT_${Date.now()}`,
        paymentId: `PAY_REDIRECT_${Date.now()}`
      };

      const res = await axios.post('/api/payment/callback', payload);
      if (res.data?.success && approve) {
        navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=SUCCESS`);
      } else {
        navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=FAILED&code=101`);
      }
    } catch (err) {
      console.error(err);
      navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=FAILED`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
            ICICI 3D Secure / NetBanking Gateway
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">
            Simulated Bank Gateway Portal
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Merchant Txn: <span className="font-mono font-bold text-slate-700">{merchantTxnNo}</span>
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Merchant Name:</span>
            <span className="font-bold text-slate-900">PRASANTH BAZAR</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount:</span>
            <span className="font-bold text-slate-900">₹{Number(amount).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Mode:</span>
            <span className="font-bold text-brand-600 uppercase">{mode}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => handleAction(true)}
            disabled={loading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Approve & Authorize Payment</span>
          </button>

          <button
            onClick={() => handleAction(false)}
            disabled={loading}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Cancel / Decline Payment</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured with ICICI 256-bit encryption simulator</span>
        </div>
      </div>
    </div>
  );
};
