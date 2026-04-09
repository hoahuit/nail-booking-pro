import { motion } from "framer-motion";
import { Gem, Palette, Sparkles, Star, Clock, Heart } from "lucide-react";

interface ServicesSectionProps {
  onBookingClick: () => void;
}

const services = [
  { icon: Palette, title: "Sơn Gel", desc: "Bền màu lên đến 3 tuần, đa dạng màu sắc xu hướng", price: "200.000đ", time: "45 phút" },
  { icon: Gem, title: "Đắp Bột & Gel", desc: "Tạo hình móng chuyên nghiệp, bền đẹp tự nhiên", price: "350.000đ", time: "90 phút" },
  { icon: Sparkles, title: "Nail Art", desc: "Thiết kế nghệ thuật độc quyền theo yêu cầu", price: "150.000đ", time: "60 phút" },
  { icon: Star, title: "Combo VIP", desc: "Manicure + Pedicure + Nail Art trọn gói", price: "500.000đ", time: "120 phút" },
  { icon: Heart, title: "Chăm Sóc Tay", desc: "Dưỡng da tay, massage thư giãn chuyên sâu", price: "180.000đ", time: "50 phút" },
  { icon: Clock, title: "Tháo & Làm Mới", desc: "Tháo móng cũ an toàn, làm mới hoàn toàn", price: "250.000đ", time: "75 phút" },
];

const ServicesSection = ({ onBookingClick }: ServicesSectionProps) => {
  return (
    <section id="services" className="py-24 bg-secondary/30">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-medium tracking-[0.3em] uppercase text-primary">Dịch vụ của chúng tôi</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 text-foreground">
            Dịch Vụ <span className="italic text-primary">Cao Cấp</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={onBookingClick}
              className="group cursor-pointer bg-card rounded-xl p-8 shadow-rose hover:shadow-rose-glow transition-all duration-500 hover:-translate-y-1 border border-border/50"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-rose flex items-center justify-center mb-5">
                <s.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2 text-foreground">{s.title}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{s.desc}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-serif text-lg font-bold text-primary">{s.price}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {s.time}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
