import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';
import { homeFeaturedProducts } from '../data/products';
import ProductCard from './ProductCard';
import './ProductSection.css';

export default function ProductSection() {
  return (
    <section className="product-section" id="products">
      <div className="container">
        <ScrollReveal className="product-section__header">
          <p className="section-label">เลือกซื้อสินค้า</p>
          <h2 className="section-title">ผลิตภัณฑ์หลัก</h2>
          <p className="product-section__desc">
            ผลิตภัณฑ์หลักสำหรับทุกขั้นตอน — ทำความสะอาด ปกป้อง ฟื้นฟู
          </p>
        </ScrollReveal>

        <div className="product-section__grid">
          {homeFeaturedProducts.map((product, index) => (
            <ScrollReveal key={product.id} delay={index * 70}>
              <ProductCard
                product={product}
                variant="bottle"
                showAddToCart={false}
                showPrice={false}
                useCase={product.useCase}
              />
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="product-section__cta" delay={120}>
          <Link to="/products" className="btn-primary">
            เลือกซื้อสินค้า
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
