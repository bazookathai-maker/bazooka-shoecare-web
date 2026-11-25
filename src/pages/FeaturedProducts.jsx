import FeaturedProductsSection from '../components/FeaturedProductsSection';
import { useLocale } from '../i18n/LocaleContext';
import useSeo from '../hooks/useSeo';
import './FeaturedProducts.css';

export default function FeaturedProducts() {
  const { t } = useLocale();
  useSeo({ title: t.featured.title, noindex: true });
  return (
    <div className="featured-products-page">
      <FeaturedProductsSection showViewAll={false} />
    </div>
  );
}
