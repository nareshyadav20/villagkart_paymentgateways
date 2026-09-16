import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ArrowLeft, Sparkles, Filter } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      if (!slug) return;
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ category: slug, limit: 50 }),
          api.getCategories()
        ]);

        setProducts(prodRes.products);
        const matchedCat = catRes.find(c => c.slug === slug);
        setCategoryInfo(matchedCat || null);
      } catch (err) {
        console.error('Failed to load category', err);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [slug]);

  const categoryTitle = categoryInfo?.name || slug?.replace('-', ' ').toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Category Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Products</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-extrabold capitalize tracking-tight">
            {categoryTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
            {categoryInfo?.description || `Explore our handpicked collection of premium ${categoryTitle} with instant ICICI payment gateway checkout.`}
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm pt-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{products.length} Products Available</span>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-slate-200/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/90 p-8 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">No products found in this category</h3>
            <p className="text-xs text-slate-400">Please check back soon or browse our full catalog.</p>
            <Link
              to="/products"
              className="inline-block px-5 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-bold"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
