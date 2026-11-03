import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function scrollToHashTarget(hash, behavior) {
  const id = hash.replace('#', '');
  if (!id) return false;

  const target = document.getElementById(id);
  if (!target) return false;

  target.scrollIntoView({ behavior, block: 'start' });
  return true;
}

/**
 * Scrolls to top on route changes, or to a hash target when present.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === '/' && hash === '#faq') {
      navigate('/faq', { replace: true });
    }
  }, [pathname, hash, navigate]);

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const behavior = prefersReducedMotion ? 'auto' : 'smooth';

    if (hash) {
      let attempts = 0;
      let frameId = 0;

      const tryScrollToHash = () => {
        if (scrollToHashTarget(hash, behavior)) return;

        if (attempts < 24) {
          attempts += 1;
          frameId = window.requestAnimationFrame(tryScrollToHash);
        }
      };

      tryScrollToHash();

      return () => {
        if (frameId) window.cancelAnimationFrame(frameId);
      };
    }

    // html { scroll-behavior: smooth } turns a bare scrollTo(0, 0) into an
    // animation. That animation starts at the previous page offset, so the new
    // heading travels under the fixed header. Force an instant jump, including
    // one frame later in case another layout effect starts a smooth scroll.
    const snapTop = () => {
      const root = document.documentElement;
      const previous = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      root.style.scrollBehavior = previous;
    };

    snapTop();
    const frame = window.requestAnimationFrame(snapTop);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname, hash]);

  return null;
}
