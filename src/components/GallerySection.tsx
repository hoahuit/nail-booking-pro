import { motion } from "framer-motion";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";

const images = [
  { src: gallery1, alt: "Nail art tinh tế" },
  { src: gallery2, alt: "Pedicure cao cấp" },
  { src: gallery3, alt: "Thiết kế gel sang trọng" },
  { src: gallery4, alt: "Bộ sưu tập sơn nail" },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-24">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium tracking-[0.3em] uppercase text-primary">Tác phẩm</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 text-foreground">
            Bộ Sưu Tập <span className="italic text-primary">Nổi Bật</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-xl aspect-square"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-500 flex items-end p-4">
                <span className="font-serif text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-sm">
                  {img.alt}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
