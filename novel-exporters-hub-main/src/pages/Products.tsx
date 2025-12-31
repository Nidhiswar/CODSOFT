import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";

const categories = ["All", "Leaves", "Seeds", "Bark", "Flowers"];

const Products = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 gradient-hero">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-15" />
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6 animate-fade-in">
            Our Products
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            Explore our premium collection of authentic
          </p>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            Tamil Nadu & Kerala Spices!
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Info */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Quality Assurance
              </span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
                Guaranteed Freshness & Purity
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All our spices undergo rigorous quality checks to ensure they meet international
                food safety standards. From sourcing to packaging, every step is carefully monitored.
              </p>
              <ul className="space-y-3">
                {[
                  "Hand-picked from trusted farmers",
                  "Laboratory tested for purity",
                  "Hygienic processing facilities",
                  "Secure, airtight packaging",
                  "FSSAI certified products",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/4820844/pexels-photo-4820844.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Airtight packaging in production"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
                <p>Vacuum-sealed, food‑grade packaging that preserves natural aroma and extends shelf life.</p>
                <p className="mt-2">We use certified, airtight materials and strict packing protocols to ensure your spices arrive fresh and intact.</p>
                <p className="mt-2">Traceable batches • Food‑grade materials • Tamper‑proof seals</p>
              </div>
            </div>

            <div className="space-y-4">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Certifications
              </span>

              <div className="flex items-center gap-3 mb-3 flex-wrap overflow-visible">
                <img src="https://img.shields.io/badge/FSSAI-Approved-2ea44f?style=flat-square" alt="FSSAI" className="h-8 w-auto max-w-[120px] object-contain" />
                <img src="https://img.shields.io/badge/ISO%202200-Certified-007ec6?style=flat-square" alt="ISO 22000" className="h-8 w-auto max-w-[120px] object-contain" />
                <img src="https://img.shields.io/badge/HACCP-Certified-FFB800?style=flat-square" alt="HACCP" className="h-8 w-auto max-w-[120px] object-contain" />
              </div>

              <h3 className="text-2xl font-bold font-serif text-foreground">Food Export Certifications</h3>

              <p className="text-muted-foreground leading-relaxed">
                FSSAI, ISO 22000 and HACCP certified — ensuring safe, traceable and high‑quality spice exports trusted by international buyers.
              </p>

              <ul className="space-y-2 mt-2">
                {[
                  "FSSAI (India) - Food Safety",
                  "ISO 22000 - Food Safety Management",
                  "HACCP - Hazard Analysis & Critical Control",
                ].map((cert, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <span className="w-3 h-3 rounded-full bg-primary/80" />
                    <span className="text-sm text-secondary">{cert}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <figure className="rounded-2xl overflow-hidden shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-primary/20 relative">
                  <img
                    src="https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Sea export operations — containers and cranes"
                    className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 bg-black/0 transition-opacity duration-300 group-hover:bg-black/20 pointer-events-none" />
                  <figcaption className="p-4 bg-background">
                    <h4 className="font-semibold text-foreground">Sea Export — Port & Containers</h4>
                    <p className="text-sm text-muted-foreground mt-1">Experienced port handling, secure containerization and ocean freight for large consignments.</p>
                  </figcaption>
                </figure>

                <figure className="rounded-2xl overflow-hidden shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border border-transparent hover:border-primary/20 relative">
                  <img
                    src="https://images.pexels.com/photos/67563/plane-aircraft-jet-airbase-67563.jpeg?auto=compress&cs=tinysrgb&w=1200"
                    alt="Cargo plane in flight — air export"
                    className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 bg-black/0 transition-opacity duration-300 group-hover:bg-black/20 pointer-events-none" />
                  <figcaption className="p-4 bg-background">
                    <h4 className="font-semibold text-foreground">Air Export — Fast & Traceable</h4>
                    <p className="text-sm text-muted-foreground mt-1">Priority air shipments with temperature control and full traceability for urgent orders.</p>
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
