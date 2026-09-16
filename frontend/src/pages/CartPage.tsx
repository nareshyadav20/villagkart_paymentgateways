import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  ArrowLeft 
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    deliveryCharge,
    totalAmount,
    totalItems
  } = useCart();
  const navigate = useNavigate();

  const freeDeliveryThreshold = 499;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 rounded-3xl bg-orange-50 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            You haven't added any products yet. Browse through our 30+ top electronics, fashion, and daily essentials!
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 hover:from-brand-600 hover:to-orange-700 transition"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for instant ICICI checkout
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-400 hover:text-red-500 flex items-center gap-1 self-start sm:self-auto transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All Items</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cart Item List (Left) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Delivery Bar */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/60 p-4">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="flex items-center gap-1.5 text-orange-950">
                <Truck className="w-4 h-4 text-brand-600" />
                {amountNeededForFreeDelivery === 0 ? (
                  <span className="text-emerald-700 font-extrabold">🎉 You unlocked FREE Delivery!</span>
                ) : (
                  <span>Add ₹{amountNeededForFreeDelivery.toLocaleString('en-IN')} more for FREE delivery</span>
                )}
              </span>
              <span className="text-brand-600 font-mono">
                ₹{subtotal} / ₹{freeDeliveryThreshold}
              </span>
            </div>
            <div className="w-full bg-orange-200/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-3xl border border-slate-200/90 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {cart.map((item) => (
              <div key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
                
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-slate-50 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">
                      {item.product.brand || item.product.categorySlug}
                    </span>
                    <Link to={`/products/${item.product.id}`} className="block">
                      <h3 className="text-sm font-bold text-slate-900 hover:text-brand-600 transition line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-extrabold text-slate-900">
                        ₹{item.product.price.toLocaleString('en-IN')}
                      </span>
                      {item.product.originalPrice > item.product.price && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{item.product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-end sm:self-center">
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-2 hover:bg-slate-200 text-slate-600 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3.5 text-xs font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-2 hover:bg-slate-200 text-slate-600 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <span className="text-sm font-extrabold text-slate-900 block">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ))}
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Order Summary Card (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal ({totalItems})</span>
                <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-emerald-600 font-bold' : 'font-bold text-slate-900'}>
                  {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (Included)</span>
                <span className="font-medium text-slate-500">₹0.00</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                <span>Grand Total</span>
                <span className="text-brand-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Safe & Secure 256-Bit SSL ICICI Bank PG Checkout</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
