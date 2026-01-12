import { User, Mail, Shield, Package, Clock, LogOut, ShoppingBag, Trash2, Plus, Minus, Send, Info, ExternalLink, ChevronRight, AlertCircle } from "lucide-react";
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
  const { cart, removeFromCart, updateQuantity, requestQuote, totalItems } = useCart();
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

  const handleRequestQuote = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await requestQuote(deliveryNote, requestedDeliveryDate);
      toast.success("Quote request sent successfully!");
      setDeliveryNote("");
      setRequestedDeliveryDate("");
      fetchOrders();
      setView("history");
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-zinc-950 pt-24 pb-20">
      <div className="container-custom max-w-6xl">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 md:p-12 rounded-[3rem] bg-white dark:bg-zinc-900 border border-border shadow-xl mb-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-spice-gold to-primary flex items-center justify-center text-white shadow-2xl">
              <User className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-serif text-foreground mb-1">{user.email.split('@')[0].toUpperCase()}</h1>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full border border-primary/20">
                  {user.isAdmin ? "Administrator" : "User Profile"}
                </span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {user.isAdmin && (
              <Button variant="warm" onClick={() => navigate("/admin")} className="rounded-2xl">
                <Shield className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout} className="rounded-2xl text-red-500 hover:bg-red-50 border-red-100">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-3">
            <button
              onClick={() => setView("cart")}
              className={`w-full flex items-center justify-between p-5 rounded-3xl transition-all ${view === 'cart' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-card text-muted-foreground hover:bg-muted/50'}`}
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
              <div className="flex items-center gap-3 font-bold">
                <Clock className="w-5 h-5" />
                Request History
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="p-6 rounded-3xl bg-spice-gold/5 border border-spice-gold/20 mt-8">
              <Info className="w-6 h-6 text-spice-gold mb-3" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Need help with your request? Our export team is available 24/7 for shipping consultation.
              </p>
            </div>
          </div>

          {/* Main Content Area */}
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
                              <div className="flex items-center gap-1 bg-white dark:bg-zinc-800 p-1 rounded-xl border border-border">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 hover:bg-muted rounded-lg"><Minus className="w-4 h-4" /></button>
                                <span className="w-8 text-center font-bold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 hover:bg-muted rounded-lg"><Plus className="w-4 h-4" /></button>
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
                  <h2 className="text-2xl font-bold font-serif mb-2">Request History</h2>
                  <p className="text-muted-foreground mb-8 text-sm">Track your past enquiries and official quotations.</p>

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
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                order.status === 'quoted' ? 'bg-blue-600 text-white' :
                                  'bg-green-600 text-white'
                                }`}>
                                {order.status}
                              </span>
                              <span className="text-[10px] text-muted-foreground mt-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap mb-6">
                            {order.products.map((p: any, i: number) => (
                              <div key={i} className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-bold border border-border">
                                {p.name} <span className="text-primary ml-1">x{p.quantity}</span>
                              </div>
                            ))}
                          </div>

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
        </div>
      </div>
    </div>
  );
};

export default Profile;
