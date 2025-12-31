import { useState, useEffect } from "react";
import {
    Users, Package, TrendingUp, Mail,
    BarChart3, Calendar, Search,
    Filter, MoreHorizontal, CheckCircle2,
    Clock, AlertCircle, ShoppingCart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { toast } from "sonner";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [orders, setOrders] = useState<any[]>([]);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [oRes, eRes, aRes, uRes] = await Promise.all([
                api.getAllOrders(),
                api.getAllEnquiries(),
                api.getAnalytics(),
                api.getAllUsers()
            ]);
            setOrders(oRes);
            setEnquiries(eRes);
            setAnalytics(aRes);
            setUsers(uRes);
        } catch (err) {
            toast.error("Failed to load admin data");
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await api.updateOrderStatus(orderId, status, `Manual update by admin on ${new Date().toLocaleDateString()}`);
            toast.success(`Order set to ${status}`);
            fetchData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-zinc-950 pt-24 pb-20">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold font-serif text-foreground mb-2">Command Center</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            Live Export Operations Dashboard
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={fetchData} className="rounded-xl">Refresh Data</Button>
                        <Button variant="warm" className="rounded-xl shadow-lg shadow-primary/20">Generate Export Report</Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Active Requests", value: orders.length, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "New Enquiries", value: enquiries.length, icon: Mail, color: "text-green-500", bg: "bg-green-500/10" },
                        { label: "Partner Interest", value: Object.keys(analytics?.productStats || {}).length, icon: TrendingUp, color: "text-spice-gold", bg: "bg-spice-gold/10" },
                        { label: "Managed Items", value: Object.values(analytics?.productStats || {}).reduce((a: any, b: any) => a + b, 0), icon: ShoppingCart, color: "text-indigo-500", bg: "bg-indigo-500/10" }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 bg-card border border-border rounded-[2rem] shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                <stat.icon className={`w-7 h-7 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                <p className="text-3xl font-bold font-serif text-foreground">{String(stat.value)}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Tab Selection */}
                <div className="flex items-center gap-2 mb-8 bg-muted/30 p-1.5 rounded-2xl w-fit">
                    {["Overview", "Orders", "Enquiries", "Users", "Intelligence"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.toLowerCase()
                                ? "bg-white dark:bg-zinc-800 text-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === "overview" && (
                            <motion.div
                                key="ov"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-8"
                            >
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-spice-gold" />
                                            Recent Activity
                                        </h3>
                                        <div className="space-y-4">
                                            {orders.slice(0, 5).map((order) => (
                                                <div key={order._id} className="p-4 rounded-2xl bg-muted/30 border border-border flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-spice-gold/20 flex items-center justify-center text-spice-gold">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm text-foreground">New Quote Request</p>
                                                            <p className="text-xs text-muted-foreground">From {order.user?.username || 'Unknown'}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground font-medium uppercase">{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                                            Market Intelligence
                                        </h3>
                                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 h-64 flex flex-col justify-center">
                                            <p className="text-sm text-muted-foreground mb-4">Total product-level interest across all carts and orders:</p>
                                            <div className="space-y-4 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                                                {analytics?.productStats && Object.entries(analytics.productStats).sort((a: any, b: any) => b[1] - a[1]).map(([name, qty]: any) => (
                                                    <div key={name} className="space-y-1">
                                                        <div className="flex justify-between text-xs font-bold">
                                                            <span>{name}</span>
                                                            <span>{qty} units</span>
                                                        </div>
                                                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                                                style={{ width: `${Math.min((qty / 100) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <motion.div key="ord" className="p-8 h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold font-serif">Manage Orders</h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input className="pl-10 pr-4 py-2 rounded-xl bg-muted/50 border-none text-sm w-64" placeholder="Search orders..." />
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border">
                                                <th className="pb-4 pl-4">Order ID / User</th>
                                                <th className="pb-4">Product Breakdown</th>
                                                <th className="pb-4">Status</th>
                                                <th className="pb-4 pr-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {orders.map((order) => (
                                                <tr key={order._id} className="group hover:bg-muted/10 transition-colors">
                                                    <td className="py-6 pl-4">
                                                        <p className="text-sm font-bold text-foreground">#{order._id.slice(-6).toUpperCase()}</p>
                                                        <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                                                    </td>
                                                    <td className="py-6">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {order.products.map((p: any, i: number) => (
                                                                <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium border border-border whitespace-nowrap">
                                                                    {p.name} ({p.quantity})
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                            order.status === 'quoted' ? 'bg-blue-100 text-blue-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 pr-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {order.status === 'pending' && (
                                                                <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold uppercase" onClick={() => updateStatus(order._id, 'quoted')}>Mark Quoted</Button>
                                                            )}
                                                            {order.status === 'quoted' && (
                                                                <Button size="sm" variant="default" className="h-8 text-[10px] font-bold uppercase" onClick={() => updateStatus(order._id, 'confirmed')}>Confirm Order</Button>
                                                            )}
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "enquiries" && (
                            <motion.div key="enq" className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {enquiries.map((enq) => (
                                        <div key={enq._id} className="p-6 rounded-3xl bg-muted/50 border border-border hover:border-primary/20 transition-all flex flex-col group">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Users className="w-5 h-5" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-bold text-foreground text-sm truncate">{enq.username}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{enq.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4 italic">"{enq.message}"</p>
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground">{new Date(enq.createdAt).toLocaleDateString()}</span>
                                                <Button size="sm" variant="ghost" className="h-8 px-4 rounded-lg text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-all">Reply</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "users" && (
                            <motion.div key="usr" className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold font-serif">Registered Partners</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b border-border">
                                                <th className="pb-4 pl-4">Partner Details</th>
                                                <th className="pb-4">Contact</th>
                                                <th className="pb-4">Role</th>
                                                <th className="pb-4 pr-4">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {users.map((u) => (
                                                <tr key={u._id} className="group hover:bg-muted/10 transition-colors">
                                                    <td className="py-6 pl-4">
                                                        <p className="text-sm font-bold text-foreground">{u.username}</p>
                                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                                    </td>
                                                    <td className="py-6">
                                                        <p className="text-xs font-medium">{u.phone || "N/A"}</p>
                                                    </td>
                                                    <td className="py-6">
                                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${u.role === 'admin' ? 'border-primary text-primary bg-primary/5' : 'border-zinc-200 text-zinc-500 bg-zinc-50'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-6 pr-4">
                                                        <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
