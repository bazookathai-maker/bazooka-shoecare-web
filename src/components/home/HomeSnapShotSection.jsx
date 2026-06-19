import { useRef } from 'react';
import { snapShot } from '../../data/homeStory';
import { useScrollParallax } from '../../hooks/useScrollParallax';
import './HomeSnapShotSection.css';

export default function HomeSnapShotSection() {
  const sectionRef = useRef(null);
  const mediaRef = useRef(null);

  useScrollParallax(sectionRef, mediaRef, { maxOffset: 64, scale: 1.08 });

  return (
    <section
      ref={sectionRef}
      className="home-snap full-bleed"
      id="snap-shot"
      aria-label="White sneakers lifestyle moment"
    >
      <div className="home-snap__frame">
        <img
          ref={mediaRef}
          className="home-snap__media"
          src={snapShot.image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={(e) => {
            if (snapShot.fallback && e.currentTarget.src !== snapShot.fallback) {
              e.currentTarget.src = snapShot.fallback;
            }
          }}
        />
      </div>
    </section>
  );
}
