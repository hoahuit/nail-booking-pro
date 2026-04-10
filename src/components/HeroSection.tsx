import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

import heroEU from "@/assets/hero-eu.jpg";
import heroNail from "@/assets/hero-nail.jpg";
import galleryEU from "@/assets/gallery-eu.jpg";
import galleryUK from "@/assets/gallery-uk.jpg";
import gallery1 from "@/assets/gallery-1.jpg";

interface HeroSectionProps {
  onBookingClick: () => void;
}

const slides = [
  { src: heroEU, alt: "King Nails Cardiff studio", label: "Our Studio" },
  { src: heroNail, alt: "Artisan nail close-up", label: "Artisan Craft" },
  { src: galleryEU, alt: "French tips design", label: "French Tips" },
  { src: galleryUK, alt: "Classic British style", label: "Classic Style" },
  { src: gallery1, alt: "Delicate nail art", label: "Nail Art" },
];

const INTERVAL_MS = 3500;

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
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number, dir: number) => {
      setDirection(dir);
      setCurrent((next + slides.length) % slides.length);
    },
    []
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(current + 1, 1), INTERVAL_MS);
    return () => clearInterval(id);
  }, [current, paused, go]);

  const slideVariants: Variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0, scale: 1.05 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeInOut" } },
    exit: (d: number) => ({
      x: d > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.6, ease: "easeInOut" },
    }),
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* 3D perspective grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          perspective: "600px",
          transform: "rotateX(55deg)",
          transformOrigin: "center -200%",
        }}
      />

      {/* Warm radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_72%_45%,hsl(35_30%_90%/0.6)_0%,transparent_60%)]" />

      {/* Ghost brand text */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none select-none font-serif font-bold text-foreground overflow-hidden"
        style={{ fontSize: "clamp(80px, 20vw, 260px)", lineHeight: 1, opacity: 0.02, whiteSpace: "nowrap" }}
      >
        KING
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
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <div className="w-8 h-px bg-warm" />
              <p className="text-xs tracking-[0.35em] uppercase text-warm font-medium">
                Cardiff's Premier Nail Studio
              </p>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-foreground leading-[0.93]"
              style={{ fontSize: "clamp(40px, 5.5vw, 78px)" }}
            >
              There's Nothing
              <br />a Fresh{" "}
              <em className="italic" style={{ color: "hsl(var(--warm))" }}>
                Manicure
              </em>
              <br />
              Cannot Fix
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-base text-muted-foreground max-w-sm leading-relaxed font-light"
            >
              A well-established and modern beauty spa — precision, artistry, and
              top-notch personalised service at an affordable price.
            </motion.p>

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

          {/* ── Right: 3D Carousel ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-7 relative"
            style={{ perspective: "1200px" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative max-w-[520px] ml-auto">
              {/* 3D tilt frame */}
              <motion.div
                className="aspect-[4/5] overflow-hidden relative bg-secondary"
                whileHover={{ rotateY: -3, rotateX: 2 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <AnimatePresence custom={direction} initial={false}>
                  <motion.img
                    key={current}
                    src={slides[current].src}
                    alt={slides[current].alt}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full object-cover"
                    width={1040}
                    height={1300}
                  />
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`label-${current}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-5 left-5 z-10"
                  >
                    <span className="bg-background/80 backdrop-blur-sm px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase text-foreground font-medium">
                      {slides[current].label}
                    </span>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-foreground/20 to-transparent pointer-events-none" />

                <button
                  aria-label="Previous slide"
                  onClick={() => go(current - 1, -1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  aria-label="Next slide"
                  onClick={() => go(current + 1, 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </motion.div>

              {/* Progress + dots */}
              <div className="mt-4 flex flex-col items-end gap-2.5 pr-1">
                <div className="w-full h-px bg-border overflow-hidden">
                  <motion.div
                    key={`progress-${current}`}
                    className="h-full bg-warm"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused ? undefined : 1 }}
                    transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => go(i, i > current ? 1 : -1)}
                      className={`transition-all duration-300 rounded-none ${
                        i === current ? "w-6 h-1.5 bg-foreground" : "w-1.5 h-1.5 bg-border hover:bg-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-[10px] tracking-[0.15em] text-muted-foreground tabular-nums">
                    {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.55 }}
                className="absolute -left-6 top-10 bg-background border border-border px-5 py-3.5 shadow-elevated z-20"
              >
                <div className="flex gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-current text-warm" />
                  ))}
                </div>
                <p className="text-[11px] tracking-[0.12em] text-muted-foreground">Rated #1 in Cardiff</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.18, duration: 0.52 }}
                className="absolute -bottom-14 right-8 bg-foreground text-primary-foreground px-7 py-4 z-20"
              >
                <p className="font-serif text-2xl leading-none">Est.</p>
                <p className="mt-1 text-[9px] tracking-[0.28em] uppercase text-primary-foreground/50">
                  Cardiff
                </p>
              </motion.div>

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
