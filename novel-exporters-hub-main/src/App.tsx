import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
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
import { api } from "./lib/api";

import { CartProvider } from "./hooks/useCart";

const queryClient = new QueryClient();

interface User {
  email: string;
  isAdmin: boolean;
  role?: string;
}

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
              isAdmin: userData.role === 'admin' && userData.email.endsWith('@novelexporters.com')
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
      isAdmin: userData.role === 'admin' && userData.email.endsWith('@novelexporters.com')
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
  };

  if (loading) return null;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CartProvider>
            <BrowserRouter>
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
                      <Profile user={user} onLogout={handleLogout} />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
