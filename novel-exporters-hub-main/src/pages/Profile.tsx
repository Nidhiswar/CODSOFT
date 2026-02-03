import { User, Mail, Shield, Package, Clock, LogOut, ShoppingBag, Trash2, Send, Info, ExternalLink, ChevronRight, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileProps {
  user: { email: string; isAdmin: boolean; role?: string } | null;
  onLogout: () => void;
}

const Profile = ({ user, onLogout }: ProfileProps) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, updateUnit, requestQuote, totalItems } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [view, setView] = useState<"cart" | "history">("cart");

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders");
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
      toast.error(err.message || "⚠️ Failed to send request. Please try again later.");
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
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-spice-gold to-primary flex items-center justify-center text-white shadow-2xl">
              <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-foreground mb-1">{user.email.split('@')[0].toUpperCase()}</h1>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase rounded-full border border-primary/20">
                  {user.isAdmin ? "Administrator" : "User Profile"}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 relative z-10 w-full md:w-auto">
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
              <div className="hidden lg:block p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-spice-gold/5 border border-spice-gold/20 mt-4 sm:mt-8">
                <Info className="w-5 h-5 sm:w-6 sm:h-6 text-spice-gold mb-2 sm:mb-3" />
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
                  Need help with your request? Our export team is available 24/7 for shipping consultation.
                </p>
              </div>
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
                                <input
                                  type="number"
                                  min="0.1"
                                  step="0.1"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0.1)}
                                  className="w-20 h-9 text-center font-bold bg-muted/30 border border-border rounded-lg focus:ring-2 ring-primary/20 outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <select
                                  value={item.unit || 'kg'}
                                  onChange={(e) => updateUnit(item.id, e.target.value as 'kg' | 'g')}
                                  className="h-9 px-3 font-bold bg-muted/30 border border-border rounded-lg focus:ring-2 ring-primary/20 outline-none text-sm cursor-pointer"
                                >
                                  <option value="kg">kg</option>
                                  <option value="g">g</option>
                                </select>
                              </div>
                              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                            </div>
                          </div>
                        ))}

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
                                <h4 className="text-xs font-black uppercase tracking-wider text-green-700 dark:text-green-400 mb-3">💰 Confirmed Quote - Product Pricing</h4>
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
                                    📦 Estimated Delivery: {new Date(order.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                )}
                                {order.price_updated_at && (
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    Last price update: {new Date(order.price_updated_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2 flex-wrap mb-6">
                              {order.products.map((p: any, i: number) => (
                                <div key={i} className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-bold border border-border">
                                  {p.name} <span className="text-primary ml-1">x{p.quantity} {p.unit || 'kg'}</span>
                                </div>
                              ))}
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
