import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import { useCart } from '../../context/CartContext';
import { homeTopPicks } from '../../data/homeStory';
import './HomeRecommendedPromotionSection.css';

function PickImage({ src, fallback, alt }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        if (fallback && e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
        }
      }}
    />
  );
}

function TopPickAddToCart({ product, mediaRef }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const resetTimerRef = useRef(null);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const img =
      mediaRef.current?.querySelector('img') ?? mediaRef.current ?? null;

    await addToCart(
      {
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
      },
      img,
    );

    setAdded(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <button
      type="button"
      className={`home-top-picks__add-cart${
        added ? ' home-top-picks__add-cart--added' : ''
      }`}
      onClick={handleClick}
      aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}
    >
      {added ? 'เพิ่มแล้ว' : 'เพิ่มลงตะกร้า'}
    </button>
  );
}

function TopPickCard({ item, index }) {
  const mediaRef = useRef(null);

  const cartProduct = {
    id: item.id,
    name: item.name,
    image: item.image,
    price: item.price,
  };

  return (
    <li
      className="home-top-picks__item"
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <article className="home-top-picks__card">
        <Link to={item.href} className="home-top-picks__card-media-link hover-zoom">
          <div className="home-top-picks__media" ref={mediaRef}>
            <PickImage
              src={item.image}
              fallback={item.fallback}
              alt={item.name}
            />
            {item.badge && (
              <span className="home-top-picks__badge">{item.badge}</span>
            )}
          </div>
        </Link>

        <div className="home-top-picks__body">
          <Link to={item.href} className="home-top-picks__name-link">
            <h3 className="home-top-picks__name">{item.name}</h3>
          </Link>
          <p className="home-top-picks__desc">{item.description}</p>
          {item.price != null && (
            <p className="home-top-picks__price">
              ฿{item.price.toLocaleString('th-TH')}
            </p>
          )}

          <div className="home-top-picks__actions">
            {item.price != null && (
              <TopPickAddToCart product={cartProduct} mediaRef={mediaRef} />
            )}
            <Link to={item.href} className="home-top-picks__detail-link">
              ดูรายละเอียด
            </Link>
          </div>
        </div>
      </article>
    </li>
  );
}

export default function HomeRecommendedPromotionSection() {
  return (
    <section className="home-top-picks" id="top-picks">
      <div className="container">
        <ScrollReveal className="home-top-picks__header">
          <h2 className="home-top-picks__title">Top Picks</h2>
          <p className="home-top-picks__subtitle">
            สินค้าที่เราแนะนำสำหรับการดูแลรองเท้าคู่โปรดของคุณ
          </p>
        </ScrollReveal>

        <ScrollReveal as="ul" className="home-top-picks__grid" delay={70}>
          {homeTopPicks.map((item, index) => (
            <TopPickCard key={item.id} item={item} index={index} />
          ))}
        </ScrollReveal>

        <ScrollReveal className="home-top-picks__footer" delay={120}>
          <Link to="/products" className="btn-outline home-top-picks__shop-all">
            ดูสินค้าทั้งหมด
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
