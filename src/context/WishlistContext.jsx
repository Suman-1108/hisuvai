import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('hisuvai_wishlist');
      return saved ? JSON.parse(saved) : ['hisuvai-24-grain-mix', 'sprouted-ragi-almond-mix'];
    } catch {
      return ['hisuvai-24-grain-mix', 'sprouted-ragi-almond-mix'];
    }
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('hisuvai_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  const toggleWishlist = (product) => {
    const productId = typeof product === 'object' ? product.id : product;
    const productName = typeof product === 'object' ? product.name : 'Product';

    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast(`Removed "${productName}" from your wishlist`, 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast(`Added "${productName}" to your wishlist!`, 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
