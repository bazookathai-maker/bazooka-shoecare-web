import { useEffect, useState } from 'react';
import LocaleLink from './LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { fetchStoreProducts } from '../api/woocommerce';
import { buildHomeTopPicks } from '../utils/homeCatalog';
import ShowcaseProductCard from './ShowcaseProductCard';
import './FeaturedProductsSection.css';

export default function FeaturedProductsSection({ showViewAll = true }) {
  const { t } = useLocale();
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
    <section className="featured-products" id="featured-products">
      <div className="container">
        <header className="featured-products__header">
          <h2 className="featured-products__title">{t.featured.title}</h2>
          <p className="featured-products__subtitle">{t.featured.subtitle}</p>
        </header>

        {loading && products.length === 0 ? (
          <p className="featured-products__status" role="status">
            {t.featured.loading}
          </p>
        ) : null}

        <ul className="featured-products__grid">
          {products.map((product) => (
            <li key={product.id}>
              <ShowcaseProductCard product={product} />
            </li>
          ))}
        </ul>

        {showViewAll && (
          <div className="featured-products__cta">
            <LocaleLink to="/products" className="btn-outline">
              {t.featured.viewAll}
            </LocaleLink>
          </div>
        )}
      </div>
    </section>
  );
}
