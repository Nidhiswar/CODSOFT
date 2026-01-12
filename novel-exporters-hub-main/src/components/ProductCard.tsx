import { Product } from "@/data/products";
import { ExternalLink, ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: (product: Product) => void;
  className?: string;
}

const ProductCard = ({ product, index = 0, onClick, className }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    addToCart(product);
    setIsAdded(true);
    toast.success(`Added ${product.name} to cart`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      layoutId={`card-container-${product.id}`}
      onClick={() => onClick && onClick(product)}
      className={`group relative overflow-hidden rounded-[2rem] bg-white/5 dark:bg-black/20 backdrop-blur-xl shadow-2xl border border-white/10 cursor-pointer h-full flex flex-col ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: index * 0.05
      }}
      whileHover={{
        y: -12,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(196, 160, 82, 0.25)",
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <motion.img
          layoutId={`product-image-${product.id}`}
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Glass Tag */}
        <motion.div
          layoutId={`badge-${product.id}`}
          className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-spice-gold shadow-lg shadow-black/20 text-black text-[10px] font-black uppercase tracking-widest border border-white/20"
        >
          {product.category}
        </motion.div>

        {/* Floating Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-2xl bg-spice-gold text-black flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group/cart"
        >
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <Check className="w-5 h-5 stroke-[3]" />
              </motion.div>
            ) : (
              <motion.div
                key="cart"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <ShoppingCart className="w-5 h-5 transition-transform group-hover/cart:rotate-12" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Info Content */}
      <div className="p-6 flex flex-col flex-grow relative">
        <motion.h3
          layoutId={`product-title-${product.id}`}
          className="text-xl font-bold font-serif text-foreground mb-1 group-hover:text-primary transition-colors"
        >
          {product.name}
        </motion.h3>

        <motion.p
          layoutId={`product-tamil-${product.id}`}
          className="text-xs font-semibold text-primary/80 italic mb-4"
        >
          {product.tamilName}
        </motion.p>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-6">
          {product.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
          <motion.span
            className="text-xs font-bold text-spice-gold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
          >
            Explore Details
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.span>

          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm shadow-inner" />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative inner glow */}
      <div className="absolute inset-0 rounded-[2rem] pointer-events-none border border-transparent group-hover:border-white/20 transition-colors duration-500" />
    </motion.div>
  );
};

export default ProductCard;
