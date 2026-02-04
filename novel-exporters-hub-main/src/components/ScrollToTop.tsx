import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top with smooth animation whenever the route changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth" // Smooth scrolling for better UX
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
