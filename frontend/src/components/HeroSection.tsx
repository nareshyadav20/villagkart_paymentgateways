import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Truck, CreditCard, Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 shadow-2xl">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-12 sm:py-20 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Direct Shopping • No Account Needed</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Shop Smart. <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
                Shop Better.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Welcome to <span className="font-semibold text-white">PRASANTH BAZAR</span>. Discover top-brand smartphones, trending fashion, kitchen essentials & groceries with instant 1-click checkout powered by ICICI Bank Payment Gateway.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transform hover:-translate-y-0.5 transition duration-200"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/products?featured=true"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/10 backdrop-blur-md transition duration-200"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Explore Deals</span>
              </Link>
            </div>

            {/* Quick feature pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-700/60 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Free Delivery ₹499+</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-400 shrink-0" />
                <span>ICICI Gateway</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Instant Pay & OTP</span>
              </div>
            </div>
          </div>

          {/* Right Showcase Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative group overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80"
                  alt="Flagship Smartphone"
                  className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition duration-500"
                />
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Mobiles</span>
                  <p className="text-xs font-bold text-white line-clamp-1">Galaxy S24 AI 5G</p>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">₹74,999</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
                  alt="Sony ANC Headphones"
                  className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition duration-500"
                />
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Audio</span>
                  <p className="text-xs font-bold text-white line-clamp-1">Sony WH-1000XM5 ANC</p>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">₹26,990</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="relative group overflow-hidden rounded-2xl bg-slate-800/80 border border-slate-700/60 p-3 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80"
                  alt="Ethnic Kurti"
                  className="w-full h-36 object-cover rounded-xl group-hover:scale-105 transition duration-500"
                />
                <div className="mt-2.5">
                  <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Fashion</span>
                  <p className="text-xs font-bold text-white line-clamp-1">Handcrafted Anarkali</p>
                  <p className="text-xs text-slate-300 font-semibold mt-0.5">₹2,499</p>
                </div>
              </div>

              <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600/90 to-orange-700/90 border border-brand-500/40 p-4 shadow-xl text-white flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">Mega Sale</span>
                  <h4 className="text-lg font-extrabold mt-2 leading-tight">Up to 70% Off</h4>
                  <p className="text-xs text-orange-100 mt-1">On electronics, kitchen & fashion</p>
                </div>
                <Link
                  to="/products"
                  className="mt-3 inline-flex items-center text-xs font-bold text-white underline underline-offset-4 hover:text-amber-200"
                >
                  View All Offers →
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
