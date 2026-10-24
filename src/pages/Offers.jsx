import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Copy, Check, ArrowRight, Gift, ShoppingBag, ShieldCheck, Tag, ChevronDown, Percent } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { productsData, faqList } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function Offers() {
  const { addToCart, applyCoupon } = useCart();
  const { addToast } = useToast();

  const [copiedCode, setCopiedCode] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  // Countdown timer for harvest celebration
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 18,
    mins: 42,
    secs: 8
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    applyCoupon(code);
    addToast(`Coupon "${code}" copied and automatically applied!`, 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // Bundles from productsData
  const bundleProducts = productsData.filter((p) => p.categorySlug === 'family-bundles' || p.badge === 'Festive Special');
  const aLaCarteDeals = productsData.filter((p) => p.categorySlug !== 'family-bundles');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* 1. HERO PROMOTIONAL BANNER */}
      <div className="bg-gradient-to-br from-cream-100 via-cream to-[#EFE7D4] rounded-3xl p-6 sm:p-10 lg:p-12 border border-cream-300 shadow-soft">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-earth text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-amber-300/60">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>Limited Time Harvest Celebration</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-forest-900 leading-tight">
              Festive Wellness & Harvest Savings
            </h1>

            <p className="text-xs sm:text-sm text-gray-700 max-w-xl leading-relaxed">
              Revitalize your family's daily routine with exclusive combo offers, festival gift hampers, and handcrafted stone-ground superfood bundles crafted from traditional heritage recipes.
            </p>

            {/* Countdown Box */}
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-cream-300 inline-flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-forest-900">
                <Clock className="w-4 h-4 text-gold" />
                <span>Sale Ends In:</span>
              </div>
              <div className="flex gap-2 text-center">
                <div className="bg-forest-900 text-white px-2.5 py-1 rounded-lg">
                  <span className="font-mono text-base font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-cream-300">Days</span>
                </div>
                <div className="bg-forest-900 text-white px-2.5 py-1 rounded-lg">
                  <span className="font-mono text-base font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-cream-300">Hours</span>
                </div>
                <div className="bg-forest-900 text-white px-2.5 py-1 rounded-lg">
                  <span className="font-mono text-base font-bold">{String(timeLeft.mins).padStart(2, '0')}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-cream-300">Mins</span>
                </div>
                <div className="bg-forest-900 text-white px-2.5 py-1 rounded-lg">
                  <span className="font-mono text-base font-bold">{String(timeLeft.secs).padStart(2, '0')}</span>
                  <span className="block text-[9px] uppercase tracking-wider text-cream-300">Secs</span>
                </div>
              </div>
            </div>

            {/* Copyable Coupon Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-2xl border border-forest/20 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Flat 15% Off Orders &gt; ₹799</span>
                  <strong className="font-mono text-sm text-forest-900 font-bold">FESTIVE15</strong>
                </div>
                <button
                  onClick={() => handleCopy('FESTIVE15')}
                  className="bg-forest text-cream text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-forest-800 transition-colors"
                >
                  {copiedCode === 'FESTIVE15' ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'FESTIVE15' ? 'Applied' : 'Copy'}</span>
                </button>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-earth/20 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">₹250 Off on 2kg+ Packs</span>
                  <strong className="font-mono text-sm text-earth font-bold">FAMILYCOMBO</strong>
                </div>
                <button
                  onClick={() => handleCopy('FAMILYCOMBO')}
                  className="bg-earth text-cream text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-earth-600 transition-colors"
                >
                  {copiedCode === 'FAMILYCOMBO' ? <Check className="w-3.5 h-3.5 text-gold" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'FAMILYCOMBO' ? 'Applied' : 'Copy'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Featured Hamper Showcase (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-cream-100">
              <img
                src="/images/product_hamper.jpg"
                alt="Festive Wellness Hamper"
                className="w-full h-auto object-cover"
              />
              <div className="absolute top-3 left-3 bg-forest text-gold text-xs font-bold px-3 py-1 rounded-full shadow-md">
                ★ 100% Traditional Stone-Ground
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-cream-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-semibold">Featured Collector's Gift Hamper</span>
                  <h4 className="font-serif font-bold text-sm text-forest-900">The Royal Harvest 3-Jar Box</h4>
                </div>
                <Link
                  to="/products/festive-wellness-heritage-hamper"
                  className="bg-forest hover:bg-forest-800 text-cream text-xs font-bold px-3.5 py-1.5 rounded-xl"
                >
                  View Box
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. BUY MORE, SAVE MORE TIERED CARDS */}
      <section className="space-y-6">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
            Unbeatable Tiered Savings
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
            Buy More, Save More
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Discounts are automatically calculated at checkout. Stackable with free festive gifts while inventory lasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft flex flex-col justify-between hover:shadow-card transition-shadow">
            <div>
              <span className="text-[10px] font-bold text-forest uppercase tracking-wider bg-forest-50 px-2.5 py-1 rounded-md">
                Tier 01 • Pantry Starter
              </span>
              <h3 className="font-serif text-xl font-bold text-gray-900 mt-3">
                Buy Any 2 Packs
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Get an extra 10% instant discount applied automatically on your entire shopping cart.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between">
              <span className="font-bold text-sm text-forest">Save 10% Extra</span>
              <ArrowRight className="w-4 h-4 text-forest" />
            </div>
          </div>

          <div className="bg-gradient-to-b from-[#FFFDF9] to-cream rounded-3xl p-6 border-2 border-gold shadow-card flex flex-col justify-between relative">
            <span className="absolute -top-3 right-6 bg-gold text-forest-900 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
              Most Popular
            </span>
            <div>
              <span className="text-[10px] font-bold text-earth uppercase tracking-wider bg-amber-100 px-2.5 py-1 rounded-md">
                Tier 02 • Household Family
              </span>
              <h3 className="font-serif text-xl font-bold text-gray-900 mt-3">
                Buy Any 3 Packs
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Enjoy flat 15% extra savings plus receive a complimentary Handcrafted Terracotta Measuring Spoon.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cream-300 flex items-center justify-between">
              <span className="font-bold text-sm text-earth">15% Off + Brass Spoon</span>
              <ArrowRight className="w-4 h-4 text-earth" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-cream-300 shadow-soft flex flex-col justify-between hover:shadow-card transition-shadow">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                Tier 03 • Grand Harvest
              </span>
              <h3 className="font-serif text-xl font-bold text-gray-900 mt-3">
                Buy 4+ Packs
              </h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Avail maximum 20% discount on order total accompanied by zero-fee Nationwide Express Priority shipping.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between">
              <span className="font-bold text-sm text-emerald-700">20% Off + Free Express</span>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. FEATURED FESTIVAL BUNDLES & VALUE HAMPERS */}
      <section className="space-y-6">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
            Handcrafted Wellness Combos
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
            Festival Bundles & Value Hampers
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Complete holistic nutrition assembled with care in vintage glass canisters, sealed gift boxes, and eco-friendly packaging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundleProducts.map((bundle) => (
            <div
              key={bundle.id}
              className="bg-white rounded-3xl border border-cream-300 shadow-soft overflow-hidden flex flex-col justify-between group hover:shadow-elevated transition-all"
            >
              <div className="relative aspect-4/3 w-full bg-cream-100 overflow-hidden">
                <img
                  src={bundle.image}
                  alt={bundle.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  {bundle.discount}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-earth block mb-1">
                    ★ {bundle.rating} ({bundle.reviewsCount} reviews)
                  </span>
                  <h3 className="font-serif font-bold text-lg text-gray-900">
                    {bundle.name}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                    {bundle.tagline || bundle.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {bundle.dietary && bundle.dietary.slice(0, 3).map((d, i) => (
                      <span key={i} className="text-[10px] bg-cream-100 text-forest-800 px-2 py-0.5 rounded">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-cream-200">
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-2xl font-bold text-forest-900">
                        ₹{bundle.price}
                      </span>
                      {bundle.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{bundle.originalPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      You Save ₹{bundle.originalPrice - bundle.price}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(bundle, 1)}
                    className="w-full bg-forest hover:bg-forest-800 text-cream py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-gold" />
                    <span>Add Bundle to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. A LA CARTE FESTIVE DEALS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
              A La Carte Festive Deals
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
              Discounted Daily Staples
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                filterCategory === 'all' ? 'bg-forest text-cream' : 'bg-white border text-gray-700'
              }`}
            >
              All Offers
            </button>
            <button
              onClick={() => setFilterCategory('millet-blends')}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                filterCategory === 'millet-blends' ? 'bg-forest text-cream' : 'bg-white border text-gray-700'
              }`}
            >
              Millet Mixes
            </button>
            <button
              onClick={() => setFilterCategory('sprouted-ragi')}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all ${
                filterCategory === 'sprouted-ragi' ? 'bg-forest text-cream' : 'bg-white border text-gray-700'
              }`}
            >
              Sprouted Flours
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {aLaCarteDeals
            .filter((p) => (filterCategory === 'all' ? true : p.categorySlug === filterCategory))
            .slice(0, 4)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>

      {/* 5. OFFER TERMS & FREQUENTLY ASKED QUESTIONS */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-300 shadow-soft">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[11px] font-bold text-earth uppercase tracking-widest block mb-1">
            Clear & Honest Promises
          </span>
          <h2 className="font-serif text-2xl font-bold text-forest-900">
            Offer Terms & Frequently Asked Questions
          </h2>
          <p className="text-xs text-gray-600 mt-1">
            Everything you need to know about our harvest promotions, packaging guarantee, and delivery timelines.
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-cream-300">
          {[
            {
              q: 'Are promotional coupon codes stackable with bundle discounts?',
              a: 'Yes! All bundle savings (which are already marked down by up to 23%) allow additional promotional coupon codes such as FESTIVE15 and FAMILYCOMBO at checkout.'
            },
            {
              q: 'What is the shelf life of combo bundles during festival seasons?',
              a: 'Because every mix is sealed in moisture-lock kraft pouches and sterilized glass canisters, each product has an unopened shelf life of 6 months from the date of roasting.'
            },
            {
              q: 'How is delivery handled during high-demand harvest sales?',
              a: 'Orders placed before 2:00 PM are freshly packaged and dispatched within 24 hours via express surface courier across India.'
            }
          ].map((item, idx) => (
            <div key={idx} className="py-3.5">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-serif font-bold text-base text-forest-900 hover:text-forest transition-colors gap-4"
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-forest shrink-0 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-gold' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-cream-200 text-center text-[11px] text-gray-400">
          Prototype Notice: Sample UI Prototype: Promotional offers and discounts are editable placeholders. Free gifts are bundled subject to availability during festive peak windows.
        </div>
      </div>

    </div>
  );
}
