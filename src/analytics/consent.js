const STORAGE_KEY = 'bazooka-analytics-consent';
export const CONSENT_EVENT = 'bazooka-analytics-consent';

export function readAnalyticsConsent() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'granted' || value === 'denied') return value;
  } catch {
    /* private mode */
  }
  return null;
}

export function storeAnalyticsConsent(value) {
  if (value !== 'granted' && value !== 'denied') return;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
