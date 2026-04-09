import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";

const Footer = () => (
  <footer id="contact" className="bg-foreground text-primary-foreground py-16">
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-12">
        <div>
          <h3 className="font-serif text-2xl font-bold mb-4">Luxe<span className="text-rose-gold-light">Nails</span></h3>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            Tiệm nail cao cấp với đội ngũ thợ chuyên nghiệp, cam kết mang đến trải nghiệm đẳng cấp nhất.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="w-10 h-10 rounded-full bg-rose-gold/20 flex items-center justify-center hover:bg-rose-gold/40 transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-rose-gold/20 flex items-center justify-center hover:bg-rose-gold/40 transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-semibold mb-4">Liên Hệ</h4>
          <p className="flex items-center gap-3 text-sm text-primary-foreground/70"><MapPin className="w-4 h-4 text-rose-gold-light" /> 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
          <p className="flex items-center gap-3 text-sm text-primary-foreground/70"><Phone className="w-4 h-4 text-rose-gold-light" /> 0912 345 678</p>
          <p className="flex items-center gap-3 text-sm text-primary-foreground/70"><Clock className="w-4 h-4 text-rose-gold-light" /> 9:00 - 19:00 (T2 - CN)</p>
        </div>
        <div>
          <h4 className="font-serif text-lg font-semibold mb-4">Dịch Vụ</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            {["Sơn Gel", "Đắp Bột & Gel", "Nail Art", "Combo VIP", "Chăm Sóc Tay"].map((s) => (
              <li key={s} className="hover:text-rose-gold-light transition-colors cursor-pointer">{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/40">
        © 2026 LuxeNails. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
