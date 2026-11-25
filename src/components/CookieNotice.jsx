import { useAnalyticsConsent } from './AnalyticsListener';
import { storeAnalyticsConsent } from '../analytics/consent';
import { useLocale } from '../i18n/LocaleContext';
import './CookieNotice.css';

export default function CookieNotice() {
  const consent = useAnalyticsConsent();
  const { t } = useLocale();
  if (consent) return null;

  return (
    <div className="cookie-notice" role="dialog" aria-label={t.cookie.label}>
      <p className="cookie-notice__text">{t.cookie.text}</p>
      <div className="cookie-notice__actions">
        <button
          type="button"
          className="btn-outline cookie-notice__button"
          onClick={() => storeAnalyticsConsent('denied')}
        >
          {t.cookie.deny}
        </button>
        <button
          type="button"
          className="btn-primary cookie-notice__button"
          onClick={() => storeAnalyticsConsent('granted')}
        >
          {t.cookie.accept}
        </button>
      </div>
    </div>
  );
}
