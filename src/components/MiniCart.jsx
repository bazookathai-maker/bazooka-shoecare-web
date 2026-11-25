import { useEffect, useId, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CHECKOUT_PATH, loginPath } from '../utils/authRedirect';
import { useLocale } from '../i18n/LocaleContext';
import { localizedProductName } from '../i18n/productCopy';
import LocaleLink from './LocaleLink';
import './MiniCart.css';

function formatPrice(value) {
  return `฿${Number(value || 0).toLocaleString('th-TH')}`;
}

function lineAmount(item) {
  if (Number.isFinite(item.lineTotal)) return item.lineTotal;
  return Number(item.price || 0) * Number(item.quantity || 0);
}

export default function MiniCart({ open, onClose }) {
  const { locale, t } = useLocale();
  const titleId = useId();
  const panelRef = useRef(null);
  const { ready: authReady, isLoggedIn } = useAuth();
  const checkoutHref =
    authReady && !isLoggedIn ? loginPath(CHECKOUT_PATH) : CHECKOUT_PATH;
  const {
    items,
    count,
    itemsTotal,
    total,
    loading,
    hydrating,
    error,
    updateQuantity,
  } = useCart();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const displayTotal = Number(total) > 0 ? total : itemsTotal;

  return (
    <div className="mini-cart" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button
        type="button"
        className="mini-cart__backdrop"
        aria-label={t.cart.close}
        onClick={onClose}
      />

      <div
        className="mini-cart__panel"
        ref={panelRef}
        tabIndex={-1}
      >
        <header className="mini-cart__header">
          <h2 id={titleId} className="mini-cart__title">
            {t.cart.title}
            {count > 0 ? ` (${count})` : ''}
          </h2>
          <button
            type="button"
            className="mini-cart__close"
            aria-label={t.search.dismiss}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {error ? (
          <p className="mini-cart__error" role="alert">
            {error}
          </p>
        ) : null}

        {(hydrating || loading) && items.length === 0 ? (
          <p className="mini-cart__status" role="status">
            {t.cart.loading}
          </p>
        ) : null}

        {!hydrating && !loading && items.length === 0 ? (
          <div className="mini-cart__empty">
            <p>{t.cart.empty}</p>
            <LocaleLink to="/products" className="btn-primary" onClick={onClose}>
              {t.cart.shop}
            </LocaleLink>
          </div>
        ) : null}

        {items.length > 0 ? (
          <>
            <ul className="mini-cart__list">
              {items.map((item) => {
                const itemName = localizedProductName(item.id, item.name, locale);
                return (
                <li key={item.key || item.id} className="mini-cart__item">
                  <div className="mini-cart__media">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </div>
                  <div className="mini-cart__details">
                    <p className="mini-cart__name">{itemName}</p>
                    <p className="mini-cart__meta">{formatPrice(item.price)}</p>
                    <div className="mini-cart__row">
                      <div className="mini-cart__qty">
                        <button
                          type="button"
                          aria-label={t.cart.decrease(itemName)}
                          disabled={loading}
                          onClick={() => {
                            void updateQuantity(item.key, item.quantity - 1);
                          }}
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={t.cart.increase(itemName)}
                          disabled={loading}
                          onClick={() => {
                            void updateQuantity(item.key, item.quantity + 1);
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="mini-cart__remove"
                        disabled={loading}
                        onClick={() => {
                          void updateQuantity(item.key, 0);
                        }}
                      >
                        {t.cart.remove}
                      </button>
                    </div>
                    <p className="mini-cart__line">
                      {formatPrice(lineAmount(item))}
                    </p>
                  </div>
                </li>
                );
              })}
            </ul>

            <footer className="mini-cart__footer">
              <div className="mini-cart__total">
                <span>{t.cart.total}</span>
                <strong>{formatPrice(displayTotal)}</strong>
              </div>
              <LocaleLink
                to="/cart"
                className="btn-outline mini-cart__link"
                onClick={onClose}
              >
                {t.cart.view}
              </LocaleLink>
              <LocaleLink
                to={checkoutHref}
                className="btn-primary mini-cart__link"
                onClick={onClose}
              >
                {t.cart.checkout}
              </LocaleLink>
            </footer>
          </>
        ) : null}
      </div>
    </div>
  );
}
