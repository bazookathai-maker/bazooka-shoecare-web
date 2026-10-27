import { useAnalyticsConsent } from './AnalyticsListener';
import { storeAnalyticsConsent } from '../analytics/consent';
import './CookieNotice.css';

export default function CookieNotice() {
  const consent = useAnalyticsConsent();
  if (consent) return null;

  return (
    <div className="cookie-notice" role="dialog" aria-label="การยินยอมคุกกี้">
      <p className="cookie-notice__text">
        เราใช้คุกกี้เพื่อวัดจำนวนผู้เข้าชมและหน้าที่ถูกเปิดดู
        ระบบจะไม่ส่งชื่อ อีเมล เบอร์โทร หรือที่อยู่ของคุณ
      </p>
      <div className="cookie-notice__actions">
        <button
          type="button"
          className="btn-outline cookie-notice__button"
          onClick={() => storeAnalyticsConsent('denied')}
        >
          ไม่ยอมรับ
        </button>
        <button
          type="button"
          className="btn-primary cookie-notice__button"
          onClick={() => storeAnalyticsConsent('granted')}
        >
          ยอมรับ
        </button>
      </div>
    </div>
  );
}
