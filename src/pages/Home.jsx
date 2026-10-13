import Hero from '../components/Hero';

import HomeOurProductsSection from '../components/home/HomeOurProductsSection';
import HomeRecommendedPromotionSection from '../components/home/HomeRecommendedPromotionSection';
import HomeHowToCareSection from '../components/home/HomeHowToCareSection';

import HomeReviewsSection from '../components/home/HomeReviewsSection';
import HomeFaqSection from '../components/home/HomeFaqSection';
import useSeo from '../hooks/useSeo';
import { PAGE_SEO } from '../utils/seo';



export default function Home() {
  useSeo(PAGE_SEO.home);

  return (

    <main className="home-campaign">

      <Hero />

      <HomeOurProductsSection />
      <HomeRecommendedPromotionSection />
      <HomeHowToCareSection />

      <HomeReviewsSection />

      <HomeFaqSection ctaOnly />

    </main>

  );

}

