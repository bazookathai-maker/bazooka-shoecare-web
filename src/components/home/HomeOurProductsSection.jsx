import { useEffect, useState } from 'react';
import ScrollReveal from '../ScrollReveal';
import { useLocale } from '../../i18n/LocaleContext';
import LocaleLink from '../LocaleLink';
import {
  buildHomeOurProducts,
  getCachedStoreProducts,
} from '../../utils/homeCatalog';
import './HomeOurProductsSection.css';

const productGifById = {
  cleaner: '/images/cleaner-card.gif',
  protector: '/images/protector-card.gif',
  refresh: '/images/refresh-card.gif',
};

function ClipMedia({ src, fallback, alt }) {
  const [clipFailed, setClipFailed] = useState(false);
  const displaySrc = clipFailed || !src ? fallback : src;

  return (
    <div className="home-our-products__media">
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={alt}
          decoding="async"
          onError={() => {
            if (fallback) setClipFailed(true);
          }}
        />
      ) : null}
    </div>
  );
}

export default function HomeOurProductsSection() {
  const { t } = useLocale();
  const [pillarProducts, setPillarProducts] = useState(() =>
    buildHomeOurProducts([]),
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const products = await getCachedStoreProducts({ force: true });
        if (!cancelled) {
          setPillarProducts(buildHomeOurProducts(products));
        }
      } catch {
        if (!cancelled) {
          setPillarProducts(buildHomeOurProducts([]));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="home-our-products" id="our-products">
      <div className="container home-our-products__layout">
        <ScrollReveal className="home-our-products__header">
          <h2 className="home-our-products__title">OUR PRODUCTS</h2>
        </ScrollReveal>

        <div
          className="home-our-products__viewport mobile-slider"
          aria-label={t.home.productsLabel}
        >
          <ul className="home-our-products__track">
            {pillarProducts.map((product) => (
              <li key={product.id} className="home-our-products__slide">
                <LocaleLink
                  to={product.href || '/products'}
                  className="home-our-products__card"
                >
                  <ClipMedia
                    src={productGifById[product.id]}
                    fallback={product.image}
                    alt=""
                  />
                  <div className="home-our-products__body">
                    <h3 className="home-our-products__name">{product.label}</h3>
                    <p className="home-our-products__benefit">
                      {String(t.home.pillars?.[product.id] || product.benefit || '')
                        .split('\n')
                        .filter(Boolean)
                        .map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                    </p>
                  </div>
                </LocaleLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
