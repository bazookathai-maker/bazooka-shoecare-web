import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CONSENT_EVENT, readAnalyticsConsent } from '../analytics/consent';
import { trackPageView } from '../analytics/ga4';

export function useAnalyticsConsent() {
  const [consent, setConsent] = useState(readAnalyticsConsent);

  useEffect(() => {
    const refresh = () => setConsent(readAnalyticsConsent());
    window.addEventListener(CONSENT_EVENT, refresh);
    return () => window.removeEventListener(CONSENT_EVENT, refresh);
  }, []);

  return consent;
}

/** One page_view per React route change. The GA tag does not send its own. */
export default function AnalyticsListener() {
  const location = useLocation();
  const consent = useAnalyticsConsent();

  useEffect(() => {
    if (consent !== 'granted') return undefined;
    const frame = requestAnimationFrame(() => {
      trackPageView();
    });
    return () => cancelAnimationFrame(frame);
  }, [consent, location.pathname, location.search]);

  return null;
}
