import { Product } from "@/data/products";
import { ExternalLink, ShoppingCart, Check, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  product: Product;
  index?: number;
  onClick?: (product: Product) => void;
  className?: string;
  user?: any;
}

const ProductCard = ({ product, index = 0, onClick, className, user }: ProductCardProps) => {
  const { addToCart, cart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const navigate = useNavigate();
  
  const isInCart = cart.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal
    
    // Check if user is logged in
    if (!user) {
      toast.error("Login to order products", {
        action: {
          label: "Login",
          onClick: () => navigate("/login")
        }
      });
      return;
    }
    
    // Check if already in cart
    if (isInCart) {
      toast.info("Already in cart! View your cart to update quantity.");
      return;
    }
    
    addToCart(product);
    setIsAdded(true);
    toast.success(`Added ${product.name} to cart`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      layoutId={`card-container-${product.id}`}
      onClick={() => onClick && onClick(product)}
      className={`group relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[2rem] bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800 cursor-pointer h-full flex flex-col ${className}`}
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 25,
        mass: 0.5,
        delay: index * 0.03
      }}
      whileHover={{
        y: -16,
        scale: 1.03,
        rotateX: 2,
        boxShadow: "0 35px 60px -15px rgba(196, 160, 82, 0.35)",
        transition: { type: "spring", stiffness: 500, damping: 15, mass: 0.5 }
      }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <motion.img
          layoutId={`product-image-${product.id}`}
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
        />

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-200" />

        {/* Glass Tag */}
        <motion.div
          layoutId={`badge-${product.id}`}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-spice-gold shadow-lg shadow-black/20 text-black text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-widest border border-white/20"
        >
          {product.category}
        </motion.div>

        {/* Floating Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-150 hover:scale-110 hover:rotate-3 active:scale-90 group/cart overflow-hidden ${!user ? 'bg-zinc-600 text-white' : isInCart ? 'bg-green-500 text-white' : 'bg-spice-gold text-black'}`}
          title={!user ? "Login to order" : isInCart ? "Already in cart" : "Add to cart"}
        >
          <AnimatePresence mode="wait">
            {!user ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <LogIn className="w-5 h-5" />
              </motion.div>
            ) : isInCart || isAdded ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <Check className="w-5 h-5 stroke-[3]" />
              </motion.div>
            ) : (
              <motion.div
                key="cart"
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: -10 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              >
                <ShoppingCart className="w-5 h-5 transition-transform duration-150 group-hover/cart:rotate-12" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Info Content */}
      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow relative">
        <motion.h3
          layoutId={`product-title-${product.id}`}
          className="text-base sm:text-lg md:text-xl font-bold font-serif text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-primary transition-colors"
        >
          {product.name}
        </motion.h3>

        <motion.p
          layoutId={`product-tamil-${product.id}`}
          className="text-[10px] sm:text-xs font-semibold text-primary italic mb-3 sm:mb-4"
        >
          {product.tamilName}
        </motion.p>

        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4 sm:mb-6">
          {product.description}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700">
          <motion.span
            className="text-xs font-bold text-spice-gold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
          >
            Explore Details
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.span>

          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative inner glow */}
      <div className="absolute inset-0 rounded-[2rem] pointer-events-none border-2 border-transparent group-hover:border-spice-gold/40 transition-all duration-200 group-hover:shadow-[inset_0_0_30px_rgba(196,160,82,0.15)]" />
    </motion.div>
  );
};

export default ProductCard;
