import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Enquiry from "./pages/Enquiry";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ConsentRequired from "./pages/ConsentRequired";
import { api } from "./lib/api";
import ConsentOverlay from "./components/ConsentOverlay";
import ScrollToTop from "./components/ScrollToTop";

import { CartProvider } from "./hooks/useCart";

const queryClient = new QueryClient();

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  isAdmin: boolean;
  role?: string;
  hasConsented?: boolean;
  isFirstLogin?: boolean;
  showConsentOverlay?: boolean; // Only true on first login
}

const AppContent = ({ user, setUser, handleLogout, handleLogin, handleConsentAccept }: any) => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {user && user.showConsentOverlay && (
        <ConsentOverlay
          onAccept={handleConsentAccept}
          onDecline={() => {
            handleLogout();
            window.location.href = "/consent-required";
          }}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <About />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <Products user={user} />
            </Layout>
          }
        />
        <Route
          path="/contact"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <Contact />
            </Layout>
          }
        />
        <Route
          path="/enquiry"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <Enquiry />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
        <Route
          path="/profile"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <Profile user={user} onLogout={handleLogout} onUserUpdate={setUser} />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            user?.isAdmin ? (
              <Layout user={user} onLogout={handleLogout}>
                <AdminDashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <PrivacyPolicy />
            </Layout>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <Layout user={user} onLogout={handleLogout}>
              <TermsOfService />
            </Layout>
          }
        />
        <Route
          path="/consent-required"
          element={<ConsentRequired />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await api.getMe();
          if (userData && !userData.message) {
            setUser({
              ...userData,
              isAdmin: userData.role === 'admin' && userData.email === 'novelexporters@gmail.com'
            });
          } else {
            localStorage.removeItem("token");
          }
        } catch (err) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    initUser();
  }, []);

  const handleLogin = (userData: any) => {
    setUser({
      ...userData,
      isAdmin: userData.role === 'admin' && userData.email === 'novelexporters@gmail.com'
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
  };

  const handleConsentAccept = async () => {
    try {
      const updatedUser = await api.recordConsent({ version: "1.0.0" });
      if (updatedUser && updatedUser._id) {
        setUser({
          ...updatedUser,
          id: updatedUser._id,
          isAdmin: updatedUser.role === 'admin' && updatedUser.email === 'novelexporters@gmail.com',
          showConsentOverlay: false // Hide overlay after consent
        });
        toast.success("Welcome! You can now explore products and place orders.");
        // Redirect to user account page for ordering & exploring products
        window.location.href = "/profile";
      } else if (updatedUser && updatedUser.message) {
        toast.error(updatedUser.message || "Failed to accept consent");
      } else {
        // Fallback: hide overlay and redirect even if response format is unexpected
        setUser(prev => prev ? { ...prev, showConsentOverlay: false } : null);
        window.location.href = "/profile";
      }
    } catch (err) {
      console.error("Failed to record consent:", err);
      toast.error("Failed to record consent. Please try again.");
    }
  };

  if (loading) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CartProvider>
            <AppContent
              user={user}
              setUser={setUser}
              handleLogout={handleLogout}
              handleLogin={handleLogin}
              handleConsentAccept={handleConsentAccept}
            />
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
