import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { products, Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, ScrollText, CheckCircle, ArrowRight, Check } from "lucide-react";
import airExportImg from "@/assets/air-export.jpg";

const categories = ["All", "Leaves", "Seeds", "Bark", "Flowers"];

const Products = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  // Lock scroll when product is selected
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedProduct]);

  return (
    <div className="overflow-hidden relative min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950" />
        <div className="container-custom relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold font-serif text-white mb-6 tracking-tight"
          >
            Premium Spice Selection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Directly from the lush plantations of <span className="text-spice-gold font-medium">Tamil Nadu</span> & <span className="text-spice-gold font-medium">Kerala</span> to your global doorstep.
          </motion.p>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-8 py-6 text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeCategory === category
                  ? "bg-spice-gold text-black shadow-xl shadow-spice-gold/20 scale-105"
                  : "bg-white/5 border-zinc-200 dark:border-white/10 hover:border-spice-gold"
                  }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                onClick={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-24">
              <p className="text-zinc-500 text-lg">No authentic spices found in the {activeCategory} category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Full-screen Product Detail View (Glass View) */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-[100]"
            />

            {/* Expanded Card */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8 pointer-events-none">
              <motion.div
                layoutId={`card-container-${selectedProduct.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-6xl h-full max-h-[85vh] bg-white dark:bg-zinc-900 overflow-hidden rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/20 pointer-events-auto flex flex-col md:flex-row"
              >
                {/* Image Section */}
                <div className="md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-black flex shrink-0">
                  <motion.img
                    layoutId={`product-image-${selectedProduct.id}`}
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />

                  {/* Category Tag Animation */}
                  <motion.div
                    layoutId={`badge-${selectedProduct.id}`}
                    className="absolute top-8 left-8 px-6 py-2 rounded-full bg-spice-gold text-black text-xs font-black uppercase tracking-[0.3em] shadow-2xl"
                  >
                    {selectedProduct.category}
                  </motion.div>
                </div>

                {/* Details Section */}
                <div className="md:w-1/2 h-1/2 md:h-full overflow-y-auto p-8 md:p-12 bg-white/5 backdrop-blur-3xl relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1">
                      <motion.h2
                        layoutId={`product-title-${selectedProduct.id}`}
                        className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight"
                      >
                        {selectedProduct.name}
                      </motion.h2>
                      <motion.p
                        layoutId={`product-tamil-${selectedProduct.id}`}
                        className="text-xl font-medium text-primary italic"
                      >
                        {selectedProduct.tamilName}
                      </motion.p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/5 hover:bg-primary/20 transition-colors group"
                    >
                      <X className="w-6 h-6 text-foreground group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-2xl bg-spice-gold/10 flex items-center justify-center shrink-0 border border-spice-gold/20">
                        <MapPin className="w-6 h-6 text-spice-gold" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1">Origin</span>
                        <p className="font-bold text-foreground">{selectedProduct.origin}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-1">Harvest Window</span>
                        <p className="font-bold text-foreground">{selectedProduct.harvestTiming}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                        <ScrollText className="w-4 h-4" /> Export Quality Profile
                      </h4>
                      <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-300 font-light italic">
                        "{selectedProduct.description}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-spice-gold" /> Quality Certifications
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.certifications.map((cert) => {
                          const isSpecial = ["IEC", "FSSAI", "ISO 22000"].includes(cert);
                          return (
                            <div
                              key={cert}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all duration-300 ${isSpecial
                                ? "bg-spice-gold/10 border-spice-gold/30 text-spice-gold shadow-[0_0_15px_rgba(196,160,82,0.1)]"
                                : "bg-white/5 border-white/10 text-foreground"
                                }`}
                            >
                              <Check className={`w-3.5 h-3.5 ${isSpecial ? "text-spice-gold" : "text-green-500"}`} />
                              <span className="text-xs font-black uppercase tracking-wider">{cert}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12">
                    <Button
                      onClick={() => !user ? navigate("/login") : navigate("/profile")}
                      className="w-full h-16 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-2xl"
                    >
                      {user ? "Request Quotation" : "Login to Request Quote"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Logistics & Quality Section (The updated visuals) */}
      <section className="section-padding bg-zinc-100 dark:bg-zinc-900">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
                  Global Logistics
                </span>
                <h2 className="text-4xl md:text-5xl font-bold font-serif text-foreground leading-tight">
                  Premium Export <br />Infrastructure
                </h2>
                <p className="text-lg text-muted-foreground font-light leading-relaxed">
                  We bridge the gap between South Indian farms and international ports using state-of-the-art cold-chain logistics and air-tight tracking systems.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl shadow-black/5 group hover:bg-spice-gold transition-colors duration-500">
                  <h4 className="text-lg font-bold mb-2 group-hover:text-black">Sea Freight</h4>
                  <p className="text-sm text-zinc-500 group-hover:text-black/80">Bulk shipments via Tuticorin & Kochi ports with industrial-grade containerization.</p>
                </div>
                <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl shadow-black/5 group hover:bg-primary transition-colors duration-500">
                  <h4 className="text-lg font-bold mb-2 group-hover:text-white">Air Priority</h4>
                  <p className="text-sm text-zinc-500 group-hover:text-white/80">Urgent delivery for high-value spice extracts and fresh leaves via Chennai Cargo.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.2)] aspect-video md:aspect-square relative group"
              >
                <img
                  src={airExportImg}
                  alt="Novel Exporters Air Cargo"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-12">
                  <div className="text-white space-y-2">
                    <h3 className="text-2xl font-bold">Fast & Traceable</h3>
                    <p className="text-white/70 font-light italic">"Ensuring aroma preservation through altitude-optimized cargo management."</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Badge */}
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-spice-gold rounded-full flex items-center justify-center p-6 shadow-2xl rotate-12 transition-transform hover:rotate-0">
                <p className="text-black text-center font-black text-sm uppercase tracking-tighter leading-none">Global Certified Quality</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications Banner - Enhanced & Eye-Catchy */}
      <section className="py-24 bg-gradient-to-b from-zinc-950 to-black border-y border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(196,160,82,0.05),transparent_70%)]" />

        <div className="container-custom mb-12 text-center relative z-10">
          <span className="text-spice-gold text-xs font-black uppercase tracking-[0.3em] mb-4 block">Quality Guaranteed</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Global Export Accreditations</h2>
          <div className="h-1 w-20 bg-spice-gold mx-auto rounded-full" />
        </div>

        <div className="flex whitespace-nowrap animate-infinite-scroll relative z-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center gap-20 mx-10">
              <div className="flex flex-col items-center group cursor-pointer px-8 py-6 rounded-3xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-spice-gold/10 flex items-center justify-center border border-spice-gold/20 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-8 h-8 text-spice-gold" />
                </div>
                <span className="text-2xl md:text-3xl font-serif text-white/90 tracking-widest font-black italic transition-all group-hover:text-spice-gold">FSSAI APPROVED</span>
                <p className="text-[10px] text-zinc-500 mt-2 font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Food Safety Standards</p>
              </div>

              <div className="flex flex-col items-center group cursor-pointer px-8 py-6 rounded-3xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <ScrollText className="w-8 h-8 text-primary" />
                </div>
                <span className="text-2xl md:text-3xl font-serif text-white/90 tracking-widest font-black italic transition-all group-hover:text-primary">ISO 22000 CERTIFIED</span>
                <p className="text-[10px] text-zinc-500 mt-2 font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">International Quality Management</p>
              </div>

              <div className="flex flex-col items-center group cursor-pointer px-8 py-6 rounded-3xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-spice-gold/10 flex items-center justify-center border border-spice-gold/20 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-spice-gold" />
                </div>
                <span className="text-2xl md:text-3xl font-serif text-white/90 tracking-widest font-black italic transition-all group-hover:text-spice-gold">IEC CERTIFIED</span>
                <p className="text-[10px] text-zinc-500 mt-2 font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Import Export Code Authorized</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Products;
