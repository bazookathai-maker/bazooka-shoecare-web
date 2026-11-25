import { useLocale } from '../i18n/LocaleContext';

function GlobeIcon() {
  return (
    <svg
      className="header__lang-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5" />
      <path d="M12 3.75c2.15 2.35 3.25 5.15 3.25 8.25S14.15 17.9 12 20.25C9.85 17.9 8.75 15.1 8.75 12S9.85 6.1 12 3.75z" />
    </svg>
  );
}

export default function LanguageSwitcher() {
  const { locale, t, switchLocale } = useLocale();

  return (
    <div className="header__lang" role="group" aria-label={t.lang.label}>
      <GlobeIcon />
      <button
        type="button"
        className={`header__lang-option${locale === 'th' ? ' header__lang-option--active' : ''}`}
        aria-pressed={locale === 'th'}
        onClick={() => switchLocale('th')}
      >
        {t.lang.th}
      </button>
      <span className="header__lang-divider" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className={`header__lang-option${locale === 'en' ? ' header__lang-option--active' : ''}`}
        aria-pressed={locale === 'en'}
        onClick={() => switchLocale('en')}
      >
        {t.lang.en}
      </button>
    </div>
  );
}
