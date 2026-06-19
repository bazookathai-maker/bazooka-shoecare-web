import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import ScrollReveal from '../components/ScrollReveal';
import { careGuides } from '../data/careGuides';
import './Articles.css';

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

function getTrackPadding(viewport) {
  const track = viewport.querySelector('.article-detail-list');
  return track
    ? Number.parseFloat(getComputedStyle(track).paddingLeft) || 0
    : 0;
}

function getCardScrollLeft(viewport, card) {
  const viewportRect = viewport.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  return cardRect.left - viewportRect.left + viewport.scrollLeft;
}

function ArticlesCarousel({ guides }) {
  const { hash } = useLocation();
  const shellRef = useRef(null);
  const viewportRef = useRef(null);
  const scrollSyncTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [controlsStyle, setControlsStyle] = useState(null);
  const lastIndex = guides.length - 1;

  const getLeadIndex = useCallback((viewport) => {
    const cards = viewport.querySelectorAll('[data-article-index]');
    if (!cards.length) return 0;

    if (isMobileCarousel()) {
      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      cards.forEach((card) => {
        const index = Number(card.getAttribute('data-article-index'));
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
      const index = Number(card.getAttribute('data-article-index'));
      const cardLeft = getCardScrollLeft(viewport, card);
      const distance = Math.abs(cardLeft - anchorLeft);

      if (distance < closestDistance) {
        closestDistance = distance;
        leadIndex = index;
      }
    });

    return leadIndex;
  }, []);

  const getMaxLeadIndex = useCallback(() => {
    return Math.max(0, guides.length - getVisibleCardCount());
  }, [guides.length]);

  const syncActiveIndex = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    setActiveIndex(getLeadIndex(viewport));
  }, [getLeadIndex]);

  const getVisibleCards = useCallback(
    (viewport) => {
      const cards = Array.from(viewport.querySelectorAll('[data-article-index]'));
      if (!cards.length) return [];

      const leadIndex = getLeadIndex(viewport);
      const visibleCount = getVisibleCardCount();

      return cards.slice(leadIndex, leadIndex + visibleCount);
    },
    [getLeadIndex],
  );

  const syncControlsPosition = useCallback(() => {
    const shell = shellRef.current;
    const viewport = viewportRef.current;
    if (!shell || !viewport) return;

    const visibleCards = getVisibleCards(viewport);
    if (!visibleCards.length) return;

    const firstCard = visibleCards[0];
    const lastCard = visibleCards[visibleCards.length - 1];
    const videoWrap = firstCard.querySelector('.article-card__video-wrap');
    if (!videoWrap) return;

    const shellRect = shell.getBoundingClientRect();
    const firstCardRect = firstCard.getBoundingClientRect();
    const lastCardRect = lastCard.getBoundingClientRect();
    const videoRect = videoWrap.getBoundingClientRect();

    setControlsStyle({
      top: videoRect.top - shellRect.top,
      left: firstCardRect.left - shellRect.left,
      width: lastCardRect.right - firstCardRect.left,
      height: videoRect.height,
    });
  }, [getVisibleCards]);

  const scrollToIndex = useCallback((index) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const card = viewport.querySelector(`[data-article-index="${index}"]`);
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

  useEffect(() => {
    if (!hash?.startsWith('#article-')) return undefined;
    const articleId = hash.replace('#article-', '');
    const index = guides.findIndex((guide) => guide.id === articleId);
    if (index < 0) return undefined;

    const timer = window.setTimeout(() => scrollToIndex(index), 120);
    return () => window.clearTimeout(timer);
  }, [hash, guides, scrollToIndex]);

  const goPrev = () => {
    scrollToIndex(Math.max(0, activeIndex - 1));
  };

  const goNext = () => {
    scrollToIndex(Math.min(getMaxLeadIndex(), activeIndex + 1));
  };

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
      viewport.scrollBy({
        left: event.deltaY,
        behavior: 'auto',
      });
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
    const viewport = viewportRef.current;
    const shell = shellRef.current;
    if (!viewport || !shell) return undefined;

    let frameId = 0;
    const schedulePositionSync = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        syncControlsPosition();
      });
    };

    schedulePositionSync();
    viewport.addEventListener('scroll', schedulePositionSync, { passive: true });
    window.addEventListener('scroll', schedulePositionSync, { passive: true });
    window.addEventListener('resize', schedulePositionSync);

    const resizeObserver = new ResizeObserver(schedulePositionSync);
    resizeObserver.observe(shell);
    resizeObserver.observe(viewport);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      viewport.removeEventListener('scroll', schedulePositionSync);
      window.removeEventListener('scroll', schedulePositionSync);
      window.removeEventListener('resize', schedulePositionSync);
      resizeObserver.disconnect();
    };
  }, [activeIndex, syncControlsPosition]);

  const maxLeadIndex = getMaxLeadIndex();

  return (
    <div className="articles-carousel">
      <div ref={shellRef} className="articles-carousel__shell">
        <div
          ref={viewportRef}
          className="articles-carousel__viewport mobile-slider"
          aria-label="เลื่อนดูบทความ"
        >
          <ul className="article-detail-list">
            {guides.map((guide, index) => (
              <li key={guide.id} data-article-index={index}>
                <ArticleCard guide={guide} isActive={activeIndex === index} />
              </li>
            ))}
          </ul>
        </div>

        <div
          className="articles-carousel__controls"
          style={
            controlsStyle
              ? {
                  top: controlsStyle.top,
                  left: controlsStyle.left,
                  width: controlsStyle.width,
                  height: controlsStyle.height,
                  visibility: 'visible',
                }
              : { visibility: 'hidden' }
          }
        >
          <button
            type="button"
            className="articles-carousel__arrow articles-carousel__arrow--prev"
            onClick={goPrev}
            aria-label="บทความก่อนหน้า"
            disabled={activeIndex === 0}
          >
            ‹
          </button>
          <button
            type="button"
            className="articles-carousel__arrow articles-carousel__arrow--next"
            onClick={goNext}
            aria-label="บทความถัดไป"
            disabled={activeIndex >= maxLeadIndex}
          >
            ›
          </button>
        </div>
      </div>

      <div
        className="articles-carousel__pagination"
        role="tablist"
        aria-label="เลือกบทความ"
      >
        {guides.map((guide, index) => (
          <button
            key={guide.id}
            type="button"
            role="tab"
            className={`articles-carousel__dot${
              index === activeIndex ? ' articles-carousel__dot--active' : ''
            }`}
            aria-label={`ไปที่บทความ: ${guide.title}`}
            aria-selected={index === activeIndex}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Articles() {
  return (
    <main className="articles-page">
      <header className="articles-page__hero">
        <div className="container container--editorial">
          <ScrollReveal>
            <h1 className="articles-page__title">เรื่องราวการดูแลรองเท้า</h1>
            <p className="articles-page__subtitle">
              คู่มือดูแลรองเท้าคู่โปรดจาก BAZOOKA
            </p>
          </ScrollReveal>
        </div>
      </header>

      <section className="articles-page__content" aria-label="เนื้อหาบทความ">
        <div className="articles-page__content-inner">
          <ArticlesCarousel guides={careGuides} />
        </div>
      </section>
    </main>
  );
}
