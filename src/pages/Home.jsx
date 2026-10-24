import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Check, Heart, ShieldCheck, Sun, Flame, Award, ChevronRight, Star, Leaf, Droplets, Sprout } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import CategoryCard from '../components/CategoryCard';
import ProductCard from '../components/ProductCard';
import OfferBanner from '../components/OfferBanner';
import Newsletter from '../components/Newsletter';
import { productsData, categoriesData, sacredIngredientsList, customerTestimonials } from '../data/products';

export default function Home() {
  const [ingredientFilter, setIngredientFilter] = useState('all');

  // Filtered ingredients for interactive showcase
  const filteredIngredients = ingredientFilter === 'all'
    ? sacredIngredientsList
    : sacredIngredientsList.filter((item) => {
        if (ingredientFilter === 'grains') return item.category === 'grains' || item.category === 'pulses';
        if (ingredientFilter === 'spices') return item.category === 'spices' || item.category === 'seeds';
        return true;
      });

  // Bestseller products for home display
  const bestsellers = productsData.slice(0, 4);

  return (
    <div className="space-y-16 lg:space-y-24 pb-12">
      
      {/* 1. SOWMIYA FOODS STYLE DYNAMIC HERO SECTION (HISUVAI.COM) */}
      <HeroSection />

      {/* 2. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoriesData.slice(1, 5).map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* 3. BESTSELLING HEALTH MIXES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
              Our Time-Honored Bestsellers
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-forest-900">
              Handcrafted Daily Staples
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
              Carefully balanced proportions of sprouted millets, sprouted chickpeas, almonds, and dry ginger.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-forest hover:text-earth uppercase tracking-wider transition-colors shrink-0"
          >
            <span>View All Blends</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. PROMOTIONAL OFFER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OfferBanner />
      </section>

      {/* 5. THE FOUR PILLARS OF PURE NUTRITION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1.5">
            Uncompromising Quality
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-900">
            The Four Pillars of Pure Nutrition
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Every single batch goes through centuries-old preparation steps before reaching your breakfast table.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-forest" />
            </div>
            <h3 className="font-serif font-bold text-base text-gray-900 mb-2">
              Sprouted & Activated
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Sprouting breaks down complex starches, multiplies essential vitamins, and activates natural digestive enzymes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
              <Sun className="w-6 h-6 text-amber-700" />
            </div>
            <h3 className="font-serif font-bold text-base text-gray-900 mb-2">
              Slow Sun-Dried
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Gently sun-cured over organic cotton cloths under natural morning sunlight to retain micronutrients.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-earth flex items-center justify-center mb-4">
              <Flame className="w-6 h-6 text-earth" />
            </div>
            <h3 className="font-serif font-bold text-base text-gray-900 mb-2">
              Stone-Pounded Milling
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Low-friction traditional stone mill preserves aroma and aromatic oils which high-heat fast millers burn away.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-cream-300 shadow-soft text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-emerald-800" />
            </div>
            <h3 className="font-serif font-bold text-base text-gray-900 mb-2">
              Zero Chemical Fillers
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Absolutely zero maltodextrin, artificial milk solids, synthetic foaming agents, or bleached table sugars.
            </p>
          </div>

        </div>
      </section>

      {/* 6. THE 24 SACRED INGREDIENTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-cream-100 via-cream to-[#ECE3CF] rounded-3xl p-6 sm:p-12 border border-cream-300 shadow-soft">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
                Open Transparency
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
                The 24 Sacred Ingredients
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 mt-1 max-w-xl">
                Nothing hidden, nothing artificial. A medicinal harmony of millets, unpolished cereals, seeds, and aromatic digestive herbs.
              </p>
            </div>

            {/* Filter Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setIngredientFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                  ingredientFilter === 'all'
                    ? 'bg-forest text-cream shadow-xs'
                    : 'bg-white/70 text-gray-700 hover:bg-white'
                }`}
              >
                All 24 Ingredients
              </button>
              <button
                onClick={() => setIngredientFilter('grains')}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                  ingredientFilter === 'grains'
                    ? 'bg-forest text-cream shadow-xs'
                    : 'bg-white/70 text-gray-700 hover:bg-white'
                }`}
              >
                Millets & Pulses
              </button>
              <button
                onClick={() => setIngredientFilter('spices')}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                  ingredientFilter === 'spices'
                    ? 'bg-forest text-cream shadow-xs'
                    : 'bg-white/70 text-gray-700 hover:bg-white'
                }`}
              >
                Herbs & Aromatics
              </button>
            </div>
          </div>

          {/* Interactive Badges Grid */}
          <div className="flex flex-wrap gap-2.5 mb-10">
            {filteredIngredients.map((item, idx) => (
              <span
                key={idx}
                className="bg-white/90 hover:bg-white text-forest-900 font-medium text-xs px-3.5 py-1.5 rounded-xl border border-cream-300 shadow-xs flex items-center gap-1.5 transition-all cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>{item.name}</span>
              </span>
            ))}
          </div>

          {/* 4 Preparation Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-cream-300/80">
            <div className="bg-white/80 p-4 rounded-2xl">
              <span className="font-mono text-xs font-bold text-earth">01</span>
              <h4 className="font-serif font-bold text-sm text-forest-900 mt-1">
                Soaking & Sprouting
              </h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Grains are slow-soaked for 12 hours and sprouted in cotton to trigger active shoots.
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl">
              <span className="font-mono text-xs font-bold text-earth">02</span>
              <h4 className="font-serif font-bold text-sm text-forest-900 mt-1">
                Slow Sun-Drying
              </h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Sprouted grains are solar-dried on clean cloths to dry out moisture without destroying nutrients.
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl">
              <span className="font-mono text-xs font-bold text-earth">03</span>
              <h4 className="font-serif font-bold text-sm text-forest-900 mt-1">
                Clay-Pot Roasting
              </h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Gentle firewood temperature in seasoned clay pots unlocks sweet, nutty aromas.
              </p>
            </div>

            <div className="bg-white/80 p-4 rounded-2xl">
              <span className="font-mono text-xs font-bold text-earth">04</span>
              <h4 className="font-serif font-bold text-sm text-forest-900 mt-1">
                Stone Mill Pulverizing
              </h4>
              <p className="text-[11px] text-gray-600 mt-1">
                Traditional stone motor mills into a velvety, digestion-ready powder.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
            Real Stories from Real Pantries
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-900">
            Cherished by 30,000+ Indian Families
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5">
            Hear how daily morning porridge transformed morning wellness in homes across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {customerTestimonials.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-cream-300 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-gold mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold" />
                  ))}
                </div>
                <h4 className="font-serif font-bold text-base text-gray-900 mb-2">
                  "{review.title}"
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  "{review.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-cream-200">
                <div className="w-9 h-9 rounded-full bg-cream-200 text-forest font-bold text-xs flex items-center justify-center">
                  {review.initials}
                </div>
                <div className="text-xs">
                  <strong className="block font-bold text-gray-900">{review.name}</strong>
                  <span className="text-gray-500 text-[11px]">{review.location} · <span className="text-emerald-700 font-semibold">Verified Buyer</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. RECIPE BOOK NEWSLETTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Newsletter />
      </section>

    </div>
  );
}
