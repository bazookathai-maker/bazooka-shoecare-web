import Hero from '../components/Hero';

import HomeOurProductsSection from '../components/home/HomeOurProductsSection';
import HomeRecommendedPromotionSection from '../components/home/HomeRecommendedPromotionSection';
import HomeHowToCareSection from '../components/home/HomeHowToCareSection';

import HomeReviewsSection from '../components/home/HomeReviewsSection';
import HomeFaqSection from '../components/home/HomeFaqSection';
import useSeo from '../hooks/useSeo';
import { useLocale } from '../i18n/LocaleContext';
import { INDEX_ENGLISH, buildOrganizationJsonLd } from '../utils/seo';



export default function Home() {
  const { locale, t } = useLocale();
  useSeo({
    fullTitle: t.home.seoTitle,
    description: t.home.seoDescription,
    path: locale === 'en' ? '/en' : '/',
    noindex: locale === 'en' && !INDEX_ENGLISH,
    jsonLd: buildOrganizationJsonLd(locale),
  });

  return (

    <main className="home-campaign">

      <Hero />

      <HomeOurProductsSection />
      <HomeRecommendedPromotionSection />
      <HomeHowToCareSection />

      <HomeReviewsSection />

      <HomeFaqSection showViewAllCta />

    </main>

  );

}

