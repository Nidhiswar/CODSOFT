import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import novelLogo from "@/assets/novel-logo-dynamic.png";
import { useCart } from "@/hooks/useCart";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Products", path: "/products" },
  { name: "Contact Us", path: "/contact" },
  { name: "Enquiry", path: "/enquiry" },
];

interface HeaderProps {
  user?: { email: string; isAdmin: boolean } | null;
  onLogout?: () => void;
}

const Header = ({ user, onLogout }: HeaderProps) => {
  const { totalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
          {navLinks.map((link) => (
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

          {/* Cart Icon */}
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-spice-gold text-black text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-in zoom-in font-sans">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="relative group/user">
                  <User className="w-5 h-5 group-hover:text-primary transition-colors" />
                  {user.isAdmin && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full" />
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
          {navLinks.map((link) => (
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
                Profile {user.isAdmin && "(Admin)"}
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
