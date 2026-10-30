import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
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

const productStillById = {
  cleaner: '/images/cleaner-card-still.jpg',
  protector: '/images/protector-card-still.jpg',
  refresh: '/images/refresh-card-still.jpg',
};

function ClipMedia({ src, still, fallback, alt }) {
  const mediaRef = useRef(null);
  const [clipFailed, setClipFailed] = useState(false);
  const [playGif, setPlayGif] = useState(false);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !src || !still) return undefined;

    let cancelled = false;
    const start = () => {
      if (!cancelled) setPlayGif(true);
    };
    const arm = () => {
      if (cancelled) return;
      const idle = window.requestIdleCallback;
      if (idle) idle(start, { timeout: 1200 });
      else window.setTimeout(start, 300);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (document.readyState === 'complete') arm();
        else window.addEventListener('load', arm, { once: true });
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src, still]);

  const displaySrc = clipFailed || !src ? fallback : playGif ? src : still || src;

  return (
    <div className="home-our-products__media" ref={mediaRef}>
      {displaySrc ? (
        <img
          src={displaySrc}
          alt={alt}
          decoding="async"
          fetchPriority="low"
          onError={() => {
            if (playGif && fallback) setClipFailed(true);
          }}
        />
      ) : null}
    </div>
  );
}

export default function HomeOurProductsSection() {
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
          aria-label="เลื่อนดูสินค้า"
        >
          <ul className="home-our-products__track">
            {pillarProducts.map((product) => (
              <li key={product.id} className="home-our-products__slide">
                <Link
                  to={product.href || '/products'}
                  className="home-our-products__card"
                >
                  <ClipMedia
                    src={productGifById[product.id]}
                    still={productStillById[product.id]}
                    fallback={product.image}
                    alt=""
                  />
                  <div className="home-our-products__body">
                    <h3 className="home-our-products__name">{product.label}</h3>
                    <p className="home-our-products__benefit">
                      {String(product.benefit || '')
                        .split('\n')
                        .filter(Boolean)
                        .map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
