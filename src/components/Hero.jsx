import { useLocale } from '../i18n/LocaleContext';
import LocaleLink from './LocaleLink';
import './Hero.css';

export default function Hero() {
  const { t } = useLocale();

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
            <span>{t.home.heroLine1}</span>
            <span>{t.home.heroLine2}</span>
          </h1>

          <div className="hero__actions">
            <LocaleLink to="/products" className="btn-primary">
              {t.home.shop}
            </LocaleLink>
            <LocaleLink
              to="#how-to-care"
              className="btn-outline hero__cta-secondary"
            >
              {t.home.howTo}
            </LocaleLink>
          </div>
        </div>
      </div>
    </section>
  );
}
