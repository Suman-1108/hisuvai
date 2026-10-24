import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Check, ShieldCheck, Sparkles, ChefHat } from 'lucide-react';
import { useQuickView } from '../context/QuickViewContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductModal() {
  const { selectedProduct, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);

  if (!selectedProduct) return null;

  const currentSize = selectedSize || selectedProduct.defaultSize || (selectedProduct.sizes && selectedProduct.sizes[0]);
  const isFavorited = isInWishlist(selectedProduct.id);

  const handleAdd = () => {
    addToCart(selectedProduct, quantity, currentSize);
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="relative bg-[#FAF7EE] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-cream-300">
        
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Product Image */}
          <div className="relative bg-cream-100 p-6 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-cream-300">
            <div className="relative aspect-square w-full max-w-md rounded-2xl overflow-hidden shadow-soft">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              {selectedProduct.badge && (
                <div className="absolute top-3 left-3 bg-forest text-cream text-xs font-bold px-3 py-1 rounded-md shadow-xs uppercase">
                  {selectedProduct.badge}
                </div>
              )}
            </div>

            {/* Quick Guarantees */}
            <div className="flex items-center gap-4 mt-6 text-xs text-forest-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>100% Traditional Stone-Ground</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Zero Refined Sugar</span>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[80vh] overflow-y-auto">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-forest-800 bg-forest-50 px-2.5 py-1 rounded-full">
                  {selectedProduct.category}
                </span>
                <div className="flex items-center gap-1 text-gold">
                  <Star className="w-4 h-4 fill-gold" />
                  <span className="font-bold text-gray-800">{selectedProduct.rating}</span>
                  <span className="text-gray-400">({selectedProduct.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                {selectedProduct.name}
              </h2>

              <p className="text-xs text-earth font-medium mt-1">
                {selectedProduct.tagline}
              </p>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 my-4">
                <span className="text-2xl sm:text-3xl font-bold text-forest-900 font-serif">
                  ₹{selectedProduct.price}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{selectedProduct.originalPrice}
                  </span>
                )}
                {selectedProduct.discount && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedProduct.discount}
                  </span>
                )}
              </div>

              {/* Long Description */}
              <p className="text-xs text-gray-700 leading-relaxed">
                {selectedProduct.longDescription || selectedProduct.description}
              </p>

              {/* Pack Sizes */}
              {selectedProduct.sizes && (
                <div className="mt-5">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Select Pack Size / Quantity:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          currentSize === size
                            ? 'bg-forest text-cream border-forest shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-forest/50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Ingredients */}
              {selectedProduct.ingredients && (
                <div className="mt-5">
                  <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                    Key Ingredients ({selectedProduct.ingredients.length}):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedProduct.ingredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-white border border-cream-300 px-2 py-0.5 rounded-md text-gray-700"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition per 100g */}
              {selectedProduct.nutritionPer100g && (
                <div className="mt-5 bg-white p-3 rounded-2xl border border-cream-300">
                  <span className="text-[11px] font-bold text-forest uppercase tracking-wider block mb-2">
                    Nutritional Facts (per 100g):
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                    <div className="bg-cream-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-gray-500 block">Energy</span>
                      <strong className="text-forest-900">{selectedProduct.nutritionPer100g.energy}</strong>
                    </div>
                    <div className="bg-cream-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-gray-500 block">Protein</span>
                      <strong className="text-forest-900">{selectedProduct.nutritionPer100g.protein}</strong>
                    </div>
                    <div className="bg-cream-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-gray-500 block">Fiber</span>
                      <strong className="text-forest-900">{selectedProduct.nutritionPer100g.dietaryFiber}</strong>
                    </div>
                    <div className="bg-cream-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-gray-500 block">Calcium</span>
                      <strong className="text-forest-900">{selectedProduct.nutritionPer100g.calcium}</strong>
                    </div>
                    <div className="bg-cream-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-gray-500 block">Iron</span>
                      <strong className="text-forest-900">{selectedProduct.nutritionPer100g.iron}</strong>
                    </div>
                    <div className="bg-cream-100 p-1.5 rounded-lg">
                      <span className="text-[10px] text-gray-500 block">Carbs</span>
                      <strong className="text-forest-900">{selectedProduct.nutritionPer100g.carbohydrates}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Form Actions */}
            <div className="mt-6 pt-4 border-t border-cream-300 flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2.5 hover:bg-gray-100 text-gray-600 font-bold"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2.5 hover:bg-gray-100 text-gray-600 font-bold"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAdd}
                className="flex-1 bg-forest hover:bg-forest-800 text-cream py-3 px-4 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-gold" />
                <span>Add to Cart (₹{selectedProduct.price * quantity})</span>
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(selectedProduct)}
                className={`p-3 rounded-xl border transition-colors ${
                  isFavorited
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-white text-gray-500 border-gray-300 hover:text-forest'
                }`}
                title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
