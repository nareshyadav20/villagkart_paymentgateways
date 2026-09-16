import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { CategoryGrid } from '../components/CategoryGrid';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';
import { Product } from '../types';
import { Flame, Sparkles, ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [mobileProducts, setMobileProducts] = useState<Product[]>([]);
  const [fashionProducts, setFashionProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [featuredRes, mobilesRes, fashionRes] = await Promise.all([
          api.getProducts({ featured: true, limit: 8 }),
          api.getProducts({ category: 'mobiles', limit: 4 }),
          api.getProducts({ category: 'fashion', limit: 4 })
        ]);

        setFeaturedProducts(featuredRes.products);
        setMobileProducts(mobilesRes.products);
        setFashionProducts(fashionRes.products);
      } catch (err) {
        console.error('Failed to load home page products', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Banner */}
      <HeroSection />

      {/* Category Icons Navigation */}
      <CategoryGrid />

      {/* Flash Deals / Featured Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent p-6 sm:p-8 rounded-3xl border border-orange-200/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold uppercase tracking-wider mb-2">
                <Flame className="w-3.5 h-3.5" />
                <span>Today's Top Deals</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Super Saver Spotlight
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Handpicked bargains with up to 70% discount • Limited stock
              </p>
            </div>

            <Link
              to="/products?featured=true"
              className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-700"
            >
              <span>View All Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mobiles & Tech Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Next-Gen Smartphones & Mobiles</span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                5G Ready
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Samsung, OnePlus, Xiaomi and Realme flagships
            </p>
          </div>

          <Link
            to="/category/mobiles"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See Mobiles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {mobileProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promotional Mid-Page Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-orange-600 to-amber-600 text-white p-8 sm:p-12 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold uppercase tracking-widest text-amber-200">
              Zero Login Checkout
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Test Seamless ICICI Payment Gateway
            </h3>
            <p className="text-sm sm:text-base text-orange-100 font-normal">
              Experience seamless card OTP authorization, instant UPI QR generation, server-to-server status inquiry, and real-time refunds right here.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/products"
                className="px-6 py-3 bg-white text-brand-700 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:bg-orange-50 transition"
              >
                Start Test Purchase
              </Link>
              <Link
                to="/dev/transactions"
                className="px-5 py-3 bg-black/30 hover:bg-black/40 text-white font-semibold text-xs sm:text-sm rounded-xl backdrop-blur-md transition"
              >
                Inspect PG Requests
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fashion & Lifestyle Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Ethnic & Contemporary Fashion
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Handcrafted kurtis, pure cotton shirts, and high-performance sneakers
            </p>
          </div>

          <Link
            to="/category/fashion"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>See Fashion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {fashionProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">100% Authentic Indian Products</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Directly sourced from verified Indian manufacturers with manufacturer warranty.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">ICICI Bank Certified PG</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Adheres strictly to ICICI Bank Payment Gateway Interface Specifications & HMAC-SHA256 secureHash.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Instant No-Account Checkout</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                No signups, no passwords. Enter delivery address, pay securely, and receive your receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
