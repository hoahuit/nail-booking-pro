import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import OurStorySection from "@/components/OurStorySection";
import ServicesSection from "@/components/ServicesSection";
import GallerySection from "@/components/GallerySection";
import FeaturesSection from "@/components/FeaturesSection";
import BookingModal from "@/components/BookingModal";
import Footer from "@/components/Footer";

const Index = () => {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onBookingClick={() => setBookingOpen(true)} />
      <HeroSection onBookingClick={() => setBookingOpen(true)} />
      <OurStorySection />
      <ServicesSection onBookingClick={() => setBookingOpen(true)} />
      <GallerySection />
      <FeaturesSection />
      <Footer />
      <BookingModal open={bookingOpen} onOpenChange={setBookingOpen} />
    </div>
  );
};

export default Index;
