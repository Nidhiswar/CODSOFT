import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { products, Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, ScrollText, CheckCircle, ArrowRight, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import airExportImg from "@/assets/air-export.jpg";

const categories = ["All", "Leaves", "Seeds", "Bark", "Flowers"];

const Products = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

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
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-zinc-950/85 backdrop-blur-xl z-[100]"
            />

            {/* Expanded Card */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 md:p-8 pointer-events-none">
              <motion.div
                layoutId={`card-container-${selectedProduct.id}`}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 30 }}
                transition={{ 
                  type: "spring",
                  stiffness: 400,
                  damping: 28,
                  mass: 0.8,
                  opacity: { duration: 0.15 }
                }}
                className="w-full max-w-6xl h-full max-h-[85vh] bg-white dark:bg-zinc-900 overflow-hidden rounded-[2.5rem] shadow-[0_0_120px_rgba(196,160,82,0.15)] border border-spice-gold/20 pointer-events-auto flex flex-col md:flex-row"
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
                <motion.div 
                  className="md:w-1/2 h-1/2 md:h-full overflow-y-auto p-8 md:p-12 bg-white/5 backdrop-blur-3xl relative"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
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
                      className="p-3 rounded-2xl bg-zinc-100 dark:bg-white/10 hover:bg-spice-gold/20 hover:scale-110 active:scale-95 transition-all duration-150 group"
                    >
                      <X className="w-6 h-6 text-foreground group-hover:rotate-90 group-hover:text-spice-gold transition-all duration-150" />
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

                  {/* Add to Cart Button */}
                  <div className="mt-8">
                    <Button
                      variant="default"
                      className={`w-full py-4 text-lg font-bold tracking-wide transition-all duration-300 ${isAddedToCart ? 'bg-green-600 hover:bg-green-600' : ''}`}
                      onClick={() => {
                        if (selectedProduct) {
                          addToCart(selectedProduct);
                          setIsAddedToCart(true);
                          toast.success(`Added ${selectedProduct.name} to cart`);
                          setTimeout(() => setIsAddedToCart(false), 2000);
                        }
                      }}
                    >
                      {isAddedToCart ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Added to Cart
                        </>
                      ) : (
                        'Add to Cart'
                      )}
                    </Button>
                  </div>

                  {/* Special Instructions */}
                  <div className="mt-4">
                    <textarea
                      className="w-full p-4 rounded-lg border border-zinc-200 dark:border-white/10 bg-white/5 text-sm text-foreground"
                      placeholder="Add special instructions for this order..."
                    ></textarea>
                  </div>

                  {/* Delivery Date Picker */}
                  <div className="mt-4">
                    <label className="block text-sm font-bold mb-2">Preferred Delivery Date:</label>
                    <input
                      type="date"
                      className="w-full p-4 rounded-lg border border-zinc-200 dark:border-white/10 bg-white/5 text-sm text-foreground"
                    />
                  </div>

                  <motion.div 
                    className="mt-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                  >
                    <Button
                      onClick={() => !user ? navigate("/login") : navigate("/profile")}
                      className="w-full h-16 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-black font-black uppercase tracking-widest hover:scale-[1.03] active:scale-[0.98] transition-all duration-150 shadow-2xl hover:shadow-spice-gold/20"
                    >
                      {user ? "Request Quotation" : "Login to Request Quote"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </motion.div>
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

    </div>
  );
};

export default Products;
