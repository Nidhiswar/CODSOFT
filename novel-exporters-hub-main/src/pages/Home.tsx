import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { ArrowRight, Leaf, Globe, Award, Truck } from "lucide-react";
import Certifications from "@/components/Certifications";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user } = useAuth();
  const curry = products.find(p => p.id === 'curry-leaves');
  const pepper = products.find(p => p.id === 'pepper');
  const cardamom = products.find(p => p.id === 'cardamom');

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-zinc-950 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center"
          style={{ 
            opacity: 0.6,
            filter: 'brightness(1.1) contrast(1.1) saturate(1.15)'
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        <div className="container-custom relative z-10 py-12 sm:py-16 md:py-20">
          <div className="max-w-2xl space-y-4 sm:space-y-6 animate-fade-in">
            <span className="inline-block px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-900 text-xs sm:text-sm font-black shadow-2xl shadow-amber-500/30 border-2 border-amber-300/50 backdrop-blur-sm hover:scale-105 transition-transform duration-300 uppercase tracking-wider sm:tracking-widest">
              Premium Quality Spices from Tamil Nadu and Kerala
            </span>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold font-serif text-white leading-tight">
              Bringing Nature's
              <span className="block bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                Finest Flavors
              </span>
              to the World
            </h1>

            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              Novel Exporters delivers authentic, handpicked spices straight from the heart of
              Coimbatore. Experience the rich heritage of South Indian spices.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { icon: Leaf, title: "100% Natural", desc: "Pure & organic spices" },
              { icon: Globe, title: "Global Export", desc: "Worldwide shipping" },
              { icon: Award, title: "Premium Quality", desc: "Handpicked selection" },
              { icon: Truck, title: "Fast Delivery", desc: "Reliable logistics" },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card shadow-sm hover:shadow-lg transition-all duration-300 card-hover animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl gradient-leaf flex items-center justify-center">
                  <feature.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="font-semibold font-serif text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-slide-in">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
                Crafting Excellence in Every Grain
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At Novel Exporters, we take pride in sourcing the finest spices from the fertile lands of
                Tamil Nadu. Our commitment to quality, sustainability, and customer satisfaction has made
                us a trusted name in the global spice trade.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From the aromatic curry leaves of Coimbatore to the premium cardamom from the Western Ghats,
                each product tells a story of tradition, purity, and excellence.
              </p>
              <Link to="/about" className="inline-block mt-2">
                <Button variant="default" size="lg">
                  Learn More About Us
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl animate-fade-in" tabIndex={0}>
                <img
                  src="/assets/curry-leaves-farm.jpg"
                  alt="Novel Exporters Spice Farming"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-spice-earth/20 opacity-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-100" />
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center mb-12 space-y-4">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              Our Products
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-foreground">
              Premium Spice Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of authentic Tamil Nadu spices,
              each bringing unique flavors and aromas to your kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} user={user} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/products">
              <Button variant="hero" size="lg">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <Certifications />

      {/* CTA Section */}
      <section className="section-padding gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-secondary/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-spice-gold/20 blur-3xl" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-white mb-4">
            Ready to Experience Premium Spices?
          </h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">
            Get in touch with us for bulk orders, custom packaging, or any enquiries.
            We're here to bring the best spices to your doorstep.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/enquiry">
              <Button variant="warm" size="xl">
                Send Enquiry
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
