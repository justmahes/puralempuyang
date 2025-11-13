import { useQuery } from '@tanstack/react-query';
import Hero from '../components/landing/Hero';
import CultureStrip from '../components/landing/CultureStrip';
import ExperienceSection from '../components/landing/ExperienceSection';
import JourneySection from '../components/landing/JourneySection';
import ScheduleShowcase from '../components/landing/ScheduleShowcase';
import Testimonials from '../components/landing/Testimonials';
import GallerySection from '../components/landing/GallerySection';
import MapSection from '../components/landing/MapSection';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api, { endpoints } from '../services/api';

const LandingPage = () => {
  const { data: slotData } = useQuery({
    queryKey: ['slots'],
    queryFn: async () => {
      const { data } = await api.get(endpoints.slots);
      return data.data || [];
    },
  });

  return (
    <div className="bg-cream text-ebony dark:bg-ebony dark:text-cream">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <CultureStrip />
        <ExperienceSection />
        <JourneySection />
        <ScheduleShowcase slots={slotData || []} />
        <GallerySection />
        <Testimonials />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;