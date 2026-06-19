import { useEffect } from 'react';
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

  useEffect(() => {
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

    window.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });

    return undefined;
  }, [pathname, hash]);

  return null;
}
