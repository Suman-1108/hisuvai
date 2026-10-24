import React from 'react';
import { Link } from 'react-router-dom';
import { Wheat, Sprout, Sparkles, Gift, HeartPulse, CupSoda } from 'lucide-react';

const iconMap = {
  Wheat: Wheat,
  Sprout: Sprout,
  Sparkles: Sparkles,
  Gift: Gift,
  HeartPulse: HeartPulse,
  CupSoda: CupSoda,
};

export default function CategoryCard({ category }) {
  const IconComponent = iconMap[category.icon] || Sparkles;

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group bg-white/80 hover:bg-white rounded-2xl p-5 border border-cream-300/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="w-14 h-14 rounded-2xl bg-cream-100 border border-gold/30 flex items-center justify-center text-forest group-hover:bg-forest group-hover:text-gold transition-colors duration-300 mb-3 shadow-xs">
        <IconComponent className="w-7 h-7" />
      </div>

      <h4 className="font-serif font-bold text-base text-forest-900 group-hover:text-forest transition-colors">
        {category.name}
      </h4>

      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
        {category.description}
      </p>

      <span className="mt-3 text-[11px] font-semibold text-earth group-hover:text-forest flex items-center gap-1 transition-colors">
        Explore Collection →
      </span>
    </Link>
  );
}
