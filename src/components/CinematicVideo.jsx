import { useRef, useCallback, useState, useEffect } from 'react';
import './CinematicVideo.css';

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <path d="M10 8v8l7-4-7-4z" strokeLinejoin="round" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <path d="M9 7.5h2v9H9v-9zm4 0h2v9h-2v-9z" strokeLinejoin="round" />
    </svg>
  );
}

export default function CinematicVideo({ src, poster, label }) {
  const videoRef = useRef(null);
  const hintTimerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPaused(false);
    const onPause = () => setIsPaused(true);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, []);

  const flashHint = useCallback(() => {
    setShowHint(true);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
    }, 1100);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    flashHint();
  }, [flashHint]);

  const showOverlay = isPaused || showHint;
  const iconMode = isPaused ? 'play' : 'pause';

  return (
    <button
      type="button"
      className="cinematic-video"
      onClick={togglePlay}
      aria-label={label ? `${label} — เล่นหรือหยุด` : 'เล่นหรือหยุดวิดีโอ'}
    >
      <span className="cinematic-video__frame">
        <video
          ref={videoRef}
          className="cinematic-video__el"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>

        {showOverlay && (
          <span
            className={`cinematic-video__hint cinematic-video__hint--${iconMode} ${
              showHint ? 'cinematic-video__hint--flash' : ''
            }`}
            aria-hidden="true"
          >
            <span className="cinematic-video__hint-icon">
              {iconMode === 'play' ? <PlayIcon /> : <PauseIcon />}
            </span>
          </span>
        )}
      </span>
    </button>
  );
}
