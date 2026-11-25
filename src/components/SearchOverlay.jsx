import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { fetchStoreProducts } from '../api/woocommerce';
import { searchSiteContent } from '../utils/siteSearch';
import { useLocale } from '../i18n/LocaleContext';
import { localizeStoreProduct } from '../i18n/productCopy';
import LocaleLink from './LocaleLink';
import './SearchOverlay.css';

function formatPrice(price) {
  return `฿${Number(price || 0).toLocaleString('th-TH')}`;
}

export default function SearchOverlay({ open, onClose }) {
  const { locale, t } = useLocale();
  const inputId = useId();
  const inputRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [catalog, setCatalog] = useState([]);

  const localizedCatalog = useMemo(
    () => catalog.map((product) => localizeStoreProduct(product, locale)),
    [catalog, locale],
  );
  const results = useMemo(
    () => searchSiteContent(query, { productsCatalog: localizedCatalog, locale }),
    [query, localizedCatalog, locale],
  );
  const hasQuery = Boolean(query);
  const hasResults = results.products.length > 0 || results.articles.length > 0;

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    fetchStoreProducts()
      .then((products) => {
        if (!cancelled) setCatalog(products);
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setDraft('');
    setQuery('');

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    setQuery(draft.trim());
  };

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label={t.search.label}>
      <button
        type="button"
        className="search-overlay__backdrop"
        aria-label={t.search.close}
        onClick={onClose}
      />

      <div className="search-overlay__panel">
        <div className="search-overlay__top">
          <form className="search-overlay__form" onSubmit={handleSubmit} role="search">
            <label htmlFor={inputId} className="visually-hidden">
              {t.search.field}
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              className="search-overlay__input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={t.search.placeholder}
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="submit" className="search-overlay__submit">
              {t.search.submit}
            </button>
          </form>

          <button
            type="button"
            className="search-overlay__close"
            aria-label={t.search.dismiss}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="search-overlay__body">
          {!hasQuery ? (
            <p className="search-overlay__hint">{t.search.hint}</p>
          ) : null}

          {hasQuery && !hasResults ? (
            <div className="search-overlay__empty">
              <p>{t.search.empty}</p>
              <LocaleLink to="/products" className="search-overlay__cta" onClick={onClose}>
                {t.search.viewAll}
              </LocaleLink>
            </div>
          ) : null}

          {hasQuery && results.products.length > 0 ? (
            <section className="search-overlay__section" aria-label={t.search.products}>
              <h2 className="search-overlay__section-title">{t.search.products}</h2>
              <ul className="search-overlay__list">
                {results.products.map((product) => (
                  <li key={product.id}>
                    <LocaleLink
                      to={product.href}
                      className="search-result search-result--product"
                      onClick={onClose}
                    >
                      <span className="search-result__media">
                        <img src={product.image} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="search-result__content">
                        <span className="search-result__title">{product.name}</span>
                        <span className="search-result__price">
                          {formatPrice(product.price)}
                        </span>
                      </span>
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hasQuery && results.articles.length > 0 ? (
            <section className="search-overlay__section" aria-label={t.search.articles}>
              <h2 className="search-overlay__section-title">{t.search.articles}</h2>
              <ul className="search-overlay__list">
                {results.articles.map((article) => (
                  <li key={article.id}>
                    <LocaleLink
                      to={article.href}
                      className="search-result search-result--article"
                      onClick={onClose}
                    >
                      <span className="search-result__media">
                        <img src={article.image} alt="" loading="lazy" decoding="async" />
                      </span>
                      <span className="search-result__content">
                        <span className="search-result__meta">{article.category}</span>
                        <span className="search-result__title">{article.title}</span>
                      </span>
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
