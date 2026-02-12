import { CheckCircle, Users, Globe, Award, Target, Heart, Plane, Box, ShieldCheck } from "lucide-react";
import Certifications from "@/components/Certifications";
import novelLogo from "@/assets/novel-logo-dynamic.png";
import ourStoryImg from "@/assets/our-story.jpg";
import airExportImg from "@/assets/air-export.jpg";
import airExportV2 from "@/assets/air-export-v2.png";
import novelPackImg from "@/assets/novel-pack.jpg";
import packedimage from "@/assets/packed.png";
import freightOperations from "@/assets/ap-1.png";
import airglobal from "@/assets/air-global.png";
import ablocal from "@/assets/ab-local.png";
function About() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 bg-zinc-950 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center"
          style={{ 
            opacity: 0.6,
            filter: 'brightness(1.1) contrast(1.1) saturate(1.15)'
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-white mb-4 sm:mb-6 animate-fade-in tracking-tight">
            About Novel Exporters
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in font-light leading-relaxed px-4" style={{ animationDelay: '100ms' }}>
            Your trusted global bridge for authentic Indian spices, committed to quality, traceability, and excellence.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="relative group">
              <div className="aspect-square rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10 relative">
                <img
                  src={ablocal}
                  alt="Authentic Spices Collection"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 flex items-center gap-3 sm:gap-4 bg-white dark:bg-zinc-900 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl border border-spice-gold/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] sm:scale-100 md:scale-110">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-spice-gold flex items-center justify-center shadow-lg">
                    <img src={novelLogo} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-black text-sm sm:text-base md:text-lg tracking-tight">Novel Exporters</h4>
                    <p className="text-muted-foreground text-[8px] sm:text-[9px] md:text-[10px] uppercase font-black tracking-[0.15em] sm:tracking-[0.2em]">Verified Export Hub</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 sm:-bottom-8 sm:-right-8 md:-bottom-10 md:-right-10 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-primary rounded-full hidden sm:flex items-center justify-center p-4 sm:p-5 md:p-6 shadow-2xl rotate-12 group-hover:rotate-0 transition-transform">
                <div className="text-center text-white">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-black block">10+</span>
                  <span className="text-[7px] sm:text-[8px] md:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest opacity-80">Years Expertise</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-black uppercase tracking-widest">
                Our Heritage
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif text-foreground leading-tight">
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

            <div className="order-1 lg:order-2 space-y-6">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                <img
                  src={packedimage}
                  alt="Airtight packaging with Novel Exporters logo"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/12 group-hover:bg-black/0 transition-colors duration-500" />
              </div>
              {/* <div className="rounded-[2rem] overflow-hidden shadow-xl relative group">
                  <img
                    src={novelPackImg}
                    alt="Novel Exporters Premium Spice Packaging"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/8 group-hover:bg-black/0 transition-colors duration-500" />
                </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Logistics Prowess Section with Image */}
      <section className="section-padding bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative group order-2 lg:order-1">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[500px]">
                <img
                  src={airglobal}
                  alt="Logistics Prowess - Aircraft Loading Operations"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                {/* Logo Overlay */}
                <div className="absolute bottom-6 left-6 p-2 md:p-3 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl border border-white/20 transform rotate-3 transition-transform group-hover:rotate-0">
                  <img src={novelLogo} alt="Novel Exporters" className="h-6 md:h-8 w-auto object-contain" />
                </div>
              </div>
            </div>

            <div className="space-y-8 order-1 lg:order-2">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest">
                Logistics Prowess
              </span>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
                Efficient Global Freight Operations
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                <p>
                  Our state-of-the-art logistics network ensures <span className="text-primary font-bold">rapid and reliable</span> delivery of premium spices worldwide. With partnerships at major ports (Tuticorin & Kochi), we offer both air and sea export options tailored to your timeline and budget.
                </p>
                <p>
                  Every shipment is tracked in real-time, handled with temperature control, and cleared through customs with complete documentation. Your products arrive fresh, authentic, and ready for market.
                </p>
              </div>

              <ul className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Plane, text: "48-72h Air Export" },
                  { icon: Box, text: "Sea Freight Options" },
                  { icon: Globe, text: "Global Coverage" },
                  { icon: CheckCircle, text: "Real-time Tracking" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/5">
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-foreground">{item.text}</span>
                  </li>
                ))}
              </ul>
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
              { value: "15+", label: "Countries Served" },
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
