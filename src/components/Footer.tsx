import { MapPin, Phone, Clock, Instagram, Facebook, Mail } from "lucide-react";
import { BUSINESS } from "@/lib/constants";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground py-20">
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-16">
        {/* Contact */}
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-8">Contact</h4>
          <div className="space-y-4">
            <a
              href={`tel:+44${BUSINESS.phone.replace(/\s/g, "").replace(/^0/, "")}`}
              className="flex items-center gap-3 text-sm text-primary-foreground/60 font-light hover:text-primary-foreground/90 transition-colors"
            >
              <Phone className="w-4 h-4 text-primary-foreground/30" /> {BUSINESS.phone}
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-3 text-sm text-primary-foreground/60 font-light hover:text-primary-foreground/90 transition-colors"
            >
              <Mail className="w-4 h-4 text-primary-foreground/30" /> {BUSINESS.email}
            </a>
          </div>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-8">Hours</h4>
          <div className="space-y-3 text-sm text-primary-foreground/60 font-light">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-primary-foreground/30 mt-0.5" />
              <div>
                {BUSINESS.hours.map((h) => (
                  <p key={h.label}>
                    {h.label}: {h.time}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase text-primary-foreground/50 mb-8">Location</h4>
          <a
            href={BUSINESS.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 text-sm text-primary-foreground/60 font-light hover:text-primary-foreground/90 transition-colors"
          >
            <MapPin className="w-4 h-4 text-primary-foreground/30 mt-0.5" />
            <span>
              {BUSINESS.address.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < BUSINESS.address.length - 1 && <br />}
                </span>
              ))}
            </span>
          </a>
        </div>
      </div>

      {/* Brand & Social */}
      <div className="border-t border-primary-foreground/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-serif text-xl tracking-wide">{BUSINESS.name}</span>
        <div className="flex items-center gap-6">
          <a
            href={BUSINESS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href={BUSINESS.facebook}
            className="text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
          >
            <Facebook className="w-5 h-5" />
          </a>
        </div>
        <span className="text-xs text-primary-foreground/25 tracking-wider">
          © 2026 {BUSINESS.name}. All rights reserved.
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
