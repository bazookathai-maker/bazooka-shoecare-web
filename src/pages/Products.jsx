import { useMemo, useState } from 'react';
import { allProducts, PRODUCT_FILTER_TABS, matchesProductFilter } from '../data/products';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import './Products.css';

function getFilterCount(filterId) {
  return allProducts.filter((product) => matchesProductFilter(product, filterId)).length;
}

export default function Products() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => matchesProductFilter(product, activeFilter));
  }, [activeFilter]);

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
              const count = getFilterCount(tab.id);
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

          <div
            key={activeFilter}
            className="products-page__grid products-page__grid--fade-in"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="compact"
                linkToDetail={false}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
