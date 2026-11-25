import { useEffect, useMemo, useState } from 'react';
import { fetchStoreProducts } from '../api/woocommerce';
import { PRODUCT_FILTER_TABS, matchesProductFilter } from '../data/products';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import { LISTING_HIDDEN_PRODUCT_IDS } from '../data/hiddenProducts';
import useSeo from '../hooks/useSeo';
import { INDEX_ENGLISH } from '../utils/seo';
import { useLocale } from '../i18n/LocaleContext';
import { localizeStoreProduct } from '../i18n/productCopy';
import './Products.css';

/**
 * Pairs of product IDs whose positions are swapped on /products.
 * 140 = Bazooka Cleaner 2, 128 = BAZOOKA SPRAY single bottle,
 * 134 = Refresh Spray, 68 = BAZOOKA CLEANER with free cloth and brush.
 */
const PRODUCTS_PAGE_SWAPPED_IDS = [
  ['140', '128'],
  ['134', '68'],
];

function applyProductSwaps(list) {
  const result = [...list];
  for (const [a, b] of PRODUCTS_PAGE_SWAPPED_IDS) {
    const i = result.findIndex((p) => String(p.id) === a);
    const j = result.findIndex((p) => String(p.id) === b);
    if (i !== -1 && j !== -1) {
      [result[i], result[j]] = [result[j], result[i]];
    }
  }
  return result;
}

export default function Products() {
  const { locale, t } = useLocale();
  const [activeFilter, setActiveFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useSeo({
    title: t.products.seoTitle,
    description: t.products.seoDescription,
    path: locale === 'en' ? '/en/products' : '/products',
    noindex: locale === 'en' && !INDEX_ENGLISH,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchStoreProducts();
        if (!cancelled) {
          setProducts(
            applyProductSwaps(
              data.filter(
                (product) => !LISTING_HIDDEN_PRODUCT_IDS.has(String(product.id)),
              ),
            ),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setProducts([]);
          setError(err instanceof Error && err.message ? err.message : 'load');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const localizedProducts = useMemo(
    () => products.map((product) => localizeStoreProduct(product, locale)),
    [products, locale],
  );

  const filteredProducts = useMemo(() => {
    return localizedProducts.filter((product) =>
      matchesProductFilter(product, activeFilter),
    );
  }, [localizedProducts, activeFilter]);

  const getFilterCount = (filterId) =>
    localizedProducts.filter((product) => matchesProductFilter(product, filterId))
      .length;

  return (
    <main className="products-page">
      <header className="products-page__intro">
        <div className="container">
          <ScrollReveal className="products-page__intro-inner">
            <p className="section-label">{t.products.label}</p>
            <h1 className="section-title">{t.products.title}</h1>
          </ScrollReveal>
        </div>
      </header>

      <section className="products-page__grid-section">
        <div className="container">
          <div
            className="products-page__filters"
            role="tablist"
            aria-label={t.products.filters}
          >
            {PRODUCT_FILTER_TABS.map((tab) => {
              const count = loading ? 0 : getFilterCount(tab.id);
              const isActive = activeFilter === tab.id;
              const isBestsellerTab = tab.id === 'bestsellers';
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`products-page__filter-btn${
                    isActive ? ' products-page__filter-btn--active' : ''
                  }${isBestsellerTab ? ' products-page__filter-btn--bestseller' : ''}`}
                  onClick={() => setActiveFilter(tab.id)}
                  disabled={loading}
                >
                  {isBestsellerTab ? (
                    <>
                      <span className="products-page__filter-hot-badge">{t.catalog.bestseller}</span>
                      <span>{t.products.tabs[tab.id] || tab.label}</span>
                      <span className="products-page__filter-count">{count}</span>
                    </>
                  ) : (
                    <>
                      {t.products.tabs[tab.id] || tab.label} {count}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="products-page__status" role="status">
              {t.products.loading}
            </p>
          ) : null}

          {error ? (
            <p className="products-page__status products-page__status--error" role="alert">
              {error === 'load' ? t.products.loadError : error}
            </p>
          ) : null}

          {!loading && !error ? (
            <div
              key={activeFilter}
              className="products-page__grid products-page__grid--fade-in"
            >
              {filteredProducts.length === 0 ? (
                <p className="products-page__status">{t.products.empty}</p>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="compact"
                    linkToDetail
                  />
                ))
              )}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
