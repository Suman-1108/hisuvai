import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Sparkles, ChevronRight, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { cart, setIsCartOpen, itemsCount, grandTotal } = useCart();
  const { wishlistCount, setIsWishlistOpen } = useWishlist();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Offers', path: '/offers', isSpecial: true },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7EE]/95 backdrop-blur-md border-b border-cream-300/80 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-forest hover:bg-forest/10 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group py-1">
            <img
              src="/images/hisuvai_logo.png"
              alt="Hi Suvai — Health & Wealth"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-3xl font-extrabold tracking-wider text-forest-900 group-hover:text-forest transition-colors">
                HISUVAI
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.22em] font-bold text-earth uppercase -mt-1">
                Health & Wealth
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-forest text-cream shadow-sm'
                      : 'text-gray-700 hover:text-forest hover:bg-forest/5'
                  }`
                }
              >
                {link.name}
                {link.isSpecial && (
                  <span className="bg-gold-500 text-forest-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Sale
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex relative flex-1 max-w-xs xl:max-w-sm"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder="Search 24-Ingredient, Ragi..."
              className="w-full bg-cream-100 text-gray-800 placeholder-gray-500 text-xs sm:text-sm pl-10 pr-9 py-2.5 rounded-full border border-forest/20 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all"
            />
            <Search className="w-4 h-4 text-forest/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </form>

          {/* Actions: Wishlist, Cart & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2.5 rounded-full text-forest hover:bg-forest/10 transition-colors"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5 text-forest" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-earth text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FAF7EE] shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 bg-forest hover:bg-forest-700 text-cream px-3.5 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 group"
              title="View Shopping Cart"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-gold group-hover:scale-110 transition-transform" />
                {itemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-forest-900 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {itemsCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left text-xs leading-tight">
                <span className="text-[10px] text-cream-200 uppercase tracking-wider">Cart</span>
                <span className="font-bold text-gold">₹{grandTotal}</span>
              </div>
            </button>

            {/* User Profile Avatar */}
            <div className="hidden sm:flex items-center pl-1">
              <div className="w-9 h-9 rounded-full bg-cream-200 border border-forest/30 flex items-center justify-center text-forest cursor-pointer hover:border-forest transition-colors">
                <User className="w-4 h-4 text-forest" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Health Mix, Sprouted Millets..."
              className="w-full bg-cream-100 text-gray-800 placeholder-gray-500 text-xs pl-9 pr-8 py-2 rounded-full border border-forest/20 focus:outline-none focus:ring-1 focus:ring-forest"
            />
            <Search className="w-4 h-4 text-forest/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="w-4/5 max-w-sm bg-[#FAF7EE] h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-forest/10">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/hisuvai_logo.png"
                  alt="Hi Suvai"
                  className="h-10 w-auto object-contain"
                />
                <span className="font-serif text-xl font-bold text-forest-900">HISUVAI</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-gray-500 hover:text-forest"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Links */}
            <div className="py-6 flex flex-col space-y-2 flex-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-forest text-cream'
                        : 'text-gray-800 hover:bg-forest/10 hover:text-forest'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    {link.name}
                    {link.isSpecial && (
                      <span className="bg-gold text-forest text-xs font-bold px-2 py-0.5 rounded-full">
                        Sale
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </NavLink>
              ))}
            </div>

            {/* Drawer Bottom Contact Info */}
            <div className="pt-6 border-t border-forest/10 text-xs text-gray-600 space-y-2">
              <p className="font-bold text-forest">Customer Support</p>
              <p>📞 +91 98765 43210</p>
              <p>✉️ care@hisuvai.com</p>
              <div className="pt-2">
                <Link
                  to="/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gold hover:bg-gold-500 text-forest-900 text-center py-2.5 rounded-lg font-bold block shadow-xs"
                >
                  View Grand Festive Sale →
                </Link>
              </div>
            </div>
          </div>

          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
