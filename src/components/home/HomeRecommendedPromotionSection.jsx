import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import {
  buildHomeTopPicks,
  getCachedStoreProducts,
} from '../../utils/homeCatalog';
import './HomeRecommendedPromotionSection.css';

function PickImage({ src, fallback, alt }) {
  if (!src && !fallback) {
    return (
      <span className="home-top-picks__media-empty" aria-hidden="true" />
    );
  }

  return (
    <img
      src={src || fallback}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
}

function TopPickCard({ item, index }) {
  const mediaRef = useRef(null);

  return (
    <li
      className="home-top-picks__item"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <article className="home-top-picks__card">
        <Link
          to={item.href}
          className="home-top-picks__card-media-link"
        >
          <div className="home-top-picks__media" ref={mediaRef}>
            <PickImage
              src={item.image}
              fallback={item.fallback || undefined}
              alt={item.name}
            />
          </div>
        </Link>

        <div className="home-top-picks__body">
          <Link to={item.href} className="home-top-picks__name-link">
            <h3 className="home-top-picks__name">{item.name}</h3>
          </Link>
          <p className="home-top-picks__price">
            {item.price != null
              ? `฿${Number(item.price).toLocaleString('th-TH')}`
              : '\u00A0'}
          </p>
          <Link to={item.href} className="home-top-picks__view-btn">
            ดูสินค้า
          </Link>
        </div>
      </article>
    </li>
  );
}

export default function HomeRecommendedPromotionSection() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      try {
        const products = await getCachedStoreProducts({ force: true });
        if (!cancelled) {
          setItems(buildHomeTopPicks(products, 6));
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          // Last resort only when Store API is unreachable
          setItems(buildHomeTopPicks([], 6));
          setStatus('fallback');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="home-top-picks" id="top-picks">
      <div className="container">
        <ScrollReveal className="home-top-picks__header">
          <h2 className="home-top-picks__title">TOP PRODUCT</h2>
        </ScrollReveal>

        {status === 'loading' && items.length === 0 ? (
          <p className="home-top-picks__status" role="status">
            กำลังโหลดสินค้า...
          </p>
        ) : null}

        <ScrollReveal as="ul" className="home-top-picks__grid" delay={70}>
          {items.map((item, index) => (
            <TopPickCard key={item.id} item={item} index={index} />
          ))}
        </ScrollReveal>

        <ScrollReveal className="home-top-picks__footer" delay={120}>
          <Link to="/products" className="btn-outline home-top-picks__shop-all">
            ดูสินค้าทั้งหมด
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
