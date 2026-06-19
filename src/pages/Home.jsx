import Hero from '../components/Hero';

import HomeOurProductsSection from '../components/home/HomeOurProductsSection';
import HomeRecommendedPromotionSection from '../components/home/HomeRecommendedPromotionSection';
import HomeHowToCareSection from '../components/home/HomeHowToCareSection';

import HomeReviewsSection from '../components/home/HomeReviewsSection';



export default function Home() {

  return (

    <main className="home-campaign">

      <Hero />

      <HomeOurProductsSection />
      <HomeRecommendedPromotionSection />
      <HomeHowToCareSection />

      <HomeReviewsSection />

    </main>

  );

}

