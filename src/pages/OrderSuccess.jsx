import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { fetchOrderPaymentStatus } from '../api/customerAuth';
import { trackPurchase } from '../analytics/ga4';
import { useAnalyticsConsent } from '../components/AnalyticsListener';
import { loginPath } from '../utils/authRedirect';
import useSeo from '../hooks/useSeo';
import './OrderPages.css';

const POLL_INTERVAL_MS = 4000;
const POLL_WINDOW_MS = 60000;
const UNPAID_FINAL_STATUSES = new Set(['cancelled', 'refunded', 'failed']);

const COPY = {
  checking: {
    title: 'กำลังตรวจสอบการชำระเงิน',
    heading: 'กำลังตรวจสอบการชำระเงิน กรุณาอย่าชำระซ้ำ',
    text: 'ระบบกำลังรอการยืนยันจากผู้ให้บริการชำระเงิน โดยปกติใช้เวลาไม่เกิน 1 นาที',
  },
  paid: {
    title: 'ชำระเงินสำเร็จ',
    heading: 'ชำระเงินสำเร็จ ขอบคุณสำหรับคำสั่งซื้อ',
    text: 'เราได้รับการชำระเงินแล้ว และกำลังเตรียมสินค้าเพื่อจัดส่ง',
  },
  timeout: {
    title: 'ยังไม่ได้รับการยืนยันการชำระเงิน',
    heading: 'ยังไม่ได้รับการยืนยันการชำระเงิน',
    text: 'หากชำระเงินแล้ว การยืนยันอาจใช้เวลาสักครู่ กรุณาอย่าชำระซ้ำ กดตรวจสอบอีกครั้ง หรือดูสถานะในคำสั่งซื้อของฉัน',
  },
  unavailable: {
    title: 'ยังตรวจสอบสถานะไม่ได้ในขณะนี้',
    heading: 'ยังตรวจสอบสถานะการชำระเงินไม่ได้ในขณะนี้',
    text: 'ไม่ได้หมายความว่าการชำระเงินไม่สำเร็จ กรุณาอย่าชำระซ้ำ กดตรวจสอบอีกครั้ง หรือดูสถานะในคำสั่งซื้อของฉัน',
  },
  unpaid: {
    title: 'คำสั่งซื้อนี้ยังไม่ได้ชำระเงิน',
    heading: 'คำสั่งซื้อนี้ยังไม่ได้ชำระเงิน',
    text: 'ดูรายละเอียดได้ในคำสั่งซื้อของฉัน หรือติดต่อร้านหากมีข้อสงสัย',
  },
  notFound: {
    title: 'ไม่พบคำสั่งซื้อนี้ในบัญชีของคุณ',
    heading: 'ไม่พบคำสั่งซื้อนี้ในบัญชีของคุณ',
    text: 'กรุณาตรวจสอบว่าเข้าสู่ระบบด้วยบัญชีที่ใช้สั่งซื้อ หรือดูคำสั่งซื้อของฉัน',
  },
  login: {
    title: 'กรุณาเข้าสู่ระบบ',
    heading: 'เข้าสู่ระบบเพื่อตรวจสอบสถานะการชำระเงิน',
    text: 'กรุณาอย่าชำระซ้ำ เข้าสู่ระบบด้วยบัญชีที่ใช้สั่งซื้อเพื่อดูสถานะล่าสุด',
  },
};

/**
 * After Stripe: shows the order's confirmed payment state from the server (own orders only).
 * Read-only; the URL's session_id is never treated as proof of payment.
 */
function PaymentStatus({ orderId, orderNumber }) {
  const { locale, t } = useLocale();
  const orders = t.orders;
  const location = useLocation();
  const { ready, isLoggedIn } = useAuth();
  const [phase, setPhase] = useState('checking');
  const [order, setOrder] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const lastErrorRef = useRef(null);

  useEffect(() => {
    if (!ready || !isLoggedIn || !orderId) return undefined;

    let cancelled = false;
    let timer = null;
    const deadline = Date.now() + POLL_WINDOW_MS;
    lastErrorRef.current = null;

    async function poll() {
      try {
        const result = await fetchOrderPaymentStatus(orderId);
        if (cancelled) return;
        lastErrorRef.current = null;
        setOrder(result);
        if (result?.paid) {
          setPhase('paid');
          return;
        }
        if (UNPAID_FINAL_STATUSES.has(result?.status)) {
          setPhase('unpaid');
          return;
        }
      } catch (err) {
        if (cancelled) return;
        if (err?.status === 401) {
          setPhase('login');
          return;
        }
        if (err?.status === 404) {
          setPhase('notFound');
          return;
        }
        lastErrorRef.current = err;
      }

      if (Date.now() >= deadline) {
        setPhase(lastErrorRef.current ? 'unavailable' : 'timeout');
        return;
      }
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ready, isLoggedIn, orderId, attempt]);

  const consent = useAnalyticsConsent();

  useEffect(() => {
    if (consent !== 'granted' || phase !== 'paid' || !order?.id) return;
    trackPurchase({
      transactionId: order.number || order.id,
      value: order.total,
      currency: order.currency || 'THB',
    });
  }, [consent, phase, order]);

  const retry = useCallback(() => {
    setPhase('checking');
    setAttempt((n) => n + 1);
  }, []);

  let current = phase;
  if (!orderId) current = 'notFound';
  else if (ready && !isLoggedIn) current = 'login';
  const copy = orders.paymentStates[current] || orders.paymentStates.unavailable;
  const canRetry = current === 'timeout' || current === 'unavailable';
  const displayNumber = order?.number || orderNumber;

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">{orders.label}</p>
          <h1 className="order-page__title">{copy.title}</h1>
        </div>
      </header>

      <div className="container order-page__body">
        <div className="order-card order-success-card">
          <h2
            className="order-card__title"
            style={{ textAlign: 'center' }}
            role="status"
            aria-live="polite"
          >
            {copy.heading}
          </h2>

          {displayNumber ? (
            <div className="order-meta" style={{ marginBottom: '1.25rem' }}>
              <div className="order-meta__row" style={{ textAlign: 'center' }}>
                <span className="order-meta__label">{orders.orderNumberLabel}</span>
                <span className="order-meta__value order-success-card__order-id">
                  #{displayNumber}
                </span>
              </div>
              {order?.total ? (
                <div className="order-meta__row" style={{ textAlign: 'center' }}>
                  <span className="order-meta__label">{orders.amount}</span>
                  <span className="order-meta__value">
                    ฿{Number(order.total).toLocaleString('th-TH')}
                  </span>
                </div>
              ) : null}
              {order?.status_label && (current === 'paid' || current === 'unpaid') ? (
                <div className="order-meta__row" style={{ textAlign: 'center' }}>
                  <span className="order-meta__label">{orders.status}</span>
                  <span className="order-meta__value">
                    {locale === 'en' && t.account.status[order.status]
                      ? t.account.status[order.status]
                      : order.status_label}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <p className="order-success-card__text">{copy.text}</p>

          <div
            className="order-page__actions"
            style={{ justifyContent: 'center' }}
          >
            {canRetry ? (
              <button type="button" className="btn-primary" onClick={retry}>
                {orders.checkAgain}
              </button>
            ) : null}
            {current === 'login' ? (
              <LocaleLink
                to={loginPath(`${location.pathname}${location.search}`)}
                className="btn-primary"
              >
                {orders.signIn}
              </LocaleLink>
            ) : null}
            <LocaleLink
              to="/account"
              className={canRetry || current === 'login' ? 'btn-outline' : 'btn-primary'}
            >
              {orders.myOrders}
            </LocaleLink>
            <LocaleLink to="/products" className="btn-outline">
              {orders.backToProducts}
            </LocaleLink>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccess() {
  const { t } = useLocale();
  const orders = t.orders;
  useSeo({ title: orders.successTitle, noindex: true });
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const orderNumber =
    location.state?.orderNumber ||
    search.get('orderNumber') ||
    search.get('orderId') ||
    location.state?.orderId;
  const orderId = location.state?.orderId || search.get('orderId') || null;
  const fromStripeCheckout = Boolean(search.get('session_id'));

  if (fromStripeCheckout) {
    return <PaymentStatus orderId={orderId} orderNumber={orderNumber} />;
  }

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">{orders.label}</p>
          <h1 className="order-page__title">{orders.receivedTitle}</h1>
        </div>
      </header>

      <div className="container order-page__body">
        <div className="order-card order-success-card">
          <h2 className="order-card__title" style={{ textAlign: 'center' }}>
            {orders.thanks}
          </h2>

          {orderNumber ? (
            <div className="order-meta" style={{ marginBottom: '1.25rem' }}>
              <div className="order-meta__row" style={{ textAlign: 'center' }}>
                <span className="order-meta__label">{orders.orderNumberLabel}</span>
                <span className="order-meta__value order-success-card__order-id">
                  #{orderNumber}
                </span>
              </div>
              {orderId && String(orderId) !== String(orderNumber) ? (
                <div className="order-meta__row" style={{ textAlign: 'center' }}>
                  <span className="order-meta__label">Order ID</span>
                  <span className="order-meta__value">{orderId}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <p className="order-success-card__text">
              {orders.missingNumber}
            </p>
          )}

          <p className="order-success-card__text">
            {orders.recorded}
          </p>

          <div
            className="order-page__actions"
            style={{ justifyContent: 'center' }}
          >
            <LocaleLink to="/account" className="btn-primary">
              {orders.myOrders}
            </LocaleLink>
            <LocaleLink to="/products" className="btn-outline">
              {orders.backToProducts}
            </LocaleLink>
          </div>
        </div>
      </div>
    </main>
  );
}
