import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onBookingClick: () => void;
}

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

        <div className="hidden md:flex items-center gap-10">
          {["Services", "Gallery", "Contact"].map((item, i) => (
            <button
              key={item}
              onClick={() => scrollTo(["services", "gallery", "contact"][i])}
              className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              {item}
            </button>
          ))}
          <Button
            onClick={onBookingClick}
            className="bg-foreground text-background hover:bg-foreground/90 text-xs tracking-[0.15em] uppercase px-6 py-2.5 rounded-none"
          >
            Book Now
          </Button>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-t border-border px-6 pb-8 pt-4 space-y-5">
          {["Services", "Gallery", "Contact"].map((item, i) => (
            <button
              key={item}
              onClick={() => scrollTo(["services", "gallery", "contact"][i])}
              className="block w-full text-left text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {item}
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
