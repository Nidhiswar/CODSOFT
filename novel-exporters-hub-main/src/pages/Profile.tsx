import { User, Mail, Shield, Package, Clock, LogOut, ShoppingBag, Trash2, Send, Info, ExternalLink, ChevronRight, AlertCircle, Download, Plus, Minus, Phone, KeyRound, Edit2, X, Check, Camera, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { getRecommendedProducts, Product } from "@/data/products";

interface ProfileProps {
  user: { email: string; username?: string; phone?: string; profilePicture?: string; isAdmin: boolean; role?: string } | null;
  onLogout: () => void;
  onUserUpdate?: (user: any) => void;
}

const Profile = ({ user, onLogout, onUserUpdate }: ProfileProps) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, updateUnit, requestQuote, totalItems, addToCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [view, setView] = useState<"cart" | "history">("cart");
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Order modification state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingProducts, setEditingProducts] = useState<any[]>([]);
  const [isModifyingOrder, setIsModifyingOrder] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Update recommendations when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      const recommendations = getRecommendedProducts(cart, 4);
      setRecommendedProducts(recommendations);
    } else {
      setRecommendedProducts([]);
    }
  }, [cart]);

  const fetchOrders = async () => {
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  const handleAddRecommendation = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      tamilName: product.tamilName,
      image: product.image,
      quantity: 1,
      unit: 'kg'
    });
    toast.success(`${product.name} added to selection!`);
  };

  // Profile picture upload handler
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const result = await api.updateProfile({ profilePicture: base64 });
        if (result && !result.message && onUserUpdate) {
          onUserUpdate({ ...user, profilePicture: result.profilePicture });
          toast.success("Profile picture updated!");
        } else {
          toast.error(result?.message || "Failed to update profile picture");
        }
      } catch (err) {
        toast.error("Failed to update profile picture");
      }
    };
    reader.readAsDataURL(file);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const result = await api.updateProfile({ 
        username: editUsername, 
        phone: editPhone 
      });
      if (result && !result.message && onUserUpdate) {
        onUserUpdate({ ...user, username: result.username, phone: result.phone });
        toast.success("Profile updated successfully!");
        setIsEditingProfile(false);
      } else if (result?.message) {
        toast.error(result.message);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Order modification handlers
  const startEditingOrder = (order: any) => {
    setEditingOrderId(order._id);
    setEditingProducts([...order.products]);
  };

  const cancelEditingOrder = () => {
    setEditingOrderId(null);
    setEditingProducts([]);
  };

  const updateProductQuantity = (index: number, quantity: number) => {
    setEditingProducts(prev => prev.map((p, i) => 
      i === index ? { ...p, quantity: Math.max(0.1, quantity) } : p
    ));
  };

  const removeProductFromOrder = (index: number) => {
    if (editingProducts.length <= 1) {
      toast.error("Order must have at least one product");
      return;
    }
    setEditingProducts(prev => prev.filter((_, i) => i !== index));
  };

  const saveOrderModification = async () => {
    if (!editingOrderId) return;
    
    setIsModifyingOrder(true);
    try {
      const result = await api.modifyOrder(editingOrderId, editingProducts);
      if (result.success) {
        toast.success(result.message);
        setEditingOrderId(null);
        setEditingProducts([]);
        fetchOrders(); // Refresh orders
      } else {
        toast.error(result.message || "Failed to modify order");
      }
    } catch (err) {
      toast.error("Failed to modify order");
    } finally {
      setIsModifyingOrder(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const downloadOrderHistory = async () => {
    if (orders.length === 0) {
      toast.error("No orders to download");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to download order history");
        return;
      }

      const response = await fetch(`http://127.0.0.1:5009/api/orders/my-orders/pdf`, {
        method: "GET",
        headers: {
          "x-auth-token": token,
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("PDF Error Response:", errorText);
        throw new Error("Failed to generate PDF");
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `novel-exporters-order-history-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Order history downloaded as PDF!");
    } catch (err) {
      console.error("PDF Download Error:", err);
      toast.error("Failed to download order history");
    }
  };

  const handleRequestQuote = async () => {
    if (cart.length === 0) {
      toast.error("❌ Your cart is empty. Add products before submitting a request.");
      return;
    }

    try {
      setIsSubmitting(true);
      await requestQuote(deliveryNote, requestedDeliveryDate);
      toast.success("Quotation request sent! Our team will respond within 24-48 hours.");
      setDeliveryNote("");
      setRequestedDeliveryDate("");
      fetchOrders();
      setView("history");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-zinc-950 pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="container-custom max-w-6xl">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 md:p-8 lg:p-12 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-zinc-900 border border-border shadow-xl mb-6 sm:mb-8 md:mb-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
            {/* Profile Picture with Upload */}
            <div className="relative group">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl overflow-hidden ${user.profilePicture ? 'bg-zinc-200 dark:bg-zinc-700' : 'bg-gradient-to-br from-spice-gold to-primary'}`}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl md:rounded-[2rem] cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>
            
            <div className="space-y-2">
              {isEditingProfile ? (
                <>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="Your name"
                      className="text-lg font-bold rounded-xl"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Phone number"
                      className="text-sm rounded-xl"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button 
                      size="sm" 
                      variant="warm" 
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      className="rounded-xl text-xs"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {isSavingProfile ? "Saving..." : "Save"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditUsername(user.username || "");
                        setEditPhone(user.phone || "");
                      }}
                      className="rounded-xl text-xs"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-foreground">{user.username || user.email.split('@')[0].toUpperCase()}</h1>
                    <button 
                      onClick={() => {
                        setEditUsername(user.username || "");
                        setEditPhone(user.phone || "");
                        setIsEditingProfile(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase rounded-full border border-primary/20">
                      {user.isAdmin ? "Administrator" : "User Profile"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                    {user.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-spice-gold" />
                        <span>{user.phone}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setEditUsername(user.username || "");
                          setEditPhone("");
                          setIsEditingProfile(true);
                        }}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Add phone number</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 relative z-10 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={async () => {
                setIsSendingReset(true);
                try {
                  const result = await api.forgotPassword(user.email);
                  if (result.message) {
                    toast.success("Password reset link sent to your email!");
                  } else {
                    toast.error(result.error || "Failed to send reset email");
                  }
                } catch (err) {
                  toast.error("Failed to send reset email");
                } finally {
                  setIsSendingReset(false);
                }
              }}
              disabled={isSendingReset}
              className="rounded-xl sm:rounded-2xl text-sm"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {isSendingReset ? "Sending..." : "Reset Password"}
            </Button>
            {user.isAdmin && (
              <Button variant="warm" onClick={() => navigate("/admin")} className="rounded-xl sm:rounded-2xl text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="rounded-xl sm:rounded-2xl text-red-500 hover:bg-red-50 border-red-100 text-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {/* Sidebar Navigation - Hide for Admin */}
          {!user.isAdmin && (
            <div className="lg:col-span-1 flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              <button
                onClick={() => setView("cart")}
                className={`flex-shrink-0 lg:w-full flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl md:rounded-3xl transition-all ${view === 'cart' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-card text-muted-foreground hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-3 font-bold">
                  <ShoppingBag className="w-5 h-5" />
                  Active Selection
                </div>
                {totalItems > 0 && (
                  <span className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center ${view === 'cart' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setView("history")}
                className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${view === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-card text-muted-foreground hover:bg-muted/50'}`}
              >
                <div className="flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-base">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="whitespace-nowrap">Request History</span>
                </div>
                <ChevronRight className="w-4 h-4 hidden lg:block" />
              </button>
              <button 
                onClick={() => navigate("/contact")}
                className="hidden lg:block p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-spice-gold/5 border border-spice-gold/20 mt-4 sm:mt-8 hover:bg-spice-gold/10 hover:border-spice-gold/40 transition-all cursor-pointer text-left w-full"
              >
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-spice-gold mb-2 sm:mb-3" />
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                  Need help with your request? Our export team is available 24/7 for shipping consultation.
                </p>
              </button>
            </div>
          )}

          {/* Admin Profile Content */}
          {user.isAdmin && (
            <div className="lg:col-span-4">
              <div className="p-5 sm:p-6 md:p-8 bg-card border border-border rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-sm text-center">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold font-serif mb-2">Administrator Account</h2>
                <Button variant="warm" onClick={() => navigate("/admin")} className="rounded-xl sm:rounded-2xl">
                  <Shield className="w-4 h-4 mr-2" />
                  Go to Admin Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Main Content Area - Only for non-admin users */}
          {!user.isAdmin && (
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {view === 'cart' ? (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm">
                    <h2 className="text-2xl font-bold font-serif mb-8 flex items-center gap-3">
                      <ShoppingBag className="w-6 h-6 text-spice-gold" />
                      Manage Your Selection
                    </h2>

                    {cart.length === 0 ? (
                      <div className="py-20 text-center space-y-4">
                        <Package className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                        <p className="text-lg text-muted-foreground">Your selection is empty</p>
                        <Button variant="outline" onClick={() => navigate("/products")} className="rounded-xl">Start Exploring</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="p-5 rounded-2xl bg-muted/20 border border-border flex items-center gap-6 group hover:border-primary/20 transition-all">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-border">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-lg font-bold text-foreground">{item.name}</h3>
                              <p className="text-xs text-primary font-medium italic">{item.tamilName}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 p-2 rounded-xl border border-border">
                                <button
                                  onClick={() => updateQuantity(item.id, Math.max(0.1, item.quantity - 1))}
                                  className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0.1)}
                                  className="w-16 h-9 text-center font-bold bg-muted/30 border border-border rounded-lg focus:ring-2 ring-primary/20 outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <select
                                  value={item.unit || 'kg'}
                                  onChange={(e) => updateUnit(item.id, e.target.value as 'kg' | 'g')}
                                  className="h-9 px-3 font-bold bg-spice-gold text-black border-0 rounded-lg focus:ring-2 ring-spice-gold/50 outline-none text-sm cursor-pointer shadow-sm hover:bg-spice-gold/90 transition-colors"
                                >
                                  <option value="kg" className="bg-white dark:bg-zinc-800 text-foreground">kg</option>
                                  <option value="g" className="bg-white dark:bg-zinc-800 text-foreground">g</option>
                                </select>
                              </div>
                              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          </div>
                        ))}

                        {/* Recommended Products Section */}
                        {recommendedProducts.length > 0 && (
                          <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-spice-gold/5 to-primary/5 border border-spice-gold/20">
                            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-foreground">
                              <Sparkles className="w-4 h-4 text-spice-gold" />
                              You might also like
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {recommendedProducts.map((product) => (
                                <div 
                                  key={product.id} 
                                  className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-border hover:border-primary/30 transition-all group cursor-pointer"
                                  onClick={() => handleAddRecommendation(product)}
                                >
                                  <div className="w-full h-16 rounded-lg overflow-hidden mb-2">
                                    <img 
                                      src={product.image} 
                                      alt={product.name} 
                                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                  </div>
                                  <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                                  <p className="text-[10px] text-primary truncate">{product.tamilName.split('(')[0]}</p>
                                  <button className="mt-2 w-full py-1.5 bg-primary/10 hover:bg-primary hover:text-white text-primary text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    Add
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-border space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 block">Special Delivery Instructions</label>
                              <textarea
                                value={deliveryNote}
                                onChange={(e) => setDeliveryNote(e.target.value)}
                                placeholder="Specify packaging needs, shipping port preference, or urgent dates..."
                                className="w-full h-32 p-4 rounded-2xl bg-muted/30 border border-border focus:ring-2 ring-primary/20 outline-none transition-all resize-none text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 block">Requested Delivery Date</label>
                              <input
                                type="date"
                                value={requestedDeliveryDate}
                                onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full h-14 p-4 rounded-2xl bg-muted/30 border border-border focus:ring-2 ring-primary/20 outline-none transition-all text-sm appearance-none"
                              />
                              <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed italic">
                                * Final delivery date will be confirmed by our logistics team after quotation approval.
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="hero"
                            className="w-full h-16 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30"
                            disabled={isSubmitting}
                            onClick={handleRequestQuote}
                          >
                            {isSubmitting ? "Submitting Request..." : "Submit Quotation Request"}
                            <Send className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold font-serif mb-2">Request History</h2>
                      <p className="text-muted-foreground text-sm">Track your past enquiries and official quotations.</p>
                    </div>
                    {orders.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={downloadOrderHistory}
                        className="rounded-2xl flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download Order Record
                      </Button>
                    )}
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-20 text-center bg-card rounded-[2.5rem] border border-dashed border-border">
                      <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">No previous requests found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Request ID</span>
                              <h3 className="text-lg font-bold font-mono">#{order._id.slice(-8).toUpperCase()}</h3>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                order.status === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                order.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                order.status === 'confirmed' ? 'bg-green-600 text-white' :
                                order.status === 'quoted' ? 'bg-blue-600 text-white' :
                                'bg-green-600 text-white'
                              }`}>
                                {order.status}
                              </span>
                              <span className="text-[10px] text-muted-foreground mt-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Show detailed pricing for confirmed orders */}
                          {order.status === 'confirmed' && order.total_amount ? (
                            <div className="mb-6">
                              <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                <h4 className="text-xs font-black uppercase tracking-wider text-green-700 dark:text-green-400 mb-3">Confirmed Quote - Product Pricing</h4>
                                <div className="space-y-2">
                                  {order.products.map((p: any, i: number) => {
                                    const currencySymbol = {'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[order.currency || 'INR'] || '₹';
                                    return (
                                      <div key={i} className="flex justify-between items-center py-2 border-b border-green-200/50 dark:border-green-800/50 last:border-0">
                                        <div>
                                          <span className="font-semibold text-sm">{p.name}</span>
                                          <span className="text-xs text-muted-foreground ml-2">({p.quantity} {p.unit || 'kg'})</span>
                                        </div>
                                        <div className="text-right">
                                          {p.unit_price && (
                                            <p className="text-[10px] text-muted-foreground">
                                              {currencySymbol}{p.unit_price?.toLocaleString()} × {p.quantity}
                                            </p>
                                          )}
                                          <p className="font-bold text-green-700 dark:text-green-400">
                                            {currencySymbol}{(p.total_price || 0).toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {/* Display Shipping Charges if any */}
                                  {order.shipping_charges > 0 && (
                                    <div className="flex justify-between items-center py-2 border-t border-green-200/50 dark:border-green-800/50 bg-amber-50 dark:bg-amber-950/30 -mx-4 px-4 mt-2">
                                      <div>
                                        <span className="font-semibold text-sm">Shipping Charges</span>
                                        <span className="text-xs text-muted-foreground ml-2">(Air/Sea Freight)</span>
                                      </div>
                                      <p className="font-bold text-amber-600 dark:text-amber-400">
                                        {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[order.currency || 'INR'] || '₹'}
                                        {(order.shipping_charges || 0).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <div className="mt-4 pt-3 border-t-2 border-green-300 dark:border-green-700 flex justify-between items-center">
                                  <span className="font-bold text-green-800 dark:text-green-300">Grand Total</span>
                                  <span className="text-xl font-black text-green-700 dark:text-green-400">
                                    {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[order.currency || 'INR'] || '₹'}
                                    {(order.total_amount || 0).toLocaleString()} {order.currency || 'INR'}
                                  </span>
                                </div>
                                {order.estimated_delivery_date && (
                                  <p className="mt-3 text-xs text-green-600 dark:text-green-500">
                                    Estimated Delivery: {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                )}
                                {order.price_updated_at && (
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    Last price update: {new Date(order.price_updated_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : editingOrderId === order._id ? (
                            /* Editing mode for pending orders */
                            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                              <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                                <Edit2 className="w-4 h-4" />
                                Modify Order Products
                              </h4>
                              <div className="space-y-3">
                                {editingProducts.map((p: any, i: number) => (
                                  <div key={i} className="flex items-center justify-between gap-3 p-3 bg-white dark:bg-zinc-800 rounded-xl border border-border">
                                    <span className="font-semibold text-sm flex-grow">{p.name}</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => updateProductQuantity(i, p.quantity - 1)}
                                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={p.quantity}
                                        onChange={(e) => updateProductQuantity(i, parseFloat(e.target.value) || 0.1)}
                                        className="w-14 h-8 text-center font-bold bg-muted/30 border border-border rounded-lg text-sm"
                                      />
                                      <button
                                        onClick={() => updateProductQuantity(i, p.quantity + 1)}
                                        className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                      <span className="text-xs font-medium text-muted-foreground w-8">{p.unit || 'kg'}</span>
                                      <button
                                        onClick={() => removeProductFromOrder(i)}
                                        className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-red-600"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  variant="warm"
                                  onClick={saveOrderModification}
                                  disabled={isModifyingOrder}
                                  className="rounded-xl text-xs"
                                >
                                  <Save className="w-3 h-3 mr-1" />
                                  {isModifyingOrder ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditingOrder}
                                  className="rounded-xl text-xs"
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-6">
                              <div className="flex gap-2 flex-wrap">
                                {order.products.map((p: any, i: number) => (
                                  <div key={i} className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-bold border border-border">
                                    {p.name} <span className="text-primary ml-1">x{p.quantity} {p.unit || 'kg'}</span>
                                  </div>
                                ))}
                              </div>
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => startEditingOrder(order)}
                                  className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Modify products in this order
                                </button>
                              )}
                            </div>
                          )}

                          {order.admin_notes && (
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex gap-3">
                              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                              <div>
                                <p className="text-[10px] font-black text-primary uppercase mb-1">Response from Export Desk</p>
                                <p className="text-sm text-foreground/80">{order.admin_notes}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
