import { useCallback, useEffect, useRef, useState } from 'react';
import ScrollReveal from '../ScrollReveal';
import HomeReviewVideo from './HomeReviewVideo';
import { homeReviewVideos } from '../../data/homeStory';
import './HomeReviewsSection.css';

const reviewVideoClasses = {
  wrap: 'home-reviews__video-wrap',
  video: 'home-reviews__video',
  ready: 'home-reviews__video--ready',
};

const DEFAULT_HANDLE = '@bazooka.review';
const DEFAULT_QUOTE = 'รีวิวจากผู้ใช้จริง';
const MOBILE_CAROUSEL_QUERY = '(max-width: 768px)';
const SCROLL_SYNC_DEBOUNCE_MS = 140;

export default function HomeReviewsSection() {
  const viewportRef = useRef(null);
  const scrollSyncTimerRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const lastIndex = homeReviewVideos.length - 1;

  const getClosestCardIndex = useCallback((viewport) => {
    const cards = viewport.querySelectorAll('[data-review-index]');
    if (!cards.length) return 0;

    const isMobile = window.matchMedia(MOBILE_CAROUSEL_QUERY).matches;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const index = Number(card.getAttribute('data-review-index'));
      let distance;

      if (isMobile) {
        const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        distance = Math.abs(cardCenter - viewportCenter);
      } else {
        distance = Math.abs(card.offsetLeft - viewport.scrollLeft);
      }

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, []);

  const syncCarouselState = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const closestIndex = getClosestCardIndex(viewport);
    const isMobile = window.matchMedia(MOBILE_CAROUSEL_QUERY).matches;

    setScrollIndex(closestIndex);
    if (isMobile) {
      setActiveVideoIndex(closestIndex);
    }
  }, [getClosestCardIndex]);

  const scrollToIndex = useCallback((index) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const card = viewport.querySelector(`[data-review-index="${index}"]`);
    if (!card) return;

    const isMobile = window.matchMedia(MOBILE_CAROUSEL_QUERY).matches;
    let left;

    if (isMobile) {
      left = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    } else {
      const viewportRect = viewport.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      left = cardRect.left - viewportRect.left + viewport.scrollLeft;
    }

    viewport.scrollTo({
      left: Math.max(0, left),
      behavior: 'smooth',
    });
    setScrollIndex(index);
  }, []);

  const selectVideo = useCallback((index) => {
    setActiveVideoIndex(index);
  }, []);

  const goPrev = () => {
    scrollToIndex(Math.max(0, scrollIndex - 1));
  };

  const goNext = () => {
    scrollToIndex(Math.min(lastIndex, scrollIndex + 1));
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const scheduleSync = () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      scrollSyncTimerRef.current = window.setTimeout(() => {
        syncCarouselState();
      }, SCROLL_SYNC_DEBOUNCE_MS);
    };

    const handleScrollEnd = () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      syncCarouselState();
    };

    viewport.addEventListener('scroll', scheduleSync, { passive: true });
    viewport.addEventListener('scrollend', handleScrollEnd, { passive: true });
    syncCarouselState();

    return () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      viewport.removeEventListener('scroll', scheduleSync);
      viewport.removeEventListener('scrollend', handleScrollEnd);
    };
  }, [syncCarouselState]);

  return (
    <section className="home-reviews" id="reviews">
      <div className="container">
        <ScrollReveal className="home-reviews__header">
          <h2 className="home-reviews__title">REVIEWS</h2>
          <p className="home-reviews__subtitle">เสียงจากผู้ใช้จริง</p>
        </ScrollReveal>
      </div>

      <ScrollReveal className="home-reviews__carousel" delay={70}>
        <div className="home-reviews__carousel-inner">
          <div className="home-reviews__viewport-shell">
            <div
              ref={viewportRef}
              className="home-reviews__viewport mobile-slider"
              aria-label="Community review videos"
            >
              <ul className="home-reviews__track">
                {homeReviewVideos.map((item, index) => {
                  const isActive = activeVideoIndex === index;

                  return (
                    <li
                      key={item.src}
                      className={`home-reviews__card${
                        isActive ? ' home-reviews__card--active' : ''
                      }`}
                      data-review-index={index}
                    >
                      <button
                        type="button"
                        className="home-reviews__card-hit"
                        onClick={() => selectVideo(index)}
                        aria-label={`เล่นวิดีโอรีวิว ${index + 1}`}
                        aria-pressed={isActive}
                      >
                        <div className="home-reviews__card-media">
                          <HomeReviewVideo
                            src={item.src}
                            fallback={item.fallback}
                            classes={reviewVideoClasses}
                            ariaLabel={`รีวิวจากผู้ใช้จริง ${index + 1}`}
                            isActive={isActive}
                            managedPlayback
                          />
                          <span className="home-reviews__handle">
                            {item.handle ?? DEFAULT_HANDLE}
                          </span>
                        </div>
                        <p className="home-reviews__quote">
                          &ldquo;{item.quote ?? DEFAULT_QUOTE}&rdquo;
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="home-reviews__controls">
              <button
                type="button"
                className="home-reviews__arrow home-reviews__arrow--prev"
                onClick={goPrev}
                aria-label="Previous review"
                disabled={scrollIndex === 0}
              >
                ‹
              </button>
              <button
                type="button"
                className="home-reviews__arrow home-reviews__arrow--next"
                onClick={goNext}
                aria-label="Next review"
                disabled={scrollIndex >= lastIndex}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        <div
          className="home-reviews__pagination"
          aria-label="Review slide pagination"
        >
          {homeReviewVideos.map((item, index) => (
            <button
              key={item.src}
              type="button"
              className={`home-reviews__dot${
                index === scrollIndex ? ' home-reviews__dot--active' : ''
              }`}
              aria-label={`Go to review ${index + 1}`}
              aria-current={index === scrollIndex ? 'true' : undefined}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
