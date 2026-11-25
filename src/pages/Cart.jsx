import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CHECKOUT_PATH, loginPath } from '../utils/authRedirect';
import { useLocale } from '../i18n/LocaleContext';
import { translateKnown } from '../i18n/knownMessages';
import { localizedProductName } from '../i18n/productCopy';
import LocaleLink from '../components/LocaleLink';
import useSeo from '../hooks/useSeo';
import './Cart.css';

function formatPrice(value) {
  return `฿${Number(value || 0).toLocaleString('th-TH')}`;
}

function lineAmount(item) {
  if (Number.isFinite(item.lineTotal)) return item.lineTotal;
  return Number(item.price || 0) * Number(item.quantity || 0);
}

export default function Cart() {
  const { locale, t, localize } = useLocale();
  const copy = t.cartPage;
  useSeo({ title: copy.seoTitle, noindex: true });
  const { ready: authReady, isLoggedIn } = useAuth();
  const checkoutHref = localize(
    authReady && !isLoggedIn ? loginPath(CHECKOUT_PATH) : CHECKOUT_PATH,
  );
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

  if ((hydrating || loading) && items.length === 0) {
    return (
      <main className="cart-page cart-page--empty">
        <div className="container cart-page__empty-inner">
          <p className="section-label">{copy.label}</p>
          <h1 className="cart-page__title">{copy.title}</h1>
          <p className="cart-page__empty-message">{copy.loading}</p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="cart-page cart-page--empty">
        <div className="container cart-page__empty-inner">
          <p className="section-label">{copy.label}</p>
          <h1 className="cart-page__title">{copy.title}</h1>
          <p className="cart-page__empty-message">{copy.empty}</p>
          {error ? (
            <p className="cart-page__error" role="alert">
              {translateKnown(locale, error)}
            </p>
          ) : null}
          <LocaleLink to="/products" className="btn-primary">
            {copy.shop}
          </LocaleLink>
        </div>
      </main>
    );
  }

  const displayTotal = Number(total) > 0 ? total : itemsTotal;

  return (
    <main className="cart-page">
      <header className="cart-page__hero">
        <div className="container">
          <p className="section-label">{copy.label}</p>
          <h1 className="cart-page__title">{copy.title}</h1>
          <p className="cart-page__subtitle">
            {loading ? copy.updating : copy.count(count)}
          </p>
        </div>
      </header>

      <div className="container cart-page__layout">
        {error ? (
          <p className="cart-page__error" role="alert">
            {translateKnown(locale, error)}
          </p>
        ) : null}

        <ul className="cart-page__list">
          {items.map((item) => {
            const itemName = localizedProductName(item.id, item.name, locale);
            return (
            <li key={item.key || item.id} className="cart-page__item">
              <div className="cart-page__media">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>

              <div className="cart-page__details">
                <div className="cart-page__heading">
                  <h2 className="cart-page__name">{itemName}</h2>
                </div>

                <p className="cart-page__unit">
                  {formatPrice(item.price)} / {copy.each}
                </p>

                <div className="cart-page__controls">
                  <div className="cart-page__qty">
                    <button
                      type="button"
                      aria-label={copy.decrease(itemName)}
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
                      aria-label={copy.increase(itemName)}
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
                    className="cart-page__remove"
                    disabled={loading}
                    onClick={() => {
                      void updateQuantity(item.key, 0);
                    }}
                  >
                    {copy.remove}
                  </button>

                  <p className="cart-page__line-total">
                    {formatPrice(lineAmount(item))}
                  </p>
                </div>
              </div>
            </li>
            );
          })}
        </ul>

        <aside className="cart-page__summary">
          <div className="cart-page__total-row">
            <span>{copy.total}</span>
            <strong>{formatPrice(displayTotal)}</strong>
          </div>
          <LocaleLink to={checkoutHref} className="btn-primary cart-page__checkout">
            {copy.checkout}
          </LocaleLink>
          <LocaleLink to="/products" className="btn-outline cart-page__continue">
            {copy.continue}
          </LocaleLink>
        </aside>
      </div>
    </main>
  );
}
