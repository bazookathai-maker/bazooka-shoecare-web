import { Hero } from '@/components/sections/Hero'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { ProductCollection } from '@/components/sections/ProductCollection'
import { BeforeAfter } from '@/components/sections/BeforeAfter'
import { WhyBazooka } from '@/components/sections/WhyBazooka'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <FeaturedProducts />
      <HowItWorks />
      <ProductCollection />
      <BeforeAfter />
      <WhyBazooka />
    </main>
  )
}
