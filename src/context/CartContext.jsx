import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  addCartItem,
  clearCartItems,
  createEmptyCartState,
  fetchCart,
  removeCartItem,
  resetCartSession,
  updateCartItem,
} from '../api/woocommerce';
import { flyToCart } from '../utils/flyToCart';

const CartContext = createContext(null);

function findCartLine(items, idOrKey) {
  const needle = String(idOrKey ?? '');
  if (!needle) return null;
  return (
    items.find((item) => item.key && String(item.key) === needle) ||
    items.find((item) => String(item.id) === needle) ||
    null
  );
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [shippingTotal, setShippingTotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [billingAddress, setBillingAddress] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [hydrating, setHydrating] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [isBouncing, setIsBouncing] = useState(false);
  const cartIconRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const loading = hydrating || pending;

  const applyCart = useCallback((cart) => {
    const nextItems = cart?.items ?? [];
    setItems(nextItems);
    setCount(cart?.count ?? 0);
    setItemsTotal(cart?.itemsTotal ?? 0);
    setShippingTotal(cart?.shippingTotal ?? 0);
    setDiscountTotal(cart?.discountTotal ?? 0);
    setTotal(cart?.total ?? 0);
    setBillingAddress(cart?.billingAddress ?? null);
    setShippingAddress(cart?.shippingAddress ?? null);
    setPaymentMethods(
      Array.isArray(cart?.paymentMethods) ? cart.paymentMethods : [],
    );
    itemsRef.current = nextItems;
  }, []);

  const syncCart = useCallback(
    (cart) => {
      if (cart) applyCart(cart);
      return cart;
    },
    [applyCart],
  );

  const triggerBounce = useCallback(() => {
    setIsBouncing(true);
    window.setTimeout(() => setIsBouncing(false), 550);
  }, []);

  const refreshCart = useCallback(async () => {
    setPending(true);
    setError('');
    try {
      const cart = await fetchCart();
      applyCart(cart);
      return cart;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'ไม่สามารถโหลดตะกร้าได้';
      setError(message);
      throw err;
    } finally {
      setPending(false);
      setHydrating(false);
    }
  }, [applyCart]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapCart() {
      setHydrating(true);
      setError('');
      try {
        const cart = await fetchCart();
        if (!cancelled) {
          applyCart(cart);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'ไม่สามารถโหลดตะกร้าได้',
          );
        }
      } finally {
        if (!cancelled) {
          setHydrating(false);
        }
      }
    }

    bootstrapCart();

    return () => {
      cancelled = true;
    };
  }, [applyCart]);

  const addToCart = useCallback(
    async (product, imageElement) => {
      const productId = Number(product?.id);
      if (!Number.isFinite(productId)) {
        const message = 'สินค้านี้ยังไม่พร้อมเพิ่มลงตะกร้า';
        setError(message);
        throw new Error(message);
      }

      setPending(true);
      setError('');

      try {
        // Animation is decorative — never block / fail the Store API add.
        if (imageElement) {
          const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
          ).matches;

          if (!prefersReducedMotion) {
            const cartEl = cartIconRef.current;
            if (cartEl && product?.image) {
              try {
                const fromRect = imageElement.getBoundingClientRect();
                const toRect = cartEl.getBoundingClientRect();
                void flyToCart(product.image, fromRect, toRect);
              } catch {
                // ignore animation errors
              }
            }
          }
        }

        const cart = await addCartItem(productId, 1);
        applyCart(cart);
        triggerBounce();
        return cart;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'เพิ่มสินค้าลงตะกร้าไม่สำเร็จ';
        setError(message);
        throw err;
      } finally {
        setPending(false);
      }
    },
    [applyCart, triggerBounce],
  );

  const updateQuantity = useCallback(
    async (idOrKey, quantity) => {
      const line = findCartLine(itemsRef.current, idOrKey);
      if (!line?.key) {
        const message = 'ไม่พบสินค้าในตะกร้า';
        setError(message);
        throw new Error(message);
      }

      setPending(true);
      setError('');

      try {
        const nextQuantity = Number(quantity);
        const cart =
          nextQuantity < 1
            ? await removeCartItem(line.key)
            : await updateCartItem(line.key, nextQuantity);
        applyCart(cart);
        return cart;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'อัปเดตจำนวนสินค้าไม่สำเร็จ';
        setError(message);
        throw err;
      } finally {
        setPending(false);
      }
    },
    [applyCart],
  );

  const clearCart = useCallback(async () => {
    setPending(true);
    setError('');

    try {
      const cart = await clearCartItems(itemsRef.current);
      applyCart(cart);
      return cart;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'ล้างตะกร้าไม่สำเร็จ';
      setError(message);
      throw err;
    } finally {
      setPending(false);
    }
  }, [applyCart]);

  /** After a successful Store API checkout — clear session without remove-item calls. */
  const resetCartAfterOrder = useCallback(() => {
    resetCartSession();
    applyCart(createEmptyCartState());
  }, [applyCart]);

  const removeItem = useCallback(
    async (idOrKey) => updateQuantity(idOrKey, 0),
    [updateQuantity],
  );

  const value = useMemo(
    () => ({
      items,
      count,
      itemsTotal,
      shippingTotal,
      discountTotal,
      total,
      billingAddress,
      shippingAddress,
      paymentMethods,
      loading,
      hydrating,
      pending,
      error,
      isBouncing,
      cartIconRef,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      resetCartAfterOrder,
      refreshCart,
      syncCart,
    }),
    [
      items,
      count,
      itemsTotal,
      shippingTotal,
      discountTotal,
      total,
      billingAddress,
      shippingAddress,
      paymentMethods,
      loading,
      hydrating,
      pending,
      error,
      isBouncing,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      resetCartAfterOrder,
      refreshCart,
      syncCart,
    ],
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
