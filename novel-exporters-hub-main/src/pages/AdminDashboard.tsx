import { useState, useEffect } from "react";
import {
    Users, Package, TrendingUp, Mail,
    BarChart3, Calendar, Search,
    Filter, MoreHorizontal, CheckCircle2,
    Clock, AlertCircle, ShoppingCart, Download,
    DollarSign, FileText, X, Pencil
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
    const [searchQuery, setSearchQuery] = useState("");
    const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "pending" | "confirmed" | "rejected">("all");
    const [users, setUsers] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [editingOrder, setEditingOrder] = useState<string | null>(null);
    const [editingPrices, setEditingPrices] = useState<string | null>(null); // For editing prices after confirmation
    const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
    const [pricingData, setPricingData] = useState<{[key: string]: { 
        productPrices: {[productIndex: number]: number}; 
        currency: string; 
        deliveryDate: string; 
        deliveryLocation: string;
        notes: string;
        shippingCharges: number;
    }}>({});
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

    const fetchData = async (showRefreshState = false) => {
        if (showRefreshState) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }
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
            if (showRefreshState) {
                toast.success("Data refreshed");
            }
        } catch (err) {
            toast.error("Failed to load admin data");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchData(true);
    };

    const updateStatus = async (orderId: string, status: string, customNotes?: string, deliveryDate?: string) => {
        // Optimistic UI update - immediately update the order in state
        setOrders(prev => prev.map(order => 
            order._id === orderId 
                ? { ...order, status, admin_notes: customNotes || order.admin_notes }
                : order
        ));
        setEditingOrder(null);
        toast.success(`Order set to ${status}`);
        
        // Mark as processing
        setProcessingOrders(prev => new Set(prev).add(orderId));
        
        try {
            const notes = customNotes || `Status updated to ${status} by admin on ${new Date().toLocaleDateString()}`;
            await api.updateOrderStatus(orderId, status, notes, deliveryDate);
            // Background refresh to sync with server (non-blocking)
            fetchData();
        } catch (err) {
            // Revert on error
            toast.error("Update failed - reverting changes");
            fetchData();
        } finally {
            setProcessingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    const updateOrderWithPricingTimeline = async (orderId: string, status: string) => {
        const data = pricingData[orderId];
        const order = orders.find(o => o._id === orderId);
        if (!data || !order) {
            toast.error("Please fill in pricing and delivery date details");
            return;
        }
        if (!data.deliveryDate) {
            toast.error("Please select an estimated delivery date");
            return;
        }
        
        // Check if at least one product has a price
        const hasAnyPrice = Object.values(data.productPrices || {}).some(price => price > 0);
        if (!hasAnyPrice) {
            toast.error("Please set price for at least one product");
            return;
        }

        const currencySymbols: {[key: string]: string} = {
            'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ',
            'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'
        };
        const symbol = currencySymbols[data.currency || 'INR'] || '';
        
        // Calculate total from individual product prices + shipping
        let productsTotal = 0;
        const products = order.products.map((p: any, index: number) => {
            const unitPrice = data.productPrices?.[index] || 0;
            const totalPrice = unitPrice * p.quantity;
            productsTotal += totalPrice;
            return { unit_price: unitPrice };
        });
        const totalAmount = productsTotal + (data.shippingCharges || 0);

        const formattedDate = new Date(data.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        const shippingNote = data.shippingCharges ? ` + Shipping: ${symbol}${data.shippingCharges.toLocaleString()}` : '';
        const notes = `Total: ${symbol}${totalAmount.toLocaleString()} ${data.currency || 'INR'}${shippingNote} | Estimated Delivery: ${formattedDate} | Notes: ${data.notes || 'None'}`;
        
        // First update pricing (including shipping charges)
        await api.updateOrderPricing(orderId, products, data.currency || 'INR', data.notes, data.shippingCharges || 0, data.deliveryLocation);
        
        // Then update status
        await updateStatus(orderId, status, notes, data.deliveryDate);
        setPricingData(prev => {
            const updated = { ...prev };
            delete updated[orderId];
            return updated;
        });
    };

    // Update prices for already confirmed orders
    const updateExistingOrderPrices = async (orderId: string) => {
        const data = pricingData[orderId];
        const order = orders.find(o => o._id === orderId);
        if (!data || !order) {
            toast.error("Please fill in pricing details");
            return;
        }

        setProcessingOrders(prev => new Set(prev).add(orderId));
        
        try {
            const products = order.products.map((p: any, index: number) => {
                const unitPrice = data.productPrices?.[index] || p.unit_price || 0;
                return { unit_price: unitPrice };
            });

            await api.updateOrderPricing(orderId, products, data.currency || order.currency || 'INR', data.notes, data.shippingCharges || 0, data.deliveryLocation);
            toast.success("Prices updated successfully & user notified via email");
            setEditingPrices(null);
            setPricingData(prev => {
                const updated = { ...prev };
                delete updated[orderId];
                return updated;
            });
            fetchData();
        } catch (err) {
            toast.error("Failed to update prices");
        } finally {
            setProcessingOrders(prev => {
                const newSet = new Set(prev);
                newSet.delete(orderId);
                return newSet;
            });
        }
    };

    // Initialize pricing data when editing an order
    const startEditingOrder = (order: any) => {
        setEditingOrder(order._id);
        // Pre-fill with existing prices if available
        const productPrices: {[key: number]: number} = {};
        order.products.forEach((p: any, index: number) => {
            productPrices[index] = p.unit_price || 0;
        });
        setPricingData(prev => ({
            ...prev,
            [order._id]: {
                productPrices,
                currency: order.currency || 'INR',
                deliveryDate: order.estimated_delivery_date ? new Date(order.estimated_delivery_date).toISOString().split('T')[0] : '',
                deliveryLocation: order.delivery_location || '',
                notes: '',
                shippingCharges: order.shipping_charges || 0
            }
        }));
    };

    // Initialize for price update on confirmed orders
    const startEditingPrices = (order: any) => {
        setEditingPrices(order._id);
        const productPrices: {[key: number]: number} = {};
        order.products.forEach((p: any, index: number) => {
            productPrices[index] = p.unit_price || 0;
        });
        setPricingData(prev => ({
            ...prev,
            [order._id]: {
                productPrices,
                currency: order.currency || 'INR',
                deliveryDate: order.estimated_delivery_date ? new Date(order.estimated_delivery_date).toISOString().split('T')[0] : '',
                deliveryLocation: order.delivery_location || '',
                notes: '',
                shippingCharges: order.shipping_charges || 0
            }
        }));
    };

    // Calculate total for display (including shipping)
    const calculateTotal = (orderId: string, order: any) => {
        const data = pricingData[orderId];
        if (!data?.productPrices) return 0;
        const productsTotal = order.products.reduce((sum: number, p: any, index: number) => {
            return sum + (data.productPrices[index] || 0) * p.quantity;
        }, 0);
        return productsTotal + (data.shippingCharges || 0);
    };

    // Calculate products total only (without shipping)
    const calculateProductsTotal = (orderId: string, order: any) => {
        const data = pricingData[orderId];
        if (!data?.productPrices) return 0;
        return order.products.reduce((sum: number, p: any, index: number) => {
            return sum + (data.productPrices[index] || 0) * p.quantity;
        }, 0);
    };

    // Download Order Data as PDF with Company Logo
    const downloadOrdersPDF = async () => {
        setIsDownloading(true);
        toast.success("Generating PDF...");
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
        } finally {
            setIsDownloading(false);
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
                        <Button 
                            variant="warm" 
                            onClick={handleRefresh} 
                            disabled={isRefreshing}
                            className="rounded-xl shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {isRefreshing ? (
                                <><span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" /> Refreshing...</>
                            ) : (
                                'Refresh Data'
                            )}
                        </Button>
                        <Button 
                            variant="warm" 
                            onClick={downloadOrdersPDF} 
                            disabled={isDownloading}
                            className="rounded-xl shadow-lg shadow-primary/20 disabled:opacity-70"
                        >
                            {isDownloading ? (
                                <><span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                            ) : (
                                <><Download className="w-4 h-4 mr-2" /> Download Orders PDF</>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Active Requests", value: orders.length, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "New Enquiries", value: enquiries.length, icon: Mail, color: "text-green-500", bg: "bg-green-500/10" },
                        { label: "Partner Interest", value: new Set(orders.map((o: any) => o.user?._id || o.user)).size, icon: TrendingUp, color: "text-spice-gold", bg: "bg-spice-gold/10" },
                        { label: "Managed Items", value: Object.keys(analytics?.productStats || {}).length, icon: ShoppingCart, color: "text-indigo-500", bg: "bg-indigo-500/10" }
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
                                            {orders.length === 0 ? (
                                                <div className="p-8 rounded-2xl bg-muted/30 border border-border text-center">
                                                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                                    <p className="text-sm font-medium text-muted-foreground">No orders yet</p>
                                                    <p className="text-xs text-muted-foreground/70 mt-1">Quote requests will appear here</p>
                                                </div>
                                            ) : (
                                                orders.slice(0, 5).map((order) => (
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
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-indigo-500" />
                                            Market Intelligence
                                        </h3>
                                        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 h-64 flex flex-col justify-center">
                                            {analytics?.productStats && Object.keys(analytics.productStats).length > 0 ? (
                                                <>
                                                    <p className="text-sm text-muted-foreground mb-4">Total product-level interest across all carts and orders:</p>
                                                    <div className="space-y-4 overflow-y-auto max-h-40 pr-2 custom-scrollbar">
                                                        {(() => {
                                                            const entries = Object.entries(analytics.productStats).sort((a: any, b: any) => b[1] - a[1]);
                                                            const maxQty = entries.length > 0 ? Math.max(...entries.map(([, qty]: any) => qty)) : 1;
                                                            return entries.map(([name, qty]: any) => (
                                                                <div key={name} className="space-y-1">
                                                                    <div className="flex justify-between text-xs font-bold">
                                                                        <span>{name}</span>
                                                                        <span>{qty >= 1000 ? `${(qty / 1000).toFixed(1)} kg` : `${qty} g`}</span>
                                                                    </div>
                                                                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                                                        <div
                                                                            className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                                                                            style={{ width: `${(qty / maxQty) * 100}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ));
                                                        })()}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center">
                                                    <BarChart3 className="w-12 h-12 text-indigo-500/30 mx-auto mb-3" />
                                                    <p className="text-sm font-medium text-muted-foreground">No product data yet</p>
                                                    <p className="text-xs text-muted-foreground/70 mt-1">Product interest analytics will appear here</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <motion.div key="ord" className="p-8 h-full">
                                <div className="flex flex-col gap-4 mb-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold font-serif">Manage Orders</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input 
                                                    className="pl-10 pr-4 py-2 rounded-xl bg-muted/50 border-none text-sm w-64" 
                                                    placeholder="Search orders..." 
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                            <Button 
                                                variant="warm" 
                                                onClick={downloadOrdersPDF} 
                                                disabled={isDownloading}
                                                className="rounded-xl text-xs shadow-lg shadow-primary/20 disabled:opacity-70"
                                            >
                                                {isDownloading ? (
                                                    <><span className="w-3 h-3 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                                                ) : (
                                                    <><Download className="w-4 h-4 mr-1" /> Export PDF</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Status Filter Tabs */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground mr-2">Filter:</span>
                                        {[
                                            { key: "all", label: "All Orders", count: orders.length },
                                            { key: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
                                            { key: "confirmed", label: "Confirmed", count: orders.filter(o => o.status === "confirmed").length },
                                            { key: "rejected", label: "Rejected", count: orders.filter(o => o.status === "rejected").length }
                                        ].map((filter) => (
                                            <button
                                                key={filter.key}
                                                onClick={() => setOrderStatusFilter(filter.key as any)}
                                                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                    orderStatusFilter === filter.key
                                                        ? filter.key === "pending" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                                                        : filter.key === "confirmed" ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                                                        : filter.key === "rejected" ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                                                        : "bg-primary text-white shadow-lg shadow-primary/30"
                                                        : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                                }`}
                                            >
                                                {filter.label} ({filter.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {(() => {
                                        const filteredOrders = orders.filter((order) => {
                                            // Status filter
                                            if (orderStatusFilter !== "all" && order.status !== orderStatusFilter) return false;
                                            // Search filter
                                            if (!searchQuery.trim()) return true;
                                            const query = searchQuery.toLowerCase();
                                            const orderId = order._id?.toLowerCase() || '';
                                            const customerName = order.user?.username?.toLowerCase() || '';
                                            const customerEmail = order.user?.email?.toLowerCase() || '';
                                            const customerPhone = order.user?.phone?.toLowerCase() || '';
                                            const productNames = order.products?.map((p: any) => p.name?.toLowerCase()).join(' ') || '';
                                            const status = order.status?.toLowerCase() || '';
                                            return orderId.includes(query) || 
                                                   customerName.includes(query) || 
                                                   customerEmail.includes(query) || 
                                                   customerPhone.includes(query) || 
                                                   productNames.includes(query) ||
                                                   status.includes(query);
                                        });
                                        
                                        if (filteredOrders.length === 0) {
                                            return (
                                                <div className="py-20 text-center">
                                                    <Package className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                                                    <h3 className="text-xl font-bold text-muted-foreground mb-2">
                                                        {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground/70">
                                                        {orders.length === 0 
                                                            ? 'When customers place orders, they will appear here for you to manage.' 
                                                            : 'Try adjusting your search or filter criteria.'}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        
                                        return filteredOrders.map((order) => (
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
                                            <div className="grid md:grid-cols-4 gap-4 mb-6">
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                                    <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Customer</h4>
                                                    <p className="font-bold text-foreground text-sm">{order.user?.username || 'N/A'}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{order.user?.email}</p>
                                                    <p className="text-xs text-primary font-medium mt-1">{order.user?.phone || 'No phone'}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                                    <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Products ({order.products.length})</h4>
                                                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                                                        {order.products.map((p: any, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                                                                {p.name} <span className="text-primary">×{p.quantity}{p.unit || 'kg'}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                                    <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Delivery Location</h4>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {order.delivery_location || <span className="text-muted-foreground italic">Not specified</span>}
                                                    </p>
                                                    {order.requested_delivery_date && (
                                                        <p className="text-[10px] text-spice-gold font-bold mt-2">📅 Requested: {new Date(order.requested_delivery_date).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                                    <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2">Instructions</h4>
                                                    <p className="text-xs text-foreground/80 italic line-clamp-3">
                                                        {order.delivery_request || 'No special instructions'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Admin Notes Display */}
                                            {order.admin_notes && (
                                                <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                                    <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">Previous Admin Notes:</p>
                                                    <p className="text-sm text-green-600 dark:text-green-300">{order.admin_notes}</p>
                                                </div>
                                            )}

                                            {/* History Sections - Two Column Layout */}
                                            {((order.modification_history && order.modification_history.length > 0) || (order.price_update_history && order.price_update_history.length > 0)) && (
                                                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                                                    {/* User Modification History - Left Column */}
                                                    <div className="rounded-xl border border-orange-200 dark:border-orange-800/50 overflow-hidden bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10">
                                                        <div className="px-4 py-2.5 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/30 border-b border-orange-200 dark:border-orange-800/50">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
                                                                    <FileText className="w-3.5 h-3.5" /> User Modifications
                                                                </p>
                                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-200 dark:bg-orange-800/50 text-orange-700 dark:text-orange-300">
                                                                    {order.modification_history?.length || 0} changes
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="max-h-64 overflow-y-auto">
                                                            {order.modification_history && order.modification_history.length > 0 ? (
                                                                order.modification_history.slice().reverse().map((mod: any, idx: number) => (
                                                                    <div key={idx} className="px-4 py-3 border-b border-orange-100 dark:border-orange-900/30 last:border-b-0 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors">
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            {idx === 0 && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-orange-500 text-white">Latest</span>}
                                                                            <span className="text-[10px] text-muted-foreground">
                                                                                {new Date(mod.modified_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} • {new Date(mod.modified_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                            </span>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-[9px] font-bold text-red-500 uppercase mt-0.5 w-12 flex-shrink-0">Before</span>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {mod.previous_products?.map((p: any, i: number) => (
                                                                                        <span key={i} className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-medium">
                                                                                            {p.name} ×{p.quantity}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-start gap-2">
                                                                                <span className="text-[9px] font-bold text-green-500 uppercase mt-0.5 w-12 flex-shrink-0">After</span>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {mod.new_products?.map((p: any, i: number) => (
                                                                                        <span key={i} className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-medium">
                                                                                            {p.name} ×{p.quantity}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                                                                    No modifications yet
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Price Update History - Right Column */}
                                                    <div className="rounded-xl border border-purple-200 dark:border-purple-800/50 overflow-hidden bg-gradient-to-br from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/10">
                                                        <div className="px-4 py-2.5 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/40 dark:to-indigo-900/30 border-b border-purple-200 dark:border-purple-800/50">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-2">
                                                                    <Clock className="w-3.5 h-3.5" /> Price Updates
                                                                </p>
                                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300">
                                                                    {order.price_update_history?.length || 0} updates
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="max-h-64 overflow-y-auto">
                                                            {order.price_update_history && order.price_update_history.length > 0 ? (
                                                                order.price_update_history.slice().reverse().map((update: any, idx: number) => {
                                                                    const currencySymbols: {[key: string]: string} = {
                                                                        'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ',
                                                                        'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'
                                                                    };
                                                                    const symbol = currencySymbols[update.currency] || '';
                                                                    const isLatest = idx === 0;
                                                                    return (
                                                                        <div key={idx} className={`px-4 py-3 border-b border-purple-100 dark:border-purple-900/30 last:border-b-0 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors ${isLatest ? 'bg-white/50 dark:bg-white/5' : ''}`}>
                                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                                <div className="flex items-center gap-2">
                                                                                    {isLatest && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-purple-500 text-white">Latest</span>}
                                                                                    <span className="text-[10px] text-muted-foreground">
                                                                                        {new Date(update.updated_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })} • {new Date(update.updated_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                                                    </span>
                                                                                </div>
                                                                                <span className="text-sm font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
                                                                                    {symbol}{update.total_amount?.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex flex-wrap gap-1">
                                                                                {update.products?.map((p: any, i: number) => (
                                                                                    <span key={i} className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-black/20 text-[10px] font-medium border border-purple-200/50 dark:border-purple-700/30">
                                                                                        {p.name}: <span className="text-purple-600 dark:text-purple-400">{symbol}{p.unit_price?.toLocaleString()}/{p.unit}</span>
                                                                                    </span>
                                                                                ))}
                                                                                {update.shipping_charges > 0 && (
                                                                                    <span className="px-1.5 py-0.5 rounded bg-amber-100/80 dark:bg-amber-900/30 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                                                                        🚚 {symbol}{update.shipping_charges?.toLocaleString()}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {update.notes && (
                                                                                <p className="text-[10px] text-muted-foreground italic mt-2 pl-2 border-l-2 border-purple-300 dark:border-purple-700">"{update.notes}"</p>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                                                                    No price updates yet
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Pricing & Timeline Section */}
                                            {editingOrder === order._id ? (
                                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 mb-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <DollarSign className="w-5 h-5 text-blue-600" />
                                                        <h4 className="font-bold text-blue-700 dark:text-blue-400">Set Individual Product Prices</h4>
                                                    </div>
                                                    
                                                    {/* Currency, Delivery Location, and Delivery Date Row */}
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Currency</label>
                                                            <select
                                                                value={pricingData[order._id]?.currency || 'INR'}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], currency: e.target.value }
                                                                }))}
                                                                className="w-full h-10 px-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                            >
                                                                <option value="INR">₹ INR</option>
                                                                <option value="USD">$ USD</option>
                                                                <option value="EUR">€ EUR</option>
                                                                <option value="GBP">£ GBP</option>
                                                                <option value="AED">AED</option>
                                                                <option value="SAR">SAR</option>
                                                                <option value="AUD">A$ AUD</option>
                                                                <option value="CAD">C$ CAD</option>
                                                                <option value="SGD">S$ SGD</option>
                                                                <option value="JPY">¥ JPY</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Delivery Location</label>
                                                            <Input
                                                                placeholder="City, Country"
                                                                value={pricingData[order._id]?.deliveryLocation || order.delivery_location || ''}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], deliveryLocation: e.target.value }
                                                                }))}
                                                                className="h-10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Estimated Delivery</label>
                                                            <input
                                                                type="date"
                                                                min={new Date().toISOString().split('T')[0]}
                                                                value={pricingData[order._id]?.deliveryDate || ''}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], deliveryDate: e.target.value }
                                                                }))}
                                                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                                            />
                                                            <p className="text-[10px] text-muted-foreground mt-1">⚠️ Reminder 1 day before</p>
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

                                                    {/* Individual Product Pricing */}
                                                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 mb-4 border border-border">
                                                        <h5 className="text-xs font-bold uppercase text-muted-foreground mb-3">Product Pricing (per unit)</h5>
                                                        <div className="space-y-3">
                                                            {order.products.map((p: any, index: number) => {
                                                                const unitPrice = pricingData[order._id]?.productPrices?.[index] || 0;
                                                                const totalPrice = unitPrice * p.quantity;
                                                                const currencySymbol = {'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[pricingData[order._id]?.currency || 'INR'] || '₹';
                                                                return (
                                                                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-sm">{p.name}</p>
                                                                            <p className="text-xs text-muted-foreground">Qty: {p.quantity} {p.unit || 'kg'}</p>
                                                                        </div>
                                                                        <div className="w-32">
                                                                            <label className="text-[10px] text-muted-foreground">Price/unit</label>
                                                                            <Input
                                                                                type="number"
                                                                                placeholder="0"
                                                                                value={unitPrice || ''}
                                                                                onChange={(e) => setPricingData(prev => ({
                                                                                    ...prev,
                                                                                    [order._id]: {
                                                                                        ...prev[order._id],
                                                                                        productPrices: {
                                                                                            ...prev[order._id]?.productPrices,
                                                                                            [index]: parseFloat(e.target.value) || 0
                                                                                        }
                                                                                    }
                                                                                }))}
                                                                                className="rounded-lg h-8 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="w-28 text-right">
                                                                            <label className="text-[10px] text-muted-foreground">Total</label>
                                                                            <p className="font-bold text-green-600">{currencySymbol}{totalPrice.toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Shipping Charges */}
                                                        <div className="mt-4 pt-4 border-t border-border">
                                                            <div className="flex items-center gap-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-sm flex items-center gap-2">
                                                                        🚢 Shipping Charges
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">Air/Sea freight charges</p>
                                                                </div>
                                                                <div className="w-40">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        value={pricingData[order._id]?.shippingCharges || ''}
                                                                        onChange={(e) => setPricingData(prev => ({
                                                                            ...prev,
                                                                            [order._id]: {
                                                                                ...prev[order._id],
                                                                                shippingCharges: parseFloat(e.target.value) || 0
                                                                            }
                                                                        }))}
                                                                        className="rounded-lg h-8 text-sm"
                                                                    />
                                                                </div>
                                                                <div className="w-28 text-right">
                                                                    <p className="font-bold text-amber-600">
                                                                        {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[pricingData[order._id]?.currency || 'INR'] || '₹'}
                                                                        {(pricingData[order._id]?.shippingCharges || 0).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Subtotal and Grand Total */}
                                                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                                <span>Products Subtotal:</span>
                                                                <span>
                                                                    {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[pricingData[order._id]?.currency || 'INR'] || '₹'}
                                                                    {calculateProductsTotal(order._id, order).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {(pricingData[order._id]?.shippingCharges || 0) > 0 && (
                                                                <div className="flex justify-between items-center text-sm text-amber-600">
                                                                    <span>Shipping:</span>
                                                                    <span>
                                                                        +{{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[pricingData[order._id]?.currency || 'INR'] || '₹'}
                                                                        {(pricingData[order._id]?.shippingCharges || 0).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center pt-2 border-t border-border">
                                                                <span className="font-bold text-lg">Grand Total:</span>
                                                                <span className="font-bold text-xl text-green-600">
                                                                    {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ', 'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'}[pricingData[order._id]?.currency || 'INR'] || '₹'}
                                                                    {calculateTotal(order._id, order).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => updateOrderWithPricingTimeline(order._id, 'confirmed')}
                                                            disabled={processingOrders.has(order._id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                                                        >
                                                            {processingOrders.has(order._id) ? (
                                                                <><span className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                                                            ) : (
                                                                <><CheckCircle2 className="w-4 h-4 mr-1" /> Confirm with Quote</>
                                                            )}
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

                                            {/* Price Update Section for Confirmed Orders */}
                                            {order.status === 'confirmed' && editingPrices === order._id && (
                                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <DollarSign className="w-5 h-5 text-amber-600" />
                                                        <h4 className="font-bold text-amber-700 dark:text-amber-400">Update Prices (Market Value Change)</h4>
                                                    </div>
                                                    
                                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Currency</label>
                                                            <select
                                                                value={pricingData[order._id]?.currency || order.currency || 'INR'}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], currency: e.target.value }
                                                                }))}
                                                                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                                                            >
                                                                <option value="INR">₹ INR</option>
                                                                <option value="USD">$ USD</option>
                                                                <option value="EUR">€ EUR</option>
                                                                <option value="GBP">£ GBP</option>
                                                                <option value="AED">د.إ AED</option>
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-muted-foreground mb-1 block">Update Note (optional)</label>
                                                            <Input
                                                                placeholder="e.g., Market price adjustment"
                                                                value={pricingData[order._id]?.notes || ''}
                                                                onChange={(e) => setPricingData(prev => ({
                                                                    ...prev,
                                                                    [order._id]: { ...prev[order._id], notes: e.target.value }
                                                                }))}
                                                                className="rounded-lg"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 mb-4 border border-border">
                                                        <div className="space-y-3">
                                                            {order.products.map((p: any, index: number) => {
                                                                const unitPrice = pricingData[order._id]?.productPrices?.[index] ?? p.unit_price ?? 0;
                                                                const totalPrice = unitPrice * p.quantity;
                                                                const currencySymbol = {'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[pricingData[order._id]?.currency || order.currency || 'INR'] || '₹';
                                                                return (
                                                                    <div key={index} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-sm">{p.name}</p>
                                                                            <p className="text-xs text-muted-foreground">Qty: {p.quantity} {p.unit || 'kg'}</p>
                                                                        </div>
                                                                        <div className="w-32">
                                                                            <Input
                                                                                type="number"
                                                                                value={unitPrice || ''}
                                                                                onChange={(e) => setPricingData(prev => ({
                                                                                    ...prev,
                                                                                    [order._id]: {
                                                                                        ...prev[order._id],
                                                                                        productPrices: {
                                                                                            ...prev[order._id]?.productPrices,
                                                                                            [index]: parseFloat(e.target.value) || 0
                                                                                        }
                                                                                    }
                                                                                }))}
                                                                                className="rounded-lg h-8 text-sm"
                                                                            />
                                                                        </div>
                                                                        <div className="w-28 text-right">
                                                                            <p className="font-bold text-amber-600">{currencySymbol}{totalPrice.toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        {/* Shipping Charges for Update */}
                                                        <div className="mt-4 pt-4 border-t border-border">
                                                            <div className="flex items-center gap-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-sm flex items-center gap-2">
                                                                        🚢 Shipping Charges
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">Air/Sea freight charges</p>
                                                                </div>
                                                                <div className="w-40">
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="0"
                                                                        value={pricingData[order._id]?.shippingCharges || ''}
                                                                        onChange={(e) => setPricingData(prev => ({
                                                                            ...prev,
                                                                            [order._id]: {
                                                                                ...prev[order._id],
                                                                                shippingCharges: parseFloat(e.target.value) || 0
                                                                            }
                                                                        }))}
                                                                        className="rounded-lg h-8 text-sm"
                                                                    />
                                                                </div>
                                                                <div className="w-28 text-right">
                                                                    <p className="font-bold text-amber-600">
                                                                        {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[pricingData[order._id]?.currency || order.currency || 'INR'] || '₹'}
                                                                        {(pricingData[order._id]?.shippingCharges || 0).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Subtotal and Grand Total */}
                                                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                                <span>Products Subtotal:</span>
                                                                <span>
                                                                    {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[pricingData[order._id]?.currency || order.currency || 'INR'] || '₹'}
                                                                    {calculateProductsTotal(order._id, order).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {(pricingData[order._id]?.shippingCharges || 0) > 0 && (
                                                                <div className="flex justify-between items-center text-sm text-amber-600">
                                                                    <span>Shipping:</span>
                                                                    <span>
                                                                        +{{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[pricingData[order._id]?.currency || order.currency || 'INR'] || '₹'}
                                                                        {(pricingData[order._id]?.shippingCharges || 0).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between items-center pt-2 border-t border-border">
                                                                <span className="font-bold">New Total:</span>
                                                                <span className="font-bold text-xl text-amber-600">
                                                                    {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[pricingData[order._id]?.currency || order.currency || 'INR'] || '₹'}
                                                                    {calculateTotal(order._id, order).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => updateExistingOrderPrices(order._id)}
                                                            disabled={processingOrders.has(order._id)}
                                                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                                                        >
                                                            {processingOrders.has(order._id) ? 'Updating...' : 'Update Prices'}
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => setEditingPrices(null)}
                                                            className="rounded-lg"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Display Current Pricing for Confirmed Orders */}
                                            {order.status === 'confirmed' && order.total_amount && editingPrices !== order._id && (
                                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 mb-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                                                            <DollarSign className="w-4 h-4" /> Current Pricing
                                                        </h4>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => startEditingPrices(order)}
                                                            className="text-xs h-7 border-amber-300 text-amber-700 hover:bg-amber-50"
                                                        >
                                                            ✏️ Update Prices
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {order.products.map((p: any, i: number) => (
                                                            <div key={i} className="flex justify-between text-sm">
                                                                <span>{p.name} ({p.quantity} {p.unit || 'kg'})</span>
                                                                <span className="font-semibold">
                                                                    {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[order.currency || 'INR'] || '₹'}
                                                                    {(p.total_price || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {order.shipping_charges > 0 && (
                                                            <div className="flex justify-between text-sm text-amber-600">
                                                                <span>🚢 Shipping Charges</span>
                                                                <span className="font-semibold">
                                                                    {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[order.currency || 'INR'] || '₹'}
                                                                    {(order.shipping_charges || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="pt-2 border-t border-green-200 dark:border-green-800 flex justify-between font-bold">
                                                            <span>Total</span>
                                                            <span className="text-green-700 dark:text-green-400">
                                                                {{'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ'}[order.currency || 'INR'] || '₹'}
                                                                {(order.total_amount || 0).toLocaleString()} {order.currency || 'INR'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {order.price_updated_at && (
                                                        <p className="text-[10px] text-muted-foreground mt-2">Last updated: {new Date(order.price_updated_at).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
                                                <span className="text-xs font-bold text-muted-foreground mr-2">Update Status:</span>
                                                <Button
                                                    size="sm"
                                                    variant={order.status === 'pending' ? 'default' : 'outline'}
                                                    onClick={() => updateStatus(order._id, 'pending')}
                                                    disabled={processingOrders.has(order._id)}
                                                    className="rounded-lg text-xs h-8 disabled:opacity-50"
                                                >
                                                    <Clock className="w-3 h-3 mr-1" /> Pending
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={order.status === 'confirmed' ? 'default' : 'outline'}
                                                    onClick={() => startEditingOrder(order)}
                                                    disabled={processingOrders.has(order._id)}
                                                    className="rounded-lg text-xs h-8 bg-green-600 hover:bg-green-700 text-white border-green-600 disabled:opacity-50"
                                                >
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm + Quote
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startEditingPrices(order)}
                                                    disabled={processingOrders.has(order._id) || order.status !== 'confirmed'}
                                                    className="rounded-lg text-xs h-8 text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 disabled:opacity-50"
                                                >
                                                    <Pencil className="w-3 h-3 mr-1" /> Update
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={order.status === 'rejected' ? 'default' : 'outline'}
                                                    onClick={() => updateStatus(order._id, 'rejected')}
                                                    disabled={processingOrders.has(order._id)}
                                                    className="rounded-lg text-xs h-8 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50"
                                                >
                                                    <AlertCircle className="w-3 h-3 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ));
                                    })()}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "enquiries" && (
                            <motion.div key="enq" className="p-8">
                                {enquiries.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <Mail className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-muted-foreground mb-2">No enquiries so far</h3>
                                        <p className="text-sm text-muted-foreground/70">When customers submit enquiries through the contact form, they will appear here.</p>
                                    </div>
                                ) : (
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
                                )}
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

                        {activeTab === "intelligence" && (
                            <motion.div
                                key="intel"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold font-serif flex items-center gap-3">
                                        <BarChart3 className="w-6 h-6 text-indigo-500" />
                                        Market Intelligence
                                    </h3>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    {/* Product Demand Analysis */}
                                    <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                                        <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                                            Product Demand Analysis
                                        </h4>
                                        <p className="text-sm text-muted-foreground mb-6">Total product-level interest across all carts and orders:</p>
                                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                            {analytics?.productStats && (() => {
                                                const entries = Object.entries(analytics.productStats).sort((a: any, b: any) => b[1] - a[1]);
                                                const maxQty = entries.length > 0 ? Math.max(...entries.map(([, qty]: any) => qty)) : 1;
                                                return entries.map(([name, qty]: any) => (
                                                    <div key={name} className="space-y-2">
                                                        <div className="flex justify-between text-sm font-bold">
                                                            <span>{name}</span>
                                                            <span className="text-indigo-600">{qty >= 1000 ? `${(qty / 1000).toFixed(1)} kg` : `${qty} g`}</span>
                                                        </div>
                                                        <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                                                                style={{ width: `${(qty / maxQty) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                            {(!analytics?.productStats || Object.keys(analytics.productStats).length === 0) && (
                                                <p className="text-muted-foreground text-sm italic">No product data available yet.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Key Metrics */}
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10">
                                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Users className="w-5 h-5 text-green-500" />
                                                Partner Insights
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50">
                                                    <p className="text-3xl font-black text-green-600">{users.length}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Total Partners</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50">
                                                    <p className="text-3xl font-black text-green-600">{new Set(orders.map((o: any) => o.user?._id || o.user)).size}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Active Buyers</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-spice-gold/5 border border-spice-gold/10">
                                            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                                                <Package className="w-5 h-5 text-spice-gold" />
                                                Order Summary
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50">
                                                    <p className="text-3xl font-black text-spice-gold">{orders.length}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50">
                                                    <p className="text-3xl font-black text-spice-gold">{enquiries.length}</p>
                                                    <p className="text-xs text-muted-foreground font-medium">Enquiries</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
