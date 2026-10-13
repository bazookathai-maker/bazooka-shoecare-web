import { useEffect } from 'react';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
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
 * `noindex` pages get no canonical.
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
}) {
  const resolvedTitle = fullTitle || (title ? `${title} | ${SITE_NAME}` : SITE_NAME);
  const resolvedDescription = description || DEFAULT_DESCRIPTION;
  const canonical = !noindex && path ? absoluteUrl(path) : '';
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = resolvedTitle;
    setMeta('name', 'description', resolvedDescription);
    setMeta('name', 'robots', noindex ? 'noindex' : '');
    setCanonical(canonical);
    setMeta('property', 'og:title', resolvedTitle);
    setMeta('property', 'og:description', resolvedDescription);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', image || DEFAULT_OG_IMAGE);
    setMeta('name', 'twitter:title', resolvedTitle);
    setMeta('name', 'twitter:description', resolvedDescription);
    setJsonLd(jsonLdText);
  }, [resolvedTitle, resolvedDescription, noindex, canonical, type, image, jsonLdText]);

  useEffect(
    () => () => {
      setJsonLd('');
      setMeta('name', 'robots', '');
    },
    [],
  );
}
