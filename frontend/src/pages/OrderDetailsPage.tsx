import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Order } from '../types';
import { 
  PackageCheck, 
  MapPin, 
  Receipt, 
  ArrowLeft, 
  Printer, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw,
  Loader2,
  CreditCard
} from 'lucide-react';

export const OrderDetailsPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNumber) return;
      try {
        setLoading(true);
        const res = await api.getOrder(orderNumber);
        setOrder(res);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Fetching Order Details...</h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <PackageCheck className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-xs text-slate-500">We could not locate an order with ID {orderNumber}.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-bold">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-600 bg-orange-50 px-2.5 py-1 rounded-md">
              Order Receipt
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono mt-1">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold ${
              order.status === 'PAID'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : order.status === 'REFUNDED'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {order.status === 'PAID' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {order.status === 'REFUNDED' && <RotateCcw className="w-4 h-4 text-purple-600" />}
              <span>Status: {order.status}</span>
            </span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
              Customer Info
            </span>
            <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
            <p className="text-slate-600">{order.customerEmail}</p>
            <p className="text-slate-600 font-mono">+91 {order.customerMobile}</p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
              Delivery Address
            </span>
            <p className="text-slate-800 font-medium">{order.shippingAddress}</p>
            <p className="text-slate-600">{order.city}, {order.state} - <span className="font-mono font-bold">{order.pincode}</span></p>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Items Ordered ({order.items?.length || 0})
          </h3>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {order.items?.map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-14 h-14 object-cover rounded-xl bg-slate-50 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-400">
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-extrabold text-slate-900 shrink-0">
                  ₹{item.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="p-5 bg-slate-50 rounded-2xl space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Items Subtotal</span>
            <span className="font-bold text-slate-900">₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Charge</span>
            <span className={order.deliveryCharge === 0 ? 'text-emerald-600 font-bold' : 'font-bold text-slate-900'}>
              {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
            <span>Total Paid</span>
            <span className="text-brand-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment Transaction History */}
        {order.transactions && order.transactions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-500" />
              <span>ICICI Payment Audit Trail</span>
            </h3>

            <div className="space-y-2">
              {order.transactions.map((txn) => (
                <div key={txn.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-slate-800">{txn.merchantTxnNo}</span>
                    <p className="text-[11px] text-slate-400">Mode: {txn.paymentMode} • Resp: {txn.responseCode || '000'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">₹{txn.amount.toLocaleString('en-IN')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      txn.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
