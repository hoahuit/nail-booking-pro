import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock } from "lucide-react";

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

const ServicesSection = ({ onBookingClick }: ServicesSectionProps) => {
  return (
    <section id="services" className="py-28">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-foreground font-bold">
            Price List
          </h2>
          <div className="divider-thin mt-6" />
        </motion.div>

        <Tabs defaultValue="fullset" className="max-w-6xl mx-auto">
          <TabsList className="w-full flex flex-wrap justify-center bg-transparent gap-0 border border-border rounded-none h-auto p-0 mb-12">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.key}
                value={cat.key}
                className="rounded-none border-none data-[state=active]:bg-[hsl(var(--warm))] data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-xs tracking-[0.08em] uppercase text-muted-foreground px-4 py-3.5 font-medium"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.key} value={cat.key}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    className="group bg-card overflow-hidden shadow-subtle hover:shadow-elevated transition-shadow duration-300"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        width={640}
                        height={640}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="font-serif text-base text-foreground leading-snug min-h-[2.5rem]">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          From <span className="font-semibold text-foreground text-lg">{item.price}</span>
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </span>
                      </div>
                      <button
                        onClick={() => onBookingClick(item)}
                        className="w-full py-3 text-xs tracking-[0.12em] uppercase font-medium bg-sand text-foreground hover:bg-[hsl(var(--warm))] hover:text-primary-foreground transition-colors duration-300"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default ServicesSection;
