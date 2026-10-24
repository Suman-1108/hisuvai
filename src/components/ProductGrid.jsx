import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';

export default function ProductGrid({ products, title, subtitle, onResetFilter }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-cream-400 max-w-lg mx-auto my-12">
        <div className="w-16 h-16 bg-cream-200 rounded-full flex items-center justify-center mx-auto mb-4 text-forest">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-xl font-bold text-gray-800 mb-2">
          No Health Mixes Match Your Selection
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          We couldn't find any products with your current filters or search term. Try expanding your criteria or resetting filters.
        </p>
        {onResetFilter && (
          <button
            onClick={onResetFilter}
            className="bg-forest hover:bg-forest-800 text-cream px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
          >
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {(title || subtitle) && (
        <div className="mb-8">
          {title && (
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1.5 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
