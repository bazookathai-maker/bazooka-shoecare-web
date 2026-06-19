import { useEffect, useRef, useState } from 'react';

const defaultClasses = {
  wrap: 'reviews-featured__video-wrap',
  video: 'reviews-featured__video',
  ready: 'reviews-featured__video--ready',
};

export default function HomeReviewVideo({
  src,
  fallback,
  poster,
  classes = defaultClasses,
  ariaLabel = 'วิดีโอรีวิวจากชุมชน sneaker care',
  autoPlay = false,
  isActive = false,
  managedPlayback = false,
}) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);

  useEffect(() => {
    setActiveSrc(src);
    setReady(false);
  }, [src]);

  useEffect(() => {
    if (managedPlayback) return undefined;

    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return undefined;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced) {
      video.pause();
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' },
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [activeSrc, managedPlayback]);

  useEffect(() => {
    if (!managedPlayback) return undefined;

    const video = videoRef.current;
    if (!video) return undefined;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (prefersReduced) {
      video.loop = false;
      video.pause();
      return undefined;
    }

    if (isActive) {
      video.loop = true;
      video.play().catch(() => {});
      return undefined;
    }

    video.loop = false;
    video.pause();

    const resetFrame = () => {
      try {
        video.currentTime = 0;
      } catch {
        /* ignore seek errors while metadata loads */
      }
    };

    if (video.readyState >= 1) {
      resetFrame();
    } else {
      video.addEventListener('loadeddata', resetFrame, { once: true });
      return () => video.removeEventListener('loadeddata', resetFrame);
    }

    return undefined;
  }, [isActive, managedPlayback, activeSrc]);

  const handleError = () => {
    if (fallback && activeSrc !== fallback) {
      setActiveSrc(fallback);
    }
  };

  return (
    <div ref={wrapRef} className={classes.wrap}>
      <video
        ref={videoRef}
        className={`${classes.video}${ready ? ` ${classes.ready}` : ''}`}
        src={activeSrc}
        poster={poster}
        autoPlay={managedPlayback ? false : autoPlay}
        muted
        loop={managedPlayback ? isActive : true}
        playsInline
        preload="metadata"
        aria-label={ariaLabel}
        onCanPlay={() => setReady(true)}
        onError={handleError}
      />
    </div>
  );
}
