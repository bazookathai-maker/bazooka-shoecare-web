import { useEffect, useRef, useState } from 'react';

export default function HomeRitualVideo({ src, fallback, poster }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [activeSrc, setActiveSrc] = useState(src);

  useEffect(() => {
    setActiveSrc(src);
    setReady(false);
  }, [src]);

  useEffect(() => {
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
      { threshold: 0.25, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(wrap);
    return () => observer.disconnect();
  }, [activeSrc]);

  const handleError = () => {
    if (fallback && activeSrc !== fallback) {
      setActiveSrc(fallback);
    }
  };

  return (
    <div ref={wrapRef} className="home-steps__ritual-wrap">
      <video
        ref={videoRef}
        className={`home-steps__ritual-player${ready ? ' home-steps__ritual-player--ready' : ''}`}
        src={activeSrc}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="วิดีโอพิธีการดูแลรองเท้าแบบต่อเนื่อง"
        onCanPlay={() => setReady(true)}
        onError={handleError}
      />
    </div>
  );
}
