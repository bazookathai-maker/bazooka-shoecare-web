import { useCallback, useEffect, useRef, useState } from 'react';
import { beforeAfterMedia } from '../data/beforeAfter';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function BeforeAfterCompare({
  beforeSrc = beforeAfterMedia.before,
  afterSrc = beforeAfterMedia.after,
  combinedSrc = beforeAfterMedia.combined,
}) {
  const trackRef = useRef(null);
  const [position, setPosition] = useState(52);
  const [isDragging, setIsDragging] = useState(false);
  const [hasSeparateImages, setHasSeparateImages] = useState(false);

  const setPositionFromClientX = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(percent, 4, 96));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
      });

    Promise.all([check(beforeSrc), check(afterSrc)]).then(([beforeOk, afterOk]) => {
      if (!cancelled) setHasSeparateImages(beforeOk && afterOk);
    });

    return () => {
      cancelled = true;
    };
  }, [beforeSrc, afterSrc]);

  useEffect(() => {
    if (!isDragging) return undefined;

    const onMove = (e) => setPositionFromClientX(e.clientX);
    const onTouchMove = (e) => {
      if (e.touches[0]) setPositionFromClientX(e.touches[0].clientX);
    };
    const onEnd = () => setIsDragging(false);

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, setPositionFromClientX]);

  const startDrag = (clientX) => {
    setIsDragging(true);
    setPositionFromClientX(clientX);
  };

  const useSplitComposite = !hasSeparateImages;
  const beforeImage = useSplitComposite ? combinedSrc : beforeSrc;
  const afterImage = useSplitComposite ? combinedSrc : afterSrc;
  const splitClass = useSplitComposite ? ' ba-compare--split' : '';

  return (
    <div
      ref={trackRef}
      className={`ba-compare${splitClass}${isDragging ? ' ba-compare--dragging' : ''}`}
      style={{ '--ba-pos': `${position}%` }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        startDrag(e.clientX);
      }}
      onTouchStart={(e) => {
        if (e.touches[0]) startDrag(e.touches[0].clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setPosition((p) => clamp(p - 4, 4, 96));
        if (e.key === 'ArrowRight') setPosition((p) => clamp(p + 4, 4, 96));
      }}
      role="slider"
      aria-label="ลากเพื่อเปรียบเทียบก่อนและหลังการดูแลรองเท้า"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      tabIndex={0}
    >
      <div className="ba-compare__layer ba-compare__layer--after" aria-hidden="true">
        <img src={afterImage} alt="" decoding="async" draggable={false} />
      </div>

      <div
        className="ba-compare__layer ba-compare__layer--before"
        aria-hidden="true"
      >
        <img src={beforeImage} alt="" decoding="async" draggable={false} />
      </div>

      <div className="ba-compare__labels" aria-hidden="true">
        <span className="ba-compare__tag ba-compare__tag--before">Before</span>
        <span className="ba-compare__tag ba-compare__tag--after">After</span>
      </div>

      <div className="ba-compare__divider" aria-hidden="true">
        <div className="ba-compare__line" />
        <button
          type="button"
          className="ba-compare__handle"
          tabIndex={-1}
          aria-hidden="true"
        >
          <span className="ba-compare__chevron ba-compare__chevron--left" />
          <span className="ba-compare__chevron ba-compare__chevron--right" />
        </button>
      </div>
    </div>
  );
}
