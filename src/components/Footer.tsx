import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from "lucide-react";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground py-20">
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-16">
        {/* Contact */}
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-8">Contact</h4>
          <div className="space-y-4">
            <a href="tel:+447482888999" className="flex items-center gap-3 text-sm text-primary-foreground/60 font-light hover:text-primary-foreground/90 transition-colors">
              <Phone className="w-4 h-4 text-primary-foreground/30" /> 07482 888 999
            </a>
            <a href="mailto:info@luxenails.co.uk" className="flex items-center gap-3 text-sm text-primary-foreground/60 font-light hover:text-primary-foreground/90 transition-colors">
              <Mail className="w-4 h-4 text-primary-foreground/30" /> info@luxenails.co.uk
            </a>
          </div>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-8">Hours</h4>
          <div className="space-y-3 text-sm text-primary-foreground/60 font-light">
            <p className="flex items-start gap-3"><Clock className="w-4 h-4 text-primary-foreground/30 mt-0.5" />
              <span>
                Mon – Sat: 9:00am – 6:30pm<br />
                Thurs: 9:00am – 7:00pm<br />
                Sun: 9:30am – 5:00pm
              </span>
            </p>
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-8">Location</h4>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 text-sm text-primary-foreground/60 font-light hover:text-primary-foreground/90 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary-foreground/30 mt-0.5" />
            <span>
              184 Whitchurch Rd,<br />
              Cardiff CF14 3JP
            </span>
          </a>
        </div>
      </div>

      {/* Brand & Social */}
      <div className="border-t border-primary-foreground/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-serif text-xl tracking-wide">LUXE NAILS</span>
        <div className="flex items-center gap-6">
          <a href="#" className="text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
          <a href="#" className="text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors">
            <Facebook className="w-5 h-5" />
          </a>
        </div>
        <span className="text-xs text-primary-foreground/25 tracking-wider">
          © 2026 LUXE NAILS. All rights reserved.
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
