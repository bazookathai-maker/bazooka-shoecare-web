import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { flyToCart } from '../utils/flyToCart';

const CartContext = createContext(null);

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    price: product.price,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isBouncing, setIsBouncing] = useState(false);
  const cartIconRef = useRef(null);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const triggerBounce = useCallback(() => {
    setIsBouncing(true);
    window.setTimeout(() => setIsBouncing(false), 550);
  }, []);

  const addToCart = useCallback(
    async (product, imageElement) => {
      const line = normalizeProduct(product);

      setItems((prev) => {
        const existing = prev.find((item) => item.id === line.id);
        if (existing) {
          return prev.map((item) =>
            item.id === line.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        }
        return [...prev, { ...line, quantity: 1 }];
      });

      if (!imageElement) {
        triggerBounce();
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      if (!prefersReducedMotion) {
        const fromRect = imageElement.getBoundingClientRect();
        const cartEl = cartIconRef.current;

        if (cartEl) {
          const toRect = cartEl.getBoundingClientRect();
          await flyToCart(product.image, fromRect, toRect);
        }
      }

      triggerBounce();
    },
    [triggerBounce],
  );

  const updateQuantity = useCallback((id, quantity) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      isBouncing,
      cartIconRef,
      addToCart,
      updateQuantity,
      clearCart,
    }),
    [items, count, total, isBouncing, addToCart, updateQuantity, clearCart],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
