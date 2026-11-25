import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_DESCRIPTION_EN,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  formatTitle,
  hreflangAlternates,
  isEnglishPath,
} from '../utils/seo';

const JSON_LD_ID = 'seo-json-ld';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!content) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setAlternates(links) {
  document.head.querySelectorAll('link[data-seo-hreflang]').forEach((el) => el.remove());
  links.forEach((link) => {
    const el = document.createElement('link');
    el.setAttribute('rel', 'alternate');
    el.setAttribute('hreflang', link.hreflang);
    el.setAttribute('href', link.href);
    el.setAttribute('data-seo-hreflang', '');
    document.head.appendChild(el);
  });
}

function setJsonLd(text) {
  let el = document.getElementById(JSON_LD_ID);
  if (!text) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.id = JSON_LD_ID;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = text;
}

/**
 * Sets title, description, canonical, robots, Open Graph and JSON-LD for the current page.
 * Every call writes all managed tags so nothing carries over from the previous route.
 * Private noindex pages omit `path`, so they get no canonical and no hreflang.
 * A public page with a path keeps its canonical.
 */
export default function useSeo({
  title,
  fullTitle,
  description,
  path,
  noindex = false,
  image,
  type = 'website',
  jsonLd = null,
  preserveJsonLd = false,
}) {
  const { pathname } = useLocation();
  const locale = isEnglishPath(pathname) ? 'en' : 'th';
  const resolvedTitle = formatTitle({ title, fullTitle });
  const resolvedDescription = description || (locale === 'en' ? DEFAULT_DESCRIPTION_EN : DEFAULT_DESCRIPTION);
  const canonical = path && (!noindex || isEnglishPath(path)) ? absoluteUrl(path) : '';
  const alternatesKey = path ? hreflangAlternates(path).map((item) => `${item.hreflang} ${item.href}`).join('\n') : '';
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = resolvedTitle;
    setMeta('name', 'description', resolvedDescription);
    setMeta('name', 'robots', noindex ? 'noindex' : '');
    setCanonical(canonical);
    setAlternates(
      alternatesKey
        ? alternatesKey.split('\n').map((line) => {
            const space = line.indexOf(' ');
            return { hreflang: line.slice(0, space), href: line.slice(space + 1) };
          })
        : [],
    );
    setMeta('property', 'og:locale', locale === 'en' ? 'en_US' : 'th_TH');
    setMeta('property', 'og:locale:alternate', locale === 'en' ? 'th_TH' : 'en_US');
    setMeta('property', 'og:title', resolvedTitle);
    setMeta('property', 'og:description', resolvedDescription);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', image || DEFAULT_OG_IMAGE);
    setMeta('name', 'twitter:title', resolvedTitle);
    setMeta('name', 'twitter:description', resolvedDescription);
    if (!preserveJsonLd) setJsonLd(jsonLdText);
  }, [resolvedTitle, resolvedDescription, noindex, canonical, type, image, jsonLdText, preserveJsonLd, locale, alternatesKey]);

  useEffect(
    () => () => {
      setJsonLd('');
      setMeta('name', 'robots', '');
      setAlternates([]);
    },
    [],
  );
}
