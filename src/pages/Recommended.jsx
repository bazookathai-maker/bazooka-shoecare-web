import { recommendedProductsList } from '../data/featuredProducts';
import ShowcaseProductCard from '../components/ShowcaseProductCard';
import '../components/FeaturedProductsSection.css';
import './Recommended.css';

export default function Recommended() {
  return (
    <main className="recommended-page">
      <header className="recommended-page__hero">
        <div className="container recommended-page__hero-inner">
          <h1 className="recommended-page__title">สินค้าแนะนำ</h1>
          <p className="recommended-page__subtitle">
            คัดสรรเซตยอดนิยมสำหรับการดูแลรองเท้าแบบครบขั้นตอน
          </p>
        </div>
      </header>

      <section className="featured-products recommended-page__grid-section">
        <div className="container">
          <ul className="featured-products__grid">
            {recommendedProductsList.map((product) => (
              <li key={product.listId ?? product.id}>
                <ShowcaseProductCard product={product} titleTag="h2" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
