import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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

const INTERVAL_MS = 3500;

const stats = [
  { value: "8+", label: "Years of Excellence" },
  { value: "500+", label: "Happy Clients" },
  { value: "5★", label: "Average Rating" },
];

/* ── Pre-defined butterfly flight configs — European pastel palette ── */
const BUTTERFLIES = [
  {
    // dusty rose — large, slow, dreamy
    color: "#c9857a", secondaryColor: "#b86d66", size: 78,
    left: "6%", top: "18%",
    pathX: [0, 90, 40, 120, 20, 0], pathY: [0, -50, 30, -10, 50, 0],
    pathRotate: [0, 10, -8, 12, -5, 0],
    delay: 0, flapSpeed: 0.52, pathDuration: 18, opacity: 0.52,
  },
  {
    // blush petal
    color: "#dbaaa4", secondaryColor: "#cc9490", size: 52,
    left: "78%", top: "10%",
    pathX: [0, -60, -20, -90, -30, 0], pathY: [0, 40, -20, 60, -10, 0],
    pathRotate: [0, -8, 6, -12, 4, 0],
    delay: 1.8, flapSpeed: 0.46, pathDuration: 14, opacity: 0.48,
  },
  {
    // sage green — earthy European
    color: "#8fa882", secondaryColor: "#7a9470", size: 65,
    left: "55%", top: "72%",
    pathX: [0, -50, 30, -80, 10, 0], pathY: [0, -60, -20, -80, -30, 0],
    pathRotate: [0, 6, -10, 8, -6, 0],
    delay: 0.7, flapSpeed: 0.58, pathDuration: 19, opacity: 0.42,
  },
  {
    // warm champagne / gold
    color: "#c8a87a", secondaryColor: "#b49060", size: 42,
    left: "30%", top: "80%",
    pathX: [0, 70, 30, 90, 20, 0], pathY: [0, -40, -70, -30, -80, 0],
    pathRotate: [0, -5, 9, -7, 5, 0],
    delay: 2.3, flapSpeed: 0.40, pathDuration: 13, opacity: 0.45,
  },
  {
    // soft mauve / lilac
    color: "#b8a4c8", secondaryColor: "#a890ba", size: 58,
    left: "88%", top: "55%",
    pathX: [0, -80, -40, -110, -20, 0], pathY: [0, 30, -40, 10, -60, 0],
    pathRotate: [0, 7, -5, 11, -3, 0],
    delay: 3.1, flapSpeed: 0.50, pathDuration: 16, opacity: 0.40,
  },
  {
    // powder rose
    color: "#d0a0a8", secondaryColor: "#c08890", size: 46,
    left: "14%", top: "65%",
    pathX: [0, 40, 80, 20, 60, 0], pathY: [0, -50, -20, -70, -40, 0],
    pathRotate: [0, -6, 8, -10, 4, 0],
    delay: 1.1, flapSpeed: 0.54, pathDuration: 15, opacity: 0.44,
  },
  {
    // dusty lavender
    color: "#b0aacb", secondaryColor: "#9e97bc", size: 35,
    left: "48%", top: "8%",
    pathX: [0, 30, -20, 50, -10, 0], pathY: [0, 30, 60, 20, 50, 0],
    pathRotate: [0, 5, -7, 9, -4, 0],
    delay: 0.4, flapSpeed: 0.46, pathDuration: 12, opacity: 0.38,
  },
  {
    // warm terracotta hint
    color: "#c4a088", secondaryColor: "#b48870", size: 38,
    left: "70%", top: "30%",
    pathX: [0, -30, 20, -50, 10, 0], pathY: [0, 40, -10, 50, 20, 0],
    pathRotate: [0, -5, 6, -8, 3, 0],
    delay: 2.8, flapSpeed: 0.52, pathDuration: 11, opacity: 0.36,
  },
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

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setCurrent((next + slides.length) % slides.length);
  }, []);

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
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, #fdf8f4 0%, #faf0eb 35%, #f6ebe4 65%, #fdf6f0 100%)",
      }}
    >
      {/* ── Bokeh glow orbs — warm soft tones ── */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 560, height: 560, left: "55%", top: "0%",
          background: "radial-gradient(circle, rgba(201,133,122,0.13) 0%, transparent 70%)",
          filter: "blur(55px)",
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 420, height: 420, left: "5%", top: "35%",
          background: "radial-gradient(circle, rgba(184,164,200,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: 340, height: 340, left: "35%", top: "58%",
          background: "radial-gradient(circle, rgba(200,168,122,0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* ── Subtle linen dot pattern ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(44,31,26,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Soft petal particles ── */}
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: i % 3 === 0 ? 4 : 3,
            height: i % 3 === 0 ? 4 : 3,
            left: `${(i * 7 + 5) % 95}%`,
            top: `${(i * 11 + 8) % 88}%`,
            background:
              i % 4 === 0 ? "#c9857a" : i % 4 === 1 ? "#c8a87a" : i % 4 === 2 ? "#b8a4c8" : "#8fa882",
            opacity: 0.45,
          }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.3, 0.5] }}
          transition={{ duration: 3 + (i % 3), delay: (i * 0.4) % 4, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* ── Butterflies ── */}
      {BUTTERFLIES.map((b, i) => (
        <Butterfly key={i} {...b} />
      ))}

      {/* ── Main content ── */}
      <div className="container mx-auto relative z-10 pt-28 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center min-h-[82vh]">

          {/* ── Left: Content ── */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="lg:col-span-6 xl:col-span-5 space-y-10"
          >
            {/* eyebrow */}
            <motion.div variants={fadeUp} className="flex items-center gap-3">
              <Sparkles className="w-4 h-4" style={{ color: "#c9857a" }} />
              <p
                className="text-xs tracking-[0.35em] uppercase font-medium"
                style={{ color: "rgba(160,100,90,0.90)" }}
              >
                Cardiff's Premier Nail Studio
              </p>
            </motion.div>

            {/* headline */}
            <motion.h1
              variants={fadeUp}
              className="font-serif leading-[0.93]"
              style={{ fontSize: "clamp(42px, 5.8vw, 82px)", color: "#2c1f1a" }}
            >
              Let Your
              <br />
              <em
                className="italic"
                style={{
                  display: "inline-block",
                  background: "linear-gradient(90deg, #c9857a, #b8a4c8, #8fa882)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Beauty
              </em>
              <br />
              Take Flight
            </motion.h1>

            {/* sub */}
            <motion.p
              variants={fadeUp}
              className="text-base max-w-sm leading-relaxed font-light"
              style={{ color: "rgba(44,31,26,0.55)" }}
            >
              A sanctuary where artistry blooms — precision, elegance, and
              top-notch personalised care at an affordable price.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-5">
              <Button
                size="lg"
                onClick={onBookingClick}
                className="group rounded-none text-xs tracking-[0.18em] uppercase px-10 h-14 border-0"
                style={{
                  background: "#2c1f1a",
                  color: "#fdf8f4",
                  boxShadow: "0 4px 20px rgba(44,31,26,0.18)",
                }}
              >
                Book Appointment
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <button
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-2 text-xs tracking-[0.18em] uppercase transition-colors"
                style={{ color: "rgba(44,31,26,0.45)" }}
              >
                View Services
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* stats */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-start gap-8 pt-6"
              style={{ borderTop: "1px solid rgba(44,31,26,0.10)" }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p
                    className="font-serif text-3xl leading-none"
                    style={{
                      display: "inline-block",
                      background: "linear-gradient(135deg, #c9857a, #b8a4c8)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="mt-1.5 text-[10px] tracking-[0.22em] uppercase"
                    style={{ color: "rgba(44,31,26,0.40)" }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Glass Carousel ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-7 relative"
            style={{ perspective: "1200px" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="relative max-w-[520px] ml-auto">
              {/* glow ring */}
              <div
                className="absolute -inset-3 rounded-sm pointer-events-none"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,133,122,0.25), rgba(184,164,200,0.20), rgba(143,168,130,0.15))",
                  filter: "blur(20px)",
                  opacity: 0.9,
                }}
              />

              {/* frame */}
              <motion.div
                className="aspect-[4/5] overflow-hidden relative"
                whileHover={{ rotateY: -3, rotateX: 2 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                style={{
                  transformStyle: "preserve-3d",
                  border: "1px solid rgba(44,31,26,0.10)",
                  boxShadow: "0 8px 40px rgba(44,31,26,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
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

                {/* colour tint */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, rgba(44,31,26,0.35) 0%, transparent 55%)",
                  }}
                />

                {/* label */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`label-${current}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="absolute bottom-5 left-5 z-10"
                  >
                    <span
                      className="px-3 py-1.5 text-[10px] tracking-[0.22em] uppercase font-medium"
                      style={{
                        background: "rgba(253,248,244,0.80)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(44,31,26,0.12)",
                        color: "rgba(44,31,26,0.80)",
                      }}
                    >
                      {slides[current].label}
                    </span>
                  </motion.div>
                </AnimatePresence>

                {/* prev/next */}
                <button
                  aria-label="Previous slide"
                  onClick={() => go(current - 1, -1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center transition-all"
                  style={{
                    background: "rgba(253,248,244,0.75)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(44,31,26,0.10)",
                  }}
                >
                  <ChevronLeft className="w-4 h-4" style={{ color: "#2c1f1a" }} />
                </button>
                <button
                  aria-label="Next slide"
                  onClick={() => go(current + 1, 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center transition-all"
                  style={{
                    background: "rgba(253,248,244,0.75)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid rgba(44,31,26,0.10)",
                  }}
                >
                  <ChevronRight className="w-4 h-4" style={{ color: "#2c1f1a" }} />
                </button>
              </motion.div>

              {/* progress + dots */}
              <div className="mt-4 flex flex-col items-end gap-2.5 pr-1">
                <div
                  className="w-full h-px overflow-hidden"
                  style={{ background: "rgba(44,31,26,0.10)" }}
                >
                  <motion.div
                    key={`progress-${current}`}
                    className="h-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: paused ? undefined : 1 }}
                    transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
                    style={{
                      transformOrigin: "left",
                      background: "linear-gradient(90deg, #c9857a, #b8a4c8)",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => go(i, i > current ? 1 : -1)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === current ? 20 : 6,
                        height: 6,
                        background:
                          i === current
                            ? "linear-gradient(90deg, #c9857a, #b8a4c8)"
                            : "rgba(44,31,26,0.15)",
                      }}
                    />
                  ))}
                  <span
                    className="ml-2 text-[10px] tracking-[0.15em] tabular-nums"
                    style={{ color: "rgba(44,31,26,0.30)" }}
                  >
                    {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* badge: star rating */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.55 }}
                className="absolute -left-6 top-10 z-20 px-5 py-3.5"
                style={{
                  background: "rgba(253,248,244,0.92)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(44,31,26,0.10)",
                  boxShadow: "0 4px 20px rgba(44,31,26,0.08)",
                }}
              >
                <div className="flex gap-1 mb-1.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} width="12" height="12" viewBox="0 0 12 12">
                      <polygon
                        points="6,1 7.5,4.5 11,4.5 8.5,7 9.5,11 6,8.8 2.5,11 3.5,7 1,4.5 4.5,4.5"
                        fill="#c9857a"
                      />
                    </svg>
                  ))}
                </div>
                <p className="text-[11px] tracking-[0.12em]" style={{ color: "rgba(44,31,26,0.55)" }}>
                  Rated #1 in Cardiff
                </p>
              </motion.div>

              {/* badge: est */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.18, duration: 0.52 }}
                className="absolute -bottom-14 right-8 z-20 px-7 py-4"
                style={{
                  background: "#2c1f1a",
                  boxShadow: "0 4px 24px rgba(44,31,26,0.18)",
                }}
              >
                <p className="font-serif text-2xl leading-none" style={{ color: "#fdf8f4" }}>Est.</p>
                <p className="mt-1 text-[9px] tracking-[0.28em] uppercase" style={{ color: "rgba(253,248,244,0.45)" }}>
                  Cardiff
                </p>
              </motion.div>

              {/* corner accents */}
              <div
                className="absolute -bottom-4 -left-4 w-20 h-20 pointer-events-none"
                style={{ border: "1px solid rgba(201,133,122,0.25)" }}
              />
              <div
                className="absolute -top-3 -right-3 w-14 h-14 pointer-events-none"
                style={{ border: "1px solid rgba(184,164,200,0.22)" }}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9 }}
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-px h-10"
          style={{ background: "linear-gradient(to bottom, rgba(201,133,122,0.6), transparent)" }}
        />
        <p className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "rgba(44,31,26,0.30)" }}>
          Scroll
        </p>
      </motion.div>
    </section>
  );
};

export default HeroSection;

