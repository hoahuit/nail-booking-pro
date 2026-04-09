import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface ServicesSectionProps {
  onBookingClick: () => void;
}

const services = [
  { title: "Classic Manicure", desc: "Essential nail care with precision shaping and polish", price: "€35", time: "45 min" },
  { title: "Gel Polish", desc: "Long-lasting color with mirror-like finish, up to 3 weeks", price: "€45", time: "60 min" },
  { title: "Nail Art", desc: "Bespoke designs from minimalist lines to intricate patterns", price: "€55", time: "75 min" },
  { title: "European Style", desc: "Clean French tips, nude tones, understated Scandinavian elegance", price: "€50", time: "60 min" },
  { title: "British Classic", desc: "Deep burgundy & navy tones, timeless sophistication", price: "€50", time: "60 min" },
  { title: "Full Experience", desc: "Manicure, pedicure & nail art — the complete treatment", price: "€95", time: "120 min" },
];

const ServicesSection = ({ onBookingClick }: ServicesSectionProps) => {
  return (
    <section id="services" className="py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">What We Offer</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            Our Services
          </h2>
          <div className="divider-thin mt-6" />
        </motion.div>

        <div className="max-w-3xl mx-auto divide-y divide-border">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={onBookingClick}
              className="group cursor-pointer flex items-start justify-between py-8 hover:bg-accent/30 transition-colors duration-300 px-4 -mx-4"
            >
              <div className="space-y-1.5 flex-1">
                <h3 className="font-serif text-2xl text-foreground group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-light">{s.desc}</p>
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3" /> {s.time}
                </span>
              </div>
              <div className="text-right ml-8 pt-1">
                <span className="font-serif text-2xl text-foreground">{s.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
