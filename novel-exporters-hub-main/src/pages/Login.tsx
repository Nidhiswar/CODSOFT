import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import novelLogo from "@/assets/novel-logo-dynamic.png";

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error("❌ Passwords do not match. Please check and try again.");
      setIsLoading(false);
      return;
    }

    try {
      let res;
      if (isLogin) {
        res = await api.login({ email: formData.email, password: formData.password });
      } else {
        res = await api.register({
          username: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
      }

      if (res.token) {
        onLogin(res.user);
        // Check if admin email - redirect to admin dashboard
        const isAdmin = res.user.role === 'admin' && res.user.email === 'novelexporters@gmail.com';
        if (isAdmin) {
          toast.success(`Welcome Admin, ${res.user.username}!`);
          navigate("/admin");
        } else {
          toast.success(isLogin ? `Welcome back, ${res.user.username}!` : "Account created successfully! Explore our products.");
          navigate("/");
        }
      } else {
        toast.error(`⚠️ ${res.message || "Authentication failed. Please check your credentials."}`);
      }
    } catch (err: any) {
      toast.error("❌ Authentication error. Please try again or contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 sm:py-16 md:py-20 px-4">
      {/* Background with higher quality assets */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920')] bg-cover bg-center opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/60 to-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(196,160,82,0.1),transparent_50%)]" />

      {/* Dynamic Orbs */}
      <div className="absolute top-1/4 -left-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-primary/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-spice-gold/10 rounded-full blur-[80px] sm:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl">
          {/* Logo/Brand */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-spice-gold via-white to-primary flex items-center justify-center shadow-[0_0_50px_rgba(196,160,82,0.3)] p-1 group hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-white rounded-xl sm:rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                  <img src={novelLogo} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-xl" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-white tracking-tight">
                Novel Exporters
              </h1>
            </div>
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <p className="text-zinc-300 text-xs font-medium leading-relaxed italic">
                {isLogin
                  ? "👋 Welcome back. Sign in to manage your orders and track international shipping."
                  : "✨ Register to access premium wholesale pricing and direct factory-to-port logistics."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">User Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    name="name"
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Contact Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleChange}
                    required={!isLogin}
                    className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                {isLogin ? "Email or Contact Number" : "Primary Email"}
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <Input
                  name="email"
                  type="text"
                  placeholder={isLogin ? "name@company.com or +91..." : "name@company.com"}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-14 pl-12 pr-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Confirm Identity</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    className="h-14 pl-12 rounded-2xl bg-white/5 border-white/10 text-white focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex justify-end">
                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">
                  Lost Password?
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-spice-gold to-primary text-white text-lg font-bold shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In to Account" : "Register Now"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switcher */}
          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <p className="text-zinc-500 text-sm font-medium">
              {isLogin ? "New to Novel Exporters?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-bold hover:text-white transition-colors"
              >
                {isLogin ? "Create Account" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
