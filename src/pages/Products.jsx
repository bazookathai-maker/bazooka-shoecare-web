import { useEffect, useMemo, useState } from 'react';
import { fetchStoreProducts } from '../api/woocommerce';
import { PRODUCT_FILTER_TABS, matchesProductFilter } from '../data/products';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import { LISTING_HIDDEN_PRODUCT_IDS } from '../data/hiddenProducts';
import useSeo from '../hooks/useSeo';
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useSeo({
    title: 'สินค้าทั้งหมด',
    description:
      'สินค้าทั้งหมดจาก BAZOOKA น้ำยาทำความสะอาดรองเท้า สเปรย์กันน้ำ สเปรย์ดับกลิ่น แปรง และชุดดูแลรองเท้าครบเซต',
    path: '/products',
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
          setError(
            err instanceof Error
              ? err.message
              : 'ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่อีกครั้ง',
          );
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

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      matchesProductFilter(product, activeFilter),
    );
  }, [products, activeFilter]);

  const getFilterCount = (filterId) =>
    products.filter((product) => matchesProductFilter(product, filterId))
      .length;

  return (
    <main className="products-page">
      <header className="products-page__intro">
        <div className="container">
          <ScrollReveal className="products-page__intro-inner">
            <p className="section-label">COLLECTION</p>
            <h1 className="section-title">BAZOOKA STORE</h1>
          </ScrollReveal>
        </div>
      </header>

      <section className="products-page__grid-section">
        <div className="container">
          <div
            className="products-page__filters"
            role="tablist"
            aria-label="กรองตามหมวดหมู่สินค้า"
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
                      <span className="products-page__filter-hot-badge">ขายดี</span>
                      <span>{tab.label}</span>
                      <span className="products-page__filter-count">{count}</span>
                    </>
                  ) : (
                    <>
                      {tab.label} {count}
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="products-page__status" role="status">
              กำลังโหลดสินค้า...
            </p>
          ) : null}

          {error ? (
            <p className="products-page__status products-page__status--error" role="alert">
              {error}
            </p>
          ) : null}

          {!loading && !error ? (
            <div
              key={activeFilter}
              className="products-page__grid products-page__grid--fade-in"
            >
              {filteredProducts.length === 0 ? (
                <p className="products-page__status">ไม่พบสินค้าในหมวดนี้</p>
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
