import { useState } from "react";
import { Menu, X, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onBookingClick: () => void;
}

const navItems = [
  { label: "Home", id: "hero" },
  { label: "Our Story", id: "story" },
  { label: "Services", id: "services" },
  { label: "Gallery", id: "gallery" },
  { label: "Contact", id: "contact" },
];

const Navbar = ({ onBookingClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between py-5 px-6">
        <button onClick={() => scrollTo("hero")} className="font-serif text-2xl tracking-wide text-foreground">
          LUXE NAILS
        </button>

        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {item.label}
            </button>
          ))}
          <Button
            onClick={onBookingClick}
            className="bg-foreground text-background hover:bg-foreground/90 text-xs tracking-[0.15em] uppercase px-6 py-2.5 rounded-none"
          >
            Book Now
          </Button>
        </div>

        <div className="hidden lg:flex items-center gap-3 ml-4">
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
        </div>

        <button className="lg:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-background border-t border-border px-6 pb-8 pt-4 space-y-5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {item.label}
            </button>
          ))}
          <Button
            onClick={() => { onBookingClick(); setIsOpen(false); }}
            className="w-full bg-foreground text-background rounded-none text-xs tracking-[0.15em] uppercase"
          >
            Book Now
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
