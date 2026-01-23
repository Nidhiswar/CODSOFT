import { CheckCircle, Users, Globe, Award, Target, Heart, Plane, Box, ShieldCheck } from "lucide-react";
import Certifications from "@/components/Certifications";
import novelLogo from "@/assets/novel-logo-dynamic.png";
import ourStoryImg from "@/assets/our-story.jpg";
import airExportImg from "@/assets/air-export.jpg";
import airExportV2 from "@/assets/air-export-v2.png";
import packedGoodsImg from "@/assets/packed-goods-export.png";

const About = () => {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-15" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-white mb-6 animate-fade-in tracking-tight">
            About Novel Exporters
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in font-light leading-relaxed" style={{ animationDelay: '100ms' }}>
            Your trusted global bridge for authentic Indian spices, committed to quality, traceability, and excellence.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 relative">
                <img
                  src={ourStoryImg}
                  alt="Authentic Spices Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-8 left-8 flex items-center gap-4 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-spice-gold/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] scale-110">
                  <div className="w-14 h-14 rounded-2xl bg-spice-gold flex items-center justify-center shadow-lg">
                    <img src={novelLogo} alt="Logo" className="w-10 h-10 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-black text-lg tracking-tight">Novel Exporters</h4>
                    <p className="text-muted-foreground text-[10px] uppercase font-black tracking-[0.2em]">Verified Export Hub</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary rounded-full flex items-center justify-center p-6 shadow-2xl rotate-12 group-hover:rotate-0 transition-transform">
                <div className="text-center text-white">
                  <span className="text-4xl font-black block">10+</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Years Expertise</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                Our Heritage
              </span>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
                From Local Harvests to Global Tables
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                <p>
                  At <span className="text-foreground font-bold italic">Novel Exporters</span>, our journey began with a simple yet powerful mission: to bring the true essence of Indian spices to international markets without compromising on quality or authenticity.
                </p>
                <p>
                  Based in <span className="text-spice-gold font-medium">Tamil Nadu</span>, we have built a robust network of farmers across South India, specifically focusing on the rich soil of Tamil Nadu and the aromatic plantations of Kerala. Our deep-rooted relationships ensure that we source only the finest harvests at their peak.
                </p>
                <p>
                  We prioritize transparency and traceability. Every spice that leaves our facility carries with it the story of the farm it came from and the rigorous quality checks it underwent to reach your kitchen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packing Image / Quality Section */}
      <section className="section-padding bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 space-y-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-black uppercase tracking-widest">
                  Processing Excellence
                </span>
                <h2 className="text-4xl font-bold font-serif text-foreground">Hygienic Packaging & Preservation</h2>
                <p className="text-lg text-muted-foreground font-light">
                  Our state-of-the-art packaging facility ensures that every product is vacuum-sealed and protected from moisture, oxygen, and light. We use food-grade, multi-layered materials that preserve the essential oils and natural aroma of the spices for extended periods.
                </p>
              </div>

              <ul className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: ShieldCheck, text: "FSSAI Grade Packaging" },
                  { icon: Box, text: "Tamper-Proof Seals" },
                  { icon: CheckCircle, text: "Moisture Control" },
                  { icon: Award, text: "Export Quality Testing" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5">
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                <img
                  src={packedGoodsImg}
                  alt="Airtight packaging in production with Novel Exporters logo"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />

                {/* Logo Overlay */}
                <div className="absolute top-6 left-6 p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-white/20 transform -rotate-3 transition-transform group-hover:rotate-0">
                  <img src={novelLogo} alt="Novel Exporters" className="h-8 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Air Export Priority Section */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[500px]">
                <img
                  src={airExportV2}
                  alt="Modern Air Export with Novel Exporters Goods"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

                {/* Logo Overlay */}
                <div className="absolute bottom-6 left-6 p-2 md:p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-white/20 transform rotate-3 transition-transform group-hover:rotate-0">
                  <img src={novelLogo} alt="Novel Exporters" className="h-6 md:h-8 w-auto object-contain" />
                </div>

                <div className="absolute top-1/2 -right-12 -translate-y-1/2 hidden lg:block">
                  <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-white/10 max-w-xs space-y-4">
                    <Plane className="w-12 h-12 text-primary mb-2" />
                    <h4 className="text-xl font-bold">Express Air Freight</h4>
                    <p className="text-sm text-zinc-500">Fast-track delivery for urgent and high-value consignments globally.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 ml-0 lg:ml-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
                Logistics Prowess
              </span>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
                Global Priority Shipping
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                <p>
                  Recognizing the delicate nature of fresh curry leaves and premium spice extracts, we offer <span className="text-primary font-bold">Priority Air Export</span> services. This ensures that your products reach their destination in the shortest possible time, maintaining their sensory profile and potency.
                </p>
                <p>
                  Our logistics team coordinates with major international carriers to provide real-time tracking, temperature control (where required), and seamless customs clearance, taking the stress out of your supply chain.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 py-2 px-4 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">48-72 Hour Delivery</span>
                </div>
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-white/5 py-2 px-4 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Full Traceability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <Certifications />

      {/* Mission & Vision */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-10 rounded-[3rem] bg-card border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-bold font-serif text-foreground mb-4">Our Mission</h3>
              <p className="text-lg text-muted-foreground font-light leading-relaxed">
                To be the bridge between India's finest spice farmers and global consumers, delivering authentic, premium-quality spices while upholding the highest standards of sustainability and fair trade practices.
              </p>
            </div>

            <div className="p-10 rounded-[3rem] bg-zinc-950 text-white border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-spice-gold/10 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div className="w-16 h-16 rounded-2xl bg-spice-gold/20 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-spice-gold" />
              </div>
              <h3 className="text-3xl font-bold font-serif mb-4">Our Vision</h3>
              <p className="text-lg text-white/70 font-light leading-relaxed">
                To become the most trusted name in global spice exports, known for our unwavering commitment to quality, innovation, and customer satisfaction while preserving the rich culinary heritage of South India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-spice-gold/10" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { value: "10+", label: "Years Experience" },
              { value: "50+", label: "Countries Served" },
              { value: "500+", label: "Happy Clients" },
              { value: "1000+", label: "Tons Exported" },
            ].map((stat, index) => (
              <div key={index} className="space-y-2">
                <span className="text-5xl md:text-6xl font-black font-serif text-white block">{stat.value}</span>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
