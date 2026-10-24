import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productsData } from '../data/products';
import { Star, Heart, ShoppingBag, ShieldCheck, Sparkles, ChefHat, Check, ArrowLeft, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const product = productsData.find((p) => p.id === id) || productsData[0];
  const [selectedSize, setSelectedSize] = useState(product.defaultSize || (product.sizes && product.sizes[0]));
  const [quantity, setQuantity] = useState(1);

  const isFavorited = isInWishlist(product.id);
  const cartItem = cart.find((item) => item.id === product.id && item.size === selectedSize);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(product, quantity, selectedSize);
  };

  // Related products
  const related = productsData.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumbs */}
      <nav className="text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-forest">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-forest">Products</Link>
        <span>/</span>
        <span className="text-forest font-semibold">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Image (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-cream-300 shadow-soft">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <div className="absolute top-4 left-4 bg-forest text-cream text-xs font-bold px-3 py-1 rounded-md shadow-xs uppercase">
                {product.badge}
              </div>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 p-3 rounded-full transition-transform active:scale-90 shadow-md ${
                isFavorited
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-white/90 text-gray-500 hover:text-forest'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-white p-3 rounded-2xl border border-cream-300 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-forest mx-auto mb-1" />
              <strong className="block text-gray-900 font-bold">100% Stone-Ground</strong>
              <span className="text-gray-500 text-[10px]">Zero high-heat burning</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-cream-300 shadow-xs">
              <Sparkles className="w-5 h-5 text-gold mx-auto mb-1" />
              <strong className="block text-gray-900 font-bold">Natural Sprouting</strong>
              <span className="text-gray-500 text-[10px]">Enhanced bioavailability</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-cream-300 shadow-xs">
              <Truck className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
              <strong className="block text-gray-900 font-bold">Fresh Batch</strong>
              <span className="text-gray-500 text-[10px]">Ground every Tuesday</span>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Form (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-forest-50 text-forest text-xs font-bold px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-gold text-xs">
                <Star className="w-4 h-4 fill-gold" />
                <span className="font-bold text-gray-800">{product.rating}</span>
                <span className="text-gray-400">({product.reviewsCount} customer reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-forest-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-xs sm:text-sm text-earth font-medium mt-1">
              {product.tagline}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-cream-300">
            <span className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice}
              </span>
            )}
            {product.discount && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {product.discount}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {product.longDescription || product.description}
          </p>

          {/* Pack Size Selection */}
          {product.sizes && (
            <div>
              <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                Available Pack Format:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      selectedSize === size
                        ? 'bg-forest text-cream border-forest shadow-xs'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-forest/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-3 hover:bg-gray-100 text-gray-600 font-bold"
              >
                -
              </button>
              <span className="px-4 text-sm font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-3 hover:bg-gray-100 text-gray-600 font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              className="flex-1 bg-forest hover:bg-forest-800 text-cream py-3.5 px-6 rounded-xl font-bold uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span>Add to Cart • ₹{product.price * quantity}</span>
            </button>
          </div>

          {/* Key Benefits */}
          {product.benefits && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cream-300 space-y-2">
              <span className="text-xs font-bold text-forest-900 uppercase tracking-wider block">
                Wholesome Benefits:
              </span>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {product.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* How to Prepare */}
          {product.howToPrepare && (
            <div className="bg-cream-100/70 p-4 sm:p-5 rounded-2xl border border-cream-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-900 uppercase tracking-wider">
                <ChefHat className="w-4 h-4 text-gold" />
                <span>How to Prepare Traditional Kanji / Porridge:</span>
              </div>
              <ol className="space-y-1 text-xs text-gray-700 list-decimal pl-4 leading-relaxed">
                {product.howToPrepare.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

        </div>

      </div>

      {/* Related Products Grid */}
      <section className="pt-8 border-t border-cream-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
              Complementary Nutrition
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
              You May Also Enjoy
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-forest hover:text-earth flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
}
