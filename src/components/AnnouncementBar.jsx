import React from 'react';
import { Phone, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AnnouncementBar() {
  return (
    <div className="bg-forest-900 text-cream-100 text-xs py-2 px-4 border-b border-forest-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Left: Contact Phone */}
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-gold" />
          <a href="tel:+919876543210" className="hover:text-gold transition-colors font-medium">
            +91 98765 43210
          </a>
          <span className="hidden sm:inline text-forest-600">|</span>
          <span className="hidden sm:inline text-cream-200">Stone-Pounded Natural Nutrition</span>
        </div>

        {/* Center: Highlight Promotion */}
        <div className="flex items-center gap-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-gold animate-soft-pulse shrink-0" />
          <span className="font-semibold text-gold tracking-wide">FESTIVE WELLNESS SALE:</span>
          <span>Enjoy 15% Off with code <strong className="text-white bg-forest-800 px-1.5 py-0.5 rounded border border-gold/30">FESTIVE15</strong></span>
          <Link to="/offers" className="underline hover:text-gold ml-1 font-semibold text-cream">
            Explore Deals →
          </Link>
        </div>

        {/* Right: Shipping & Quality Badges */}
        <div className="hidden lg:flex items-center gap-4 text-cream-200">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-gold" />
            <span>Free Shipping Above ₹499</span>
          </div>
          <span className="text-forest-600">|</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>100% Traditional Stone-Ground</span>
          </div>
        </div>
      </div>
    </div>
  );
}
