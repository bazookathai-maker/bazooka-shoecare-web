import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AddToCartButton from '../AddToCartButton';
import ProductPrice from '../ProductPrice';
import ScrollReveal from '../ScrollReveal';
import {
  HOME_TOP_PICKS_APPEND_IDS,
  buildHomeTopPicks,
  getCachedStoreProducts,
} from '../../utils/homeCatalog';
import './HomeRecommendedPromotionSection.css';

/** Same ids the shop card hides; the product itself stays in this carousel. */
const BESTSELLER_BADGE_HIDDEN_IDS = new Set(['134', '126']);

function pickBadge(item) {
  if (
    item.isBestseller &&
    !BESTSELLER_BADGE_HIDDEN_IDS.has(String(item.id))
  ) {
    return 'ขายดี';
  }
  if (item.source === 'fallback' && item.badge) return item.badge;
  return '';
}

function hasRealRating(item) {
  const rating = Number(item.rating);
  const count = Number(item.reviewCount);
  return Number.isFinite(rating) && rating > 0 && Number.isFinite(count) && count > 0;
}

function ArrowIcon({ direction }) {
  const path = direction === 'prev' ? 'M11.5 3.5 6 9l5.5 5.5' : 'M6.5 3.5 12 9l-5.5 5.5';
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ReviewStars({ rating, count }) {
  const value = Math.max(0, Math.min(5, Number(rating)));
  const full = Math.round(value);
  return (
    <p className="home-top-picks__rating">
      <span className="home-top-picks__stars" aria-hidden="true">
        {'★★★★★'.slice(0, full)}
        {'☆☆☆☆☆'.slice(0, 5 - full)}
      </span>
      <span className="visually-hidden">
        {`คะแนน ${value} จาก 5 จาก ${count} รีวิว`}
      </span>
    </p>
  );
}

function PickImage({ src, fallback, alt }) {
  if (!src && !fallback) {
    return <span className="home-top-picks__media-empty" aria-hidden="true" />;
  }

  return (
    <img
      src={src || fallback}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        if (fallback && event.currentTarget.src !== fallback) {
          event.currentTarget.src = fallback;
        }
      }}
    />
  );
}

function TopPickCard({ item, reserveRating }) {
  const mediaRef = useRef(null);
  const badge = pickBadge(item);
  const rated = hasRealRating(item);

  return (
    <li className="home-top-picks__item">
      <article className="home-top-picks__card">
        <div
          className={`home-top-picks__media${
            item.imageFrame === 'fill' ? ' home-top-picks__media--fill' : ''
          }`}
          ref={mediaRef}
        >
          {badge ? <span className="home-top-picks__badge">{badge}</span> : null}
          <Link to={item.href} className="home-top-picks__card-media-link">
            <PickImage
              src={item.image}
              fallback={item.fallback || undefined}
              alt={item.name}
            />
          </Link>
        </div>

        <div className="home-top-picks__body">
          <Link to={item.href} className="home-top-picks__name-link">
            <h3 className="home-top-picks__name">{item.name}</h3>
          </Link>
          {reserveRating ? (
            rated ? (
              <ReviewStars rating={item.rating} count={item.reviewCount} />
            ) : (
              <p className="home-top-picks__rating home-top-picks__rating--empty" aria-hidden="true">
                {'\u00A0'}
              </p>
            )
          ) : null}
          <p className="home-top-picks__price">
            {item.price != null ? (
              <ProductPrice
                price={item.price}
                regularPrice={item.regularPrice}
                isOnSale={item.isOnSale}
              />
            ) : (
              '\u00A0'
            )}
          </p>
          <AddToCartButton product={item} mediaRef={mediaRef} />
        </div>
      </article>
    </li>
  );
}

export default function HomeRecommendedPromotionSection() {
  const viewportRef = useRef(null);
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const ratingsAvailable = items.some(hasRealRating);

  const updateEdges = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    setCanPrev(viewport.scrollLeft > 2);
    setCanNext(maxScroll > 2 && viewport.scrollLeft < maxScroll - 2);
  }, []);

  const scrollByCard = useCallback((direction) => {
    const viewport = viewportRef.current;
    const card = viewport?.querySelector('.home-top-picks__item');
    if (!viewport || !card) return;
    const track = viewport.querySelector('.home-top-picks__grid');
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 16;
    const distance = card.getBoundingClientRect().width + gap;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollBy({
      left: direction * distance,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus('loading');
      try {
        const products = await getCachedStoreProducts({ force: true });
        if (!cancelled) {
          setItems(buildHomeTopPicks(products, 6, HOME_TOP_PICKS_APPEND_IDS));
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

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    updateEdges();
    viewport.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      viewport.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [items, updateEdges]);

  return (
    <section className="home-top-picks" id="top-picks">
      <div className="container">
        <ScrollReveal className="home-top-picks__header">
          <h2 className="home-top-picks__title">TOP PRODUCT</h2>
          <div className="home-top-picks__arrows">
            <button
              type="button"
              className="home-top-picks__arrow"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="สินค้าก่อนหน้า"
            >
              <ArrowIcon direction="prev" />
            </button>
            <button
              type="button"
              className="home-top-picks__arrow"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label="สินค้าถัดไป"
            >
              <ArrowIcon direction="next" />
            </button>
          </div>
        </ScrollReveal>

        {status === 'loading' && items.length === 0 ? (
          <p className="home-top-picks__status" role="status">
            กำลังโหลดสินค้า...
          </p>
        ) : null}

        <div
          ref={viewportRef}
          className="home-top-picks__viewport"
          aria-label="เลื่อนดูสินค้าแนะนำ"
        >
          <ul className="home-top-picks__grid">
            {items.map((item) => (
              <TopPickCard
                key={item.id}
                item={item}
                reserveRating={ratingsAvailable}
              />
            ))}
          </ul>
        </div>

        <ScrollReveal className="home-top-picks__footer" delay={120}>
          <Link to="/products" className="btn-outline home-top-picks__shop-all">
            ดูสินค้าทั้งหมด
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
