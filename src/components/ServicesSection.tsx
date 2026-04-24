import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { useServices, useIsPopular } from "@/hooks/useServices";
import type { ServiceItem } from "@/lib/types";

interface ServicesSectionProps {
  onBookingClick: (service?: ServiceItem) => void;
}

export type { ServiceItem };

const ALL_TAB = "__all__";

const ServicesSection = ({ onBookingClick }: ServicesSectionProps) => {
  const { data: categories = [] } = useServices();
  const [activeTab, setActiveTab] = useState(ALL_TAB);

  const allItems: ServiceItem[] = categories.flatMap((c) => c.items);
  const activeCat =
    activeTab === ALL_TAB
      ? { key: ALL_TAB, label: "All", items: allItems }
      : (categories.find((c) => c.key === activeTab) ?? categories[0]);

  if (!activeCat) return null;

  return (
    <section id="services" className="py-32 relative overflow-hidden">
      {/* 3D perspective decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20 space-y-5"
        >
          <p className="text-xs tracking-[0.32em] uppercase text-muted-foreground">
            Service Menu
          </p>
          <h2 className="font-serif text-5xl md:text-6xl text-foreground leading-none">
            Price List
          </h2>
          <p className="text-sm text-muted-foreground font-light max-w-md mx-auto">
            Premium nail care — from classic elegance to avant-garde artistry.
          </p>
          <div className="divider-thin mt-6" />
        </motion.div>

        {/* Tabs */}
        <div className="mb-14 overflow-x-auto">
          <div className="flex items-center justify-start md:justify-center border-b border-border w-fit md:w-full">
            {[{ key: ALL_TAB, label: "All" }, ...categories].map((cat) => (
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

        {/* Cards Grid with 3D hover */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5"
          >
            {activeCat.items.map((item, idx) => (
              <ServiceCard
                key={item.id}
                item={item}
                idx={idx}
                onBook={onBookingClick}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 text-center space-y-3"
        >
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

/* ── Individual Service Card with 3D tilt ── */
function priceDisplay(item: ServiceItem): string {
  return item.priceMax ? `${item.price} – ${item.priceMax}` : item.price;
}

function ServiceCard({
  item,
  idx,
  onBook,
}: {
  item: ServiceItem;
  idx: number;
  onBook: (s: ServiceItem) => void;
}) {
  const isPopular = useIsPopular(item.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05, duration: 0.42 }}
      onClick={() => onBook(item)}
      className="group cursor-pointer"
      style={{ perspective: "800px" }}
    >
      {/* Mobile card */}
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
              {priceDisplay(item)}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBook(item);
              }}
              className="text-[9px] tracking-[0.18em] uppercase border-b border-foreground pb-0.5 text-foreground"
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {/* Desktop 3D card */}
      <motion.div
        className="hidden lg:block relative aspect-[4/5] overflow-hidden bg-secondary"
        whileHover={{ rotateY: -4, rotateX: 2, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={640}
          height={800}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />

        {/* Default info */}
        <div className="absolute bottom-0 inset-x-0 p-5 transition-all duration-500 group-hover:opacity-0 group-hover:translate-y-2">
          <h3 className="font-serif text-lg text-primary-foreground leading-tight line-clamp-2">
            {item.name}
          </h3>
          <span className="font-serif text-2xl text-primary-foreground/90">
            {priceDisplay(item)}
          </span>
        </div>

        {/* Hover panel */}
        <div className="absolute inset-x-0 bottom-0 bg-background/[0.97] backdrop-blur-[2px] p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <h3 className="font-serif text-sm text-foreground leading-snug mb-3">
            {item.name}
          </h3>
          <div className="flex items-center justify-between py-3 border-t border-b border-border">
            <span className="font-serif text-2xl text-foreground">
              {priceDisplay(item)}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {item.duration}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(item);
            }}
            className="mt-4 w-full bg-foreground text-primary-foreground text-[10px] tracking-[0.22em] uppercase py-3 hover:bg-foreground/85 transition-colors"
          >
            Book Now
          </button>
        </div>

        {isPopular && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-foreground/90 backdrop-blur-sm text-primary-foreground px-2.5 py-1.5">
            <Sparkles className="w-2.5 h-2.5" />
            <span className="text-[9px] tracking-[0.2em] uppercase font-medium">
              Popular
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-20 bg-background/80 backdrop-blur-sm px-2 py-1 flex items-center gap-1.5 group-hover:opacity-0 transition-opacity duration-300">
          <Clock className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-[10px] tracking-[0.08em] text-muted-foreground">
            {item.duration}
          </span>
        </div>

        {/* 3D corner accents */}
        <div className="absolute top-0 left-0 w-7 h-7 border-l-2 border-t-2 border-primary-foreground/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
        <div className="absolute top-0 right-0 w-7 h-7 border-r-2 border-t-2 border-primary-foreground/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
      </motion.div>
    </motion.div>
  );
}

export default ServicesSection;
