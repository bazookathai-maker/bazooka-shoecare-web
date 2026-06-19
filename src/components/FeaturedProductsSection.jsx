import { Link } from 'react-router-dom';
import { featuredProductsList } from '../data/featuredProducts';
import ShowcaseProductCard from './ShowcaseProductCard';
import './FeaturedProductsSection.css';

export default function FeaturedProductsSection({ showViewAll = true }) {
  return (
    <section className="featured-products" id="featured-products">
      <div className="container">
        <header className="featured-products__header">
          <h2 className="featured-products__title">สินค้าแนะนำ</h2>
          <p className="featured-products__subtitle">
            สินค้าคัดสรรสำหรับการดูแลรองเท้าสมัยใหม่
          </p>
        </header>

        <ul className="featured-products__grid">
          {featuredProductsList.map((product) => (
            <li key={product.listId ?? product.id}>
              <ShowcaseProductCard product={product} />
            </li>
          ))}
        </ul>

        {showViewAll && (
          <div className="featured-products__cta">
            <Link to="/products" className="btn-outline">
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
