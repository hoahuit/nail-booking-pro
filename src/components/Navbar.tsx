import { useState } from "react";
import { Menu, X, Phone, Instagram, Facebook } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import logoNgang2 from "@/assets/logo-kingnails.png";

interface NavbarProps {
  onBookingClick: () => void;
}

const navItems = [
  { label: "Home",      id: "hero" },
  { label: "Services",  id: "services" },
  { label: "Our Story", id: "story" },
  { label: "Gallery",   id: "gallery" },
  { label: "Location",  id: "location" },
  { label: "Contact",   id: "contact" },
];

const Navbar = ({ onBookingClick }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <button onClick={() => scrollTo("hero")}>
          <img src={logoNgang2} alt={BUSINESS.name} className="h-24 w-auto object-contain" />
        </button>

        {/* Center nav */}
        <div className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right: phone + socials + book now */}
        <div className="hidden lg:flex items-center gap-5">
          <a
            href={`tel:${BUSINESS.phone}`}
            className="flex items-center gap-1.5 text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: "#c9a227" }}
          >
            <Phone className="w-3.5 h-3.5" />
            {BUSINESS.phone}
          </a>

          {/* Social icons */}
          <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
            <a
              href={BUSINESS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-pink-500 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={BUSINESS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>

          <button
            onClick={onBookingClick}
            className="bg-gray-900 text-white text-xs tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-gray-700 transition-colors duration-200 flex items-center gap-1.5"
          >
            Book Now <span className="text-base leading-none">→</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="lg:hidden text-gray-900" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 pb-6 pt-4 space-y-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left text-sm text-gray-600 hover:text-gray-900 py-1.5"
            >
              {item.label}
            </button>
          ))}
          <a
            href={`tel:${BUSINESS.phone}`}
            className="flex items-center gap-2 text-sm font-medium py-1.5"
            style={{ color: "#c9a227" }}
          >
            <Phone className="w-3.5 h-3.5" />
            {BUSINESS.phone}
          </a>
          <button
            onClick={() => { onBookingClick(); setIsOpen(false); }}
            className="w-full bg-gray-900 text-white text-xs tracking-[0.15em] uppercase py-3"
          >
            Book Now
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
