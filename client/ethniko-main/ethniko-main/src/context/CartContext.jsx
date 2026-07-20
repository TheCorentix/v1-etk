import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('etniko_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState(() => {
    const saved = localStorage.getItem('etniko_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  const [giftWrap, setGiftWrap] = useState(() => {
    const saved = localStorage.getItem('etniko_gift_wrap');
    return saved ? JSON.parse(saved) : false;
  });

  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    localStorage.setItem('etniko_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('etniko_coupon', JSON.stringify(coupon));
  }, [coupon]);

  useEffect(() => {
    localStorage.setItem('etniko_gift_wrap', JSON.stringify(giftWrap));
  }, [giftWrap]);

  const addToCart = (product, size = "M", qty = 1) => {
    setCart((prevCart) => {
      const idx = prevCart.findIndex(item => item.id === product.id && item.size === size);
      if (idx > -1) {
        const updated = [...prevCart];
        updated[idx].qty += qty;
        return updated;
      }
      return [...prevCart, {
        id: product.id,
        slug: product.slug,
        name: product.name,
        designer: product.designer,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.images[0],
        size,
        qty
      }];
    });
  };

  const removeFromCart = (productId, size) => {
    setCart((prevCart) => prevCart.filter(item => !(item.id === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prevCart) => {
      const idx = prevCart.findIndex(item => item.id === productId && item.size === size);
      if (idx > -1) {
        const updated = [...prevCart];
        updated[idx].qty = qty;
        return updated;
      }
      return prevCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setGiftWrap(false);
  };

  const applyCouponCode = async (code) => {
    setCouponError(null);
    try {
      const res = await cartService.validateCoupon(code);
      if (res.valid) {
        setCoupon({
          code: code.trim().toUpperCase(),
          discountPercent: res.discountPercent,
          description: res.description
        });
        return true;
      } else {
        setCouponError(res.description);
        return false;
      }
    } catch (err) {
      setCouponError("Could not validate coupon. Try again.");
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  // Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const activePrice = item.discountPrice || item.price;
      return sum + (activePrice * item.qty);
    }, 0);
  }, [cart]);

  const cartDiscount = useMemo(() => {
    if (!coupon) return 0;
    return Math.round((cartSubtotal * coupon.discountPercent) / 100);
  }, [cartSubtotal, coupon]);

  const giftWrapFee = useMemo(() => {
    return giftWrap ? 250 : 0;
  }, [giftWrap]);

  const cartShipping = 0; // ETNIKO offers free premium delivery across all items

  const cartTotal = useMemo(() => {
    return cartSubtotal - cartDiscount + giftWrapFee + cartShipping;
  }, [cartSubtotal, cartDiscount, giftWrapFee, cartShipping]);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      coupon,
      couponError,
      applyCouponCode,
      removeCoupon,
      giftWrap,
      setGiftWrap,
      cartSubtotal,
      cartDiscount,
      cartShipping,
      giftWrapFee,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
