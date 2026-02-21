import HeroSection from '../components/HeroSection';
import TrustedSection from '../components/TrustedSection';
import ServicesSection from '../components/ServicesSection';
import ShowcaseCarousel from '../components/ShowcaseCarousel';
import WhyBeehiveSection from '../components/WhyBeehiveSection';
import SectorsSection from '../components/SectorsSection';
import ClientExperienceSection from '../components/ClientExperienceSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CtaSection from '../components/CtaSection';
import type { Page } from '../App';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main className="flex-1">
      <HeroSection onNavigate={onNavigate} />
      <TrustedSection />
      <ServicesSection />
      <ShowcaseCarousel />
      <WhyBeehiveSection />
      <SectorsSection />
      <ClientExperienceSection />
      <TestimonialsSection />
      <CtaSection onNavigate={onNavigate} />
    </main>
  );
}
