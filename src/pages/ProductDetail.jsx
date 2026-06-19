import { Link, Navigate, useParams } from 'react-router-dom';
import ProductGallery from '../components/ProductGallery';
import ProductCard from '../components/ProductCard';
import CinematicVideo from '../components/CinematicVideo';
import ScrollReveal from '../components/ScrollReveal';
import { ProductRelatedArticles } from '../components/HubRelatedContent';
import { getProductDetailBySlug } from '../data/productDetails';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const detail = getProductDetailBySlug(slug);

  if (!detail) {
    return <Navigate to="/products" replace />;
  }

  return (
    <main className="pdp pdp--usage">
      <nav className="pdp__breadcrumb container" aria-label="เส้นทางนำทาง">
        <Link to="/">หน้าแรก</Link>
        <span className="pdp__breadcrumb-sep" aria-hidden="true">
          /
        </span>
        <span className="pdp__breadcrumb-current">
          {detail.breadcrumbLabel ?? detail.name}
        </span>
      </nav>

      <section className="pdp__hero container">
        <div className="pdp__layout">
          <ProductGallery images={detail.gallery} />

          <div className="pdp__info">
            <p className="pdp__category">{detail.category}</p>
            <h1 className="pdp__name">{detail.name}</h1>
            <p className="pdp__description">{detail.description}</p>
            <p className="pdp__usage-intro">{detail.usageIntro}</p>

            {detail.benefits?.length > 0 && (
              <ul className="pdp__benefits">
                {detail.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}

            <div className="pdp__actions">
              <Link to="/products" className="btn-primary">
                เลือกซื้อสินค้า
              </Link>
              <a href="#how-to-use" className="btn-outline">
                ดูวิธีดูแลรองเท้า
              </a>
            </div>
          </div>
        </div>
      </section>

      {detail.howToUse?.length > 0 && (
        <section className="pdp__section pdp__steps" id="how-to-use">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">วิธีใช้</p>
              <h2 className="pdp__section-title">พิธีการดูแล</h2>
              <p className="pdp__section-desc">
                ขั้นตอนการดูแลที่ออกแบบมาสำหรับชีวิตจริง — ไม่ซับซ้อน
              </p>
            </header>
            <ol className="pdp__steps-list">
              {detail.howToUse.map((step) => (
                <li key={step.step} className="pdp__steps-item">
                  <span className="pdp__steps-num">{step.step}</span>
                  <div>
                    <h3 className="pdp__steps-title">{step.title}</h3>
                    <p className="pdp__steps-text">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="pdp__section pdp__cleaning-gallery" id="cleaning-gallery">
        <div className="container pdp__section-inner">
          <header className="pdp__section-header">
            <p className="section-label">คู่มือทำความสะอาด</p>
            <h2 className="pdp__section-title">วิธีทำ</h2>
            <p className="pdp__section-desc">
              ดูลำดับการดูแลรองเท้าตั้งแต่เตรียมอุปกรณ์จนถึงผลลัพธ์
            </p>
          </header>
          <ul
            className={`pdp__cleaning-grid${
              detail.cleaningGallery.length === 2
                ? ' pdp__cleaning-grid--duo'
                : ''
            }`}
          >
            {detail.cleaningGallery.map((item) => (
              <li key={item.src} className="pdp__cleaning-item">
                <figure>
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  {item.caption && (
                    <figcaption>{item.caption}</figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={`pdp__section pdp__video ${
          detail.video.cinematic ? 'pdp__video--cinematic' : ''
        }`}
        id="video"
      >
        {detail.video.cinematic ? (
          <div className="pdp__video-cinematic-wrap">
            {detail.video.src ? (
              <CinematicVideo
                src={detail.video.src}
                poster={detail.video.poster}
                label={detail.video.caption}
              />
            ) : (
              <div className="pdp__video-fallback pdp__video-fallback--cinematic">
                <img
                  src={detail.video.poster}
                  alt=""
                  className="pdp__video-poster"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className={`container pdp__section-inner${
              detail.video.fullWidth ? ' pdp__section-inner--video-full' : ''
            }`}
          >
            <header className="pdp__section-header">
              <p className="section-label">วิดีโอ</p>
              <h2 className="pdp__section-title">{detail.video.title}</h2>
              <p className="pdp__section-desc">{detail.video.caption}</p>
            </header>
            <div
              className={[
                'pdp__video-frame',
                detail.video.fullWidth ? 'pdp__video-frame--full' : '',
                detail.video.portrait ? 'pdp__video-frame--portrait' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {detail.video.src ? (
                <video
                  className="pdp__video-player"
                  controls
                  playsInline
                  preload="metadata"
                  poster={detail.video.poster}
                >
                  <source src={detail.video.src} type="video/mp4" />
                </video>
              ) : (
                <div className="pdp__video-fallback">
                  <img
                    src={detail.video.poster}
                    alt=""
                    className="pdp__video-poster"
                    loading="lazy"
                  />
                  <p className="pdp__video-note">
                    วิดีโอแนะนำการใช้งานสำหรับสินค้านี้
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {detail.beforeAfter && (
        <section className="pdp__section pdp__before-after">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">ผลลัพธ์</p>
              <h2 className="pdp__section-title">ก่อน &amp; หลัง</h2>
              <p className="pdp__section-desc">
                ผลลัพธ์หลังพิธีการดูแล — สีสด รายละเอียดชัด พร้อมออกจากบ้าน
              </p>
            </header>
            <figure className="pdp__before-after-figure">
              <img
                src={detail.beforeAfter.image}
                alt={detail.beforeAfter.alt}
                loading="lazy"
                decoding="async"
              />
              {detail.beforeAfter.caption && (
                <figcaption>{detail.beforeAfter.caption}</figcaption>
              )}
            </figure>
          </div>
        </section>
      )}

      <div className="container">
        <ProductRelatedArticles slug={detail.slug} />
      </div>

      {detail.recommended?.length > 0 && (
        <section className="pdp__section pdp__recommended">
          <div className="container pdp__section-inner">
            <header className="pdp__section-header">
              <p className="section-label">ครบพิธีการดูแล</p>
              <h2 className="pdp__section-title">สินค้าแนะนำ</h2>
            </header>
            <div className="pdp__recommended-grid">
              {detail.recommended.map((product, index) => (
                <ScrollReveal key={product.slug} delay={index * 60}>
                  <ProductCard
                    product={product}
                    variant="bottle"
                    showAddToCart={false}
                    showPrice={false}
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
