import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-eu.jpg";

interface HeroSectionProps {
  onBookingClick: () => void;
}

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  return (
    <section id="hero" className="min-h-screen flex items-center pt-20">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-8 lg:pr-8"
          >
            <div className="space-y-2">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">European Nail Studio</p>
              <div className="divider-thin !mx-0 mt-4" />
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-foreground">
              The Art of
              <br />
              <span className="italic">Beautiful</span> Nails
            </h1>

            <p className="text-base text-muted-foreground max-w-md leading-relaxed font-light">
              A refined nail experience inspired by European elegance. Precision, artistry, and attention to every detail.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <Button
                size="lg"
                onClick={onBookingClick}
                className="bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs tracking-[0.15em] uppercase px-8 py-6"
              >
                Book Appointment
              </Button>
              <button
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Explore
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right — Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={heroImage}
                alt="European luxury nail studio interior"
                className="w-full h-full object-cover"
                width={1920}
                height={1080}
              />
            </div>
            {/* Minimal accent line */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-border" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
