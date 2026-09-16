import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Smartphone, 
  Laptop, 
  Shirt, 
  UtensilsCrossed, 
  ShoppingBasket, 
  Sparkles, 
  Watch, 
  Zap 
} from 'lucide-react';
import { Category } from '../types';

interface CategoryGridProps {
  categories?: Category[];
}

const defaultCategories = [
  { name: 'Mobiles', slug: 'mobiles', icon: Smartphone, color: 'from-blue-500 to-indigo-600', count: '4 Items' },
  { name: 'Electronics', slug: 'electronics', icon: Laptop, color: 'from-purple-500 to-violet-600', count: '6 Items' },
  { name: 'Fashion', slug: 'fashion', icon: Shirt, color: 'from-pink-500 to-rose-600', count: '4 Items' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', icon: UtensilsCrossed, color: 'from-amber-500 to-orange-600', count: '4 Items' },
  { name: 'Grocery', slug: 'grocery', icon: ShoppingBasket, color: 'from-emerald-500 to-teal-600', count: '4 Items' },
  { name: 'Beauty', slug: 'beauty', icon: Sparkles, color: 'from-fuchsia-500 to-pink-600', count: '4 Items' },
  { name: 'Accessories', slug: 'accessories', icon: Watch, color: 'from-cyan-500 to-blue-600', count: '3 Items' },
  { name: 'Daily Essentials', slug: 'daily-essentials', icon: Zap, color: 'from-orange-500 to-red-600', count: '3 Items' },
];

export const CategoryGrid: React.FC<CategoryGridProps> = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Featured Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Explore handpicked deals across our most popular departments
          </p>
        </div>
        <Link
          to="/products"
          className="text-xs sm:text-sm font-semibold text-brand-600 hover:text-brand-700 transition"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {defaultCategories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/50 hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition duration-300`}>
                <IconComponent className="w-7 h-7" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-3 group-hover:text-brand-600 transition line-clamp-1">
                {cat.name}
              </span>
              <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                {cat.count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
