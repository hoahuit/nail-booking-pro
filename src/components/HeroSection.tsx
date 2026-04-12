import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import Butterfly from "@/components/Butterfly";

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

const INTERVAL_MS = 2200;

const stats = [
  { value: "8+", label: "Years of Excellence" },
  { value: "500+", label: "Happy Clients" },
  { value: "5★", label: "Average Rating" },
];

/* ── Pre-defined butterfly flight configs — lightened for dark hero ── */
const BUTTERFLIES = [
  {
    color: "#f0b8b0", secondaryColor: "#e8a0a0", size: 78,
    left: "6%", top: "18%",
    pathX: [0, 90, 40, 120, 20, 0], pathY: [0, -50, 30, -10, 50, 0],
    pathRotate: [0, 10, -8, 12, -5, 0],
    delay: 0, flapSpeed: 0.52, pathDuration: 18, opacity: 0.38,
  },
  {
    color: "#f5c8c4", secondaryColor: "#e8b0b0", size: 52,
    left: "78%", top: "10%",
    pathX: [0, -60, -20, -90, -30, 0], pathY: [0, 40, -20, 60, -10, 0],
    pathRotate: [0, -8, 6, -12, 4, 0],
    delay: 1.8, flapSpeed: 0.46, pathDuration: 14, opacity: 0.34,
  },
  {
    color: "#b8d8b0", secondaryColor: "#a0c898", size: 65,
    left: "55%", top: "72%",
    pathX: [0, -50, 30, -80, 10, 0], pathY: [0, -60, -20, -80, -30, 0],
    pathRotate: [0, 6, -10, 8, -6, 0],
    delay: 0.7, flapSpeed: 0.58, pathDuration: 19, opacity: 0.30,
  },
  {
    color: "#e8d090", secondaryColor: "#d8b870", size: 42,
    left: "30%", top: "80%",
    pathX: [0, 70, 30, 90, 20, 0], pathY: [0, -40, -70, -30, -80, 0],
    pathRotate: [0, -5, 9, -7, 5, 0],
    delay: 2.3, flapSpeed: 0.40, pathDuration: 13, opacity: 0.36,
  },
  {
    color: "#d8c8f0", secondaryColor: "#c8b8e0", size: 58,
    left: "88%", top: "55%",
    pathX: [0, -80, -40, -110, -20, 0], pathY: [0, 30, -40, 10, -60, 0],
    pathRotate: [0, 7, -5, 11, -3, 0],
    delay: 3.1, flapSpeed: 0.50, pathDuration: 16, opacity: 0.30,
  },
  {
    color: "#f0c0c8", secondaryColor: "#e0a8b0", size: 46,
    left: "14%", top: "65%",
    pathX: [0, 40, 80, 20, 60, 0], pathY: [0, -50, -20, -70, -40, 0],
    pathRotate: [0, -6, 8, -10, 4, 0],
    delay: 1.1, flapSpeed: 0.54, pathDuration: 15, opacity: 0.32,
  },
  {
    color: "#c8c4e8", secondaryColor: "#b8b0d8", size: 35,
    left: "48%", top: "8%",
    pathX: [0, 30, -20, 50, -10, 0], pathY: [0, 30, 60, 20, 50, 0],
    pathRotate: [0, 5, -7, 9, -4, 0],
    delay: 0.4, flapSpeed: 0.46, pathDuration: 12, opacity: 0.28,
  },
  {
    color: "#e8c8a8", secondaryColor: "#d8b890", size: 38,
    left: "70%", top: "30%",
    pathX: [0, -30, 20, -50, 10, 0], pathY: [0, 40, -10, 50, 20, 0],
    pathRotate: [0, -5, 6, -8, 3, 0],
    delay: 2.8, flapSpeed: 0.52, pathDuration: 11, opacity: 0.28,
  },
];

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.13 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut", delay: i * 0.15 },
  }),
};

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setCurrent((next + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(() => go(current + 1, 1), INTERVAL_MS);
    return () => clearInterval(id);
  }, [current, go]);

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
    <section
      id="hero"
      className="relative h-screen min-h-[600px] flex items-center overflow-hidden"
    >
      {/* ── Background slideshow ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 1.4, ease: "easeOut" } }}
          exit={{ scale: 0.97, opacity: 0, transition: { duration: 0.8, ease: "easeIn" } }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].src}
            alt={slides[current].alt}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlays ── */}
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }}
      />

      {/* ── Butterflies ── */}
      {BUTTERFLIES.map((b, i) => (
        <Butterfly key={i} {...b} />
      ))}

      {/* ── Left: vertical social links ── */}
      <div className="absolute left-7 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-5">
        <div className="w-px h-14 bg-white/25" />
        {[
          { label: "Instagram", href: BUSINESS.instagram },
          { label: "Facebook",  href: BUSINESS.facebook },
        ].map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/45 hover:text-amber-400 transition-colors duration-300"
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: "9px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontFamily: "var(--font-sans)",
            }}
          >
            {s.label}
          </a>
        ))}
        <div className="w-px h-14 bg-white/25" />
      </div>

      {/* ── Main content ── */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl lg:ml-16">

          {/* Script eyebrow */}
          <motion.p
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-serif italic mb-4"
            style={{ color: "#c9a227", fontSize: "clamp(18px, 2vw, 26px)" }}
          >
          </motion.p>

          {/* Main heading */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <div className="inline-flex flex-col items-start">
              <Crown
                style={{
                  color: "#c9a227",
                  width: "clamp(24px, 3.5vw, 50px)",
                  height: "clamp(24px, 3.5vw, 50px)",
                  marginBottom: "-0.1em",
                  marginLeft: "0.08em",
                  filter: "drop-shadow(0 0 8px rgba(201,162,39,0.5))",
                }}
              />
              <span
                className="font-serif italic text-white block leading-none"
                style={{ fontSize: "clamp(60px, 9.5vw, 124px)", letterSpacing: "-0.03em" }}
              >
                King  <span  style={{
                  fontSize: "clamp(33px, 3.8vw, 26px)",
                  letterSpacing: "0.55em",
                  color: "#c9a227",
                  textTransform: "uppercase",
                  paddingBottom: "6px",
                  borderBottom: "1px solid rgba(201,162,39,0.4)",
                  marginLeft: "0.08em",
                }}> Nails</span>
              </span>
          
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white/60 font-light max-w-md mb-10"
            style={{ fontSize: "clamp(14px, 1.1vw, 17px)", lineHeight: 1.85, fontFamily: "var(--font-sans)" }}
          >
            A sanctuary where artistry blooms — precision, elegance, and
            top-notch personalised care in the heart of Cardiff.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center gap-2 border border-white/75 text-white text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-white hover:text-black transition-all duration-300"
            >
              Explore Services
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onBookingClick}
              className="group flex items-center gap-2 text-black text-xs tracking-[0.2em] uppercase px-8 py-4 font-medium transition-all duration-300 hover:opacity-90"
              style={{ background: "#c9a227" }}
            >
              Book Now
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-10 mt-14 pt-8 border-t border-white/15"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-serif text-3xl leading-none text-white">{s.value}</p>
                <p className="mt-1.5 text-[10px] tracking-[0.2em] uppercase text-white/40">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Right: vertical slide dots ── */}
      <div className="absolute right-7 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => go(i, i > current ? 1 : -1)}
            className="transition-all duration-300"
            style={{
              width: 2,
              height: i === current ? 32 : 10,
              background: i === current ? "#c9a227" : "rgba(255,255,255,0.30)",
            }}
          />
        ))}
      </div>

      {/* ── Bottom: slide counter ── */}
      <div className="absolute bottom-8 right-8 z-20 hidden lg:block">
        <span className="font-serif text-white/35 text-sm tabular-nums">
          {String(current + 1).padStart(2, "0")}
          <span className="mx-2 text-white/20">/</span>
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2"
      >
        <div className="w-px h-12 bg-white/20 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full bg-amber-400"
            animate={{ height: ["0%", "100%", "0%"], top: ["0%", "0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <span className="text-white/30 text-[9px] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-sans)" }}>
          Scroll
        </span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
