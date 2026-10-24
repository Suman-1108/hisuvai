import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('hisuvai_cart');
      if (saved) return JSON.parse(saved);
      // Pre-populate with 2 default items matching the mockup preview
      return [
        {
          id: 'hisuvai-24-grain-mix',
          name: 'Traditional 24-Ingredient Millet Health Mix',
          price: 349,
          originalPrice: 399,
          size: '500g Pouch',
          image: '/images/product_24grain.jpg',
          quantity: 1
        },
        {
          id: 'festive-wellness-heritage-hamper',
          name: 'Festive Wellness Heritage Hamper',
          price: 899,
          originalPrice: 1099,
          size: '1.5kg Collector Box (3x 500g)',
          image: '/images/product_hamper.jpg',
          quantity: 1
        }
      ];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState('FESTIVE15');
  const { addToast } = useToast();

  const FREE_SHIPPING_THRESHOLD = 499;

  useEffect(() => {
    try {
      localStorage.setItem('hisuvai_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    const size = selectedSize || product.defaultSize || (product.sizes && product.sizes[0]) || 'Standard Pack';
    
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            size: size,
            image: product.image,
            quantity: quantity
          }
        ];
      }
    });

    addToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.size === size)));
    addToast('Item removed from cart', 'info');
  };

  const updateQuantity = (productId, size, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'HISUVAI25' || clean === 'FESTIVE15' || clean === 'FAMILYCOMBO') {
      setAppliedCoupon(clean);
      addToast(`Coupon "${clean}" applied successfully! 🎉`, 'success');
      return { success: true };
    } else {
      addToast('Invalid coupon code. Try "HISUVAI25" or "FESTIVE15"', 'error');
      return { success: false, message: 'Invalid coupon' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon === 'HISUVAI25') {
    discountAmount = Math.round(subtotal * 0.25);
  } else if (appliedCoupon === 'FESTIVE15') {
    discountAmount = Math.round(subtotal * 0.15);
  } else if (appliedCoupon === 'FAMILYCOMBO') {
    discountAmount = subtotal > 700 ? 250 : Math.min(subtotal, 100);
  }

  const shippingFee = subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 50;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discountAmount,
        shippingFee,
        grandTotal,
        itemsCount,
        FREE_SHIPPING_THRESHOLD,
        freeShippingProgress,
        amountNeededForFreeShipping
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
