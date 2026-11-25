import { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { localeFromPathname, localizePath, rememberLocale } from './locale';
import { messages } from './messages';
import { pageCopy } from './pageCopy';
import { journeyCopy } from './journeyCopy';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  const locale = localeFromPathname(pathname);

  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'th';
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      t: { ...messages[locale], ...pageCopy[locale], ...journeyCopy[locale] },
      localize: (to) => localizePath(to, locale),
      switchLocale: (nextLocale) => {
        if (nextLocale === locale) return;
        rememberLocale(nextLocale);
        navigate(`${localizePath(pathname, nextLocale)}${search}${hash}`);
      },
    }),
    [hash, locale, navigate, pathname, search],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return value;
}
