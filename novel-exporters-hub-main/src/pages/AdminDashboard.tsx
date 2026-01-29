import { useState, useEffect } from "react";
import {
    Users, Package, TrendingUp, Mail,
    BarChart3, Calendar, Search,
    Filter, MoreHorizontal, CheckCircle2,
    Clock, AlertCircle, ShoppingCart, Download,
    DollarSign, FileText, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import novelLogo from "@/assets/novel-logo-dynamic.png";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [orders, setOrders] = useState<any[]>([]);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [pricingData, setPricingData] = useState<{[key: string]: { pricing: string; timeline: string; notes: string }}>({});
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const adminEmail = "novelexporters@gmail.com";

    useEffect(() => {
        // Wait for auth to complete before checking role
        if (!authLoading) {
            if (!user || user.role !== "admin") {
                navigate("/login");
            }
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user?.role === "admin") {
            fetchData();
        }
    }, [user]);

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

    const updateStatus = async (orderId: string, status: string, customNotes?: string) => {
        try {
            const notes = customNotes || `Status updated to ${status} by admin on ${new Date().toLocaleDateString()}`;
            await api.updateOrderStatus(orderId, status, notes);
            toast.success(`Order set to ${status}`);
            setEditingOrder(null);
            fetchData();
        } catch (err) {
            toast.error("Update failed");
        }
    };

    const updateOrderWithPricingTimeline = async (orderId: string, status: string) => {
        const data = pricingData[orderId];
        if (!data) {
            toast.error("Please fill in pricing and timeline details");
            return;
        }
        const notes = `Pricing: ${data.pricing || 'TBD'} | Timeline: ${data.timeline || 'TBD'} | Notes: ${data.notes || 'None'}`;
        await updateStatus(orderId, status, notes);
        setPricingData(prev => {
            const updated = { ...prev };
            delete updated[orderId];
            return updated;
        });
    };

    // Download Order Data as PDF with Company Logo
    const downloadOrdersPDF = async () => {
        try {
            // Convert logo to base64 for embedding in PDF
            const getLogoBase64 = (): Promise<string> => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/png'));
                    };
                    img.onerror = () => resolve('');
                    img.src = novelLogo;
                });
            };

            const logoBase64 = await getLogoBase64();

            const reportContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Novel Exporters - Orders Report</title>
                    <style>
                        @page { size: A4 landscape; margin: 12mm; }
                        * { box-sizing: border-box; }
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 15px; color: #1e293b; font-size: 10px; background: #fff; }
                        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 3px solid #0c4a6e; padding-bottom: 15px; }
                        .logo-section { display: flex; align-items: center; gap: 15px; }
                        .logo { width: 70px; height: 70px; object-fit: contain; }
                        .company-info h1 { color: #0c4a6e; margin: 0; font-size: 22px; font-weight: 700; }
                        .company-info p { color: #64748b; margin: 3px 0 0; font-size: 11px; }
                        .report-info { text-align: right; }
                        .report-info h2 { color: #0c4a6e; margin: 0; font-size: 14px; font-weight: 600; }
                        .report-info p { color: #64748b; margin: 2px 0; font-size: 9px; }
                        .meta { display: flex; justify-content: space-between; margin-bottom: 15px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 10px 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
                        .meta span { color: #475569; font-size: 10px; }
                        .meta strong { color: #0c4a6e; }
                        table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1px solid #e2e8f0; }
                        th { background: linear-gradient(135deg, #0c4a6e, #0f766e); color: white; padding: 10px 6px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
                        td { padding: 8px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; font-size: 9px; }
                        tr:nth-child(even) { background: #f8fafc; }
                        .status { display: inline-block; padding: 3px 8px; border-radius: 10px; font-weight: 600; font-size: 8px; text-transform: uppercase; }
                        .status-pending { background: #fef3c7; color: #92400e; }
                        .status-confirmed { background: #d1fae5; color: #065f46; }
                        .status-rejected { background: #fee2e2; color: #991b1b; }
                        .status-approved { background: #dbeafe; color: #1e40af; }
                        .order-id { font-family: 'Courier New', monospace; font-weight: bold; color: #0c4a6e; font-size: 10px; }
                        .user-name { font-weight: 600; color: #1e293b; }
                        .user-email { color: #64748b; font-size: 8px; }
                        .phone { color: #0c4a6e; font-weight: 500; }
                        .instructions { max-width: 180px; font-style: italic; color: #64748b; font-size: 9px; line-height: 1.3; }
                        .products { font-size: 9px; line-height: 1.4; }
                        .footer { margin-top: 25px; text-align: center; color: #94a3b8; font-size: 9px; border-top: 2px solid #0c4a6e; padding-top: 12px; }
                        .footer p { margin: 3px 0; }
                        .watermark { position: fixed; bottom: 10px; right: 15px; font-size: 8px; color: #cbd5e1; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo-section">
                            ${logoBase64 ? `<img src="${logoBase64}" alt="Novel Exporters" class="logo" />` : ''}
                            <div class="company-info">
                                <h1>NOVEL EXPORTERS</h1>
                                <p>Premium Indian Spices | Global Export Excellence</p>
                            </div>
                        </div>
                        <div class="report-info">
                            <h2>📦 USER ORDER DATA REPORT</h2>
                            <p>Generated: ${new Date().toLocaleString()}</p>
                            <p>Admin: novelexporters@gmail.com</p>
                        </div>
                    </div>
                    
                    <div class="meta">
                        <span><strong>Total Orders:</strong> ${orders.length}</span>
                        <span><strong>Pending:</strong> ${orders.filter(o => o.status === 'pending').length}</span>
                        <span><strong>Confirmed:</strong> ${orders.filter(o => o.status === 'confirmed').length}</span>
                        <span><strong>Rejected:</strong> ${orders.filter(o => o.status === 'rejected').length}</span>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 12%">Order ID</th>
                                <th style="width: 18%">User Name</th>
                                <th style="width: 12%">Phone No</th>
                                <th style="width: 20%">Products</th>
                                <th style="width: 20%">Special Instructions</th>
                                <th style="width: 10%">Status</th>
                                <th style="width: 8%">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td class="order-id">#${order._id.slice(-8).toUpperCase()}</td>
                                    <td>
                                        <div class="user-name">${order.user?.username || 'N/A'}</div>
                                        <div class="user-email">${order.user?.email || ''}</div>
                                    </td>
                                    <td class="phone">${order.user?.phone || 'Not provided'}</td>
                                    <td class="products">${order.products.map((p: any) => `${p.name} (${p.quantity} ${p.unit || 'kg'})`).join(', ')}</td>
                                    <td class="instructions">${order.delivery_request || 'No special instructions'}</td>
                                    <td><span class="status status-${order.status}">${order.status}</span></td>
                                    <td>${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p><strong>© 2026 Novel Exporters</strong> | International Trading Excellence</p>
                        <p>📧 novelexporters@gmail.com | 📞 +91 80128 04316</p>
                        <p>This document is confidential and intended for internal use only.</p>
                    </div>
                    <div class="watermark">Novel Exporters - Confidential</div>
                </body>
                </html>
            `;

            // Create a new window and print to PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(reportContent);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                }, 300);
            }

            toast.success("📄 Order data PDF generated! Use Print dialog to save as PDF.");
        } catch (err) {
            toast.error("Failed to generate PDF report");
        }
    };

    const generatePDFReport = () => {
        try {
            // Create HTML content for PDF
            const reportContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Novel Exporters - Export Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                        h1 { color: #0c4a6e; border-bottom: 3px solid #fbbf24; padding-bottom: 10px; }
                        h2 { color: #475569; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th { background: #0c4a6e; color: white; padding: 12px; text-align: left; }
                        td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
                        tr:hover { background: #f8fafc; }
                        .stats { display: flex; gap: 20px; margin: 20px 0; }
                        .stat-card { flex: 1; padding: 20px; background: #f1f5f9; border-radius: 8px; }
                        .stat-value { font-size: 32px; font-weight: bold; color: #0c4a6e; }
                        .stat-label { color: #64748b; font-size: 14px; text-transform: uppercase; }
                        .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <h1>📊 Novel Exporters - Export Report</h1>
                    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Report Type:</strong> Comprehensive Export Operations Summary</p>
                    
                    <h2>📈 Key Metrics</h2>
                    <div class="stats">
                        <div class="stat-card">
                            <div class="stat-value">${orders.length}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${enquiries.length}</div>
                            <div class="stat-label">Enquiries</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${users.length}</div>
                            <div class="stat-label">Registered Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Object.values(analytics?.productStats || {}).reduce((a: any, b: any) => a + b, 0)}</div>
                            <div class="stat-label">Total Units</div>
                        </div>
                    </div>

                    <h2>📦 Orders Summary</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Products</th>
                                <th>Delivery Date</th>
                                <th>Instructions</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td>#${order._id.slice(-6).toUpperCase()}</td>
                                    <td>${order.user?.username || 'N/A'}</td>
                                    <td>${order.user?.email || 'N/A'}</td>
                                    <td>${order.user?.phone || 'N/A'}</td>
                                    <td>${order.products.map((p: any) => `${p.name} (${p.quantity} ${p.unit || 'kg'})`).join(', ')}</td>
                                    <td>${order.requested_delivery_date ? new Date(order.requested_delivery_date).toLocaleDateString() : 'Flexible'}</td>
                                    <td>${order.delivery_request || 'None'}</td>
                                    <td><strong>${order.status.toUpperCase()}</strong></td>
                                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <h2>📧 Enquiries Summary</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Message</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${enquiries.map(enq => `
                                <tr>
                                    <td>${enq.username}</td>
                                    <td>${enq.email}</td>
                                    <td>${enq.message.substring(0, 100)}...</td>
                                    <td>${new Date(enq.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <h2>👥 Users Summary</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr>
                                    <td>${u.username}</td>
                                    <td>${u.email}</td>
                                    <td>${u.phone || 'N/A'}</td>
                                    <td><strong>${u.role.toUpperCase()}</strong></td>
                                    <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <h2>📊 Product Analytics</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Total Units Ordered</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${analytics?.productStats ? Object.entries(analytics.productStats)
                    .sort((a: any, b: any) => b[1] - a[1])
                    .map(([name, qty]: any) => `
                                    <tr>
                                        <td>${name}</td>
                                        <td><strong>${qty} units</strong></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="2">No data available</td></tr>'}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>© 2026 Novel Exporters | International Trading Excellence</p>
                        <p>This report is confidential and intended for internal use only.</p>
                    </div>
                </body>
                </html>
            `;

            // Create a new window and print to PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(reportContent);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }

            toast.success("PDF report generated successfully");
        } catch (err) {
            toast.error("Failed to generate PDF report");
        }
    };

    // Show loading while authenticating or fetching data
    if (authLoading || isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    // Don't render if not admin
    if (!user || user.role !== "admin") {
        return null;
    }

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
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button variant="outline" onClick={fetchData} className="rounded-xl">Refresh Data</Button>
                        <Button variant="outline" onClick={downloadOrdersPDF} className="rounded-xl border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20">
                            <Download className="w-4 h-4 mr-2" />
                            Download Orders PDF
                        </Button>
                        <Button variant="warm" onClick={generatePDFReport} className="rounded-xl shadow-lg shadow-primary/20">Generate Export Report</Button>
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
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <input className="pl-10 pr-4 py-2 rounded-xl bg-muted/50 border-none text-sm w-64" placeholder="Search orders..." />
                                        </div>
                                        <Button variant="outline" onClick={downloadOrdersPDF} className="rounded-xl text-xs">
                                            <Download className="w-4 h-4 mr-1" /> Export PDF
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order._id} className="p-6 rounded-2xl bg-muted/20 border border-border hover:border-primary/20 transition-all">
                                            {/* Order Header */}
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                        <Package className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-foreground">Order #{order._id.slice(-8).toUpperCase()}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${
                                                    order.status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    order.status === 'approved' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    order.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    order.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            {/* Customer & Order Info */}
                                            <div className="grid md:grid-cols-3 gap-6 mb-6">
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Customer</h4>
                                                    <p className="font-semibold text-foreground">{order.user?.username || 'N/A'}</p>
                                                    <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                                                    <p className="text-sm text-primary font-medium">{order.user?.phone || 'No phone'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Products</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.products.map((p: any, i: number) => (
                                                            <span key={i} className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-medium">
                                                                {p.name} ({p.quantity} {p.unit || 'kg'})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Special Instructions</h4>
                                                    <p className="text-sm text-foreground/80 italic">
                                                        {order.delivery_request || 'No special instructions'}
                                                    </p>
                                                    {order.requested_delivery_date && (
                                                        <p className="text-xs text-spice-gold font-bold">📅 Requested: {new Date(order.requested_delivery_date).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Admin Notes Display */}
                                            {order.admin_notes && (
                                                <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                                    <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">Previous Admin Notes:</p>
                                                    <p className="text-sm text-green-600 dark:text-green-300">{order.admin_notes}</p>
                                                </div>
                                            )}

                                            {/* Pricing & Timeline Section */}
                                            {editingOrder === order._id ? (
                                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 mb-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                                        <h4 className="font-bold text-blue-700 dark:text-blue-400">Provide Pricing & Timeline</h4>
                                                    </div>
                                                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Pricing (₹/USD)</label>
                                                            <Input
                                                                placeholder="e.g., ₹50,000 or $600"
                                                                value={pricingData[order._id]?.pricing || ''}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], pricing: e.target.value }
                                                                }))}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Delivery Timeline</label>
                                                            <Input
                                                                placeholder="e.g., 15-20 days"
                                                                value={pricingData[order._id]?.timeline || ''}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], timeline: e.target.value }
                                                                }))}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Additional Notes</label>
                                                            <Input
                                                                placeholder="Any additional info..."
                                                                value={pricingData[order._id]?.notes || ''}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], notes: e.target.value }
                                                                }))}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => updateOrderWithPricingTimeline(order._id, 'confirmed')}
                                                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-1" /> Confirm with Quote
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => setEditingOrder(null)}
                                                            className="rounded-lg"
                                                        >
                                                            <X className="w-4 h-4 mr-1" /> Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : null}

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                                                <span className="text-xs font-bold text-muted-foreground mr-2">Update Status:</span>
                                                <Button
                                                    size="sm"
                                                    variant={order.status === 'pending' ? 'default' : 'outline'}
                                                    onClick={() => updateStatus(order._id, 'pending')}
                                                    className="rounded-lg text-xs h-8"
                                                >
                                                    <Clock className="w-3 h-3 mr-1" /> Pending
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={order.status === 'confirmed' ? 'default' : 'outline'}
                                                    onClick={() => setEditingOrder(order._id)}
                                                    className="rounded-lg text-xs h-8 bg-green-600 hover:bg-green-700 text-white border-green-600"
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm + Quote
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={order.status === 'rejected' ? 'default' : 'outline'}
                                                    onClick={() => updateStatus(order._id, 'rejected')}
                                                    className="rounded-lg text-xs h-8 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                >
                                                    <AlertCircle className="w-3 h-3 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
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
