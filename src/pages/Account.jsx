import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { fetchCustomerOrders } from '../api/customerAuth';
import { useAuth } from '../context/AuthContext';
import './Account.css';

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  processing: 'กำลังจัดเตรียม',
  'on-hold': 'พักไว้',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก',
  refunded: 'คืนเงิน',
  failed: 'ไม่สำเร็จ',
};

function formatOrderDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatMoney(total, currency = 'THB') {
  const amount = Number(total);
  if (!Number.isFinite(amount)) return total;
  return `${amount.toLocaleString('th-TH')} ${currency}`;
}

function customerDisplayName(customer) {
  const name = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  return name || customer?.email || 'ลูกค้า';
}

export default function Account() {
  const { ready, isLoggedIn, customer, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!ready || !isLoggedIn) return undefined;
    let cancelled = false;

    async function loadOrders() {
      setLoadingOrders(true);
      setOrdersError('');
      try {
        const list = await fetchCustomerOrders();
        if (!cancelled) setOrders(list);
      } catch (err) {
        if (!cancelled) {
          setOrdersError(
            err instanceof Error ? err.message : 'โหลดประวัติคำสั่งซื้อไม่สำเร็จ',
          );
        }
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [ready, isLoggedIn]);

  if (!ready) {
    return (
      <main className="account-page">
        <div className="container account-page__body">
          <p className="account-page__muted">กำลังโหลดบัญชี...</p>
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login?next=/account" replace />;
  }

  const billing = customer.billing || {};

  return (
    <main className="account-page">
      <header className="account-page__hero">
        <div className="container">
          <p className="section-label">บัญชี</p>
          <h1 className="account-page__title">บัญชีของฉัน</h1>
        </div>
      </header>

      <div className="container account-page__body">
        <section className="account-card">
          <div className="account-card__header">
            <h2 className="account-card__title">ข้อมูลลูกค้า</h2>
            <button type="button" className="btn-outline account-card__logout" onClick={logout}>
              ออกจากระบบ
            </button>
          </div>
          <dl className="account-meta">
            <div>
              <dt>ชื่อ</dt>
              <dd>{customerDisplayName(customer)}</dd>
            </div>
            <div>
              <dt>อีเมล</dt>
              <dd>{customer.email || '-'}</dd>
            </div>
            <div>
              <dt>โทรศัพท์</dt>
              <dd>{billing.phone || '-'}</dd>
            </div>
            <div>
              <dt>ที่อยู่</dt>
              <dd>
                {[billing.address_1, billing.address_2, billing.city, billing.state, billing.postcode]
                  .filter(Boolean)
                  .join(' ') || '-'}
              </dd>
            </div>
          </dl>
        </section>

        <section className="account-card">
          <h2 className="account-card__title">ประวัติคำสั่งซื้อ</h2>
          {loadingOrders ? (
            <p className="account-page__muted">กำลังโหลดคำสั่งซื้อ...</p>
          ) : ordersError ? (
            <p className="account-form__error" role="alert">
              {ordersError}
            </p>
          ) : orders.length === 0 ? (
            <p className="account-page__muted">
              ยังไม่มีคำสั่งซื้อ{' '}
              <Link to="/products">เลือกซื้อสินค้า</Link>
            </p>
          ) : (
            <ul className="account-orders">
              {orders.map((order) => (
                <li key={order.id} className="account-order">
                  <div className="account-order__top">
                    <p className="account-order__number">#{order.number}</p>
                    <p className="account-order__status">
                      {STATUS_LABELS[order.status] || order.status}
                    </p>
                  </div>
                  <p className="account-order__date">{formatOrderDate(order.date_created)}</p>
                  <p className="account-order__total">
                    {formatMoney(order.total, order.currency)}
                    {order.payment_method_title
                      ? ` · ${order.payment_method_title}`
                      : ''}
                  </p>
                  {order.line_items?.length ? (
                    <ul className="account-order__items">
                      {order.line_items.map((item) => (
                        <li key={item.id}>
                          {item.name} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
