import { useEffect, useState } from 'react';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { localizedProductName } from '../i18n/productCopy';
import ScrollReveal from '../components/ScrollReveal';
import { fetchStoreProducts } from '../api/woocommerce';
import { getRecommendedProducts } from '../utils/siteSearch';
import useSeo from '../hooks/useSeo';
import './NotFound.css';

function formatPrice(price) {
  return `฿${Number(price || 0).toLocaleString('th-TH')}`;
}

export default function NotFound() {
  const { locale, t } = useLocale();
  const copy = t.notFound;
  useSeo({ title: copy.title, noindex: true });
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchStoreProducts()
      .then((products) => {
        if (!cancelled) {
          setRecommended(getRecommendedProducts(4, products));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecommended(getRecommendedProducts(4, []));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="not-found-page">
      <section className="not-found-page__hero">
        <div className="container">
          <ScrollReveal className="not-found-page__hero-inner">
            <p className="not-found-page__code">404</p>
            <h1 className="not-found-page__title">{copy.title}</h1>
            <p className="not-found-page__subtitle">{copy.subtitle}</p>
            <div className="not-found-page__actions">
              <LocaleLink to="/" className="not-found-page__btn not-found-page__btn--primary">
                {copy.home}
              </LocaleLink>
              <LocaleLink
                to="/products"
                className="not-found-page__btn not-found-page__btn--secondary"
              >
                {copy.products}
              </LocaleLink>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {recommended.length > 0 ? (
        <section className="not-found-page__recommend" aria-label={copy.recommended}>
          <div className="container">
            <h2 className="not-found-page__recommend-title">{copy.recommended}</h2>
            <ul className="not-found-page__grid">
              {recommended.map((product) => (
                <li key={product.id}>
                  <article className="not-found-card">
                    <LocaleLink to={product.href} className="not-found-card__link">
                      <span className="not-found-card__media">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </span>
                      <h3 className="not-found-card__name">
                        {localizedProductName(product.id, product.name, locale)}
                      </h3>
                      <p className="not-found-card__price">
                        {formatPrice(product.price)}
                      </p>
                    </LocaleLink>
                    <LocaleLink to={product.href} className="not-found-card__btn">
                      {copy.buy}
                    </LocaleLink>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
