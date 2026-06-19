import FeaturedProductsSection from '../components/FeaturedProductsSection';
import './FeaturedProducts.css';

export default function FeaturedProducts() {
  return (
    <div className="featured-products-page">
      <FeaturedProductsSection showViewAll={false} />
    </div>
  );
}
