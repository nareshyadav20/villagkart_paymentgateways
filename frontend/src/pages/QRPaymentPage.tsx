import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  Loader2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Zap,
  Info,
  Edit3
} from 'lucide-react';
import axios from 'axios';

export const QRPaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const merchantTxnNo = searchParams.get('merchantTxnNo') || '';
  const amount = searchParams.get('amount') || '0';
  const orderNumber = searchParams.get('orderNumber') || '';

  const [customVpa, setCustomVpa] = useState<string>('');
  const [isEditingVpa, setIsEditingVpa] = useState(false);
  const [qrString, setQrString] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    async function loadQR() {
      if (!merchantTxnNo) return;
      try {
        setLoading(true);
        const activeVpa = customVpa.trim() || 'prasanthbazar@icici';
        const generated = `upi://pay?pa=${encodeURIComponent(activeVpa)}&pn=PRASANTH%20BAZAR&tr=${merchantTxnNo}&am=${amount}&cu=INR&tn=Order%20${merchantTxnNo}`;
        setQrString(generated);
      } catch (err) {
        console.error('QR Load error', err);
      } finally {
        setLoading(false);
      }
    }

    loadQR();
  }, [merchantTxnNo, amount, customVpa]);

  // Polling transaction status every 3 seconds
  useEffect(() => {
    if (!merchantTxnNo || paymentSuccess) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await api.checkStatus(merchantTxnNo);
        if (statusRes.status === 'SUCCESS' || statusRes.responseCode === '000' || statusRes.responseCode === '0000') {
          setPaymentSuccess(true);
          clearInterval(interval);
          setTimeout(() => {
            navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=SUCCESS&orderNumber=${orderNumber}`);
          }, 1000);
        }
      } catch (err) {
        // Continue polling
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [merchantTxnNo, paymentSuccess, navigate, orderNumber]);

  // Expiration countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Simulate payment completion for sandbox verification
  const handleSimulatePayment = async () => {
    try {
      setVerifying(true);
      await axios.post('/api/payment/callback', {
        merchantTxnNo,
        amount,
        responseCode: '000',
        responseDescription: 'UPI QR Payment Authorized',
        txnId: `UPI_TXN_${Date.now()}`,
        paymentId: `PAY_UPI_${Date.now()}`
      });
      setPaymentSuccess(true);
      setTimeout(() => {
        navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=SUCCESS&orderNumber=${orderNumber}`);
      }, 800);
    } catch (e) {
      console.error(e);
      // Fallback navigate
      navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=SUCCESS&orderNumber=${orderNumber}`);
    } finally {
      setVerifying(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // Generate QR Code image
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrString || 'upi://pay')}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">ICICI Dynamic UPI QR</h2>
            <p className="text-xs text-slate-400 font-mono">Txn: {merchantTxnNo}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Amount</span>
          <span className="text-lg font-extrabold text-brand-400">₹{Number(amount).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Main QR Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6 text-center">
        
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Scan with any UPI App to Pay
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            GPay, PhonePe, Paytm, BHIM, or ICICI iMobile
          </p>
        </div>

        {/* QR Display */}
        <div className="relative w-64 h-64 mx-auto p-4 bg-white border-2 border-dashed border-brand-500/40 rounded-3xl shadow-inner flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
              <span className="text-xs text-slate-400 font-medium">Generating ICICI QR...</span>
            </div>
          ) : paymentSuccess ? (
            <div className="flex flex-col items-center gap-2 text-emerald-600 animate-in zoom-in-90 duration-300">
              <CheckCircle2 className="w-16 h-16" />
              <span className="text-sm font-bold">Payment Verified!</span>
            </div>
          ) : (
            <img
              src={qrImageUrl}
              alt="UPI QR Code"
              className="w-full h-full object-contain rounded-xl"
            />
          )}
        </div>

        {/* Expiration Timer & Polling */}
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-brand-500" />
            <span>Expires in: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Listening for payment...</span>
          </div>
        </div>

        {/* 1-Click Simulation Button */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <button
            onClick={handleSimulatePayment}
            disabled={verifying || paymentSuccess}
            className="w-full py-4 bg-gradient-to-r from-brand-500 via-orange-500 to-amber-500 hover:from-brand-600 hover:to-orange-600 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Gateway Status...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Simulate Instant UPI Payment (Sandbox 1-Click)</span>
              </>
            )}
          </button>

          {/* NPCI Mobile Banking Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs text-slate-600 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">PhonePe / GPay Physical Scan Note:</span>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Real mobile UPI apps reject dummy merchant IDs (e.g. <code>prasanthbazar@icici</code>) because NPCI validates merchant handles against live bank switches. Click the <strong>1-Click Simulate button above</strong> to test the full automated webhook/order completion flow, or enter your personal UPI ID below to test with your real banking app!
                </p>
              </div>
            </div>

            {/* Custom VPA Input */}
            <div className="pt-2 border-t border-slate-200/80">
              {isEditingVpa ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. yourname@oksbi / yourname@ybl"
                    value={customVpa}
                    onChange={(e) => setCustomVpa(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl"
                  />
                  <button
                    onClick={() => setIsEditingVpa(false)}
                    className="px-3 py-1.5 bg-brand-500 text-white rounded-xl text-xs font-bold"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingVpa(true)}
                  className="flex items-center gap-1.5 text-brand-600 hover:text-brand-700 text-[11px] font-bold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Use Custom UPI ID ({customVpa || 'prasanthbazar@icici'})</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
