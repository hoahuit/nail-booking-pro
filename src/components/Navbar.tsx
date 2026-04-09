import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between py-4">
        <button onClick={() => scrollTo("hero")} className="font-serif text-2xl font-bold tracking-wide text-foreground">
          Luxe<span className="text-rose-gold">Nails</span>
        </button>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {["Dịch Vụ", "Bộ Sưu Tập", "Liên Hệ"].map((item, i) => (
            <button
              key={item}
              onClick={() => scrollTo(["services", "gallery", "contact"][i])}
              className="text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              {item}
            </button>
          ))}
          <Button onClick={onBookingClick} className="bg-gradient-rose hover:shadow-rose-glow transition-all duration-300">
            Đặt Lịch Ngay
          </Button>
        </div>

        {/* Mobile */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-6 space-y-4">
          {["Dịch Vụ", "Bộ Sưu Tập", "Liên Hệ"].map((item, i) => (
            <button
              key={item}
              onClick={() => scrollTo(["services", "gallery", "contact"][i])}
              className="block w-full text-left text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors py-2"
            >
              {item}
            </button>
          ))}
          <Button onClick={() => { onBookingClick(); setIsOpen(false); }} className="w-full bg-gradient-rose">
            Đặt Lịch Ngay
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
