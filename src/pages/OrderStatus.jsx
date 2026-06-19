import { Link, useParams } from 'react-router-dom';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import { PAYMENT_LABELS, getOrderById } from '../utils/orderStorage';
import './OrderPages.css';

function formatOrderDate(isoString) {
  if (!isoString) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));
}

export default function OrderStatus() {
  const { orderId } = useParams();
  const order = getOrderById(orderId);

  if (!order) {
    return (
      <main className="order-page">
        <header className="order-page__hero">
          <div className="container">
            <p className="section-label">คำสั่งซื้อ</p>
            <h1 className="order-page__title">ตรวจสอบสถานะคำสั่งซื้อ</h1>
          </div>
        </header>
        <div className="container order-page__body">
          <p className="order-page__message" role="alert">
            ไม่พบคำสั่งซื้อ กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง
          </p>
          <div className="order-page__actions" style={{ justifyContent: 'center' }}>
            <Link to="/track-order" className="btn-primary">
              ติดตามคำสั่งซื้อ
            </Link>
            <Link to="/products" className="btn-outline">
              กลับไปที่สินค้า
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const paymentLabel = PAYMENT_LABELS[order.payment] || order.payment;

  return (
    <main className="order-page">
      <header className="order-page__hero">
        <div className="container">
          <p className="section-label">คำสั่งซื้อ</p>
          <h1 className="order-page__title">ตรวจสอบสถานะคำสั่งซื้อ</h1>
          <p className="order-page__lead">
            ขอบคุณสำหรับคำสั่งซื้อ — ทีมงานจะติดต่อกลับโดยเร็ว
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
                    {order.id}
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
                <div className="order-meta__row" style={{ gridColumn: '1 / -1' }}>
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
                {order.items?.map((item) => (
                  <li key={item.id} className="order-items__item">
                    <div className="order-items__media">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="order-items__image"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="order-items__details">
                      <h3 className="order-items__name">{item.name}</h3>
                      <p className="order-items__meta">
                        จำนวน {item.quantity} ชิ้น · ฿
                        {item.price.toLocaleString()} / ชิ้น
                      </p>
                      <p className="order-items__price">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="order-total">
                <span className="order-total__label">รวมทั้งสิ้น</span>
                <span className="order-total__value">
                  ฿{order.total?.toLocaleString()}
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
