import { motion } from "framer-motion";
import { BUSINESS } from "@/lib/constants";
import gallery1 from "@/assets/gallery-1.jpg";
import Butterfly from "@/components/Butterfly";

const OurStorySection = () => {
  return (
    <section id="story" className="py-28 bg-secondary/40 relative overflow-hidden">
      {/* Butterfly accents */}
      <Butterfly
        color="#8fa882" secondaryColor="#7a9470" size={52}
        left="85%" top="12%"
        pathX={[0, -60, -20, -80, 0]} pathY={[0, 30, -20, 50, 0]}
        pathRotate={[0, -8, 6, -10, 0]}
        delay={0.3} flapSpeed={0.50} pathDuration={14} opacity={0.28}
      />
      <Butterfly
        color="#c8a87a" secondaryColor="#b49060" size={38}
        left="3%" top="60%"
        pathX={[0, 50, 20, 70, 10, 0]} pathY={[0, -40, -10, -55, -20, 0]}
        pathRotate={[0, 6, -5, 9, -3, 0]}
        delay={1.5} flapSpeed={0.44} pathDuration={12} opacity={0.25}
      />

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image with 3D tilt */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
            style={{ perspective: "800px" }}
          >
            <motion.div
              className="aspect-[4/5] overflow-hidden"
              whileHover={{ rotateY: 5, rotateX: -3 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src={gallery1}
                alt="King Nails Cardiff studio"
                className="w-full h-full object-cover"
                loading="lazy"
                width={800}
                height={1000}
              />
            </motion.div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-border" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">About Us</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground">Our Story</h2>
              <div className="divider-thin !mx-0 mt-6" />
            </div>

            <blockquote className="font-serif text-xl italic text-foreground/80 leading-relaxed border-l-2 border-border pl-6">
              "Our goal is to offer top-notch, personalised services in a friendly and soothing atmosphere."
            </blockquote>

            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              {BUSINESS.name} Cardiff is a well-established and modern beauty spa, flooded with contemporary
              lighting. We offer an extensive array of professional nail services, featuring acrylic nails,
              ombre nails, powder gel nails, and shellac extensions, along with natural nail enhancements.
            </p>

            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Our team consists of well-trained, highly experienced nail technicians who prioritise exceptional
              customer service and maintain the highest standards. Our services also encompass manicures,
              pedicures, and a wide spectrum of beauty treatments, including waxing, tinting, and more. All of
              this comes at an affordable price.
            </p>

            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-block text-xs tracking-[0.15em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
            >
              View Our Services
            </button>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-24 border-t border-border pt-12 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: "8+", label: "Years of Experience" },
            { value: "500+", label: "Happy Clients" },
            { value: "20+", label: "Services Offered" },
            { value: "5★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-4xl md:text-5xl text-foreground">{stat.value}</p>
              <p className="mt-2 text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurStorySection;
