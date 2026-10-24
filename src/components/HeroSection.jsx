import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Truck, Sprout, Wheat, Phone, HeartPulse, Check, Copy } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { productsData } from '../data/products';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const { addToast } = useToast();
  const { addToCart, applyCoupon } = useCart();

  const slides = [
    {
      id: 'slide-24grain',
      badge: '100% பாரம்பரிய முறை • 24 SACRED WHOLE GRAINS',
      badgeBg: 'bg-emerald-900/90 text-gold border-gold/40',
      title: 'Traditional 24-Ingredient Health Mix',
      tamilTitle: 'பாரம்பரிய 24 தானிய சத்து மாவு',
      subtitle: 'Handcrafted from 24 sprouted millets, roasted pulses, California almonds, and dry ginger. Zero refined sugar, zero preservatives.',
      tagline: 'hisuvai.com — Pure Ancestral Nutrition for the Whole Family',
      price: '₹349',
      originalPrice: '₹399',
      discount: '12% OFF',
      productId: 'hisuvai-24-grain-mix',
      image: '/images/hero_kanji.jpg',
      productPouch: '/images/product_24grain.jpg',
      bgGradient: 'from-[#1a3824] via-[#245C3A] to-[#122418]',
      ctaText: 'Shop Now',
      ctaLink: '/products/hisuvai-24-grain-mix',
      secondaryText: 'Explore 24 Grains',
      secondaryLink: '/products',
      features: ['24 Whole Grains', 'Clay-Pot Roasted', 'Stone-Pounded']
    },
    {
      id: 'slide-festive',
      badge: 'FESTIVE HARVEST SAVINGS • UP TO 25% OFF',
      badgeBg: 'bg-amber-900/90 text-cream border-gold/50',
      title: 'Grand Traditional Wellness Sale',
      tamilTitle: 'தித்திக்கும் விழாக்கால சிறப்பு தள்ளுபடி சலுகை',
      subtitle: 'Stock your family pantry with collector 3-jar heritage gift hampers & monthly wellness rations. Use code HISUVAI25 for 25% instant savings.',
      tagline: 'hisuvai.com — Festive Gifting with Pure Traditional Goodness',
      price: '₹899',
      originalPrice: '₹1,099',
      discount: 'Save 25%',
      coupon: 'HISUVAI25',
      productId: 'festive-wellness-heritage-hamper',
      image: '/images/product_hamper.jpg',
      bgGradient: 'from-[#422616] via-[#633b21] to-[#2b180d]',
      ctaText: 'Claim 25% Offer',
      ctaLink: '/offers',
      secondaryText: 'View Gift Hamper',
      secondaryLink: '/products/festive-wellness-heritage-hamper',
      features: ['Collector 3-Jar Box', 'Free Brass Spoon', 'Eco Wooden Tray']
    },
    {
      id: 'slide-ragi',
      badge: 'BONE DENSITY & TODDLER GROWTH • RICH CALCIUM',
      badgeBg: 'bg-emerald-950/90 text-gold border-emerald-400/40',
      title: 'Sprouted Ragi & Almond Health Mix',
      tamilTitle: 'முளைகட்டிய ராகி & பாதாம் சத்து மாவு',
      subtitle: 'Double-sprouted finger millet fortified with roasted almonds and cardamom. Delivers 3x more bioavailable calcium and plant iron.',
      tagline: 'hisuvai.com — Naturally Energizing Porridge for Growing Kids & Adults',
      price: '₹299',
      originalPrice: '₹329',
      discount: '10% OFF',
      productId: 'sprouted-ragi-almond-mix',
      image: '/images/product_ragi.jpg',
      bgGradient: 'from-[#1e3d2b] via-[#245C3A] to-[#162f21]',
      ctaText: 'Order Ragi Mix',
      ctaLink: '/products/sprouted-ragi-almond-mix',
      secondaryText: 'Browse All Millets',
      secondaryLink: '/products?category=sprouted-ragi',
      features: ['3x Bio Calcium', 'Zero Added Sugar', 'Gentle on Gut']
    },
    {
      id: 'slide-diabcare',
      badge: '0% ADDED SUGAR • LOW GLYCEMIC INDEX (<45)',
      badgeBg: 'bg-teal-950/90 text-teal-200 border-teal-400/40',
      title: 'Sugar-Free Diab-Care 18-Grain Mix',
      tamilTitle: 'இயற்கை சர்க்கரை கட்டுப்பாடு சத்து மாவு',
      subtitle: 'Ayurvedic formulation with sprouted fenugreek, roasted barley, and kodo millet to maintain balanced glucose levels and gut vitality.',
      tagline: 'hisuvai.com — Certified Low GI Ancient Grains Formulation',
      price: '₹380',
      originalPrice: '₹420',
      discount: '10% OFF',
      productId: 'diab-care-multigrain-mix',
      image: '/images/product_diabcare.jpg',
      bgGradient: 'from-[#143026] via-[#1a4435] to-[#0c1f19]',
      ctaText: 'Shop Diab-Care',
      ctaLink: '/products/diab-care-multigrain-mix',
      secondaryText: 'View Ingredients',
      secondaryLink: '/products?category=diabetic-care',
      features: ['Sprouted Methi', 'Low Glycemic Index', 'Roasted Barley']
    }
  ];

  // Auto slide rotation every 5 seconds (just like sowmiyafoods.com)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  // Touch swipe handling (matching sowmiyafoods)
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const handleQuickAdd = (slide) => {
    const product = productsData.find((p) => p.id === slide.productId);
    if (product) {
      addToCart(product, 1);
    }
    if (slide.coupon) {
      applyCoupon(slide.coupon);
    }
  };

  // Quick Category Bar items with bilingual English + Tamil (sowmiyafoods style)
  const categoryShortcuts = [
    { name: 'All Blends', tamil: 'அனைத்து வகைகள்', slug: 'all' },
    { name: 'Traditional Health Mix', tamil: 'பாரம்பரிய சத்து மாவு', slug: 'millet-blends' },
    { name: 'Sprouted Ragi', tamil: 'முளைகட்டிய ராகி', slug: 'sprouted-ragi' },
    { name: 'Diabetic Care', tamil: 'சர்க்கரை கட்டுப்பாடு', slug: 'diabetic-care' },
    { name: 'Kids Nutri-Malt', tamil: 'குழந்தைகள் மால்ட்', slug: 'kids-malts' },
    { name: 'Family Bundles', tamil: 'குடும்ப காம்போ', slug: 'family-bundles' }
  ];

  return (
    <div className="w-full space-y-4">
      
      {/* 1. TOP BILINGUAL CATEGORY BAR (Sowmiya Foods Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-cream-300 shadow-soft p-2.5 sm:p-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between gap-2 min-w-max">
            {categoryShortcuts.map((cat, idx) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center px-3.5 py-1.5 rounded-xl hover:bg-forest/5 transition-all text-center"
              >
                <span className="text-xs sm:text-sm font-bold text-gray-800 group-hover:text-forest transition-colors">
                  {cat.name}
                </span>
                <span className="text-[10px] sm:text-[11px] text-earth font-medium leading-tight mt-0.5 group-hover:text-forest-700 transition-colors">
                  {cat.tamil}
                </span>
                <div className="w-full h-0.5 rounded-full mt-1 bg-transparent group-hover:bg-gold transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN SOWMIYAFOODS-INSPIRED HERO CAROUSEL / SLIDER */}
      <div
        className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[520px] lg:min-h-[560px] bg-forest-950 text-cream"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out bg-gradient-to-r ${slide.bgGradient} ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Decorative Background Lighting */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-gold/15 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/40 blur-2xl pointer-events-none" />

              <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Column: Content */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
                    
                    {/* Badge & Website Domain Tag */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border shadow-xs ${slide.badgeBg}`}>
                        <Sparkles className="w-3.5 h-3.5 text-gold" />
                        <span>{slide.badge}</span>
                      </div>
                      <span className="hidden sm:inline-block text-[11px] font-mono text-gold/90 bg-black/30 px-2.5 py-1 rounded-full border border-white/10">
                        {slide.tagline}
                      </span>
                    </div>

                    {/* Main Headline & Tamil Subtitle */}
                    <div>
                      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
                        {slide.title}
                      </h1>
                      <p className="font-serif italic text-lg sm:text-2xl text-gold mt-1 font-normal">
                        {slide.tamilTitle}
                      </p>
                    </div>

                    {/* Subtitle Description */}
                    <p className="text-xs sm:text-sm text-cream-200 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                      {slide.subtitle}
                    </p>

                    {/* Pricing & Offer Pill */}
                    <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
                      <div className="flex items-baseline gap-2 bg-black/30 px-3.5 py-1.5 rounded-xl border border-white/10">
                        <span className="font-serif text-2xl font-bold text-white">{slide.price}</span>
                        <span className="text-xs text-cream-300 line-through">{slide.originalPrice}</span>
                        <span className="text-xs font-bold text-gold">{slide.discount}</span>
                      </div>
                      {slide.coupon && (
                        <div className="bg-gold text-forest-900 text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-white/40 shadow-xs flex items-center gap-1">
                          <span>CODE:</span>
                          <span className="tracking-wider">{slide.coupon}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                      <Link
                        to={slide.ctaLink}
                        className="w-full sm:w-auto bg-gold hover:bg-gold-500 text-forest-900 font-bold px-7 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                      >
                        <span>{slide.ctaText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      <Link
                        to={slide.secondaryLink}
                        className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border border-white/30 font-semibold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 backdrop-blur-xs transition-colors"
                      >
                        <span>{slide.secondaryText}</span>
                      </Link>
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3 text-[11px] text-cream-200 border-t border-white/10">
                      {slide.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-gold" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Right Column: Hero Visual Showcase */}
                  <div className="lg:col-span-5 relative flex items-center justify-center">
                    <div className="relative w-full max-w-sm lg:max-w-md aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 bg-cream-200 group">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Official Logo Watermark in top corner */}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-cream-300">
                        <img
                          src="/images/hisuvai_logo.png"
                          alt="Hi Suvai"
                          className="h-9 w-auto object-contain"
                        />
                      </div>

                      {/* Floating bottom label */}
                      <div className="absolute bottom-3 left-3 right-3 bg-forest-950/90 backdrop-blur-md p-3 rounded-2xl border border-gold/30 flex items-center justify-between">
                        <div>
                          <strong className="block text-xs font-serif text-gold">HISUVAI Health & Wealth</strong>
                          <span className="text-[10px] text-cream-200">100% Traditional Stone-Pounded</span>
                        </div>
                        <button
                          onClick={() => handleQuickAdd(slide)}
                          className="bg-gold hover:bg-gold-500 text-forest-900 font-bold px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shadow-xs"
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })}

        {/* Carousel Navigation Arrows (Sowmiya Foods Style) */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-90"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-90"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Carousel Dots Indicators (Sowmiya Foods Style) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-full backdrop-blur-sm border border-white/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-gold' : 'w-2.5 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 3. TRUST & BENEFIT BAR (Sowmiya Foods Style Strip) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-cream-300 shadow-soft p-4 sm:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-cream-300">
            
            <div className="flex flex-col items-center justify-center p-2">
              <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest flex items-center justify-center mb-1.5 shadow-xs">
                <Wheat className="w-5 h-5" />
              </div>
              <strong className="text-xs sm:text-sm font-bold text-gray-900">
                100% Stone-Pounded
              </strong>
              <span className="text-[11px] text-earth font-medium">
                பாரம்பரிய உரல் அரைப்பு
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 shadow-xs">
                <Sprout className="w-5 h-5" />
              </div>
              <strong className="text-xs sm:text-sm font-bold text-gray-900">
                48h Sprouted Millets
              </strong>
              <span className="text-[11px] text-earth font-medium">
                முளைகட்டிய தானியங்கள்
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-1.5 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <strong className="text-xs sm:text-sm font-bold text-gray-900">
                Free Delivery Above ₹499
              </strong>
              <span className="text-[11px] text-earth font-medium">
                அகில இந்திய இலவச டெலிவரி
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-2 pt-4 md:pt-2">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center mb-1.5 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <strong className="text-xs sm:text-sm font-bold text-gray-900">
                Zero Chemical Additives
              </strong>
              <span className="text-[11px] text-earth font-medium">
                100% கலப்படமற்ற இயற்கை சத்து
              </span>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
