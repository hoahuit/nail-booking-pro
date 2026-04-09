import { motion } from "framer-motion";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import galleryEU from "@/assets/gallery-eu.jpg";
import galleryUK from "@/assets/gallery-uk.jpg";

const images = [
  { src: galleryEU, alt: "European French tips", span: "col-span-2 row-span-2" },
  { src: gallery1, alt: "Delicate nail art", span: "" },
  { src: galleryUK, alt: "British classic style", span: "" },
  { src: gallery3, alt: "Gel nail design", span: "" },
  { src: gallery2, alt: "Spa treatment", span: "" },
  { src: gallery4, alt: "Polish collection", span: "col-span-2" },
];

const GallerySection = () => {
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
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            Our Work
          </h2>
          <div className="divider-thin mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[250px]">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`group relative overflow-hidden ${img.span}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-500 flex items-end p-6">
                <span className="font-serif text-lg text-primary-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                  {img.alt}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground font-light">
            Inspired by what you see?
          </p>
          <button
            onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-xs tracking-[0.22em] uppercase text-foreground border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors"
          >
            Book This Look
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default GallerySection;
