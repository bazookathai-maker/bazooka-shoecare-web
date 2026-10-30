import { useLayoutEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';
import { heroPictureFallback, heroPictureSources } from './heroPicture';

function HeroPicture() {
  return (
    <picture>
      {heroPictureSources.map((source) => (
        <source
          key={source.srcSet}
          media={source.media}
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      <img
        className="hero__bg"
        src={heroPictureFallback}
        alt=""
        fetchPriority="high"
      />
    </picture>
  );
}

export default function Hero() {
  const [useShell] = useState(
    () => typeof document !== 'undefined' && Boolean(document.getElementById('hero-lcp-slot')),
  );

  useLayoutEffect(() => {
    const slot = document.getElementById('hero-lcp-slot');
    if (!slot) return undefined;
    slot.hidden = false;
    return () => {
      slot.hidden = true;
    };
  }, []);

  return (
    <section className={useShell ? 'hero hero--cinematic hero--shell' : 'hero hero--cinematic'}>
      {useShell ? null : <div className="hero__overlay" aria-hidden="true" />}

      <div className="hero__media" aria-hidden="true">
        {useShell ? null : <HeroPicture />}
      </div>

      <div className="hero__content container">
        <div className="hero__copy">
          <h1 className="hero__headline">
            <span>ดูแลรองเท้า</span>
            <span>ได้ครบในเซตเดียว</span>
          </h1>

          <div className="hero__actions">
            <Link to="/products" className="btn-primary">
              เลือกซื้อสินค้า
            </Link>
            <Link
              to="#how-to-care"
              className="btn-outline hero__cta-secondary"
            >
              ดูวิธีดูแลรองเท้า
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
