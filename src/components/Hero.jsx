import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero hero--cinematic">
      <div className="hero__overlay" aria-hidden="true" />

      <div className="hero__media" aria-hidden="true">
        <picture>
          <source
            media="(min-width: 1600px)"
            srcSet="/hero-large-1920.jpg"
            type="image/jpeg"
          />
          <source
            media="(min-width: 1280px)"
            srcSet="/hero-large-1440.jpg"
            type="image/jpeg"
          />
          <source
            media="(min-width: 1024px)"
            srcSet="/hero-large-1024.jpg"
            type="image/jpeg"
          />
          <source
            media="(max-width: 768px)"
            srcSet="/hero-mobile-fill.jpg"
            type="image/jpeg"
          />
          <img
            className="hero__bg"
            src="/hero-large-mobile.jpg"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </picture>
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
