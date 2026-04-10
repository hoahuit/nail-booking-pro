import { useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";

import imgOverlay from "@/assets/service-acrylic-overlay.jpg";
import imgFrench from "@/assets/service-french-tips.jpg";
import imgGel from "@/assets/service-gel-colour.jpg";
import imgOmbre from "@/assets/service-french-tips.jpg";
import imgGlitter from "@/assets/service-glitter.jpg";
import imgBiab from "@/assets/service-biab.jpg";
import imgChrome from "@/assets/service-chrome.jpg";
import imgPedicure from "@/assets/service-pedicure.jpg";
import imgManicure from "@/assets/service-manicure.jpg";

interface ServicesSectionProps {
  onBookingClick: (service?: ServiceItem) => void;
}

export type ServiceItem = {
  name: string;
  price: string;
  duration: string;
  image: string;
};

type ServiceCategory = {
  key: string;
  label: string;
  items: ServiceItem[];
};

const categories: ServiceCategory[] = [
  {
    key: "fullset",
    label: "FULL SET",
    items: [
      { name: "Full Set Acrylic Overlays", price: "£30.00", duration: "45m", image: imgOverlay },
      { name: "Full Set Acrylic with French Tips", price: "£45.00", duration: "45m", image: imgFrench },
      { name: "Full Set Acrylic with Gel Colour", price: "£38.00", duration: "45m", image: imgGel },
      { name: "Full Set Acrylic with Ombre", price: "£40.00", duration: "45m", image: imgOmbre },
      { name: "Full Set Glitter Powder", price: "£45.00", duration: "45m", image: imgGlitter },
      { name: "Full Set BIAB On Natural", price: "£35.00", duration: "40m", image: imgBiab },
      { name: "Full Set BIAB With Extensions", price: "£40.00", duration: "50m", image: imgBiab },
      { name: "Full Set BIAB French Tips", price: "£45.00", duration: "50m", image: imgFrench },
    ],
  },
  {
    key: "infill",
    label: "INFILL",
    items: [
      { name: "Infill Acrylic Only", price: "£25.00", duration: "40m", image: imgOverlay },
      { name: "Infill Acrylic & Gel Colour", price: "£30.00", duration: "45m", image: imgGel },
      { name: "Infill French Tips", price: "£35.00", duration: "45m", image: imgFrench },
      { name: "Infill Ombre", price: "£30.00", duration: "45m", image: imgOmbre },
      { name: "Infill Glitter Powder", price: "£35.00", duration: "45m", image: imgGlitter },
      { name: "Infill BIAB", price: "£30.00", duration: "40m", image: imgBiab },
    ],
  },
  {
    key: "takeoff",
    label: "TAKE OFF & REDONE",
    items: [
      { name: "T/O Acrylic Only New Set", price: "£35.00", duration: "60m", image: imgOverlay },
      { name: "T/O Acrylic & Gel Colour", price: "£43.00", duration: "60m", image: imgGel },
      { name: "T/O French Tips New Set", price: "£48.00", duration: "60m", image: imgFrench },
      { name: "T/O Ombre New Set", price: "£45.00", duration: "60m", image: imgOmbre },
      { name: "T/O Glitter Powder New Set", price: "£48.00", duration: "60m", image: imgGlitter },
    ],
  },
  {
    key: "gelcolour",
    label: "GEL COLOUR",
    items: [
      { name: "Gel Polish Hands", price: "£20.00", duration: "30m", image: imgGel },
      { name: "Gel Polish Toes", price: "£20.00", duration: "30m", image: imgPedicure },
    ],
  },
  {
    key: "manicure",
    label: "MANICURE",
    items: [
      { name: "Basic Manicure", price: "£30.00", duration: "30m", image: imgManicure },
      { name: "Luxury Manicure", price: "£35.00", duration: "45m", image: imgManicure },
    ],
  },
  {
    key: "pedicure",
    label: "PEDICURE",
    items: [
      { name: "Basic Pedicure", price: "£40.00", duration: "40m", image: imgPedicure },
      { name: "Luxury Pedicure", price: "£45.00", duration: "50m", image: imgPedicure },
      { name: "Toes Acrylics & Gel Colour", price: "£35.00", duration: "40m", image: imgPedicure },
      { name: "2 Big Toes", price: "£10.00", duration: "15m", image: imgPedicure },
    ],
  },
  {
    key: "additional",
    label: "ADDITIONAL SERVICES",
    items: [
      { name: "Chrome", price: "£5.00", duration: "10m", image: imgChrome },
      { name: "Cateyes", price: "£5.00", duration: "10m", image: imgChrome },
      { name: "Designs", price: "£5.00", duration: "15m", image: imgGlitter },
      { name: "Diamonds", price: "£2.00", duration: "10m", image: imgGlitter },
      { name: "Take Off Acrylics / BIAB", price: "£10.00", duration: "20m", image: imgOverlay },
      { name: "Take Off Gel Polish", price: "£5.00", duration: "15m", image: imgGel },
      { name: "Kids Nails", price: "£10.00", duration: "20m", image: imgManicure },
    ],
  },
];

export { categories };

const POPULAR = new Set([
  "Full Set Acrylic with French Tips",
  "Full Set BIAB French Tips",
  "Luxury Manicure",
  "Luxury Pedicure",
]);

const ButterflyIcon = ({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) => (
  <svg
    viewBox="0 0 200 160"
    className={className}
    style={style}
    fill="currentColor"
    aria-hidden
  >
    {/* Upper wings */}
    <path d="M100,78 C86,50 32,18 10,44 C-4,64 22,88 100,78Z" />
    <path d="M100,78 C114,50 168,18 190,44 C204,64 178,88 100,78Z" />
    {/* Lower wings */}
    <path d="M100,78 C64,98 14,128 18,143 C25,156 68,138 100,78Z" />
    <path d="M100,78 C136,98 186,128 182,143 C175,156 132,138 100,78Z" />
    {/* Body */}
    <ellipse cx="100" cy="90" rx="4" ry="20" />
    {/* Antennae */}
    <path
      d="M97,70 C91,52 82,42 76,30"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M103,70 C109,52 118,42 124,30"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="75" cy="27" r="3.5" />
    <circle cx="125" cy="27" r="3.5" />
  </svg>
);

const ServicesSection = ({ onBookingClick }: ServicesSectionProps) => {
  const [activeTab, setActiveTab] = useState("fullset");
  const activeCat = categories.find((c) => c.key === activeTab)!;

  return (
    <section id="services" className="py-32 relative overflow-hidden">
      {/* Butterfly watermarks */}
      <ButterflyIcon className="absolute -top-6 right-0 w-80 h-auto text-foreground/[0.025] pointer-events-none select-none" />
      <ButterflyIcon className="absolute bottom-10 -left-8 w-52 h-auto text-foreground/[0.018] pointer-events-none select-none -rotate-[18deg]" />

      <div className="container mx-auto relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20 space-y-5"
        >
          <ButterflyIcon
            className="w-10 h-auto mx-auto"
            style={{ color: "hsl(var(--warm))" }}
          />
          <p className="text-xs tracking-[0.32em] uppercase text-muted-foreground">
            Our Services
          </p>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground leading-none">
            Price List
          </h2>
          <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
            Premium nail care — from classic elegance to avant-garde artistry.
          </p>
          <div className="divider-thin mt-6" />
        </motion.div>

        {/* ── Tab Navigation ── */}
        <div className="mb-14 overflow-x-auto">
          <div className="flex items-center justify-start md:justify-center border-b border-border w-fit md:w-full">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                className={`relative whitespace-nowrap px-4 md:px-5 pb-4 pt-1 text-[10px] tracking-[0.12em] uppercase font-medium transition-colors duration-200 ${
                  activeTab === cat.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/75"
                }`}
              >
                {cat.label}
                {activeTab === cat.key && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 inset-x-2 h-[1.5px]"
                    style={{ backgroundColor: "hsl(var(--warm))" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cards Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {activeCat.items.map((item, idx) => {
              const isPopular = POPULAR.has(item.name);
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.055, duration: 0.42 }}
                  onClick={() => onBookingClick(item)}
                  className="group cursor-pointer overflow-hidden"
                >
                  {/* ── Mobile card (stacked) ── */}
                  <div className="lg:hidden bg-card shadow-subtle">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        width={640}
                        height={480}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                      {isPopular && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-foreground/85 text-primary-foreground px-2 py-1">
                          <Sparkles className="w-2 h-2" />
                          <span className="text-[8px] tracking-[0.15em] uppercase">
                            Popular
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-serif text-sm text-foreground leading-snug min-h-[2.2rem] line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
                        <span className="font-serif text-xl text-foreground">
                          {item.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onBookingClick(item);
                          }}
                          className="text-[9px] tracking-[0.18em] uppercase border-b border-foreground pb-0.5 text-foreground"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Desktop butterfly card ── */}
                  <div className="hidden lg:block relative aspect-[4/5] overflow-hidden bg-secondary">
                    {/* Image */}
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      width={640}
                      height={800}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Permanent gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

                    {/* Default: name + price — fades out on hover */}
                    <div className="absolute bottom-0 inset-x-0 p-5 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-2">
                      <h3 className="font-serif text-lg text-primary-foreground leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                      <span className="font-serif text-2xl text-primary-foreground/90">
                        {item.price}
                      </span>
                    </div>

                    {/* ──── Butterfly Wing Spread Panel ──── */}
                    <div className="absolute inset-x-0 bottom-0 bg-background/[0.97] backdrop-blur-[2px] p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-serif text-sm text-foreground leading-snug">
                          {item.name}
                        </h3>
                        <ButterflyIcon
                          className="w-5 h-auto flex-shrink-0 mt-0.5"
                          style={{ color: "hsl(var(--warm))" }}
                        />
                      </div>
                      <div className="flex items-center justify-between py-3 border-t border-b border-border">
                        <span className="font-serif text-2xl text-foreground">
                          {item.price}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                          <Clock className="w-2.5 h-2.5" />
                          {item.duration}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick(item);
                        }}
                        className="mt-4 w-full bg-foreground text-primary-foreground text-[10px] tracking-[0.22em] uppercase py-3 hover:bg-foreground/85 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>

                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-foreground/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span className="text-[9px] tracking-[0.2em] uppercase font-medium">
                          Popular
                        </span>
                      </div>
                    )}

                    {/* Duration badge — hides on hover */}
                    <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm px-2 py-1 flex items-center gap-1.5 group-hover:opacity-0 transition-opacity duration-300">
                      <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[10px] tracking-[0.08em] text-muted-foreground">
                        {item.duration}
                      </span>
                    </div>

                    {/* Corner wing accent marks */}
                    <div className="absolute top-0 left-0 w-7 h-7 border-l-2 border-t-2 border-primary-foreground/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                    <div className="absolute top-0 right-0 w-7 h-7 border-r-2 border-t-2 border-primary-foreground/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 text-center space-y-3"
        >
          <ButterflyIcon
            className="w-7 h-auto mx-auto opacity-40"
            style={{ color: "hsl(var(--warm))" }}
          />
          <p className="text-sm text-muted-foreground font-light">
            Can't find what you're looking for?
          </p>
          <a
            href="tel:+447482888999"
            className="inline-block text-xs tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-0.5 hover:text-primary hover:border-primary transition-colors"
          >
            Call Us Directly
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
