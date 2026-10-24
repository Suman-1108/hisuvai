import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import ProductModal from './components/ProductModal';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Products from './pages/Products';
import Offers from './pages/Offers';
import About from './pages/About';
import Contact from './pages/Contact';
import ProductDetail from './pages/ProductDetail';

import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { QuickViewProvider } from './context/QuickViewContext';

export default function App() {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <QuickViewProvider>
            <BrowserRouter>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen bg-[#FAF7EE] text-gray-800">
                
                {/* 1. Promotional Announcement Bar */}
                <AnnouncementBar />

                {/* 2. Responsive Brand Navbar */}
                <Navbar />

                {/* 3. Main Routed Pages */}
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/offers" element={<Offers />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>

                {/* 4. Unified Reusable Footer */}
                <Footer />

                {/* 5. Drawers & Modals */}
                <CartDrawer />
                <WishlistDrawer />
                <ProductModal />

              </div>
            </BrowserRouter>
          </QuickViewProvider>
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}
