import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import OurStorySection from "@/components/OurStorySection";
import GallerySection from "@/components/GallerySection";
import FeaturesSection from "@/components/FeaturesSection";
import BookingModal from "@/components/BookingModal";
import Footer from "@/components/Footer";
import LocationSection from "@/components/LocationSection";
import type { ServiceItem } from "@/lib/types";

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const handleBooking = (service?: ServiceItem) => {
    setSelectedService(service || null);
    setBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onBookingClick={() => handleBooking()} />
      <HeroSection onBookingClick={() => handleBooking()} />
      <ServicesSection onBookingClick={handleBooking} />
      <OurStorySection />
      <GallerySection />
      <FeaturesSection />
      <LocationSection />
      <Footer />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} selectedService={selectedService} />
    </div>
  );
};

export default Index;
