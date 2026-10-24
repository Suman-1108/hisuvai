import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, ShieldCheck, Truck, ChevronDown, Sparkles, Filter, X, LayoutGrid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productsData, categoriesData, faqList } from '../data/products';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [selectedSize, setSelectedSize] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state if URL query params change
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('search');
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  // Dietary filter options
  const dietaryOptions = [
    { id: '100% Vegan & Natural', label: '100% Vegan & Natural', count: 8 },
    { id: 'Certified Gluten-Free', label: 'Certified Gluten-Free', count: 3 },
    { id: 'High Plant Protein', label: 'High Plant Protein', count: 6 },
    { id: 'Rich in Calcium & Iron', label: 'Rich in Calcium & Iron', count: 5 },
    { id: 'Zero Added Sugar / Jaggery', label: 'Zero Added Sugar / Jaggery', count: 6 },
  ];

  const handleDietaryToggle = (item) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(1500);
    setSelectedDietary([]);
    setSelectedSize('all');
    setSearchParams({});
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return productsData
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.categorySlug !== selectedCategory) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.ingredients && p.ingredients.some((ing) => ing.toLowerCase().includes(q)));
          if (!matches) return false;
        }
        // Price filter
        if (p.price > maxPrice) {
          return false;
        }
        // Dietary filter
        if (selectedDietary.length > 0) {
          const hasAll = selectedDietary.every((d) => p.dietary && p.dietary.includes(d));
          if (!hasAll) return false;
        }
        // Pack Size filter
        if (selectedSize !== 'all') {
          const hasSize = p.sizes && p.sizes.some((s) => s.toLowerCase().includes(selectedSize.toLowerCase()));
          if (!hasSize) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // featured default
      });
  }, [selectedCategory, searchQuery, maxPrice, selectedDietary, selectedSize, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Breadcrumbs */}
      <nav className="text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-forest transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-400">Products</span>
        <span>/</span>
        <span className="text-forest font-semibold">All Health Mixes & Superfoods</span>
      </nav>

      {/* 2. Page Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cream-300">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-earth uppercase tracking-widest mb-1.5">
            <span>Ayurvedic Formulations</span>
            <span>•</span>
            <span>Stone-Pounded</span>
            <span>•</span>
            <span>Zero Additives</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-900">
            All Traditional Health Mixes & Organic Superfoods
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Purely stone-ground, whole-grain nutrition for toddlers, adults, and seniors. Crafted through ancestral sun-drying, slow clay-roasting, and artisanal stone pounding.
          </p>
        </div>

        {/* Quality Badges */}
        <div className="flex flex-row md:flex-col gap-2 shrink-0 text-xs text-forest font-medium">
          <div className="flex items-center gap-1.5 bg-forest-50 px-3 py-1.5 rounded-full border border-forest/15">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span>Lab-Certified 100% Pure</span>
          </div>
          <div className="flex items-center gap-1.5 bg-forest-50 px-3 py-1.5 rounded-full border border-forest/15">
            <Truck className="w-4 h-4 text-forest" />
            <span>Fast Dispatch &lt; 24h</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-cream-300 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by name (e.g. Sprouted Ragi, 24-Ingredient, Diab-Care)..."
              className="w-full bg-cream-100/70 text-gray-800 text-xs sm:text-sm pl-10 pr-8 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-forest"
            />
            <Search className="w-4 h-4 text-forest/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden bg-cream-200 text-forest font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Pantry ({selectedDietary.length + (selectedCategory !== 'all' ? 1 : 0)})</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-500 font-medium hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-cream-100 text-gray-800 text-xs font-semibold px-3 py-2.5 rounded-xl border border-cream-300 focus:outline-none focus:border-forest"
            >
              <option value="featured">Featured • Handpicked</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="name">Product Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoriesData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.slug);
                if (cat.slug === 'all') {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('category');
                  setSearchParams(newParams);
                } else {
                  setSearchParams({ ...Object.fromEntries(searchParams), category: cat.slug });
                }
              }}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold shrink-0 transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-forest text-cream shadow-xs'
                  : 'bg-cream-100 text-gray-700 hover:bg-cream-200'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Filter (3 cols) */}
        <aside
          className={`lg:col-span-3 space-y-6 bg-white p-5 rounded-3xl border border-cream-300 shadow-soft ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-cream-300">
            <div className="flex items-center gap-2 font-serif font-bold text-forest-900 text-base">
              <SlidersHorizontal className="w-4 h-4 text-forest" />
              <span>Refine Pantry</span>
            </div>
            {(selectedCategory !== 'all' || selectedDietary.length > 0 || maxPrice < 1500 || searchQuery) && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-earth hover:text-forest underline font-semibold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Dietary Philosophy Filter */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Dietary Philosophy
            </label>
            <div className="space-y-2">
              {dietaryOptions.map((item) => (
                <label key={item.id} className="flex items-center justify-between text-xs text-gray-700 cursor-pointer hover:text-forest">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedDietary.includes(item.id)}
                      onChange={() => handleDietaryToggle(item.id)}
                      className="w-4 h-4 rounded text-forest focus:ring-forest border-gray-300"
                    />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-gray-400 text-[11px]">{item.count}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pack Size / Format */}
          <div className="space-y-3 pt-4 border-t border-cream-300">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
              Pack Size / Format
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'All Sizes', value: 'all' },
                { label: '500g Pouch', value: '500g' },
                { label: '1kg Family', value: '1kg' },
                { label: 'Jars & Hampers', value: 'box' },
              ].map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedSize(s.value)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    selectedSize === s.value
                      ? 'bg-forest text-cream border-forest'
                      : 'bg-cream-100 text-gray-700 border-cream-300 hover:border-forest/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Span */}
          <div className="space-y-3 pt-4 border-t border-cream-300">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-gray-800 uppercase tracking-wider">
                Budget Span
              </label>
              <span className="font-bold text-forest">Up to ₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="200"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-forest"
            />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>₹200 (Single)</span>
              <span>₹1,500 (Gourmet Cask)</span>
            </div>
          </div>

          {/* The Hisuvai Guarantee Box */}
          <div className="bg-forest-50 p-4 rounded-2xl border border-forest/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-serif font-bold text-forest-900">
              <Sparkles className="w-4 h-4 text-gold" />
              <span>The Hisuvai Guarantee</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              Every batch is sprouted for 48 hours to activate natural enzymes, gently roasted over firewood, and fine stone-ground. 0% preservatives, 0% maltodextrin.
            </p>
          </div>

        </aside>

        {/* Right Products Content (9 cols) */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Active Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/60 p-3 rounded-2xl border border-cream-300 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-gray-500 font-medium">Active Selection:</span>
              <span className="bg-cream-200 text-forest-900 px-2.5 py-1 rounded-full font-semibold">
                Category: {selectedCategory.replace('-', ' ').toUpperCase()}
              </span>
              {selectedDietary.map((d) => (
                <span key={d} className="bg-forest-50 text-forest-800 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  {d}
                  <button onClick={() => handleDietaryToggle(d)} className="hover:text-red-500">✕</button>
                </span>
              ))}
            </div>
            <span className="text-gray-500 font-semibold">
              Showing {filteredProducts.length} of {productsData.length} artisan products
            </span>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-cream-400">
              <h3 className="font-serif text-xl font-bold text-gray-800">No Blends Found</h3>
              <p className="text-xs text-gray-500 mt-1 mb-6">
                No health mixes match your active filters. Click below to reset and view all mixes.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-forest text-cream px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Pagination Preview */}
          <div className="flex items-center justify-between pt-6 border-t border-cream-300 text-xs">
            <span className="text-gray-500">Page 1 of 1 (Showing {filteredProducts.length} items)</span>
            <div className="flex items-center gap-1">
              <button disabled className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-forest text-cream font-bold">
                1
              </button>
              <button disabled className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>

          {/* Bulk Orders & Gifting Banner */}
          <div className="bg-forest-900 text-cream rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-gold/30 shadow-soft">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-serif font-bold text-lg sm:text-xl text-white">
                Bulk Orders, Custom Packaging & Heritage Gifting
              </h4>
              <p className="text-xs text-cream-200 max-w-xl">
                Require corporate wellness packs, temple ceremony mixes, or customized 25kg bulk gunny bags for your ayurvedic wellness center? We grind to order with custom labels.
              </p>
            </div>
            <Link
              to="/contact"
              className="bg-gold hover:bg-gold-500 text-forest-900 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shrink-0 shadow-sm"
            >
              Inquire Bulk Rates →
            </Link>
          </div>

        </main>
      </div>

      {/* 5. Pantry FAQ Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-soft mt-12">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold text-earth uppercase tracking-widest block mb-1">
            Honest & Informative
          </span>
          <h2 className="font-serif text-2xl font-bold text-forest-900">
            Frequently Asked Pantry Questions
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Everything you need to know about our stone-pounded milling tradition
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-cream-300">
          {faqList.slice(0, 3).map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-serif font-bold text-base text-forest-900 hover:text-forest transition-colors gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-forest shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-gold' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
