import FeaturedProductsSection from '../components/FeaturedProductsSection';
import useSeo from '../hooks/useSeo';
import './FeaturedProducts.css';

export default function FeaturedProducts() {
  useSeo({ title: 'สินค้าแนะนำ', noindex: true });
  return (
    <div className="featured-products-page">
      <FeaturedProductsSection showViewAll={false} />
    </div>
  );
}
