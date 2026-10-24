import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { productsData } from '../data/products';
import { Link } from 'react-router-dom';

export default function WishlistDrawer() {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  const wishlistProducts = productsData.filter((p) => wishlist.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7EE] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-forest/10 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h2 className="font-serif text-lg font-bold text-forest-900">
                Your Saved Favorites ({wishlistProducts.length})
              </h2>
            </div>
            <button
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {wishlistProducts.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-3 text-red-400">
                  <Heart className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-800">Your wishlist is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                  Click the heart icon on any health mix to save it for your next family order.
                </p>
                <Link
                  to="/products"
                  onClick={() => setIsWishlistOpen(false)}
                  className="mt-5 inline-block bg-forest hover:bg-forest-800 text-cream px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-3.5 rounded-2xl border border-cream-300 shadow-xs flex gap-3.5 items-center"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-cream-100 shrink-0 border border-cream-200"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-gray-500">{product.category}</p>
                    <span className="font-bold text-sm text-forest-900 mt-1 block">
                      ₹{product.price}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => {
                        addToCart(product, 1);
                        toggleWishlist(product);
                      }}
                      className="bg-forest hover:bg-forest-800 text-cream p-2 rounded-xl text-xs flex items-center gap-1 shadow-xs font-semibold"
                      title="Move to cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                      <span>Move</span>
                    </button>
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="text-gray-400 hover:text-red-500 p-1 text-center flex items-center justify-center"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-forest/10 bg-white">
            <Link
              to="/products"
              onClick={() => setIsWishlistOpen(false)}
              className="w-full bg-cream-200 hover:bg-cream-300 text-forest-900 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider block text-center transition-colors"
            >
              Continue Exploring Blends
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
