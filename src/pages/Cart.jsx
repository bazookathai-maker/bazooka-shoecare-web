import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function formatPrice(value) {
  return `฿${Number(value || 0).toLocaleString('th-TH')}`;
}

function lineAmount(item) {
  if (Number.isFinite(item.lineTotal)) return item.lineTotal;
  return Number(item.price || 0) * Number(item.quantity || 0);
}

export default function Cart() {
  const {
    items,
    count,
    itemsTotal,
    total,
    loading,
    hydrating,
    error,
    updateQuantity,
  } = useCart();

  if ((hydrating || loading) && items.length === 0) {
    return (
      <main className="cart-page cart-page--empty">
        <div className="container cart-page__empty-inner">
          <p className="section-label">ตะกร้า</p>
          <h1 className="cart-page__title">ตะกร้าสินค้า</h1>
          <p className="cart-page__empty-message">กำลังโหลดตะกร้า...</p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="cart-page cart-page--empty">
        <div className="container cart-page__empty-inner">
          <p className="section-label">ตะกร้า</p>
          <h1 className="cart-page__title">ตะกร้าสินค้า</h1>
          <p className="cart-page__empty-message">ยังไม่มีสินค้าในตะกร้า</p>
          {error ? (
            <p className="cart-page__error" role="alert">
              {error}
            </p>
          ) : null}
          <Link to="/products" className="btn-primary">
            กลับไปที่สินค้า
          </Link>
        </div>
      </main>
    );
  }

  const displayTotal = Number(total) > 0 ? total : itemsTotal;

  return (
    <main className="cart-page">
      <header className="cart-page__hero">
        <div className="container">
          <p className="section-label">ตะกร้า</p>
          <h1 className="cart-page__title">ตะกร้าสินค้า</h1>
          <p className="cart-page__subtitle">
            {loading ? 'กำลังอัปเดต...' : `${count} ชิ้นในตะกร้า`}
          </p>
        </div>
      </header>

      <div className="container cart-page__layout">
        {error ? (
          <p className="cart-page__error" role="alert">
            {error}
          </p>
        ) : null}

        <ul className="cart-page__list">
          {items.map((item) => (
            <li key={item.key || item.id} className="cart-page__item">
              <div className="cart-page__media">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </div>

              <div className="cart-page__details">
                <div className="cart-page__heading">
                  <h2 className="cart-page__name">{item.name}</h2>
                </div>

                <p className="cart-page__unit">
                  {formatPrice(item.price)} / ชิ้น
                </p>

                <div className="cart-page__controls">
                  <div className="cart-page__qty">
                    <button
                      type="button"
                      aria-label={`ลดจำนวน ${item.name}`}
                      disabled={loading}
                      onClick={() => {
                        void updateQuantity(item.key, item.quantity - 1);
                      }}
                    >
                      −
                    </button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`เพิ่มจำนวน ${item.name}`}
                      disabled={loading}
                      onClick={() => {
                        void updateQuantity(item.key, item.quantity + 1);
                      }}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cart-page__remove"
                    disabled={loading}
                    onClick={() => {
                      void updateQuantity(item.key, 0);
                    }}
                  >
                    ลบสินค้า
                  </button>

                  <p className="cart-page__line-total">
                    {formatPrice(lineAmount(item))}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="cart-page__summary">
          <div className="cart-page__total-row">
            <span>รวมทั้งสิ้น</span>
            <strong>{formatPrice(displayTotal)}</strong>
          </div>
          <Link to="/checkout" className="btn-primary cart-page__checkout">
            ไปชำระเงิน
          </Link>
          <Link to="/products" className="btn-outline cart-page__continue">
            เลือกซื้อต่อ
          </Link>
        </aside>
      </div>
    </main>
  );
}
