import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Zap, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const navigate = useNavigate();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 hover:border-brand-500/40 hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      
      {/* Discount Badge */}
      {product.discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
          {product.discountPercent}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white backdrop-blur-md rounded-full text-slate-400 hover:text-red-500 shadow-sm transition"
        title="Add to Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-50 p-4">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col p-4 sm:p-5">
        
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          <span>{product.brand || product.categorySlug}</span>
          {product.inStock ? (
            <span className="text-emerald-600 font-bold lowercase text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">in stock</span>
          ) : (
            <span className="text-red-500 font-bold lowercase text-[10px] bg-red-50 px-1.5 py-0.5 rounded">sold out</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/products/${product.id}`} className="block mb-2">
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-md text-xs font-bold">
            <span>{product.rating.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-xs text-slate-400">
            ({product.ratingCount.toLocaleString()})
          </span>
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-baseline gap-2 mb-4">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};
