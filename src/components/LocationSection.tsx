import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Mail, ExternalLink } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import Butterfly from "@/components/Butterfly";

const LocationSection = () => (
  <section id="location" className="py-28 bg-secondary/40 relative overflow-hidden">
    <Butterfly
      color="#a8c4b8" secondaryColor="#8fb0a2" size={48}
      left="88%" top="10%"
      pathX={[0, -50, -15, -70, 0]} pathY={[0, 25, -15, 45, 0]}
      pathRotate={[0, -7, 5, -9, 0]}
      delay={0.4} flapSpeed={0.50} pathDuration={13} opacity={0.27}
    />
    <Butterfly
      color="#c8a87a" secondaryColor="#b49060" size={34}
      left="4%" top="65%"
      pathX={[0, 45, 15, 65, 0]} pathY={[0, -35, -10, -50, 0]}
      pathRotate={[0, 6, -4, 8, 0]}
      delay={1.8} flapSpeed={0.45} pathDuration={12} opacity={0.24}
    />
    <span aria-hidden className="absolute left-0 bottom-0 font-serif font-bold pointer-events-none select-none text-foreground leading-none"
      style={{ fontSize: "clamp(70px, 13vw, 170px)", opacity: 0.025 }}>
      FIND US
    </span>

    <div className="container mx-auto relative z-10">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-16 space-y-4">
        <p className="text-xs tracking-[0.32em] uppercase text-muted-foreground">Find Us</p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground">Our Location</h2>
        <div className="divider-thin !mx-0 mt-6" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Map */}
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative" style={{ perspective: "800px" }}>
          <motion.div className="aspect-[4/3] overflow-hidden bg-secondary"
            whileHover={{ rotateY: 3, rotateX: -2 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            style={{ transformStyle: "preserve-3d" }}>
            <iframe
              title="King Nails Cardiff Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2487.9!2d-3.2077!3d51.5078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486e1c5c6be72e3b%3A0x1!2s184+Whitchurch+Rd%2C+Cardiff+CF14+3JP!5e0!3m2!1sen!2suk!4v1"
              width="100%" height="100%" style={{ border: 0 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </motion.div>
          <div className="absolute -bottom-4 -right-4 w-20 h-20 border border-border" />
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-6">
          <div className="bg-card shadow-subtle p-6 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground">Address</p>
            </div>
            <p className="font-serif text-xl text-foreground">{BUSINESS.address[0]}</p>
            <p className="font-serif text-xl text-foreground">{BUSINESS.address[1]}</p>
            <a href={BUSINESS.mapUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground pb-0.5 transition-all mt-2">
              Get Directions <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="bg-card shadow-subtle p-6 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground">Opening Hours</p>
            </div>
            <div className="space-y-2">
              {BUSINESS.hours.map((h) => (
                <div key={h.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-light">{h.label}</span>
                  <span className="text-foreground font-medium">{h.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card shadow-subtle p-6 space-y-4">
            <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground mb-4">Contact</p>
            <a href={`tel:+44${BUSINESS.phone.replace(/\s/g, "").replace(/^0/, "")}`}
              className="flex items-center gap-3 text-sm text-muted-foreground font-light hover:text-foreground transition-colors">
              <Phone className="w-4 h-4 text-muted-foreground/50" /> {BUSINESS.phone}
            </a>
            <a href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-3 text-sm text-muted-foreground font-light hover:text-foreground transition-colors">
              <Mail className="w-4 h-4 text-muted-foreground/50" /> {BUSINESS.email}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default LocationSection;