import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import './OrderPages.css';

const TRACK_ORDER_API_URL = '/api/track-order';

function formatOrderDate(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return new Intl.DateTimeFormat('th-TH', {
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
            <p className="section-label">คำสั่งซื้อ</p>
            <h1 className="order-page__title">ตรวจสอบสถานะคำสั่งซื้อ</h1>
            <p className="order-page__lead">
              กรอกเบอร์โทรศัพท์ที่ใช้สั่งซื้อเพื่อยืนยันก่อนดูรายละเอียดคำสั่งซื้อ #
              {orderId}
            </p>
          </div>
        </header>

        <div className="container order-page__body">
          <form className="order-track-form" onSubmit={handleVerify}>
            <div className="order-track-form__fields">
              <label className="order-track-form__field">
                <span className="order-track-form__label">เลขคำสั่งซื้อ</span>
                <input
                  type="text"
                  value={orderId || ''}
                  readOnly
                  className="order-track-form__input"
                  aria-readonly="true"
                />
              </label>
              <label className="order-track-form__field">
                <span className="order-track-form__label">เบอร์โทรศัพท์</span>
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
                  placeholder="เบอร์ที่ใช้สั่งซื้อ"
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
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              className="btn-primary order-track-form__submit"
              disabled={loading || !String(phone || '').trim()}
            >
              {loading ? 'กำลังยืนยัน...' : 'ยืนยันเบอร์โทรศัพท์'}
            </button>
          </form>

          <div
            className="order-page__actions"
            style={{ justifyContent: 'center', marginTop: '1.5rem' }}
          >
            <Link to="/track-order" className="btn-outline">
              ค้นหาด้วยเลขคำสั่งซื้ออื่น
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const paymentLabel = order.payment || order.paymentMethod || '-';
  const statusLabel = order.wooStatus || order.status || '';

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">คำสั่งซื้อ</p>
          <h1 className="order-page__title">ตรวจสอบสถานะคำสั่งซื้อ</h1>
          <p className="order-page__lead">
            สถานะจาก WooCommerce
            {statusLabel ? ` — ${statusLabel}` : ''}
          </p>
        </div>
      </header>

      <div className="container order-page__body">
        <div className="order-page__layout order-page__layout--status">
          <div className="order-page__main">
            <section className="order-card">
              <h2 className="order-card__title">ข้อมูลคำสั่งซื้อ</h2>
              <div className="order-meta order-meta--grid">
                <div className="order-meta__row">
                  <span className="order-meta__label">เลขคำสั่งซื้อ</span>
                  <span className="order-meta__value order-meta__value--id">
                    #{order.id}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">วันที่สั่งซื้อ</span>
                  <span className="order-meta__value">
                    {formatOrderDate(order.createdAt)}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">ชื่อ-นามสกุล</span>
                  <span className="order-meta__value">
                    {order.customer?.fullName || '-'}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">เบอร์โทรศัพท์</span>
                  <span className="order-meta__value">
                    {order.customer?.phone || '-'}
                  </span>
                </div>
                <div
                  className="order-meta__row"
                  style={{ gridColumn: '1 / -1' }}
                >
                  <span className="order-meta__label">ที่อยู่จัดส่ง</span>
                  <span className="order-meta__value">
                    {order.address?.fullAddress || '-'}
                  </span>
                </div>
                <div className="order-meta__row">
                  <span className="order-meta__label">ช่องทางชำระเงิน</span>
                  <span className="order-meta__value">{paymentLabel}</span>
                </div>
              </div>
            </section>

            <section className="order-card" style={{ marginTop: '1.25rem' }}>
              <h2 className="order-card__title">รายการสินค้า</h2>
              <ul className="order-items">
                {(order.items || []).map((item) => (
                  <li key={item.id} className="order-items__item">
                    {item.image ? (
                      <div className="order-items__media">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-items__image"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : null}
                    <div className="order-items__details">
                      <h3 className="order-items__name">{item.name}</h3>
                      <p className="order-items__meta">
                        จำนวน {item.quantity} ชิ้น
                        {item.price
                          ? ` · ฿${Number(item.price).toLocaleString()} / ชิ้น`
                          : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="order-total">
                <span className="order-total__label">รวมทั้งสิ้น</span>
                <span className="order-total__value">
                  ฿{Number(order.total || 0).toLocaleString()}
                </span>
              </div>
            </section>
          </div>

          <aside>
            <section className="order-card">
              <h2 className="order-card__title">สถานะการจัดส่ง</h2>
              <OrderStatusTimeline status={order.status} />
            </section>
          </aside>
        </div>

        <div className="order-page__actions">
          <Link to="/products" className="btn-primary">
            ช้อปต่อ
          </Link>
          <Link to="/track-order" className="btn-outline">
            ติดตามคำสั่งซื้ออื่น
          </Link>
        </div>
      </div>
    </main>
  );
}
