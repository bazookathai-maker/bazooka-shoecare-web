import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import AddToCartButton from '../components/AddToCartButton';
import ScrollReveal from '../components/ScrollReveal';
import {
  fetchStoreProductById,
  fetchStoreProducts,
} from '../api/woocommerce';
import './ProductDetail.css';

function DetailStatus({ children, error = false }) {
  return (
    <main className="pdp">
      <div className="container">
        <p
          className={`pdp__status${error ? ' pdp__status--error' : ''}`}
          role={error ? 'alert' : 'status'}
        >
          {children}
        </p>
        <div className="pdp__actions" style={{ marginTop: '1.5rem' }}>
          <Link to="/products" className="btn-primary">
            กลับไปที่สินค้า
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetail() {
  const { slug: productId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  const actionsMediaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError('');
      setNotFound(false);
      setDetail(null);

      try {
        const product = await fetchStoreProductById(productId);
        if (cancelled) return;

        if (!product) {
          setNotFound(true);
          return;
        }

        let recommended = [];
        try {
          const allProducts = await fetchStoreProducts();
          if (!cancelled) {
            recommended = allProducts
              .filter((item) => item.id !== product.id)
              .slice(0, 4);
          }
        } catch {
          recommended = [];
        }

        if (!cancelled) {
          setDetail({ ...product, recommended });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'ไม่สามารถโหลดสินค้าได้ กรุณาลองใหม่อีกครั้ง',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return <DetailStatus>กำลังโหลดสินค้า...</DetailStatus>;
  }

  if (error) {
    return <DetailStatus error>{error}</DetailStatus>;
  }

  if (notFound || !detail) {
    return (
      <DetailStatus error>
        ไม่พบสินค้า กรุณาตรวจสอบอีกครั้งหรือกลับไปเลือกจากหน้ารายการสินค้า
      </DetailStatus>
    );
  }

  const hasAbout = Boolean(detail.aboutDescription);
  const hasBenefits = detail.benefits?.length > 0;
  const hasHowTo = Boolean(detail.howToText);
  const realCategories =
    detail.categories?.filter(
      (item) =>
        item.name &&
        item.name.toLowerCase() !== 'uncategorized' &&
        item.name !== 'ไม่มีหมวดหมู่',
    ) ?? [];
  const hasMeta = Boolean(detail.sku) || realCategories.length > 0;

  return (
    <main className="pdp">
      <nav className="pdp__breadcrumb container" aria-label="เส้นทางนำทาง">
        <Link to="/">หน้าแรก</Link>
        <span className="pdp__breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <Link to="/products">สินค้า</Link>
        <span className="pdp__breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="pdp__breadcrumb-current">
          {detail.breadcrumbLabel ?? detail.name}
        </span>
      </nav>

      <section className="pdp__hero container">
        <div className="pdp__layout">
          {detail.gallery?.length > 0 ? (
            <ProductGallery images={detail.gallery} />
          ) : null}

          <div className="pdp__info">
            <h1 className="pdp__name">{detail.name}</h1>
            <p className="pdp__price">฿{detail.price.toLocaleString()}</p>
            {detail.heroDescription ? (
              <p className="pdp__description">{detail.heroDescription}</p>
            ) : null}
            <p
              className={`pdp__stock${
                detail.isInStock ? '' : ' pdp__stock--out'
              }`}
            >
              {detail.stockLabelShort || detail.stockLabel}
            </p>

            <div className="pdp__actions" ref={actionsMediaRef}>
              {detail.image ? (
                <img
                  src={detail.image}
                  alt=""
                  className="pdp__actions-fly-source"
                  aria-hidden="true"
                />
              ) : null}
              {detail.isInStock ? (
                <AddToCartButton
                  product={detail}
                  mediaRef={actionsMediaRef}
                />
              ) : (
                <button type="button" className="btn-primary" disabled>
                  สินค้าหมด
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {hasAbout ? (
        <section className="pdp__section pdp__content" id="about">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">รายละเอียด</p>
              <h2 className="pdp__section-title">เกี่ยวกับสินค้า</h2>
            </header>
            <p className="pdp__prose">{detail.aboutDescription}</p>
          </div>
        </section>
      ) : null}

      {hasBenefits ? (
        <section className="pdp__section pdp__highlights" id="highlights">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">Highlights</p>
              <h2 className="pdp__section-title">จุดเด่น</h2>
            </header>
            <ul className="pdp__benefit-list">
              {detail.benefits.slice(0, 6).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {hasHowTo ? (
        <section className="pdp__section pdp__howto" id="how-to-use">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">Usage</p>
              <h2 className="pdp__section-title">วิธีใช้</h2>
            </header>
            <p className="pdp__prose">{detail.howToText}</p>
          </div>
        </section>
      ) : null}

      {hasMeta ? (
        <section className="pdp__section pdp__meta" id="more-details">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">Info</p>
              <h2 className="pdp__section-title">รายละเอียดเพิ่มเติม</h2>
            </header>
            <dl className="pdp__meta-list">
              {detail.sku ? (
                <div className="pdp__meta-row">
                  <dt>SKU</dt>
                  <dd>{detail.sku}</dd>
                </div>
              ) : null}
              {realCategories.length > 0 ? (
                <div className="pdp__meta-row">
                  <dt>หมวดหมู่</dt>
                  <dd>{realCategories.map((item) => item.name).join(', ')}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>
      ) : null}

      {detail.recommended?.length > 0 && (
        <section className="pdp__section pdp__recommended">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">More</p>
              <h2 className="pdp__section-title">สินค้าแนะนำ</h2>
            </header>
            <div className="pdp__recommended-grid">
              {detail.recommended.map((product, index) => (
                <ScrollReveal
                  key={product.id}
                  delay={index * 60}
                  className="pdp__recommended-item"
                >
                  <ProductCard
                    product={product}
                    variant="recommend"
                    showAddToCart={false}
                    showPrice
                    linkToDetail
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
