import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-nail.jpg";

interface HeroSectionProps {
  onBookingClick: () => void;
}

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Luxury nail salon" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
      </div>

      <div className="container mx-auto relative z-10 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-gold/20 backdrop-blur-sm border border-rose-gold/30 mb-8"
          >
            <Sparkles className="w-4 h-4 text-rose-gold-light" />
            <span className="text-sm font-medium tracking-wider text-rose-gold-light uppercase">Chào mừng đến với LuxeNails</span>
          </motion.div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6 text-primary-foreground">
            Nâng Tầm
            <br />
            <span className="italic text-rose-gold-light">Vẻ Đẹp</span> Đôi Tay
          </h1>

          <p className="text-lg md:text-xl mb-10 text-rose-gold-light/80 max-w-lg font-light leading-relaxed">
            Trải nghiệm dịch vụ nail cao cấp với đội ngũ chuyên gia hàng đầu. Mỗi thiết kế là một tác phẩm nghệ thuật.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={onBookingClick}
              className="bg-gradient-rose hover:shadow-rose-glow transition-all duration-500 text-lg px-10 py-6"
            >
              Đặt Lịch Ngay
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="border-rose-gold-light/40 text-rose-gold-light hover:bg-rose-gold-light/10 text-lg px-10 py-6"
            >
              Xem Dịch Vụ
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
