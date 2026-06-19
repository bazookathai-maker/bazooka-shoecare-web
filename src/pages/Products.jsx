import { useMemo, useState } from 'react';
import { allProducts, PRODUCT_FILTER_TABS } from '../data/products';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import './Products.css';

function getFilterCount(filterId) {
  if (filterId === 'all') return allProducts.length;
  return allProducts.filter((p) => p.filterCategory === filterId).length;
}

export default function Products() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return allProducts;
    return allProducts.filter(
      (product) => product.filterCategory === activeFilter,
    );
  }, [activeFilter]);

  return (
    <main className="products-page">
      <header className="products-page__intro">
        <div className="container">
          <ScrollReveal className="products-page__intro-inner">
            <p className="section-label">คอลเลกชัน</p>
            <h1 className="section-title">ร้านดูแลรองเท้า</h1>
            <p className="products-page__desc">
              {allProducts.length} สูตรสำหรับทุกวัสดุและทุกโอกาส — ตั้งแต่ฟื้นฟูด่วน
              จนถึงพิธีการปกป้องครบวงจร คัดสรร ไม่รก
            </p>
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
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`products-page__filter-btn ${
                    isActive ? 'products-page__filter-btn--active' : ''
                  }`}
                  onClick={() => setActiveFilter(tab.id)}
                >
                  {tab.label} {count}
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
