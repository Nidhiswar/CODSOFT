import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Phone } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
      toast.error("Passwords do not match");
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
        toast.success(isLogin ? `Welcome back, ${res.user.username}!` : "Account created successfully!");
        navigate("/");
      } else {
        toast.error(res.message || "Authentication failed");
      }
    } catch (err) {
      toast.error("An error occurred during authentication");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20 px-4">
      {/* Background with higher quality assets */}
      <div className="absolute inset-0 bg-zinc-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(196,160,82,0.15),transparent_50%)]" />

      {/* Dynamic Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-spice-gold/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="p-8 md:p-12 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl">
          {/* Logo/Brand */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-spice-gold to-primary p-0.5 shadow-2xl">
              <div className="w-full h-full bg-zinc-900 rounded-[1.4rem] flex items-center justify-center">
                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-spice-gold to-white font-serif">N</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold font-serif text-white tracking-tight">
              {isLogin ? "Global Partners Hub" : "Join the Network"}
            </h1>
            <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-zinc-400 text-xs font-medium leading-relaxed italic">
                {isLogin
                  ? "👋 Welcome back. Securely manage your global spice quotations and track international shipping status below."
                  : "✨ Register to access wholesale pricing, verified lab reports, and direct factory-to-port logistics tracking."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Company Representative</label>
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
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Secret Key</label>
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
                  {isLogin ? "Establish Session" : "Apply for Access"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Switcher */}
          <div className="mt-8 text-center pt-8 border-t border-white/5">
            <p className="text-zinc-500 text-sm font-medium">
              {isLogin ? "Access Required?" : "Already Authorized?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-primary font-bold hover:text-white transition-colors"
              >
                {isLogin ? "Apply Now" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
