import React from 'react';
import { Sparkles, ShieldCheck, Heart, Sun, Flame, Sprout, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16 lg:space-y-24">
      
      {/* 1. HERO BANNER */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-cream-200 text-forest-900 text-xs font-semibold px-4 py-1.5 rounded-full border border-forest/20">
          <Sprout className="w-3.5 h-3.5 text-forest" />
          <span>Roots of Wholesome Living</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-forest-900 leading-tight">
          Reviving India's Sacred Tradition of Slow Porridge & Sprouted Grains
        </h1>

        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          HISUVAI was founded on a simple truth: our grandparents did not rely on multivitamins or synthetic health drinks. They drank honest, whole-grain Kanji prepared from sprouted millets, roasted lentils, and ground dry ginger.
        </p>
      </div>

      {/* 2. HERITAGE IMAGE & BRAND STORY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left: Image (6 cols) */}
        <div className="lg:col-span-6 relative">
          <div className="rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-cream-200">
            <img
              src="/images/about_heritage.jpg"
              alt="Traditional stone grinding mill and sprouted grains"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-forest text-gold p-5 rounded-2xl shadow-xl hidden sm:block max-w-xs border border-gold/40">
            <p className="font-serif font-bold text-sm text-cream">
              "Honoring the ancient grain wisdom of Tamil Nadu & South India."
            </p>
            <span className="text-[10px] text-cream-200 uppercase tracking-widest mt-1 block">
              100% Sun-Dried & Stone-Pounded
            </span>
          </div>
        </div>

        {/* Right: Story (6 cols) */}
        <div className="lg:col-span-6 space-y-5 text-gray-700 text-sm leading-relaxed">
          <span className="text-xs font-bold text-earth uppercase tracking-widest block">
            Our Humble Beginning
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
            From Grandma's Earthen Stove to Modern Pantries
          </h2>
          <p>
            The word <strong className="text-forest-900">HISUVAI</strong> embodies the pure sensory delight of genuine nutrition—food that warms the soul, restores digestive balance, and sustains deep energy throughout the day.
          </p>
          <p>
            When modern breakfast aisles filled up with ultra-processed cereals loaded with 40% white sugar, synthetic emulsifiers, and bleached starches, we asked ourselves: <em>What happened to our ancestral Sathu Maavu?</em>
          </p>
          <p>
            We traveled across Madurai, Thanjavur, and Karnataka’s millet heartlands to source heirloom grains directly from organic farming clusters. We revived the traditional 4-step preparation ritual: slow soaking, 48-hour cotton sprouting, solar drying, and clay-pot firewood roasting.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-300">
            <div>
              <strong className="font-serif text-2xl font-bold text-forest-900 block">24</strong>
              <span className="text-xs text-gray-600">Sacred Millets, Pulses, & Spices</span>
            </div>
            <div>
              <strong className="font-serif text-2xl font-bold text-forest-900 block">0%</strong>
              <span className="text-xs text-gray-600">Preservatives, Colors, or Maltodextrin</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. INGREDIENTS & ARTISANAL CRAFT */}
      <section className="bg-white rounded-3xl p-6 sm:p-12 border border-cream-300 shadow-soft space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
            Artisanal Craft
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
            The Ancestral 4-Step Preparation Ritual
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            We reject high-speed industrial processing. Our slow, meticulous method preserves live food enzymes and natural grain aromatics.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest flex items-center justify-center font-bold mb-4">
              01
            </div>
            <h4 className="font-serif font-bold text-base text-gray-900 mb-2">
              Soaking & Sprouting
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Clean spring-water soaking for 12 hours followed by wrapping in natural muslin cloths to unlock sprout shoots and bioavailable iron.
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold mb-4">
              02
            </div>
            <h4 className="font-serif font-bold text-base text-gray-900 mb-2">
              Gentle Sun Curing
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Spread thin over organic cotton mats in sun-drenched courtyards, letting dry heat evaporate moisture naturally without oven blistering.
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-earth flex items-center justify-center font-bold mb-4">
              03
            </div>
            <h4 className="font-serif font-bold text-base text-gray-900 mb-2">
              Clay-Pot Roasting
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Each grain is roasted individually in heavy earthen cookware over slow firewood embers to coax out rich, nutty notes.
            </p>
          </div>

          <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold mb-4">
              04
            </div>
            <h4 className="font-serif font-bold text-base text-gray-900 mb-2">
              Artisan Stone Grinding
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Low-RPM granite stone pulverizers prevent heat build-up, ensuring delicate oils in almonds and cardamom are never scorched.
            </p>
          </div>
        </div>
      </section>

      {/* 4. OUR QUALITY & ETHICAL VALUES */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-earth uppercase tracking-widest block mb-1">
            Our Compass
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-forest-900">
            Customer-First Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-cream-300 shadow-soft text-center">
            <div className="w-12 h-12 rounded-full bg-forest text-gold flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">
              Uncompromising Transparency
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every single grain and botanical spice is printed clearly on our labels. No hidden "flavor extracts", no code numbers.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-cream-300 shadow-soft text-center">
            <div className="w-12 h-12 rounded-full bg-earth text-cream flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">
              Fair-Trade Farming
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We procure ancient millets from indigenous farmer cooperatives across South India at fair, dignified prices.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-cream-300 shadow-soft text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-800 text-gold flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-gray-900 mb-2">
              Small-Batch Freshness
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We never grind massive warehouses of powder. We produce in disciplined weekly batches to guarantee mouthwatering aroma.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <div className="bg-forest-900 text-cream rounded-3xl p-8 sm:p-12 text-center border border-gold/30 shadow-elevated max-w-4xl mx-auto">
        <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-white">
          Taste the Difference of Stone-Pounded Grains
        </h3>
        <p className="text-xs sm:text-sm text-cream-200 mt-2 max-w-xl mx-auto">
          Start your family's morning with wholesome sustained vitality. Delivered straight from our stone mill to your doorstep.
        </p>
        <div className="mt-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-500 text-forest-900 font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider shadow-md transition-all"
          >
            <span>Explore The Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
