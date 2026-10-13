import FeaturedProductsSection from '../components/FeaturedProductsSection';
import './FeaturedProducts.css';
import useSeo from '../hooks/useSeo';

export default function FeaturedProducts() {
  useSeo({ title: 'สินค้าแนะนำ', noindex: true });
  return (
    <div className="featured-products-page">
      <FeaturedProductsSection showViewAll={false} />
    </div>
  );
}
