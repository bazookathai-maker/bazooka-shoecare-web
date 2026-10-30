/** Shared hero <picture> sources. The homepage shell and <Hero> must select the same file. */
export const heroPictureSources = [
  { media: '(min-width: 1600px)', srcSet: '/hero-large-1920.jpg', type: 'image/jpeg' },
  { media: '(min-width: 1280px)', srcSet: '/hero-large-1440.jpg', type: 'image/jpeg' },
  { media: '(min-width: 1024px)', srcSet: '/hero-large-1024.jpg', type: 'image/jpeg' },
  { media: '(max-width: 768px)', srcSet: '/hero-mobile.webp', type: 'image/webp' },
  { media: '(max-width: 768px)', srcSet: '/hero-mobile-fill.jpg', type: 'image/jpeg' },
];

export const heroPictureFallback = '/hero-large-mobile.jpg';

/** First-HTML hero box for the homepage only. React moves #hero-lcp into the live hero. */
export function renderHeroLcpShell() {
  const sources = heroPictureSources
    .map(
      (source) =>
        `<source media="${source.media}" srcset="${source.srcSet}" type="${source.type}" />`,
    )
    .join('');

  return (
    `<section id="hero-lcp-slot" class="hero hero--cinematic" aria-hidden="true">` +
    `<div class="hero__overlay"></div>` +
    `<div class="hero__media">` +
    `<picture id="hero-lcp">${sources}` +
    `<img class="hero__bg" src="${heroPictureFallback}" alt="" fetchpriority="high" />` +
    `</picture></div>` +
    `<div class="hero__content"></div>` +
    `</section>`
  );
}
