import { MapPin, Phone, Clock, Instagram } from "lucide-react";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground py-20">
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-16">
        <div>
          <h3 className="font-serif text-2xl tracking-wide mb-6">LUXE NAILS</h3>
          <p className="text-primary-foreground/50 text-sm leading-relaxed font-light">
            A refined nail experience crafted with European precision and artistry. Every detail matters.
          </p>
          <a href="#" className="inline-flex items-center gap-2 mt-6 text-xs tracking-[0.15em] uppercase text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
            <Instagram className="w-4 h-4" /> Follow Us
          </a>
        </div>
        <div className="space-y-5">
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-6">Contact</h4>
          <p className="flex items-center gap-3 text-sm text-primary-foreground/60 font-light"><MapPin className="w-4 h-4 text-primary-foreground/30" /> 12 King's Road, Chelsea, London</p>
          <p className="flex items-center gap-3 text-sm text-primary-foreground/60 font-light"><Phone className="w-4 h-4 text-primary-foreground/30" /> +44 20 7946 0958</p>
          <p className="flex items-center gap-3 text-sm text-primary-foreground/60 font-light"><Clock className="w-4 h-4 text-primary-foreground/30" /> Mon — Sun, 9:00 – 19:00</p>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-6">Services</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/60 font-light">
            {["Classic Manicure", "Gel Polish", "Nail Art", "European Style", "British Classic", "Full Experience"].map((s) => (
              <li key={s} className="hover:text-primary-foreground/90 transition-colors cursor-pointer">{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-16 pt-8 text-center text-xs text-primary-foreground/25 tracking-wider">
        © 2026 LUXE NAILS. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
