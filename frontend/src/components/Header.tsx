import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  PackageCheck, 
  Flame, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TestModeBadge } from './TestModeBadge';

export const Header: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orderLookupOpen, setOrderLookupOpen] = useState(false);
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleOrderLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumberInput.trim()) {
      setOrderLookupOpen(false);
      navigate(`/orders/${orderNumberInput.trim()}`);
    }
  };

  return (
    <>
      <TestModeBadge />

      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm transition-all">
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition duration-300">
                <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
                  PRASANTH <span className="text-brand-600">BAZAR</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Shop Smart • Shop Better
                </span>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  placeholder="Search 10,000+ products (e.g., Samsung, Kurti, Headphones, Rice)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-24 py-2.5 bg-slate-100/90 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-semibold shadow-sm transition"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Nav Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Track Order */}
              <button
                onClick={() => setOrderLookupOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 hover:bg-orange-50 rounded-lg transition"
                title="Lookup Order Status"
              >
                <PackageCheck className="w-4 h-4 text-brand-500" />
                <span>Track Order</span>
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md shadow-slate-900/10 transition group"
              >
                <ShoppingCart className="w-5 h-5 text-brand-400 group-hover:scale-110 transition" />
                <span className="hidden sm:inline text-sm font-semibold">Cart</span>
                {totalItems > 0 && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-brand-500 rounded-full shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-700 hover:text-brand-600 rounded-lg hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Secondary Categories Bar (Desktop) */}
          <nav className="hidden md:flex items-center justify-between border-t border-slate-100 py-2.5 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
              <Link to="/products" className="hover:text-brand-600 transition flex items-center gap-1 font-semibold text-slate-900">
                All Products
              </Link>
              <Link to="/category/mobiles" className="hover:text-brand-600 transition">
                Mobiles
              </Link>
              <Link to="/category/electronics" className="hover:text-brand-600 transition">
                Electronics
              </Link>
              <Link to="/category/fashion" className="hover:text-brand-600 transition">
                Fashion
              </Link>
              <Link to="/category/home-kitchen" className="hover:text-brand-600 transition">
                Home & Kitchen
              </Link>
              <Link to="/category/grocery" className="hover:text-brand-600 transition">
                Grocery
              </Link>
              <Link to="/category/beauty" className="hover:text-brand-600 transition">
                Beauty
              </Link>
              <Link to="/category/accessories" className="hover:text-brand-600 transition">
                Accessories
              </Link>
              <Link to="/category/daily-essentials" className="hover:text-brand-600 transition">
                Daily Essentials
              </Link>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <Link to="/products?featured=true" className="flex items-center gap-1 text-orange-600 font-semibold hover:text-orange-700">
                <Flame className="w-3.5 h-3.5" />
                <span>Today's Deals</span>
              </Link>
              <Link to="/dev/transactions" className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>PG Inspector</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-20 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <button
                type="submit"
                className="absolute right-1 top-1 px-3 py-1 bg-brand-500 text-white rounded text-xs font-medium"
              >
                Search
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-700">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-lg hover:bg-orange-50 hover:text-brand-600"
              >
                All Products
              </Link>
              <Link
                to="/products?featured=true"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-orange-50 text-brand-600 rounded-lg font-semibold"
              >
                🔥 Today's Deals
              </Link>
              <Link
                to="/category/mobiles"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-lg"
              >
                Mobiles
              </Link>
              <Link
                to="/category/electronics"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-lg"
              >
                Electronics
              </Link>
              <Link
                to="/category/fashion"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-lg"
              >
                Fashion
              </Link>
              <Link
                to="/category/grocery"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-lg"
              >
                Grocery
              </Link>
              <Link
                to="/category/home-kitchen"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-lg"
              >
                Home & Kitchen
              </Link>
              <Link
                to="/category/beauty"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-slate-50 rounded-lg"
              >
                Beauty
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 text-sm">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOrderLookupOpen(true);
                }}
                className="flex items-center gap-2 text-slate-700 py-1"
              >
                <PackageCheck className="w-4 h-4 text-brand-500" />
                <span>Track an Order</span>
              </button>
              <Link
                to="/dev/transactions"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-slate-700 py-1"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ICICI Payment Inspector</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Order Lookup Modal */}
      {orderLookupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setOrderLookupOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Track Your Order</h3>
                <p className="text-xs text-slate-500">No login required! Just enter your order number</p>
              </div>
            </div>

            <form onSubmit={handleOrderLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. PB-2026-123456"
                  value={orderNumberInput}
                  onChange={(e) => setOrderNumberInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 uppercase font-mono"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderLookupOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl shadow-md transition"
                >
                  Track Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
