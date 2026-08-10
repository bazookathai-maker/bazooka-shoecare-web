import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../components/ScrollReveal';
import { fetchStoreProducts } from '../api/woocommerce';
import { getRecommendedProducts } from '../utils/siteSearch';
import './NotFound.css';

function formatPrice(price) {
  return `฿${Number(price || 0).toLocaleString('th-TH')}`;
}

export default function NotFound() {
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetchStoreProducts()
      .then((products) => {
        if (!cancelled) {
          setRecommended(getRecommendedProducts(4, products));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecommended(getRecommendedProducts(4, []));
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="not-found-page">
      <section className="not-found-page__hero">
        <div className="container">
          <ScrollReveal className="not-found-page__hero-inner">
            <p className="not-found-page__code">404</p>
            <h1 className="not-found-page__title">ไม่พบหน้าที่คุณกำลังค้นหา</h1>
            <p className="not-found-page__subtitle">
              หน้านี้อาจถูกย้ายหรือไม่มีในเว็บไซต์แล้ว
            </p>
            <div className="not-found-page__actions">
              <Link to="/" className="not-found-page__btn not-found-page__btn--primary">
                กลับหน้าแรก
              </Link>
              <Link
                to="/products"
                className="not-found-page__btn not-found-page__btn--secondary"
              >
                ดูสินค้าทั้งหมด
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {recommended.length > 0 ? (
        <section className="not-found-page__recommend" aria-label="สินค้าแนะนำ">
          <div className="container">
            <h2 className="not-found-page__recommend-title">สินค้าแนะนำ</h2>
            <ul className="not-found-page__grid">
              {recommended.map((product) => (
                <li key={product.id}>
                  <article className="not-found-card">
                    <Link to={product.href} className="not-found-card__link">
                      <span className="not-found-card__media">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt=""
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </span>
                      <h3 className="not-found-card__name">{product.name}</h3>
                      <p className="not-found-card__price">
                        {formatPrice(product.price)}
                      </p>
                    </Link>
                    <Link to={product.href} className="not-found-card__btn">
                      ดูสินค้า
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
