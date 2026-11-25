import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import LocaleLink from '../components/LocaleLink';
import { useLocale } from '../i18n/LocaleContext';
import { translateKnown } from '../i18n/knownMessages';
import { localizedProductName } from '../i18n/productCopy';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import useSeo from '../hooks/useSeo';
import './OrderPages.css';

const TRACK_ORDER_API_URL = '/api/track-order';

function formatOrderDate(isoString, locale) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

async function verifyOrderWithPhone(orderId, phone) {
  const response = await fetch(TRACK_ORDER_API_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({ orderId, phone }),
    cache: 'no-store',
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.order) {
    const err = new Error(
      (data && typeof data.message === 'string' && data.message.trim()) ||
        'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง',
    );
    err.status = response.status;
    throw err;
  }

  return data.order;
}

export default function OrderStatus() {
  const { locale, t, localize } = useLocale();
  const orders = t.orders;
  useSeo({ title: orders.statusTitle, noindex: true });
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Only accept a just-verified navigation from /track-order (same navigation).
  // Direct URL / refresh never auto-loads customer PII.
  useEffect(() => {
    try {
      sessionStorage.removeItem('bazooka_tracked_order');
    } catch {
      // ignore
    }
    const fromTrack =
      location.state?.phoneVerified === true &&
      location.state?.order &&
      String(location.state.order.id) === String(orderId)
        ? location.state.order
        : null;
    setOrder(fromTrack);
    setError('');
    setPhone('');
  }, [orderId, location.state]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const verified = await verifyOrderWithPhone(orderId, phone);
      setOrder(verified);
    } catch (err) {
      setOrder(null);
      setError(
        err instanceof Error
          ? err.message
          : 'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเบอร์โทรศัพท์อีกครั้ง',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <main className="order-page">
        <header className="order-page__hero">
          <div className="container">
            <p className="section-label">{orders.label}</p>
            <h1 className="order-page__title">{orders.verifyTitle}</h1>
            <p className="order-page__lead">
              {orders.verifyLead}
              {orderId}
            </p>
          </div>
        </header>

        <div className="container order-page__body">
          <form className="order-track-form" onSubmit={handleVerify}>
            <div className="order-track-form__fields">
              <label className="order-track-form__field">
                <span className="order-track-form__label">{orders.orderId}</span>
                <input
                  type="text"
                  value={orderId || ''}
                  readOnly
                  className="order-track-form__input"
                  aria-readonly="true"
                />
              </label>
              <label className="order-track-form__field">
                <span className="order-track-form__label">{orders.phone}</span>
                <input
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(event) => {
                    setPhone(event.target.value);
                    if (error) setError('');
                  }}
                  required
                  className="order-track-form__input"
                  placeholder={orders.phoneShortPlaceholder}
                  autoComplete="tel"
                  disabled={loading}
                />
              </label>
            </div>

            {error ? (
              <p
                className="order-page__message"
                role="alert"
                style={{ marginTop: '1.25rem' }}
              >
                {translateKnown(locale, error)}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-primary order-track-form__submit"
              disabled={loading || !String(phone || '').trim()}
            >
              {loading ? orders.verifying : orders.verify}
            </button>
          </form>

          <div
            className="order-page__actions"
            style={{ justifyContent: 'center', marginTop: '1.5rem' }}
          >
            <LocaleLink to="/track-order" className="btn-outline">
              {orders.another}
            </LocaleLink>
          </div>
        </div>
      </main>
    );
  }

  const paymentLabel = translateKnown(locale, order.payment || order.paymentMethod || '-');
  const statusLabel = order.statusLabel || order.wooStatus || order.status || '';

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">{orders.label}</p>
          <h1 className="order-page__title">{orders.verifyTitle}</h1>
          <p className="order-page__lead">
            {orders.wooStatus}
            {statusLabel ? ` — ${statusLabel}` : ''}
          </p>
        </div>
      </header>

      <div className="container order-page__body">
        <div className="order-page__layout order-page__layout--status">
          <div className="order-page__main">
            <section className="order-card">
              <h2 className="order-card__title">{orders.details}</h2>
              <div className="order-meta order-meta--grid">
                <div className="order-meta__row">
                  <span className="order-meta__label">{orders.orderNumber}</span>
                  <span className="order-meta__value order-meta__value--id">
                    #{order.id}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">{orders.orderedOn}</span>
                  <span className="order-meta__value">
                    {formatOrderDate(order.createdAt, locale)}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">{orders.fullName}</span>
                  <span className="order-meta__value">
                    {order.customer?.fullName || '-'}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">{orders.phone}</span>
                  <span className="order-meta__value">
                    {order.customer?.phone || '-'}
                  </span>
                </div>
                <div
                  className="order-meta__row"
                  style={{ gridColumn: '1 / -1' }}
                >
                  <span className="order-meta__label">{orders.shippingAddress}</span>
                  <span className="order-meta__value">
                    {order.address?.fullAddress || '-'}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">{orders.payment}</span>
                  <span className="order-meta__value">{paymentLabel}</span>
                </div>
              </div>
            </section>

            <section className="order-card" style={{ marginTop: '1.25rem' }}>
              <h2 className="order-card__title">{orders.items}</h2>
              <ul className="order-items">
                {(order.items || []).map((item) => (
                  <li key={item.id} className="order-items__item">
                    {item.image ? (
                      <div className="order-items__media">
                        <img
                          src={item.image}
                          alt={localizedProductName(item.productId, item.name, locale)}
                          className="order-items__image"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : null}
                    <div className="order-items__details">
                      <h3 className="order-items__name">{localizedProductName(item.productId, item.name, locale)}</h3>
                      <p className="order-items__meta">
                        {orders.quantity(item.quantity)}
                        {item.price
                          ? ` · ฿${Number(item.price).toLocaleString()} / ${orders.each}`
                          : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="order-total">
                <span className="order-total__label">{orders.total}</span>
                <span className="order-total__value">
                  ฿{Number(order.total || 0).toLocaleString()}
                </span>
              </div>
            </section>
          </div>

          <aside>
            <section className="order-card">
              <h2 className="order-card__title">{orders.delivery}</h2>
              <OrderStatusTimeline status={order.status} />
            </section>
            {order.tracking?.length ? (
              <section className="order-card" style={{ marginTop: '1.25rem' }}>
                <h2 className="order-card__title">{orders.parcel}</h2>
                <div className="order-meta">
                  {order.tracking.map((tracking) => (
                    <div
                      key={`${tracking.provider}-${tracking.number}`}
                      className="order-meta__row"
                    >
                      <span className="order-meta__label">
                        {tracking.provider || orders.carrier}
                      </span>
                      <span className="order-meta__value">
                        {tracking.number}
                        {tracking.link ? (
                          <>
                            {' · '}
                            <a href={tracking.link} target="_blank" rel="noopener noreferrer">
                              {orders.trackParcel}
                            </a>
                          </>
                        ) : null}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>

        <div className="order-page__actions">
          <LocaleLink to="/products" className="btn-primary">
            {orders.continue}
          </LocaleLink>
          <LocaleLink to="/track-order" className="btn-outline">
            {orders.trackOther}
          </LocaleLink>
        </div>
      </div>
    </main>
  );
}
