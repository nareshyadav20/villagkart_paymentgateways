import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  ShoppingBag, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, deliveryCharge, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  // Customer Form State (Zero authentication required)
  const [formData, setFormData] = useState({
    customerName: 'Prasanth Kumar',
    customerEmail: 'prasanth@example.com',
    customerMobile: '9876543210',
    shippingAddress: 'Flat 402, Royal Palms Residency, MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  });

  // Selected Payment Method
  const [paymentMode, setPaymentMode] = useState<'CARD' | 'UPI' | 'NB' | 'WALLET' | 'QR'>('CARD');
  const [paymentOption, setPaymentOption] = useState<string>('ICICI');
  const [serviceChargeInfo, setServiceChargeInfo] = useState<{ serviceCharge: string; totalPayableAmount: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check service charges preview
    async function loadCharges() {
      try {
        const res = await api.getServiceCharges({
          merchantTxnNo: `PBPREV${Date.now()}`,
          amount: totalAmount,
          paymentMode,
          paymentOption
        });
        if (res.responseCode === '000') {
          setServiceChargeInfo({
            serviceCharge: res.serviceCharge,
            totalPayableAmount: res.totalPayableAmount
          });
        }
      } catch (e) {
        console.error('Service charges fetch error', e);
      }
    }

    if (totalAmount > 0) {
      loadCharges();
    }
  }, [paymentMode, paymentOption, totalAmount]);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your cart is empty</h2>
        <p className="text-sm text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-block px-6 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-bold">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // 1. Create order on backend
      const orderRes = await api.createOrder({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerMobile: formData.customerMobile,
        shippingAddress: formData.shippingAddress,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      });

      const orderId = orderRes.id;
      const orderNumber = orderRes.orderNumber;

      // 2. Initiate Payment with ICICI Gateway
      const paymentRes = await api.initiatePayment({
        orderId,
        paymentMode,
        paymentOption
      });

      // Clear local cart once transaction initiated
      clearCart();

      // 3. Handle Gateway Routing Flows
      if (paymentMode === 'QR' || paymentRes.qrData) {
        // Direct QR Payment Screen
        navigate(`/payment/qr?merchantTxnNo=${paymentRes.merchantTxnNo}&amount=${paymentRes.amount}&orderNumber=${orderNumber}`);
      } else if (paymentRes.showOTPCapturePage === 'Y' && paymentRes.tranCtx) {
        // Direct Seamless OTP Screen
        navigate(`/payment/otp?tranCtx=${encodeURIComponent(paymentRes.tranCtx)}&merchantTxnNo=${paymentRes.merchantTxnNo}&amount=${paymentRes.amount}&orderNumber=${orderNumber}`);
      } else if (paymentRes.paymentUrl || paymentRes.redirectURI) {
        // 3DS Redirect / Bank Gateway URL with tranCtx attached
        const targetUrl = paymentRes.paymentUrl || `${paymentRes.redirectURI}${paymentRes.redirectURI.includes('?') ? '&' : '?'}tranCtx=${paymentRes.tranCtx}`;
        console.log('[REDIRECTING_TO_ICICI_PORTAL]', targetUrl);
        window.location.href = targetUrl;
      } else {
        // Immediate status or fallback to Result Page
        navigate(`/payment/result?merchantTxnNo=${paymentRes.merchantTxnNo}&orderNumber=${orderNumber}`);
      }
    } catch (err: any) {
      console.error('Payment checkout error', err);
      setErrorMessage(
        err.response?.data?.message || err.message || 'Payment gateway connection error. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Checkout Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Express Checkout
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Zero-Login Checkout • Powered by ICICI Bank Payment Gateway
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <div>
            <span className="font-bold">Checkout Notice: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <form onSubmit={handlePaymentSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Customer & Payment Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 1: Customer & Delivery Details */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Customer & Delivery Information
                    </h2>
                    <p className="text-xs text-slate-400">No account or password required</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    name="customerMobile"
                    value={formData.customerMobile}
                    onChange={handleInputChange}
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="House/Flat No, Apartment, Street name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Gateway Method */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-extrabold text-sm flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Select Payment Method (ICICI Gateway)
                    </h2>
                    <p className="text-xs text-slate-400">All modes integrated with ICICI API specification</p>
                  </div>
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { mode: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, subtitle: 'Seamless OTP flow' },
                  { mode: 'UPI', label: 'UPI / VPA', icon: Smartphone, subtitle: 'GPay, PhonePe, Paytm' },
                  { mode: 'QR', label: 'Dynamic QR', icon: QrCode, subtitle: 'Scan & Pay instantly' },
                  { mode: 'NB', label: 'Net Banking', icon: Building2, subtitle: 'ICICI, HDFC, SBI' },
                  { mode: 'WALLET', label: 'Wallets', icon: Wallet, subtitle: 'Digital Wallets' },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMode === m.mode;
                  return (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => setPaymentMode(m.mode as any)}
                      className={`flex flex-col items-center p-3.5 rounded-2xl border text-center transition duration-200 ${
                        isSelected
                          ? 'border-brand-500 bg-orange-50/70 shadow-md ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${
                        isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">
                        {m.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        {m.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Mode Details & Options */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                {paymentMode === 'CARD' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <CreditCard className="w-4 h-4 text-brand-500" />
                      <span>ICICI Direct Seamless Card Flow (showOTPCapturePage = Y)</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Initiates server-to-server sale with ICICI gateway, returns transaction context (`tranCtx`), sends test OTP, and prompts for 6-digit OTP authorization directly.
                    </p>
                  </div>
                )}

                {paymentMode === 'UPI' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Smartphone className="w-4 h-4 text-brand-500" />
                      <span>UPI Intent / VPA Integration</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Standard ICICI UPI collection flow.
                    </p>
                  </div>
                )}

                {paymentMode === 'QR' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <QrCode className="w-4 h-4 text-brand-500" />
                      <span>ICICI Dynamic UPI QR Code Generation</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Generates dynamic UPI QR code on backend and streams live transaction status polling.
                    </p>
                  </div>
                )}

                {paymentMode === 'NB' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Your Bank
                    </label>
                    <select
                      value={paymentOption}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="ICICI">ICICI Bank Retail NetBanking</option>
                      <option value="HDFC">HDFC Bank NetBanking</option>
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="AXIS">Axis Bank NetBanking</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMode === 'WALLET' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Select Wallet Provider
                    </label>
                    <select
                      value={paymentOption}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                    >
                      <option value="PAYTM">Paytm Wallet</option>
                      <option value="PHONEPE">PhonePe Wallet</option>
                      <option value="MOBIKWIK">MobiKwik Wallet</option>
                      <option value="AMAZONPAY">Amazon Pay</option>
                    </select>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Right: Order Breakdown & Checkout Button */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6 sticky top-28">
              <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                Order Review ({cart.length} items)
              </h2>

              <div className="max-h-48 overflow-y-auto space-y-3 divide-y divide-slate-100 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="pt-2 flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                      <span className="text-slate-400">Qty: {item.quantity} × ₹{item.product.price}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className={deliveryCharge === 0 ? 'text-emerald-600 font-bold' : 'font-bold text-slate-900'}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {serviceChargeInfo && Number(serviceChargeInfo.serviceCharge) > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>PG Service Charge</span>
                    <span>₹{serviceChargeInfo.serviceCharge}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Final Amount</span>
                  <span className="text-brand-600">
                    ₹{serviceChargeInfo ? Number(serviceChargeInfo.totalPayableAmount).toLocaleString('en-IN') : totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-brand-500 via-orange-500 to-amber-500 hover:from-brand-600 hover:to-orange-600 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Initiating ICICI Sale...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{totalAmount.toLocaleString('en-IN')} via ICICI</span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-slate-400 font-medium">
                By placing this order you agree to test shopping terms. No real money will be debited in mock/sandbox environment.
              </div>
            </div>
          </div>

        </div>
      </form>

    </div>
  );
};
