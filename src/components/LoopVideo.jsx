import { useState } from 'react';
import './LoopVideo.css';

export default function LoopVideo({
  src,
  poster,
  className = '',
  aspect = 'portrait',
}) {
  const [ready, setReady] = useState(false);

  return (
    <div className={`loop-video loop-video--${aspect}${className ? ` ${className}` : ''}`}>
      {poster && (
        <img
          className="loop-video__poster"
          src={poster}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}
      {src && (
        <video
          className={`loop-video__el${ready ? ' loop-video__el--ready' : ''}`}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setReady(true)}
        />
      )}
    </div>
  );
}
