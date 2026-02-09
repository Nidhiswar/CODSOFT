import { User, Mail, Shield, Package, Clock, LogOut, ShoppingBag, Trash2, Send, Info, ExternalLink, ChevronRight, AlertCircle, Download, Plus, Minus, Phone, KeyRound, Edit2, X, Check, Save, History, Calendar, FileText, TrendingUp, CheckCircle2, Timer, XCircle } from "lucide-react";
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
  user: { email: string; username?: string; phone?: string; isAdmin: boolean; role?: string } | null;
  onLogout: () => void;
  onUserUpdate?: (user: any) => void;
}

const Profile = ({ user, onLogout, onUserUpdate }: ProfileProps) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, updateUnit, requestQuote, totalItems, addToCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Order modification state
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [editingProducts, setEditingProducts] = useState<any[]>([]);
  const [isModifyingOrder, setIsModifyingOrder] = useState(false);
  
  // Ref for scrolling to history section
  const historyRef = useRef<HTMLDivElement>(null);

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

  // Helper function for order statistics
  const getOrderStats = () => {
    const pending = orders.filter(o => o.status === 'pending').length;
    const confirmed = orders.filter(o => o.status === 'confirmed').length;
    const quoted = orders.filter(o => o.status === 'quoted').length;
    return { pending, confirmed, quoted, total: orders.length };
  };

  const orderStats = getOrderStats();

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
      i === index ? { ...p, quantity: Math.max(1, quantity) } : p
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
      toast.error("❌ Your selection is empty. Add products before submitting a request.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Fire request without awaiting for faster UI response
      const orderPromise = requestQuote(deliveryNote, requestedDeliveryDate, deliveryLocation);
      
      // Immediately clear form for snappy UX
      setDeliveryNote("");
      setDeliveryLocation("");
      setRequestedDeliveryDate("");
      
      // Scroll to history section
      setTimeout(() => {
        if (historyRef.current) {
          historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      
      // Wait for request to complete and fetch updated orders
      await orderPromise;
      toast.success("Quotation request sent! Our team will respond within 24-48 hours.");
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to send request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFCFB] via-white to-[#F9F6F2] dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pt-20 sm:pt-24 pb-12 sm:pb-20">
      <div className="container-custom max-w-7xl">
        {/* Profile Header Card - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 sm:p-6 md:p-8 lg:p-10 rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 shadow-xl mb-6 sm:mb-8 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8 relative overflow-hidden"
        >
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-primary/10 to-spice-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-gradient-to-tr from-spice-gold/5 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10 text-center sm:text-left">
            {/* User Profile Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl md:rounded-[2rem] flex items-center justify-center text-white shadow-2xl bg-gradient-to-br from-spice-gold to-primary">
              <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
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
                  <div className="flex flex-col gap-1">
                    <span className="text-sm sm:text-base text-primary font-medium">
                      {user.isAdmin ? "Welcome Admin !" : `Welcome ${user.username || user.email.split('@')[0]} !`}
                    </span>
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
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    {user.isAdmin ? (
                      <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase rounded-full border border-primary/20">
                        Administrator
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase rounded-full border border-primary/20">
                        User Profile
                      </span>
                    )}
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
            <Button variant="outline" onClick={handleLogout} className="rounded-xl sm:rounded-2xl text-red-500 hover:bg-red-50 border-red-100 text-sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Admin Profile Content */}
          {user.isAdmin && (
            <div className="lg:col-span-2">
              <div className="p-5 sm:p-6 md:p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-sm text-center">
                <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-primary mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold font-serif mb-2">Administrator Account</h2>
                <Button variant="warm" onClick={() => navigate("/admin")} className="rounded-xl sm:rounded-2xl">
                  <Shield className="w-4 h-4 mr-2" />
                  Go to Admin Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* LEFT COLUMN: Active Selection */}
          {!user.isAdmin && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Active Selection Header Card */}
              <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-3xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-spice-gold to-primary flex items-center justify-center shadow-lg shadow-primary/20">
                      <ShoppingBag className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-serif text-foreground">Active Selection</h2>
                      <p className="text-xs text-muted-foreground">Products ready for quotation</p>
                    </div>
                  </div>
                  {totalItems > 0 && (
                    <div className="px-4 py-2 bg-primary/10 rounded-2xl">
                      <span className="text-2xl font-black text-primary">{totalItems}</span>
                      <span className="text-xs text-muted-foreground ml-1">items</span>
                    </div>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-16 text-center space-y-4 border-2 border-dashed border-border rounded-2xl bg-muted/10">
                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                      <Package className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">No products selected</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">Browse our catalog to add spices</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/products")} className="rounded-xl mt-4">
                      Explore Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-2xl bg-gradient-to-r from-muted/30 to-transparent border border-border/50 flex items-center gap-4 group hover:border-primary/30 hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border shadow-sm">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-foreground truncate">{item.name}</h3>
                          <p className="text-[10px] text-primary font-medium italic truncate">{item.tamilName}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1.5 rounded-xl border border-border shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Math.max(1, parseFloat(e.target.value) || 1))}
                              className="w-12 h-7 text-center font-bold bg-transparent border-0 focus:ring-0 outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <div className="flex h-7 bg-zinc-100 dark:bg-zinc-700 rounded-lg p-0.5 ml-1">
                              <button
                                onClick={() => updateUnit(item.id, 'kg')}
                                className={`px-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
                                  (item.unit || 'kg') === 'kg'
                                    ? 'bg-spice-gold text-black shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                              >
                                kg
                              </button>
                              <button
                                onClick={() => updateUnit(item.id, 'g')}
                                className={`px-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
                                  item.unit === 'g'
                                    ? 'bg-spice-gold text-black shadow-sm'
                                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                }`}
                              >
                                g
                              </button>
                            </div>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Recommended Products Section */}
                {recommendedProducts.length > 0 && (
                  <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-spice-gold/5 to-primary/5 border border-spice-gold/20">
                    <h3 className="text-xs font-bold font-serif mb-3 text-foreground">
                      Recommended for you
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {recommendedProducts.slice(0, 4).map((product) => (
                        <div 
                          key={product.id} 
                          className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-border hover:border-primary/30 transition-all group cursor-pointer"
                          onClick={() => handleAddRecommendation(product)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{product.name}</p>
                              <button className="text-[9px] text-primary font-medium flex items-center gap-0.5">
                                <Plus className="w-2.5 h-2.5" />
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Request Form Card */}
              {cart.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-3xl shadow-lg"
                >
                  <h3 className="text-lg font-bold font-serif mb-5 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Request Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Delivery Instructions</label>
                      <textarea
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        placeholder="Packaging needs, shipping port, special requirements..."
                        className="w-full h-24 p-4 rounded-xl bg-muted/30 border border-border focus:ring-2 ring-primary/20 outline-none transition-all resize-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        Delivery Location
                      </label>
                      <Input
                        value={deliveryLocation}
                        onChange={(e) => setDeliveryLocation(e.target.value)}
                        placeholder="City, Country (e.g., Dubai, UAE)"
                        className="h-12 rounded-xl bg-muted/30 border border-border focus:ring-2 ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Requested Delivery Date
                      </label>
                      <input
                        type="date"
                        value={requestedDeliveryDate}
                        onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full h-12 p-4 rounded-xl bg-muted/30 border border-border focus:ring-2 ring-primary/20 outline-none transition-all text-sm appearance-none"
                      />
                    </div>
                    <Button
                      variant="hero"
                      className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/30 mt-2"
                      disabled={isSubmitting}
                      onClick={handleRequestQuote}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Quotation Request"}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center italic">
                      Final delivery date will be confirmed after quotation approval
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Help Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-spice-gold/10 to-primary/5 border border-spice-gold/20 hover:border-spice-gold/40 transition-all cursor-pointer" onClick={() => navigate("/contact")}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-spice-gold/20 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-spice-gold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Need Help?</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Our export team is available 24/7 for shipping consultation and support.
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            </motion.div>
          )}

          {/* RIGHT COLUMN: Request History */}
          {!user.isAdmin && (
            <motion.div
              ref={historyRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
              {/* History Header Card */}
              <div className="p-6 sm:p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-3xl shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold font-serif text-foreground">Record History</h2>
                      <p className="text-xs text-muted-foreground">Track your past enquiries</p>
                    </div>
                  </div>
                  {orders.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadOrderHistory}
                      className="rounded-xl text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PDF
                    </Button>
                  )}
                </div>

                {/* Order Statistics */}
                {orders.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border border-amber-200/50 dark:border-amber-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Timer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">Pending</span>
                      </div>
                      <span className="text-xl font-black text-amber-700 dark:text-amber-400">{orderStats.pending}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-medium text-blue-700 dark:text-blue-400">Quoted</span>
                      </div>
                      <span className="text-xl font-black text-blue-700 dark:text-blue-400">{orderStats.quoted}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border border-green-200/50 dark:border-green-800/30">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-[10px] font-medium text-green-700 dark:text-green-400">Confirmed</span>
                      </div>
                      <span className="text-xl font-black text-green-700 dark:text-green-400">{orderStats.confirmed}</span>
                    </div>
                  </div>
                )}

                {orders.length === 0 ? (
                  <div className="py-16 text-center space-y-4 border-2 border-dashed border-border rounded-2xl bg-muted/10">
                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto">
                      <Clock className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">No previous requests</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">Your order history will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {orders.map((order, index) => (
                      <motion.div
                        key={order._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          expandedOrderId === order._id 
                            ? 'bg-white dark:bg-zinc-800 border-primary/30 shadow-lg' 
                            : 'bg-muted/20 border-border/50 hover:border-border hover:bg-muted/40'
                        }`}
                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                      >
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              order.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30' :
                              order.status === 'quoted' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              order.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' :
                              order.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                              'bg-gray-100 dark:bg-gray-900/30'
                            }`}>
                              {order.status === 'pending' && <Timer className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                              {order.status === 'quoted' && <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                              {order.status === 'confirmed' && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                              {order.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                              {!['pending', 'quoted', 'confirmed', 'rejected'].includes(order.status) && <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                              <p className="text-xs font-medium text-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              order.status === 'quoted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              order.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              order.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                              {order.status}
                            </span>
                            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expandedOrderId === order._id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                        {/* Products Summary */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {order.products.slice(0, expandedOrderId === order._id ? undefined : 3).map((p: any, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-muted/50 rounded-md text-[10px] font-medium border border-border/50">
                              {p.name} <span className="text-primary">×{p.quantity}</span>
                            </span>
                          ))}
                          {expandedOrderId !== order._id && order.products.length > 3 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-[10px] font-medium">
                              +{order.products.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {expandedOrderId === order._id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-border/50 space-y-4"
                            >
                              {/* Confirmed Order Pricing */}
                              {order.status === 'confirmed' && order.total_amount && (
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                  <h4 className="text-xs font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Confirmed Pricing
                                  </h4>
                                  <div className="space-y-2">
                                    {order.products.map((p: any, i: number) => {
                                      const currencySymbol = {'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[order.currency || 'INR'] || '₹';
                                      return (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                          <span>{p.name} ({p.quantity} {p.unit || 'kg'})</span>
                                          <span className="font-bold text-green-700 dark:text-green-400">
                                            {currencySymbol}{(p.total_price || 0).toLocaleString()}
                                          </span>
                                        </div>
                                      );
                                    })}
                                    {order.shipping_charges > 0 && (
                                      <div className="flex justify-between items-center text-sm pt-2 border-t border-green-200/50">
                                        <span>Shipping Charges</span>
                                        <span className="font-bold text-amber-600">
                                          {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[order.currency || 'INR'] || '₹'}
                                          {(order.shipping_charges || 0).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t-2 border-green-300 dark:border-green-700">
                                      <span className="font-bold">Grand Total</span>
                                      <span className="text-lg font-black text-green-700 dark:text-green-400">
                                        {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[order.currency || 'INR'] || '₹'}
                                        {(order.total_amount || 0).toLocaleString()} {order.currency || 'INR'}
                                      </span>
                                    </div>
                                  </div>
                                  {order.estimated_delivery_date && (
                                    <p className="mt-3 text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Est. Delivery: {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Pending Order - Edit Option */}
                              {order.status === 'pending' && editingOrderId !== order._id && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); startEditingOrder(order); }}
                                  className="flex items-center gap-2 text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  Modify products in this order
                                </button>
                              )}

                              {/* Editing Mode for Pending Orders */}
                              {editingOrderId === order._id && (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800" onClick={(e) => e.stopPropagation()}>
                                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                                    <Edit2 className="w-4 h-4" />
                                    Modify Order Products
                                  </h4>
                                  <div className="space-y-2">
                                    {editingProducts.map((p: any, i: number) => (
                                      <div key={i} className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-zinc-800 rounded-lg border border-border">
                                        <span className="font-medium text-xs flex-grow truncate">{p.name}</span>
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => updateProductQuantity(i, Math.max(1, p.quantity - 1))}
                                            className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors disabled:opacity-50"
                                            disabled={p.quantity <= 1}
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={p.quantity}
                                            onChange={(e) => updateProductQuantity(i, Math.max(1, parseFloat(e.target.value) || 1))}
                                            className="w-12 h-6 text-center font-bold bg-muted/30 border border-border rounded text-xs"
                                          />
                                          <button
                                            onClick={() => updateProductQuantity(i, p.quantity + 1)}
                                            className="w-6 h-6 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                          <span className="text-[10px] font-medium text-muted-foreground w-6">{p.unit || 'kg'}</span>
                                          <button
                                            onClick={() => removeProductFromOrder(i)}
                                            className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-red-600"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <Button
                                      size="sm"
                                      variant="warm"
                                      onClick={saveOrderModification}
                                      disabled={isModifyingOrder}
                                      className="rounded-lg text-xs"
                                    >
                                      <Save className="w-3 h-3 mr-1" />
                                      {isModifyingOrder ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={cancelEditingOrder}
                                      className="rounded-lg text-xs"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Admin Notes */}
                              {order.admin_notes && (
                                <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex gap-2">
                                  <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Export Desk Response</p>
                                    <p className="text-xs text-foreground/80">{order.admin_notes}</p>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
