import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-sm mt-20 border-t border-slate-800">
      
      {/* Value Proposition Bar */}
      <div className="border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">Free & Fast Delivery</h4>
                <p className="text-xs text-slate-400">100% Free on all orders • Zero Tax</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">ICICI Secure PG</h4>
                <p className="text-xs text-slate-400">256-bit encrypted checkout</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">7 Days Easy Return</h4>
                <p className="text-xs text-slate-400">Hassle-free instant refund</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">24/7 Helpline</h4>
                <p className="text-xs text-slate-400">Dedicated shopping assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                PRASANTH <span className="text-brand-500">BAZAR</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's modern test shopping destination. Experience instant checkout with zero mandatory account creation, backed by official ICICI Bank Payment Gateway integration.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-slate-900 border border-slate-800 p-2.5 rounded-xl max-w-sm">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Zero-Login Shopping: Anyone can order immediately!</span>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Categories
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/budget-treats" className="text-amber-400 hover:text-amber-300 font-semibold transition">🍪 ₹1 - ₹10 Store</Link></li>
              <li><Link to="/category/mobiles" className="hover:text-white transition">Mobiles & 5G</Link></li>
              <li><Link to="/category/electronics" className="hover:text-white transition">Electronics & Audio</Link></li>
              <li><Link to="/category/fashion" className="hover:text-white transition">Ethnic & Casual Fashion</Link></li>
              <li><Link to="/category/home-kitchen" className="hover:text-white transition">Home & Kitchen</Link></li>
              <li><Link to="/category/grocery" className="hover:text-white transition">Grocery & Staples</Link></li>
              <li><Link to="/category/beauty" className="hover:text-white transition">Beauty & Care</Link></li>
            </ul>
          </div>

          {/* Customer Care & Direct Links */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
              <li><Link to="/products?featured=true" className="hover:text-white transition">Today's Deals</Link></li>
              <li><Link to="/cart" className="hover:text-white transition">My Cart</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition">Express Checkout</Link></li>
            </ul>
          </div>

          {/* Gateway Specifications */}
          <div>
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-white mb-4">
              Payment Gateway
            </h5>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>• ICICI SecureHash V1/V2</li>
              <li>• Seamless OTP Authorize</li>
              <li>• 3D Secure / NetBanking</li>
              <li>• Dynamic UPI QR Flow</li>
              <li>• Server Payment Advice</li>
              <li><Link to="/dev/transactions" className="text-brand-400 hover:underline">→ Developer Inspector</Link></li>
            </ul>
          </div>

        </div>

        {/* Payment Methods & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {new Date().getFullYear()} PRASANTH BAZAR. All rights reserved. Powered by ICICI Bank Payment Gateway Integration.</p>
          
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>UPI</span>
            <span>•</span>
            <span>RUPAY</span>
            <span>•</span>
            <span>VISA</span>
            <span>•</span>
            <span>MASTERCARD</span>
            <span>•</span>
            <span>NET BANKING</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
