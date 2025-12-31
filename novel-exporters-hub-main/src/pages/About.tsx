import { CheckCircle, Users, Globe, Award, Target, Heart } from "lucide-react";
import { products } from "@/data/products";
import novelLogo from "@/assets/novel-logo-dynamic.png";

const About = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 gradient-hero">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-15" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6 animate-fade-in">
            About Novel Exporters
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            Your trusted partner in premium spice exports from the heart of Tamil Nadu and Kerala
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              {/* Packed spices hero with logo and export badges */}
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-card group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border border-transparent hover:border-primary/30">
                <img
                  src="https://images.pexels.com/photos/1393382/pexels-photo-1393382.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Packed spices ready for export"
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* subtle fade overlay for hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-spice-earth/10 pointer-events-none" />
                <div aria-hidden className="absolute inset-0 bg-black/0 transition-opacity duration-300 group-hover:bg-black/20 pointer-events-none" />

                <div className="absolute top-4 left-4 flex items-center gap-3">
                  <div className="rounded-lg p-1.5">
                    <img src={novelLogo} alt="Novel Exporters logo" className="h-16 w-16 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-serif text-foreground">Novel Exporters</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">Packed spices • Export‑ready • Traceable</p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-3">
                  <div aria-hidden className="bg-card text-foreground rounded-md px-3 py-2 flex items-center gap-2 shadow-sm border border-border">
                    <span className="text-xl">🚢</span>
                    <span className="text-sm">Sea Export</span>
                  </div>

                  <div aria-hidden className="bg-card text-foreground rounded-md px-3 py-2 flex items-center gap-2 shadow-sm border border-border">
                    <span className="text-xl">✈️</span>
                    <span className="text-sm">Air Export</span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl gradient-warm flex items-center justify-center shadow-xl animate-float">
                <div className="text-center text-white">
                  <span className="text-4xl font-bold font-serif">10+</span>
                  <p className="text-sm opacity-90">Years of Excellence</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-slide-in">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Our Story
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
                From Coimbatore to the World
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Founded with a vision to share the authentic flavors of South India with the world,
                Novel Exporters has grown from a small family business to a leading spice export company.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Based in Coimbatore, Tamil Nadu, we work directly with local farmers who have been
                cultivating spices for generations. This direct relationship ensures we maintain the
                highest quality standards while supporting sustainable farming practices.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we proudly export our premium spices to customers across the globe, bringing
                the rich heritage of Tamil Nadu and Kerala's spice tradition to kitchens worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-card shadow-lg card-hover animate-fade-in">
              <div className="w-16 h-16 rounded-2xl gradient-leaf flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To be the bridge between India's finest spice farmers and global consumers,
                delivering authentic, premium-quality spices while upholding the highest
                standards of sustainability and fair trade practices.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-card shadow-lg card-hover animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 rounded-2xl gradient-warm flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become the most trusted name in global spice exports, known for our
                unwavering commitment to quality, innovation, and customer satisfaction
                while preserving the rich culinary heritage of Tamil Nadu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12 space-y-4">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
              The Novel Exporters Difference
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CheckCircle,
                title: "Premium Quality",
                desc: "Every batch is carefully inspected and tested to ensure it meets our rigorous quality standards.",
              },
              {
                icon: Users,
                title: "Direct Sourcing",
                desc: "We work directly with farmers, ensuring fair prices and authentic, traceable products.",
              },
              {
                icon: Globe,
                title: "Global Reach",
                desc: "Efficient logistics and reliable shipping to customers across continents.",
              },
              {
                icon: Award,
                title: "Certified Excellence",
                desc: "All products comply with international food safety and quality certifications.",
              },
              {
                icon: Heart,
                title: "Sustainable Practices",
                desc: "Committed to eco-friendly packaging and supporting sustainable farming.",
              },
              {
                icon: Target,
                title: "Customer Focus",
                desc: "Dedicated support team ensuring smooth transactions and customer satisfaction.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-serif text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 gradient-hero">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10+", label: "Years Experience" },
              { value: "50+", label: "Countries Served" },
              { value: "500+", label: "Happy Clients" },
              { value: "1000+", label: "Tons Exported" },
            ].map((stat, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <span className="text-4xl md:text-5xl font-bold font-serif text-white">{stat.value}</span>
                <p className="text-white/80 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
