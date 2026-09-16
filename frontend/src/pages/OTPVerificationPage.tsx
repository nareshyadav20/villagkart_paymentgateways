import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const OTPVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tranCtx = searchParams.get('tranCtx') || '';
  const merchantTxnNo = searchParams.get('merchantTxnNo') || '';
  const amount = searchParams.get('amount') || '0';
  const orderNumber = searchParams.get('orderNumber') || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Generate initial OTP on mount if required
  useEffect(() => {
    async function triggerOtp() {
      if (!tranCtx) return;
      try {
        setGeneratingOtp(true);
        const res = await api.generateOTP(tranCtx);
        if (res.responseCode === '000' || res.responseCode === '0000') {
          setOtpGenerated(true);
          setStatusMessage(res.responseDescription || 'OTP sent successfully to registered mobile.');
        }
      } catch (err: any) {
        console.error('Initial OTP generation failed', err);
      } finally {
        setGeneratingOtp(false);
      }
    }

    triggerOtp();
  }, [tranCtx]);

  // Resend cooldown timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || !tranCtx) return;
    setErrorMessage(null);
    try {
      setGeneratingOtp(true);
      const res = await api.generateOTP(tranCtx);
      if (res.responseCode === '000' || res.responseCode === '0000') {
        setStatusMessage('New 6-digit OTP dispatched to mobile!');
        setResendCooldown(30);
      } else {
        setErrorMessage(res.responseDescription || 'Failed to resend OTP.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error communicating with gateway.');
    } finally {
      setGeneratingOtp(false);
    }
  };

  const handleVerifyAndAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMessage('Please enter a valid 6-digit numeric OTP.');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Verify OTP
      setStatusMessage('Verifying OTP with ICICI Gateway...');
      const verifyRes = await api.verifyOTP({ tranCtx, otp });

      if (verifyRes.responseCode !== '000' && verifyRes.responseCode !== '0000') {
        setErrorMessage(verifyRes.responseDescription || 'Invalid OTP entered. (For testing, use 123456)');
        setLoading(false);
        return;
      }

      // Step 2: Authorize Payment
      setStatusMessage('Authorizing Transaction with ICICI Gateway...');
      const authRes = await api.authorizePayment({ tranCtx });

      if (authRes.success || authRes.responseCode === '000' || authRes.responseCode === '0000') {
        // Redirect to success result page
        navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=SUCCESS&orderNumber=${orderNumber}`);
      } else {
        navigate(`/payment/result?merchantTxnNo=${merchantTxnNo}&status=FAILED&code=${authRes.responseCode}&orderNumber=${orderNumber}`);
      }
    } catch (err: any) {
      console.error('OTP authorize flow failed', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Authorization failed.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      
      {/* ICICI Bank Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">ICICI Bank 3D Secure</h2>
            <p className="text-xs text-slate-400 font-mono">Txn: {merchantTxnNo || 'PB-TXN'}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Amount</span>
          <span className="text-lg font-extrabold text-brand-400">₹{Number(amount).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-900">
            Enter 6-Digit One Time Password (OTP)
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            An authentication OTP has been generated for your ICICI Bank payment authorization.
          </p>
        </div>

        {/* Test Sandbox Helper Pill */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sandbox Test OTP: <strong className="font-mono text-sm tracking-wider">123456</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setOtp('123456')}
            className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[11px] font-bold transition"
          >
            Auto-Fill
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerifyAndAuthorize} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
              6-Digit Security Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full text-center tracking-[0.75em] text-3xl font-mono font-extrabold py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
              autoFocus
              required
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Didn't receive OTP?</span>
            <button
              type="button"
              disabled={resendCooldown > 0 || generatingOtp}
              onClick={handleResendOTP}
              className="font-bold text-brand-600 hover:text-brand-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-brand-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authorizing Payment...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Verify & Complete Payment</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Official ICICI Bank Payment Gateway direct OTP verification endpoint.
          </p>
        </div>

      </div>

    </div>
  );
};
