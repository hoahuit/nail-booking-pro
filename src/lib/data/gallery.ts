import type { GalleryImage } from "../types";

import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import galleryEU from "@/assets/gallery-eu.jpg";
import galleryUK from "@/assets/gallery-uk.jpg";

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: "g1", src: galleryEU, alt: "European French tips", label: "French Tips", span: "col-span-2 row-span-2" },
  { id: "g2", src: gallery1, alt: "Delicate nail art", label: "Nail Art" },
  { id: "g3", src: galleryUK, alt: "British classic style", label: "Classic Style" },
  { id: "g4", src: gallery3, alt: "Gel nail design", label: "Gel Design" },
  { id: "g5", src: gallery2, alt: "Spa treatment", label: "Spa Care" },
  { id: "g6", src: gallery4, alt: "Polish collection", label: "Polish Collection", span: "col-span-2" },
];
