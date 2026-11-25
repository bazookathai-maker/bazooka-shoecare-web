export const LOCALE_STORAGE_KEY = 'bazooka-locale';

export function localeFromPathname(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'th';
}

export function stripLocale(pathname) {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname || '/';
}

export function localizePath(to, locale) {
  if (typeof to !== 'string' || to.length === 0) return to;
  if (
    to.startsWith('#') ||
    to.startsWith('mailto:') ||
    to.startsWith('tel:') ||
    /^https?:\/\//i.test(to)
  ) {
    return to;
  }

  const splitAt = ['?', '#'].reduce((index, mark) => {
    const found = to.indexOf(mark);
    if (found === -1) return index;
    return index === -1 ? found : Math.min(index, found);
  }, -1);
  const path = splitAt === -1 ? to : to.slice(0, splitAt);
  const suffix = splitAt === -1 ? '' : to.slice(splitAt);
  const absolute = path.startsWith('/') ? path : `/${path}`;
  const bare = stripLocale(absolute);
  const localized = locale === 'en' ? (bare === '/' ? '/en' : `/en${bare}`) : bare;
  return `${localized}${suffix}`;
}

export function rememberLocale(locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage can be blocked. The URL remains the source of truth.
  }
}
