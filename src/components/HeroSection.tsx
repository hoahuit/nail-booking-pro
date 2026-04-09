import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-eu.jpg";

interface HeroSectionProps {
  onBookingClick: () => void;
}

const stats = [
  { value: "8+", label: "Years of Excellence" },
  { value: "500+", label: "Happy Clients" },
  { value: "5★", label: "Average Rating" },
];

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Warm radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_72%_45%,hsl(35_30%_90%)_0%,transparent_60%)]" />

      {/* Ghost "LUXE" background text */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none select-none font-serif font-bold text-foreground overflow-hidden"
        style={{ fontSize: "clamp(100px, 23vw, 300px)", lineHeight: 1, opacity: 0.025, whiteSpace: "nowrap" }}
      >
        LUXE
      </span>

      <div className="container mx-auto relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center min-h-[82vh]">

          {/* ── Left: Content ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 xl:col-span-5 space-y-10"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="w-8 h-px bg-warm" />
              <p className="text-xs tracking-[0.35em] uppercase text-warm font-medium">
                European Nail Studio
              </p>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-serif text-foreground leading-[0.93]"
              style={{ fontSize: "clamp(52px, 6.5vw, 90px)" }}
            >
              The Art
              <br />
              of{" "}
              <em className="italic" style={{ color: "hsl(var(--warm))" }}>
                Beautiful
              </em>
              <br />
              Nails
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-base text-muted-foreground max-w-sm leading-relaxed font-light"
            >
              A refined nail experience inspired by European elegance — precision,
              artistry, and attention to every detail.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5">
              <Button
                size="lg"
                onClick={onBookingClick}
                className="group bg-foreground text-background hover:bg-foreground/85 rounded-none text-xs tracking-[0.18em] uppercase px-10 h-14"
              >
                Book Appointment
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-2 text-xs tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                View Services
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-start gap-8 pt-6 border-t border-border"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-3xl text-foreground leading-none">{s.value}</p>
                  <p className="mt-1.5 text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Image ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-7 relative"
          >
            <div className="relative max-w-[520px] ml-auto">
              {/* Main image */}
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={heroImage}
                  alt="European luxury nail studio"
                  className="w-full h-full object-cover"
                  width={1040}
                  height={1300}
                />
              </div>

              {/* Soft bottom vignette */}
              <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-foreground/15 to-transparent pointer-events-none" />

              {/* Floating: star rating badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.55 }}
                className="absolute -left-6 top-10 bg-background border border-border px-5 py-3.5 shadow-elevated"
              >
                <div className="flex gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-current text-warm" />
                  ))}
                </div>
                <p className="text-[11px] tracking-[0.12em] text-muted-foreground">
                  Rated #1 in Cardiff
                </p>
              </motion.div>

              {/* Floating: Est. badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.18, duration: 0.52 }}
                className="absolute -bottom-5 right-8 bg-foreground text-primary-foreground px-7 py-4"
              >
                <p className="font-serif text-2xl leading-none">2016</p>
                <p className="mt-1 text-[9px] tracking-[0.28em] uppercase text-primary-foreground/50">
                  Est.
                </p>
              </motion.div>

              {/* Decorative corner frames */}
              <div className="absolute -bottom-4 -left-4 w-20 h-20 border border-border pointer-events-none" />
              <div className="absolute -top-3 -right-3 w-14 h-14 border border-border/40 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-border to-transparent"
        />
        <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground/50">Scroll</p>
      </motion.div>
    </section>
  );
};

export default HeroSection;
