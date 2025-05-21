import { HeroSection } from '@/components/home/hero-section';
import { FeaturedCarsCarousel } from '@/components/home/featured-cars-carousel';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <HeroSection />
      <FeaturedCarsCarousel />
    </div>
  );
}
