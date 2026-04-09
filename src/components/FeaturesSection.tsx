import { motion } from "framer-motion";
import { Heart, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Personalized Experience",
    desc: "Each guest is our favourite guest. Come and make sure that our service is exceptional.",
  },
  {
    icon: Shield,
    title: "Professional Care",
    desc: "All products we use are professional and have proven efficiency. No compromises.",
  },
  {
    icon: Sparkles,
    title: "We Love What We Do",
    desc: "People that you'll meet in our studio are doing the job they love. Come and see the difference.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-4"
            >
              <f.icon className="w-8 h-8 mx-auto text-muted-foreground" strokeWidth={1.2} />
              <h3 className="font-serif text-2xl text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-xs mx-auto">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
