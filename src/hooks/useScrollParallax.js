import { useEffect } from 'react';

/**
 * Subtle scroll parallax — media moves slower than surrounding page scroll.
 * Respects prefers-reduced-motion.
 */
export function useScrollParallax(sectionRef, mediaRef, options = {}) {
  const { maxOffset = 72, scale = 1.08 } = options;

  useEffect(() => {
    const section = sectionRef.current;
    const media = mediaRef.current;
    if (!section || !media) return undefined;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const reset = () => {
      media.style.transform = scale === 1 ? '' : `scale(${scale})`;
    };

    if (motionQuery.matches) {
      reset();
      return undefined;
    }

    let raf = 0;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      if (rect.bottom < 0 || rect.top > vh) {
        reset();
        return;
      }

      const travel = rect.height + vh;
      const progress = (vh - rect.top) / travel;
      const offset = (progress - 0.5) * maxOffset * 2;
      const y = offset.toFixed(2);

      media.style.transform =
        scale === 1
          ? `translate3d(0, ${y}px, 0)`
          : `translate3d(0, ${y}px, 0) scale(${scale})`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    const onMotionChange = () => {
      if (motionQuery.matches) {
        cancelAnimationFrame(raf);
        reset();
      } else {
        update();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    motionQuery.addEventListener('change', onMotionChange);
    update();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      motionQuery.removeEventListener('change', onMotionChange);
      media.style.transform = '';
    };
  }, [sectionRef, mediaRef, maxOffset, scale]);
}
