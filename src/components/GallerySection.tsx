import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GALLERY_IMAGES } from "@/lib/data/gallery";

const GallerySection = () => {
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-28 bg-secondary/40">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 space-y-4"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">Portfolio</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">Gallery</h2>
          <div className="divider-thin mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[250px]">
          {GALLERY_IMAGES.map((img, i) => (
            <motion.button
              key={img.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.02, rotateY: -2 }}
              onClick={() => setLightbox(i)}
              className={`group relative overflow-hidden cursor-zoom-in text-left ${img.span || ""}`}
              style={{ perspective: "600px" }}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div
                className="absolute bottom-0 inset-x-0 p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all"
                style={{ transitionDuration: "400ms" }}
              >
                <span className="font-serif text-xl text-primary-foreground">{img.label}</span>
                <div className="mt-1 w-6 h-px bg-primary-foreground/60" />
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <a
            href="https://www.instagram.com/kingnails.cardiff/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
          >
            Follow Us @kingnails.cardiff
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/85 backdrop-blur-sm p-6 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={GALLERY_IMAGES[lightbox].src}
                alt={GALLERY_IMAGES[lightbox].alt}
                className="max-w-full max-h-[85vh] object-contain"
              />
              <div className="absolute bottom-0 inset-x-0 p-4 bg-foreground/50 backdrop-blur-sm">
                <span className="font-serif text-lg text-primary-foreground">
                  {GALLERY_IMAGES[lightbox].label}
                </span>
              </div>
              <button
                onClick={() => setLightbox((lightbox - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/70 flex items-center justify-center hover:bg-background transition-colors"
              >
                ‹
              </button>
              <button
                onClick={() => setLightbox((lightbox + 1) % GALLERY_IMAGES.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/70 flex items-center justify-center hover:bg-background transition-colors"
              >
                ›
              </button>
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-4 -right-4 w-9 h-9 bg-background flex items-center justify-center text-foreground hover:bg-secondary transition-colors text-sm"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
