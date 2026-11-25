import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../i18n/LocaleContext';
import { translateKnown } from '../i18n/knownMessages';
import useSeo from '../hooks/useSeo';
import './OrderPages.css';

const TRACK_ORDER_API_URL = '/api/track-order';

export default function TrackOrder() {
  const { locale, t, localize } = useLocale();
  const orders = t.orders;
  useSeo({ title: orders.trackTitle, noindex: true });
  const navigate = useNavigate();
  const [form, setForm] = useState({ orderId: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(TRACK_ORDER_API_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          orderId: form.orderId,
          phone: form.phone,
        }),
        cache: 'no-store',
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok || !data?.order) {
        throw new Error(
          (data && typeof data.message === 'string' && data.message.trim()) ||
            'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง',
        );
      }

      // Pass verified order only via navigation state (lost on hard refresh /
      // direct URL). Never persist customer PII in sessionStorage.
      navigate(localize(`/order-status/${encodeURIComponent(data.order.id)}`), {
        replace: false,
        state: { order: data.order, phoneVerified: true },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">{orders.label}</p>
          <h1 className="order-page__title">{orders.trackTitle}</h1>
          <p className="order-page__lead">{orders.trackLead}</p>
        </div>
      </header>

      <div className="container order-page__body">
        <form className="order-track-form" onSubmit={handleSubmit}>
          <div className="order-track-form__fields">
            <label className="order-track-form__field">
              <span className="order-track-form__label">{orders.orderId}</span>
              <input
                type="text"
                name="orderId"
                value={form.orderId}
                onChange={handleChange}
                required
                className="order-track-form__input"
                placeholder={orders.orderIdPlaceholder}
                autoComplete="off"
                disabled={loading}
              />
            </label>

            <label className="order-track-form__field">
              <span className="order-track-form__label">{orders.phone}</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="order-track-form__input"
                placeholder={orders.phonePlaceholder}
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
            disabled={loading}
          >
            {loading ? orders.searching : orders.check}
          </button>
        </form>
      </div>
    </main>
  );
}
