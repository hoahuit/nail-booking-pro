import { motion } from "framer-motion";
import { Heart, Shield, Sparkles } from "lucide-react";
import Butterfly from "@/components/Butterfly";

const features = [
  {
    num: "01",
    icon: Heart,
    title: "Personalized Experience",
    desc: "Each guest is our favourite guest. Come and make sure that our service is exceptional.",
  },
  {
    num: "02",
    icon: Shield,
    title: "Professional Care",
    desc: "All products we use are professional and have proven efficiency. No compromises.",
  },
  {
    num: "03",
    icon: Sparkles,
    title: "We Love What We Do",
    desc: "People that you'll meet in our studio are doing the job they love. Come and see the difference.",
  },
];

const FeaturesSection = () => (
  <section className="py-32 relative overflow-hidden">
    {/* Butterfly accents */}
    <Butterfly
      color="#b8a4c8" secondaryColor="#a890ba" size={44}
      left="2%" top="20%"
      pathX={[0, 50, 10, 70, 0]} pathY={[0, -30, 20, -40, 0]}
      pathRotate={[0, 8, -6, 10, 0]}
      delay={0.5} flapSpeed={0.52} pathDuration={13} opacity={0.28}
    />
    <Butterfly
      color="#c9857a" secondaryColor="#b06e65" size={36}
      left="91%" top="55%"
      pathX={[0, -40, -10, -60, 0]} pathY={[0, -20, 30, -10, 0]}
      pathRotate={[0, -7, 5, -9, 0]}
      delay={2.0} flapSpeed={0.46} pathDuration={11} opacity={0.25}
    />
    <span
      aria-hidden
      className="absolute right-0 bottom-0 font-serif font-bold pointer-events-none select-none text-foreground leading-none"
      style={{ fontSize: "clamp(80px, 14vw, 180px)", opacity: 0.025 }}
    >
      CARE
    </span>

    <div className="container mx-auto relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-20 space-y-4"
      >
        <p className="text-xs tracking-[0.32em] uppercase text-muted-foreground">Why Choose Us</p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground">Our Promise</h2>
        <div className="divider-thin !mx-0 mt-6" />
      </motion.div>

      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            whileHover={{ y: -6 }}
            className="relative p-10 md:p-14 group overflow-hidden"
            style={{ perspective: "600px" }}
          >
            <span
              aria-hidden
              className="absolute top-6 right-8 font-serif font-bold text-foreground select-none leading-none"
              style={{ fontSize: "clamp(64px, 8vw, 100px)", opacity: 0.05 }}
            >
              {f.num}
            </span>

            <div className="relative z-10 space-y-6">
              <f.icon className="w-6 h-6" style={{ color: "hsl(var(--warm))" }} strokeWidth={1.2} />
              <div className="space-y-3">
                <h3 className="font-serif text-2xl md:text-3xl text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-[280px]">
                  {f.desc}
                </p>
              </div>
              <div
                className="h-px transition-all duration-500 w-0 group-hover:w-10"
                style={{ backgroundColor: "hsl(var(--warm))" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
