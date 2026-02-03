import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import novelLogo from "@/assets/novel-logo-dynamic.png";
import { useCart } from "@/hooks/useCart";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const getNavLinks = (isAdmin: boolean) => {
  const baseLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact Us", path: "/contact" },
    { name: "Enquiry", path: "/enquiry" },
  ];
  
  if (isAdmin) {
    return [
      { name: "Admin Dashboard", path: "/admin" },
    ];
  }
  
  return [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Products", path: "/products" },
    { name: "Contact Us", path: "/contact" },
    { name: "Enquiry", path: "/enquiry" },
  ];
};

interface HeaderProps {
  user?: { id: string; username: string; email: string; isAdmin: boolean; hasConsented?: boolean } | null;
  onLogout?: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const { cart, totalItems, removeFromCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close cart dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalytics(); // Changed to getAnalytics for proper admin data
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics");
      }
    };
    if (user?.isAdmin) {
      fetchAnalytics();
      const interval = setInterval(fetchAnalytics, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for product modal open/close events
  useEffect(() => {
    const handleModalOpen = () => setIsProductModalOpen(true);
    const handleModalClose = () => setIsProductModalOpen(false);

    window.addEventListener('productModalOpen', handleModalOpen);
    window.addEventListener('productModalClose', handleModalClose);

    return () => {
      window.removeEventListener('productModalOpen', handleModalOpen);
      window.removeEventListener('productModalClose', handleModalClose);
    };
  }, []);

  const handleLogout = () => {
    onLogout?.();
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 transition-all duration-500 py-3 ${isProductModalOpen
        ? "-translate-y-full opacity-0 pointer-events-none z-0"
        : "translate-y-0 opacity-100 z-50"
        } ${isScrolled
          ? "glass shadow-lg"
          : "bg-transparent"
        }`}
    >
      <div className="container-custom flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="rounded-lg p-1.5 transition-all duration-300 group-hover:scale-105">
            <img
              src={novelLogo}
              alt="Novel Exporters Logo"
              className="h-12 md:h-14 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {getNavLinks(user?.isAdmin || false).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path
                ? "text-primary active"
                : "text-foreground/80 hover:text-primary"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />

          {/* Cart Icon with Dropdown - Show only for non-admin logged-in users */}
          {user && !user.isAdmin && (
            <div className="relative" ref={cartRef}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-primary/10 transition-colors group"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-spice-gold text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-in zoom-in font-sans">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Cart Dropdown */}
              <AnimatePresence>
                {isCartOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                      <h3 className="font-bold text-sm text-foreground">Your Cart ({totalItems} items)</h3>
                    </div>

                    {/* Cart Items */}
                    <div className="max-h-72 overflow-y-auto">
                      {cart.length === 0 ? (
                        <div className="py-12 px-4 text-center">
                          <ShoppingCart className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                          <p className="text-zinc-500 dark:text-zinc-400 font-medium">No items added to cart</p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Browse products to add items</p>
                        </div>
                      ) : (
                        <div className="p-2">
                          {cart.map((item) => (
                            <motion.div
                              key={item.id}
                              layout
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group/item"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-zinc-500">
                                  {item.quantity} {item.unit}
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                      <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
                        <Button
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate("/profile");
                          }}
                          className="w-full bg-spice-gold hover:bg-spice-gold/90 text-black font-bold"
                        >
                          Request Quotation
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="relative group/user">
                  <User className="w-5 h-5 group-hover:text-primary transition-colors" />
                  {user.isAdmin && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-spice-gold rounded-full border-2 border-zinc-950" />
                  )}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-primary/20 hover:bg-primary/5">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="hero" size="default">
                Login / Register
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 glass transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-screen py-4" : "max-h-0"
          }`}
      >
        <nav className="container-custom flex flex-col gap-2">
          {getNavLinks(user?.isAdmin || false).map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3 rounded-lg transition-colors ${location.pathname === link.path
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/80 hover:bg-muted"
                }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="border-t border-border my-2" />
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-foreground/80 hover:bg-muted flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                Profile {user.isAdmin ? "(Administrator)" : "(User)"}
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-4 py-3 rounded-lg text-foreground/80 hover:bg-muted flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mx-4"
            >
              <Button variant="hero" className="w-full">
                Login / Register
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
