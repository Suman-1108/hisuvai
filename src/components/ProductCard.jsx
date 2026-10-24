import React from 'react';
import { Star, Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useQuickView } from '../context/QuickViewContext';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openQuickView } = useQuickView();

  const isFavorited = isInWishlist(product.id);
  const cartItem = cart.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="group bg-white rounded-2xl border border-cream-300/80 shadow-soft hover:shadow-elevated transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Top Media Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-cream-100 flex items-center justify-center">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
          {product.badge && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-forest text-cream shadow-xs">
              {product.badge}
            </span>
          )}
          {product.discount && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-600 text-white shadow-xs">
              {product.discount}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-transform active:scale-90 shadow-sm ${
            isFavorited
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-white/90 text-gray-500 hover:text-forest hover:bg-white'
          }`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
        </button>

        {/* Product Image */}
        <Link to={`/products/${product.id}`} className="w-full h-full block">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Floating Tag over image bottom */}
        <div className="absolute bottom-2 left-3 right-3 z-10 pointer-events-none">
          <span className="inline-block bg-black/60 backdrop-blur-xs text-white/95 text-[10px] font-medium px-2 py-0.5 rounded-md">
            {product.sizes ? product.sizes[0] : 'Standard Pack'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Reviews */}
          <div className="flex items-center justify-between text-xs mb-1.5 text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="font-bold text-gray-800">{product.rating}</span>
              <span className="text-gray-400">({product.reviewsCount})</span>
            </div>
            <span className="text-[11px] font-medium text-forest-700 bg-forest-50 px-1.5 py-0.5 rounded">
              {product.category}
            </span>
          </div>

          {/* Title */}
          <Link to={`/products/${product.id}`} className="block group-hover:text-forest transition-colors">
            <h3 className="font-serif font-bold text-base sm:text-lg text-gray-900 line-clamp-1 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-gray-600 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Buttons */}
        <div className="mt-4 pt-3 border-t border-cream-200">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-bold text-lg sm:text-xl text-forest-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
            {product.discount && (
              <span className="text-[11px] font-semibold text-emerald-700">
                Save ₹{product.originalPrice - product.price}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openQuickView(product)}
              className="py-2 px-2.5 rounded-xl border border-forest/30 text-forest hover:bg-forest/5 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Details</span>
            </button>

            <button
              onClick={() => addToCart(product, 1)}
              className={`py-2 px-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                quantityInCart > 0
                  ? 'bg-forest text-gold hover:bg-forest-800'
                  : 'bg-forest text-cream hover:bg-forest-800'
              }`}
            >
              {quantityInCart > 0 ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added ({quantityInCart})</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
