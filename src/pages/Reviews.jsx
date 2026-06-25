import { useCallback, useEffect, useRef, useState } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import { ReviewProductLink } from '../components/HubRelatedContent';
import { googleReviews } from '../data/googleReviews';
import './Reviews.css';

const GOOGLE_REVIEW_URL =
  'https://www.google.com/search?q=BAZOOKA+Sneaker+Care+reviews';

const AVATAR_COLORS = [
  '#8E75B2',
  '#5B8DEF',
  '#E67C73',
  '#7BC67E',
  '#F5B400',
  '#6B7F6E',
  '#C97B63',
  '#4A90A4',
  '#9B8AC4',
  '#D4A056',
];
const SCROLL_SYNC_DEBOUNCE_MS = 140;
const MOBILE_CAROUSEL_MQ = '(max-width: 767px)';
const TABLET_CAROUSEL_MQ = '(min-width: 768px)';
const DESKTOP_CAROUSEL_MQ = '(min-width: 1200px)';

function getVisibleCardCount() {
  if (window.matchMedia(DESKTOP_CAROUSEL_MQ).matches) return 3;
  if (window.matchMedia(TABLET_CAROUSEL_MQ).matches) return 2;
  return 1;
}

function isMobileCarousel() {
  return window.matchMedia(MOBILE_CAROUSEL_MQ).matches;
}

function formatReviewerName(name) {
  const raw = name?.trim() ?? '';
  if (!raw) return '*****';
  if (raw.includes('*')) return raw;

  const lower = raw.toLowerCase();
  const visibleCount = lower.startsWith('choom') ? 5 : Math.min(4, raw.length);
  const visible = raw.slice(0, visibleCount);
  return `${visible.charAt(0).toUpperCase()}${visible.slice(1)}*****`;
}

function getTrackPadding(viewport) {
  const track = viewport.querySelector('.reviews-page__carousel-track');
  return track
    ? Number.parseFloat(getComputedStyle(track).paddingLeft) || 0
    : 0;
}

function getCardScrollLeft(viewport, card) {
  const viewportRect = viewport.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  return cardRect.left - viewportRect.left + viewport.scrollLeft;
}

function GoogleIcon() {
  return (
    <svg
      className="reviews-page__platform-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      className="reviews-page__platform-icon reviews-page__tiktok-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 0 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.69V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.1 4.1 0 0 1-1-.48z"
      />
    </svg>
  );
}

function ReviewSourceIcon({ source }) {
  if (source === 'tiktok') return <TikTokIcon />;
  if (source === 'shopee') return <ShopeeIcon />;
  return <GoogleIcon />;
}

function ShopeeIcon() {
  return (
    <img
      src="/images/icons/shopee.png"
      alt=""
      className="reviews-page__platform-icon reviews-page__shopee-icon"
      width={20}
      height={20}
      decoding="async"
    />
  );
}

function GoogleStars({ count = 5 }) {
  return (
    <span className="reviews-page__stars" aria-label={`${count} จาก 5 ดาว`}>
      {Array.from({ length: count }, (_, i) => (
        <svg
          key={i}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewerAvatar({ name, colorIndex, image }) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className="reviews-page__reviewer-avatar reviews-page__reviewer-avatar--photo"
        loading="lazy"
        decoding="async"
      />
    );
  }

  const initial = name.charAt(0).toUpperCase();
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];

  return (
    <span
      className="reviews-page__reviewer-avatar"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function getReviewSource(cardIndex, showSummary) {
  const reviewIndex = showSummary ? cardIndex - 1 : cardIndex;
  if (reviewIndex <= 1 || reviewIndex === 3 || reviewIndex === 5) return 'tiktok';
  if (reviewIndex === 2 || reviewIndex === 4) return 'shopee';
  return 'google';
}

function GoogleReviewCard({ review, colorIndex, source = 'google' }) {
  const images =
    Array.isArray(review.images) && review.images.length
      ? review.images
      : review.image
        ? [review.image]
        : [];

  return (
    <article className="reviews-page__google-card">
      <div className="reviews-page__google-card-top">
        <div className="reviews-page__google-card-meta">
          <ReviewerAvatar
            name={review.name}
            colorIndex={colorIndex}
            image={review.avatar}
          />
          <div>
            <p className="reviews-page__google-name">
              {formatReviewerName(review.name)}
            </p>
            {review.time ? (
              <p className="reviews-page__google-time">{review.time}</p>
            ) : null}
          </div>
        </div>
        <ReviewSourceIcon source={source} />
      </div>
      <GoogleStars count={review.rating} />
      <p className="reviews-page__google-text">{review.text}</p>
      {images.length ? (
        <div
          className={`reviews-page__google-photo${
            images.length > 1 ? ' reviews-page__google-photo--grid' : ''
          }`}
        >
          {images.slice(0, 2).map((src, index) => (
            <img
              key={`${review.id}-${src}-${index}`}
              src={src}
              alt={review.imageAlt ?? ''}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      ) : null}
      <ReviewProductLink reviewId={review.id} />
    </article>
  );
}

function RatingSummaryCard() {
  return (
    <article className="reviews-page__google-card reviews-page__summary">
      <div className="reviews-page__summary-content">
        <p className="reviews-page__summary-brand">BAZOOKA Sneaker Care</p>
        <div className="reviews-page__summary-rating-row">
          <span className="reviews-page__summary-score">4.9 / 5</span>
          <GoogleStars count={5} />
        </div>
        <p className="reviews-page__summary-label">Based on customer reviews</p>
        <a
          href={GOOGLE_REVIEW_URL}
          className="reviews-page__summary-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          review us on Google
        </a>
      </div>
    </article>
  );
}

function getPageCount(reviewCount, visibleCount) {
  if (reviewCount === 0) return 0;
  return Math.ceil(reviewCount / visibleCount);
}

function getPageLeadIndex(pageIndex, visibleCount, maxLeadIndex) {
  return Math.min(pageIndex * visibleCount, maxLeadIndex);
}

function getActivePage(activeIndex, visibleCount, pageCount) {
  if (pageCount <= 1) return 0;
  return Math.min(Math.floor(activeIndex / visibleCount), pageCount - 1);
}

function GoogleReviewsCarousel({ reviews, showSummary = false }) {
  const viewportRef = useRef(null);
  const dotsRef = useRef(null);
  const scrollSyncTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(getVisibleCardCount);

  const cards = showSummary ? [null, ...reviews] : reviews;
  const maxLeadIndex = Math.max(0, cards.length - visibleCount);
  const pageCount = getPageCount(cards.length, visibleCount);
  const activePage = getActivePage(activeIndex, visibleCount, pageCount);

  const getLeadIndex = useCallback((viewport) => {
    const cards = viewport.querySelectorAll('[data-review-index]');
    if (!cards.length) return 0;

    if (isMobileCarousel()) {
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card) => {
        const index = Number(card.getAttribute('data-review-index'));
        const cardCenter =
          getCardScrollLeft(viewport, card) + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    }

    const trackPadding = getTrackPadding(viewport);
    const anchorLeft = viewport.scrollLeft + trackPadding;
    let leadIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const index = Number(card.getAttribute('data-review-index'));
      const cardLeft = getCardScrollLeft(viewport, card);
      const distance = Math.abs(cardLeft - anchorLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        leadIndex = index;
      }
    });

    return leadIndex;
  }, []);

  const syncActiveIndex = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setActiveIndex(getLeadIndex(viewport));
  }, [getLeadIndex]);

  const scrollToIndex = useCallback((index) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const card = viewport.querySelector(`[data-review-index="${index}"]`);
    if (!card) return;

    const cardScrollLeft = getCardScrollLeft(viewport, card);
    let targetScroll;

    if (isMobileCarousel()) {
      targetScroll =
        cardScrollLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    } else {
      targetScroll = cardScrollLeft - getTrackPadding(viewport);
    }

    viewport.scrollTo({
      left: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
    setActiveIndex(index);
  }, []);

  const goPrev = () => scrollToIndex(Math.max(0, activeIndex - 1));
  const goNext = () => scrollToIndex(Math.min(maxLeadIndex, activeIndex + 1));

  const scrollToPage = useCallback(
    (pageIndex) => {
      scrollToIndex(getPageLeadIndex(pageIndex, visibleCount, maxLeadIndex));
    },
    [maxLeadIndex, scrollToIndex, visibleCount],
  );

  useEffect(() => {
    const updateVisibleCount = () => setVisibleCount(getVisibleCardCount());
    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    if (activeIndex <= maxLeadIndex) return;
    scrollToIndex(maxLeadIndex);
  }, [activeIndex, maxLeadIndex, scrollToIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const scheduleSync = () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      scrollSyncTimerRef.current = window.setTimeout(() => {
        syncActiveIndex();
      }, SCROLL_SYNC_DEBOUNCE_MS);
    };

    const handleScrollEnd = () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      syncActiveIndex();
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      viewport.scrollBy({ left: event.deltaY, behavior: 'auto' });
    };

    viewport.addEventListener('scroll', scheduleSync, { passive: true });
    viewport.addEventListener('scrollend', handleScrollEnd, { passive: true });
    viewport.addEventListener('wheel', handleWheel, { passive: false });
    syncActiveIndex();

    return () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      viewport.removeEventListener('scroll', scheduleSync);
      viewport.removeEventListener('scrollend', handleScrollEnd);
      viewport.removeEventListener('wheel', handleWheel);
    };
  }, [syncActiveIndex]);

  useEffect(() => {
    const dots = dotsRef.current;
    if (!dots) return;

    const activeDot = dots.querySelector(`[data-review-dot="${activePage}"]`);
    activeDot?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activePage]);

  return (
    <div className="reviews-page__carousel">
      <div
        ref={viewportRef}
        className="reviews-page__carousel-viewport mobile-slider"
        aria-label="เลื่อนดูรีวิว"
      >
        <ul className="reviews-page__carousel-track">
          {cards.map((review, index) => (
            <li
              key={review?.id ?? 'reviews-summary'}
              data-review-index={index}
              aria-label={review ? `รีวิว ${index}` : 'สรุปคะแนนรีวิว'}
            >
              {review ? (
                <GoogleReviewCard
                  review={review}
                  colorIndex={index}
                  source={getReviewSource(index, showSummary)}
                />
              ) : (
                <RatingSummaryCard />
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="reviews-page__carousel-footer">
        <div className="reviews-page__carousel-arrows">
          <button
            type="button"
            className="reviews-page__carousel-arrow"
            onClick={goPrev}
            aria-label="รีวิวก่อนหน้า"
            disabled={activeIndex === 0}
          >
            ‹
          </button>
          <button
            type="button"
            className="reviews-page__carousel-arrow"
            onClick={goNext}
            aria-label="รีวิวถัดไป"
            disabled={activeIndex >= maxLeadIndex}
          >
            ›
          </button>
        </div>
      </div>

      {pageCount > 0 ? (
        <div
          ref={dotsRef}
          className="reviews-page__carousel-dots"
          role="tablist"
          aria-label="เลือกหน้ารีวิว"
        >
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <button
              key={pageIndex}
              type="button"
              role="tab"
              data-review-dot={pageIndex}
              className={`reviews-page__carousel-dot${
                pageIndex === activePage
                  ? ' reviews-page__carousel-dot--active'
                  : ''
              }`}
              aria-label={`ไปที่หน้ารีวิว ${pageIndex + 1} จาก ${pageCount}`}
              aria-selected={pageIndex === activePage}
              onClick={() => scrollToPage(pageIndex)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function Reviews() {
  return (
    <main className="reviews-page">
      <header className="reviews-page__intro">
        <div className="container container--editorial">
          <ScrollReveal className="reviews-page__intro-inner">
            <p className="section-label">ชุมชน</p>
            <h1 className="section-title">รีวิว</h1>
            <p className="reviews-page__lead">
              ข้อความจากคนที่ใช้ BAZOOKA ในชีวิตจริง — ประสบการณ์จริง
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="reviews-page__google" aria-label="รีวิวจากลูกค้า">
        <div className="container container--editorial">
          <ScrollReveal>
            <div className="reviews-page__google-layout">
              <GoogleReviewsCarousel reviews={googleReviews} showSummary />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
