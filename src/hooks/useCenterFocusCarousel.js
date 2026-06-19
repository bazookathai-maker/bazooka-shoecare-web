import { useCallback, useEffect, useRef, useState } from 'react';

const MOBILE_CAROUSEL_QUERY = '(max-width: 768px)';
const SCROLL_SYNC_DEBOUNCE_MS = 140;

export function useCenterFocusCarousel({
  itemCount,
  indexAttribute = 'data-slide-index',
}) {
  const viewportRef = useRef(null);
  const scrollSyncTimerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(0, itemCount - 1);

  const isMobileCarousel = useCallback(
    () => window.matchMedia(MOBILE_CAROUSEL_QUERY).matches,
    [],
  );

  const getClosestIndex = useCallback(
    (viewport) => {
      const slideEls = viewport.querySelectorAll(`[${indexAttribute}]`);
      if (!slideEls.length) return 0;

      const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      slideEls.forEach((slide) => {
        const index = Number(slide.getAttribute(indexAttribute));
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const distance = Math.abs(slideCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      return closestIndex;
    },
    [indexAttribute],
  );

  const syncActiveIndex = useCallback(() => {
    if (!isMobileCarousel()) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    setActiveIndex(getClosestIndex(viewport));
  }, [getClosestIndex, isMobileCarousel]);

  const scrollToIndex = useCallback(
    (index) => {
      const clampedIndex = Math.max(0, Math.min(index, maxIndex));

      if (!isMobileCarousel()) {
        setActiveIndex(clampedIndex);
        return;
      }

      const viewport = viewportRef.current;
      if (!viewport) return;

      const slide = viewport.querySelector(
        `[${indexAttribute}="${clampedIndex}"]`,
      );
      if (!slide) return;

      const left =
        slide.offsetLeft - (viewport.clientWidth - slide.offsetWidth) / 2;

      viewport.scrollTo({
        left: Math.max(0, left),
        behavior: 'smooth',
      });
      setActiveIndex(clampedIndex);
    },
    [indexAttribute, isMobileCarousel, maxIndex],
  );

  const goPrev = useCallback(() => {
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  const goNext = useCallback(() => {
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, scrollToIndex]);

  const goToIndex = useCallback(
    (index) => {
      scrollToIndex(index);
    },
    [scrollToIndex],
  );

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const scheduleSync = () => {
      if (!isMobileCarousel()) return;

      window.clearTimeout(scrollSyncTimerRef.current);
      scrollSyncTimerRef.current = window.setTimeout(() => {
        syncActiveIndex();
      }, SCROLL_SYNC_DEBOUNCE_MS);
    };

    const handleScrollEnd = () => {
      if (!isMobileCarousel()) return;

      window.clearTimeout(scrollSyncTimerRef.current);
      syncActiveIndex();
    };

    viewport.addEventListener('scroll', scheduleSync, { passive: true });
    viewport.addEventListener('scrollend', handleScrollEnd, { passive: true });
    syncActiveIndex();

    return () => {
      window.clearTimeout(scrollSyncTimerRef.current);
      viewport.removeEventListener('scroll', scheduleSync);
      viewport.removeEventListener('scrollend', handleScrollEnd);
    };
  }, [isMobileCarousel, syncActiveIndex, itemCount]);

  return {
    viewportRef,
    activeIndex,
    maxIndex,
    goPrev,
    goNext,
    goToIndex,
    scrollToIndex,
  };
}
