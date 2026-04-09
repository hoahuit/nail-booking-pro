import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ServicesSectionProps {
  onBookingClick: () => void;
}

type ServiceItem = { name: string; price: string };

const categories: { key: string; label: string; items: ServiceItem[] }[] = [
  {
    key: "fullset",
    label: "Nails EXT\nFull Set",
    items: [
      { name: "Acrylics Only", price: "£30" },
      { name: "Acrylics & Gel Colour", price: "£38" },
      { name: "Acrylics & Gel Colour French Tips", price: "£45" },
      { name: "Ombre'", price: "£40" },
      { name: "Glitter Powder", price: "£45" },
      { name: "BIAB On Natural", price: "£35" },
      { name: "BIAB With Extensions", price: "£40" },
      { name: "BIAB & Gel Colour French Tips", price: "£45" },
      { name: "Toes Acrylics & Gel Colour", price: "£35" },
      { name: "2 Big Toes", price: "£10" },
    ],
  },
  {
    key: "infill",
    label: "Nails EXT\nInfill",
    items: [
      { name: "Acrylics Only", price: "£25" },
      { name: "Acrylics & Gel Colour", price: "£30" },
      { name: "Acrylics & Gel Colour French Tips", price: "£35" },
      { name: "Ombre'", price: "£30" },
      { name: "Glitter Powder", price: "£35" },
      { name: "BIAB On Natural", price: "£30" },
      { name: "BIAB With Extensions", price: "£30" },
      { name: "BIAB & Gel Colour French Tips", price: "£35" },
      { name: "Toes Acrylics & Gel Colour", price: "£30" },
      { name: "2 Big Toes", price: "£5" },
    ],
  },
  {
    key: "newset",
    label: "Nails EXT\nT/O New Set",
    items: [
      { name: "Acrylics Only", price: "£35" },
      { name: "Acrylics & Gel Colour", price: "£43" },
      { name: "Acrylics & Gel Colour French Tips", price: "£48" },
      { name: "Ombre'", price: "£45" },
      { name: "Glitter Powder", price: "£48" },
      { name: "BIAB On Natural", price: "£35" },
      { name: "BIAB With Extensions", price: "£40" },
      { name: "BIAB & Gel Colour French Tips", price: "£45" },
      { name: "Toes Acrylics & Gel Colour", price: "£40" },
    ],
  },
  {
    key: "natural",
    label: "Natural Nails",
    items: [
      { name: "Basic Pedicure", price: "£40" },
      { name: "Luxury Pedicure", price: "£45" },
      { name: "Basic Manicure", price: "£30" },
      { name: "Luxury Manicure", price: "£35" },
      { name: "Gel Polish Hands", price: "£20" },
      { name: "Gel Polish Toes", price: "£20" },
      { name: "Kids Nails", price: "£10" },
    ],
  },
  {
    key: "extra",
    label: "Extra",
    items: [
      { name: "Chrome", price: "£5" },
      { name: "Cateyes", price: "£5" },
      { name: "Designs", price: "£5–£10" },
      { name: "Diamonds", price: "£2–£5" },
      { name: "Take Off Acrylics / BIAB", price: "£10" },
      { name: "Take Off Gel Polish", price: "£5" },
    ],
  },
];

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
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground">What We Offer</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">
            Service Menu
          </h2>
          <div className="divider-thin mt-6" />
        </motion.div>

        <Tabs defaultValue="fullset" className="max-w-4xl mx-auto">
          <TabsList className="w-full flex flex-wrap justify-center bg-transparent gap-0 border-b border-border rounded-none h-auto p-0 mb-10">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.key}
                value={cat.key}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs tracking-[0.12em] uppercase text-muted-foreground data-[state=active]:text-foreground px-5 py-4 whitespace-pre-line leading-tight"
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
                className="grid md:grid-cols-2 gap-x-16 gap-y-0"
              >
                {cat.items.map((item) => (
                  <div
                    key={item.name}
                    onClick={onBookingClick}
                    className="group cursor-pointer flex items-center justify-between py-5 border-b border-border/50 hover:bg-accent/30 transition-colors duration-300 px-3 -mx-3"
                  >
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors font-light">
                      {item.name}
                    </span>
                    <span className="font-serif text-lg text-foreground ml-4">
                      {item.price}
                    </span>
                  </div>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12">
          <button
            onClick={onBookingClick}
            className="inline-block border border-foreground text-foreground text-xs tracking-[0.15em] uppercase px-10 py-4 hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
