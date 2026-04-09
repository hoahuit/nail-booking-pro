import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OurStorySection from "@/components/OurStorySection";
import ServicesSection, { type ServiceItem } from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import FeaturesSection from "@/components/FeaturesSection";
import BookingModal from "@/components/BookingModal";
import Footer from "@/components/Footer";

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
      <OurStorySection />
      <ServicesSection onBookingClick={handleBooking} />
      <GallerySection />
      <FeaturesSection />
      <Footer />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} selectedService={selectedService} />
    </div>
  );
};

export default Index;
