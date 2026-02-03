import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import novelLogo from "@/assets/novel-logo-dynamic.png";
import { socials } from "@/data/socials";
import FooterSpiceDecoration from "../SpiceBackgroundAnimation";

const Footer = () => {
  return (
    <footer className="relative bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-white/5 transition-colors duration-300 overflow-hidden">
      <FooterSpiceDecoration />
      <div className="container-custom py-10 sm:py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2 bg-white dark:bg-white/5 shadow-sm transition-all duration-300 hover:shadow-md group">
                <img
                  src={novelLogo}
                  alt="Novel Exporters Logo"
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              Exporting the finest quality spices from Tamil Nadu to the world.
              Our commitment to excellence ensures you receive nature's best flavors.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-bold font-serif text-zinc-900 dark:text-white mb-4 sm:mb-6">Quick Links</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "Home", path: "/" },
                { name: "About Us", path: "/about" },
                { name: "Products", path: "/products" },
                { name: "Contact", path: "/contact" },
                { name: "Enquiry", path: "/enquiry" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="hover:text-spice-gold transition-colors duration-300 text-xs sm:text-sm flex items-center gap-2 group font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-spice-gold opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold font-serif text-zinc-900 dark:text-white mb-6">Contact Us</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group">
                <a
                  href="mailto:novelexporters@gmail.com"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-spice-gold group-hover:text-black transition-all cursor-pointer"
                >
                  <Mail className="w-5 h-5" />
                </a>
                <div className="space-y-1">
                  <a
                    href="mailto:novelexporters@gmail.com"
                    className="text-zinc-800 dark:text-zinc-300 text-sm font-semibold break-all hover:text-spice-gold transition-colors"
                  >
                      novelexporters@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <a
                  href="tel:+918012804316"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-spice-gold group-hover:text-black transition-all cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <div className="space-y-1">
                  <a
                    href="tel:+918012804316"
                    className="text-zinc-800 dark:text-zinc-300 text-sm font-semibold hover:text-spice-gold transition-colors"
                  >
                    +91 80128 04316
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <a
                  href="https://www.google.com/maps/search/Novel+Exporters,+2/202-C,+Dhanam+Nagar,+Mylampatti,+Coimbatore+-+641062"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm flex items-center justify-center shrink-0 group-hover:bg-spice-gold group-hover:text-black transition-all cursor-pointer"
                >
                  <MapPin className="w-5 h-5" />
                </a>
                <div className="space-y-1">
                  <a
                    href="https://www.google.com/maps/search/Novel+Exporters,+2/202-C,+Dhanam+Nagar,+Mylampatti,+Coimbatore+-+641062"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-800 dark:text-zinc-300 text-sm font-semibold hover:text-spice-gold transition-colors"
                  >
                    Novel Exporters, 2/202-C, Dhanam Nagar, Mylampatti, Coimbatore - 641062
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-lg font-bold font-serif text-zinc-900 dark:text-white mb-6">Follow Us</h4>
            <div className="flex flex-wrap gap-4">
              {socials.map(({ name, url, Icon }) => (
                <a
                  key={name}
                  href={url}
                  aria-label={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center hover:bg-spice-gold hover:text-black transition-all duration-300 hover:-translate-y-1 shadow-sm border border-zinc-200 dark:border-white/5"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} <span className="text-zinc-800 dark:text-zinc-300 font-bold">Novel Exporters</span>. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="/privacy-policy" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm transition-colors hover:underline underline-offset-4">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm transition-colors hover:underline underline-offset-4">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer >
  );
};

export default Footer;
