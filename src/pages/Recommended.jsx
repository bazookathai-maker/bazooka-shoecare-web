import { useEffect, useState } from 'react';
import { fetchStoreProducts } from '../api/woocommerce';
import { buildHomeTopPicks } from '../utils/homeCatalog';
import ShowcaseProductCard from '../components/ShowcaseProductCard';
import '../components/FeaturedProductsSection.css';
import './Recommended.css';

export default function Recommended() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const live = await fetchStoreProducts();
        if (!cancelled) {
          setProducts(buildHomeTopPicks(live, 6));
        }
      } catch {
        if (!cancelled) {
          setProducts(buildHomeTopPicks([], 6));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="recommended-page">
      <header className="recommended-page__hero">
        <div className="container recommended-page__hero-inner">
          <h1 className="recommended-page__title">TOP PRODUCT</h1>
        </div>
      </header>

      <section className="featured-products recommended-page__grid-section">
        <div className="container">
          {loading && products.length === 0 ? (
            <p className="featured-products__status" role="status">
              กำลังโหลดสินค้า...
            </p>
          ) : null}
          <ul className="featured-products__grid">
            {products.map((product) => (
              <li key={product.id}>
                <ShowcaseProductCard product={product} titleTag="h2" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
