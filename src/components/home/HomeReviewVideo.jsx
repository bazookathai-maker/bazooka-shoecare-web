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
  onUnavailable,
}) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [readyFor, setReadyFor] = useState(null);
  const [fallbackFor, setFallbackFor] = useState(null);
  const [attached, setAttached] = useState(null);
  const activeSrc = fallbackFor?.from === src ? fallbackFor.to : src;
  const attachedSrc = attached?.forSrc === activeSrc ? attached.value : null;
  const ready = readyFor === activeSrc;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !activeSrc) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setAttached({ forSrc: activeSrc, value: activeSrc });
        observer.disconnect();
      },
      { rootMargin: '480px 0px', threshold: 0.01 },
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [activeSrc]);

  useEffect(() => {
    if (managedPlayback || !attachedSrc) return undefined;

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
  }, [activeSrc, attachedSrc, managedPlayback]);

  useEffect(() => {
    if (!managedPlayback || !attachedSrc) return undefined;

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
  }, [isActive, managedPlayback, activeSrc, attachedSrc]);

  const handleError = () => {
    if (fallback && activeSrc !== fallback) {
      setFallbackFor({ from: src, to: fallback });
      setAttached({ forSrc: fallback, value: fallback });
      return;
    }

    onUnavailable?.();
  };

  return (
    <div ref={wrapRef} className={classes.wrap}>
      {poster ? (
        <img
          className={`${classes.video} ${classes.video}--poster`}
          src={poster}
          alt=""
          width={720}
          height={1280}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <video
        ref={videoRef}
        className={`${classes.video}${ready ? ` ${classes.ready}` : ''}`}
        src={attachedSrc || undefined}
        poster={poster || undefined}
        autoPlay={managedPlayback ? false : autoPlay}
        muted
        loop={managedPlayback ? isActive : true}
        playsInline
        preload="none"
        aria-label={ariaLabel}
        onCanPlay={() => setReadyFor(activeSrc)}
        onError={handleError}
      />
    </div>
  );
}
