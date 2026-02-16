const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const { getEmailHeader, getEmailFooter, getLogoAttachment } = require("../utils/emailTemplate");
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const ADMIN_EMAIL = "novelexporters@gmail.com";

// Create new Order (Quotation Request)
router.post("/", auth, async (req, res) => {
    const { products, delivery_request, requested_delivery_date, delivery_location } = req.body;

    if (!products || products.length === 0) {
        return res.status(400).json({ message: "No products selected" });
    }

    try {
        const user = await User.findById(req.user.id);

        const newOrder = new Order({
            user: req.user.id,
            products,
            delivery_request,
            requested_delivery_date,
            delivery_location,
            status: "pending"
        });

        await newOrder.save();

        // Send emails asynchronously (background)
        const emailPromise = Promise.all([
            // Notify Admin
            transporter.sendMail({
                from: `"Order Desk" <${process.env.EMAIL_USER}>`,
                to: ADMIN_EMAIL,
                subject: `NEW QUOTATION REQUEST: ${user.username}`,
                attachments: getLogoAttachment(),
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="padding: 30px;">
                            ${getEmailHeader()}
                            <h2 style="color: #d97706; margin-top: 0;">Quotation Required</h2>
                            <p><b>From:</b> ${user.username} (${user.email})</p>
                            <p><b>Phone:</b> ${user.phone || "Not provided"}</p>
                            <p><b>Requested Delivery:</b> ${requested_delivery_date ? new Date(requested_delivery_date).toLocaleDateString() : "Flexible"}</p>
                            <p><b>Delivery Location:</b> ${delivery_location || "Not specified"}</p>
                            <p><b>Delivery Note:</b> ${delivery_request || "Standard shipping"}</p>
                            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                <thead>
                                    <tr style="background: #228B22;">
                                        <th style="padding: 12px; border: 1px solid #ddd; color: white;">Product</th>
                                        <th style="padding: 12px; border: 1px solid #ddd; color: white;">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${products.map(p => `
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${p.name}</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${p.quantity} ${p.unit || 'kg'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            <p style="margin-top: 20px;">Please login to the Admin Dashboard to provide pricing and timeline.</p>
                            ${getEmailFooter()}
                        </div>
                    </div>
                `
            }),
            // Notify User
            transporter.sendMail({
                from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: "Quotation Request Received – Novel Exporters",
                attachments: getLogoAttachment(),
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="padding: 30px;">
                            ${getEmailHeader()}
                            <h3 style="color: #0f172a; margin-top: 0;">Hello ${user.username},</h3>
                            <p>Thank you for choosing <strong>Novel Exporters</strong>. We have received your request for a quotation on ${products.length} items.</p>
                            <p>Our export specialists are currently calculating the best possible pricing for your specific requirements, including quality certifications and optimized delivery timelines.</p>
                            
                            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #228B22;">
                                <h4 style="margin-top: 0; color: #475569;">Order ID: ${newOrder._id}</h4>
                                <p style="margin-bottom: 5px;"><strong>Items Requested:</strong></p>
                                <ul style="padding-left: 20px; margin: 10px 0;">
                                    ${products.map(p => `<li>${p.name} - ${p.quantity} ${p.unit || 'kg'}</li>`).join('')}
                                </ul>
                            </div>

                            <p>We will get back to you with the full commercial offer shortly.</p>
                            ${getEmailFooter()}
                        </div>
                    </div>
                `
            })
        ]).catch(err => console.error("❌ Email sending failed (background):", err));

        res.status(201).json({
            success: true,
            message: "✅ Quotation request submitted successfully! Check your email for confirmation.",
            orderId: newOrder._id,
            status: "pending",
            expectedResponse: "24-48 hours"
        });
    } catch (err) {
        console.error("❌ Error placing order:", err);
        res.status(500).json({
            success: false,
            message: "⚠️ Failed to submit quotation request. Please try again or contact support: novelexporters@gmail.com",
            error: err.message
        });
    }
});

// Download user's orders as PDF
router.get('/my-orders/pdf', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        const user = await User.findById(req.user.id);
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="order-history-${new Date().toISOString().split('T')[0]}.pdf"`);

        doc.pipe(res);

        // Logo path
        const logoPath = path.join(__dirname, '..', 'Novel-Exporters-logo.png');
        const logoExists = fs.existsSync(logoPath);

        // Helper function to draw page border
        const drawPageBorder = () => {
            doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
                .strokeColor('#0c4a6e')
                .lineWidth(2)
                .stroke();
        };

        // Helper function to draw footer at the bottom of current content
        const drawFooter = (yPosition) => {
            const footerY = Math.min(yPosition + 30, doc.page.height - 60);
            doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY)
                .strokeColor('#e2e8f0').lineWidth(1).stroke();
            doc.fontSize(8).fillColor('#94a3b8').font('Helvetica')
                .text('Novel Exporters | Premium Indian Spices | novelexporters@gmail.com | +91 80128 04316',
                    50, footerY + 10, { align: 'center', width: doc.page.width - 100 });
        };

        // Helper function to draw header with logo
        const drawHeader = () => {
            drawPageBorder();

            // Company Logo
            if (logoExists) {
                try {
                    doc.image(logoPath, 50, 35, { width: 100 });
                } catch (e) {
                    // Fallback to text if image fails
                    doc.fontSize(28).fillColor('#0c4a6e').font('Helvetica-Bold')
                        .text('NOVEL', 50, 40, { continued: true })
                        .fillColor('#22c55e').text(' EXPORTERS');
                }
            } else {
                doc.fontSize(28).fillColor('#0c4a6e').font('Helvetica-Bold')
                    .text('NOVEL', 50, 40, { continued: true })
                    .fillColor('#22c55e').text(' EXPORTERS');
            }

            doc.fontSize(10).fillColor('#64748b').font('Helvetica')
                .text('Premium Indian Spices | Global Export Excellence', 170, 55);

            doc.moveTo(50, 90).lineTo(doc.page.width - 50, 90)
                .strokeColor('#e2e8f0').lineWidth(1).stroke();

            // User info section
            doc.fontSize(11).fillColor('#334155').font('Helvetica-Bold')
                .text('Customer:', 50, 105);
            doc.fontSize(11).fillColor('#000').font('Helvetica')
                .text(user?.username || 'N/A', 120, 105);

            doc.fontSize(11).fillColor('#334155').font('Helvetica-Bold')
                .text('Email:', 300, 105);
            doc.fontSize(11).fillColor('#000').font('Helvetica')
                .text(user?.email || 'N/A', 340, 105);

            doc.fontSize(11).fillColor('#334155').font('Helvetica-Bold')
                .text('Phone:', 50, 122);
            doc.fontSize(11).fillColor('#000').font('Helvetica')
                .text(user?.phone || 'N/A', 120, 122);

            doc.fontSize(11).fillColor('#334155').font('Helvetica-Bold')
                .text('Generated:', 300, 122);
            doc.fontSize(11).fillColor('#000').font('Helvetica')
                .text(new Date().toLocaleDateString(), 370, 122);

            doc.moveTo(50, 145).lineTo(doc.page.width - 50, 145)
                .strokeColor('#e2e8f0').lineWidth(1).stroke();

            return 160; // Return Y position after header
        };

        if (orders.length === 0) {
            drawHeader();
            doc.fontSize(14).fillColor('#64748b').text('No orders found for this account.', 50, 180, { align: 'center' });
            drawFooter(210);
            doc.end();
            return;
        }

        orders.forEach((order, idx) => {
            if (idx > 0) doc.addPage();

            let yPos = drawHeader();
            const orderId = order._id.toString();

            // Order Header Box
            doc.rect(50, yPos, doc.page.width - 100, 35)
                .fillColor('#f1f5f9').fill();

            doc.fontSize(14).fillColor('#0c4a6e').font('Helvetica-Bold')
                .text(`Order #${orderId.slice(-8).toUpperCase()}`, 60, yPos + 10);

            doc.fontSize(10).fillColor('#64748b').font('Helvetica')
                .text(`Placed on: ${new Date(order.createdAt).toLocaleDateString()}`, 350, yPos + 12);

            yPos += 50;

            // Status Badge
            const statusColors = {
                'pending': '#f59e0b',
                'quoted': '#3b82f6',
                'confirmed': '#22c55e',
                'shipped': '#8b5cf6'
            };
            doc.fontSize(10).fillColor(statusColors[order.status] || '#64748b').font('Helvetica-Bold')
                .text(`Status: ${order.status.toUpperCase()}`, 50, yPos);

            yPos += 25;

            // Requested Delivery Date
            if (order.requested_delivery_date) {
                doc.fontSize(11).fillColor('#334155').font('Helvetica-Bold')
                    .text('Requested Delivery Date:', 50, yPos);
                doc.fontSize(11).fillColor('#0c4a6e').font('Helvetica')
                    .text(new Date(order.requested_delivery_date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    }), 200, yPos);
                yPos += 20;
            }

            // Special Instructions
            if (order.delivery_request) {
                yPos += 10;
                doc.rect(50, yPos, doc.page.width - 100, 60)
                    .fillColor('#fef3c7').fill();
                doc.fontSize(10).fillColor('#92400e').font('Helvetica-Bold')
                    .text('Special Instructions:', 60, yPos + 8);
                doc.fontSize(10).fillColor('#78350f').font('Helvetica')
                    .text(order.delivery_request, 60, yPos + 22, { width: doc.page.width - 120 });
                yPos += 70;
            }

            yPos += 15;

            // Products Table Header - with pricing columns if order has pricing
            const hasPricing = order.total_amount > 0;

            doc.rect(50, yPos, doc.page.width - 100, 25)
                .fillColor('#0c4a6e').fill();

            if (hasPricing) {
                doc.fontSize(10).fillColor('#fff').font('Helvetica-Bold')
                    .text('Product Name', 60, yPos + 8)
                    .text('Qty', 280, yPos + 8)
                    .text('Unit Price', 340, yPos + 8)
                    .text('Total', 450, yPos + 8);
            } else {
                doc.fontSize(10).fillColor('#fff').font('Helvetica-Bold')
                    .text('Product Name', 60, yPos + 8)
                    .text('Quantity', 350, yPos + 8)
                    .text('Unit', 450, yPos + 8);
            }

            yPos += 25;

            // Currency symbol
            const currencySymbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ' };
            const symbol = currencySymbols[order.currency || 'INR'] || '₹';

            // Products Table Rows
            order.products.forEach((p, pIdx) => {
                const bgColor = pIdx % 2 === 0 ? '#f8fafc' : '#fff';
                doc.rect(50, yPos, doc.page.width - 100, 22)
                    .fillColor(bgColor).fill();

                if (hasPricing) {
                    doc.fontSize(10).fillColor('#334155').font('Helvetica')
                        .text(p.name, 60, yPos + 6)
                        .text(`${p.quantity} ${p.unit || 'kg'}`, 280, yPos + 6)
                        .text(`${symbol}${(p.unit_price || 0).toLocaleString()}`, 340, yPos + 6)
                        .text(`${symbol}${(p.total_price || 0).toLocaleString()}`, 450, yPos + 6);
                } else {
                    doc.fontSize(10).fillColor('#334155').font('Helvetica')
                        .text(p.name, 60, yPos + 6)
                        .text(p.quantity.toString(), 350, yPos + 6)
                        .text(p.unit || 'kg', 450, yPos + 6);
                }
                yPos += 22;
            });

            // Shipping Charges Row (if applicable)
            if (hasPricing && order.shipping_charges > 0) {
                doc.rect(50, yPos, doc.page.width - 100, 22)
                    .fillColor('#fef3c7').fill();
                doc.fontSize(10).fillColor('#92400e').font('Helvetica-Bold')
                    .text('Shipping Charges', 60, yPos + 6)
                    .text(`${symbol}${order.shipping_charges.toLocaleString()}`, 450, yPos + 6);
                yPos += 22;
            }

            // Grand Total Row (if pricing exists)
            if (hasPricing) {
                doc.rect(50, yPos, doc.page.width - 100, 28)
                    .fillColor('#dcfce7').fill();
                doc.fontSize(12).fillColor('#166534').font('Helvetica-Bold')
                    .text('Grand Total:', 60, yPos + 8)
                    .text(`${symbol}${(order.total_amount || 0).toLocaleString()} ${order.currency || 'INR'}`, 400, yPos + 8);
                yPos += 28;
            }

            // Table border
            const tableHeight = hasPricing
                ? (order.products.length * 22) + 25 + (order.shipping_charges > 0 ? 22 : 0) + 28
                : (order.products.length * 22) + 25;
            doc.rect(50, yPos - tableHeight, doc.page.width - 100, tableHeight)
                .strokeColor('#e2e8f0').lineWidth(1).stroke();

            yPos += 20;

            // Admin Notes
            if (order.admin_notes) {
                doc.rect(50, yPos, doc.page.width - 100, 50)
                    .fillColor('#ecfdf5').fill();
                doc.fontSize(10).fillColor('#065f46').font('Helvetica-Bold')
                    .text('Message from Export Desk:', 60, yPos + 8);
                doc.fontSize(10).fillColor('#047857').font('Helvetica')
                    .text(order.admin_notes, 60, yPos + 22, { width: doc.page.width - 120 });
                yPos += 60;
            }

            // Footer - placed after content, not at absolute bottom
            drawFooter(yPos);
        });

        doc.end();
    } catch (err) {
        console.error('PDF Generation Error:', err);
        res.status(500).json({ message: 'Failed to generate PDF' });
    }
});

// Get User's Own Orders
router.get("/my-orders", auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Modify Order Products (User can only modify pending orders)
router.put("/my-orders/:id/modify", auth, async (req, res) => {
    const { products } = req.body;
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Only allow modification of pending orders
        if (order.status !== "pending") {
            return res.status(400).json({ message: "Can only modify pending orders. Please contact support for confirmed orders." });
        }

        // Validate products - must have at least one product
        if (!products || products.length === 0) {
            return res.status(400).json({ message: "Order must have at least one product" });
        }

        const user = await User.findById(req.user.id);

        // Save modification history
        const previousProducts = order.products.map(p => ({
            name: p.name,
            quantity: p.quantity,
            unit: p.unit || 'kg'
        }));
        const newProducts = products.map(p => ({
            name: p.name,
            quantity: p.quantity,
            unit: p.unit || 'kg'
        }));

        if (!order.modification_history) {
            order.modification_history = [];
        }
        order.modification_history.push({
            modified_at: new Date(),
            previous_products: previousProducts,
            new_products: newProducts
        });

        // Update order products
        order.products = products;
        await order.save();

        // Send emails asynchronously (background)
        const emailPromise = Promise.all([
            // Notify admin about the modification
            transporter.sendMail({
                from: `"Order Update" <${process.env.EMAIL_USER}>`,
                to: ADMIN_EMAIL,
                subject: `ORDER MODIFIED: ${user.username} - #${order._id.toString().slice(-8).toUpperCase()}`,
                attachments: getLogoAttachment(),
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="padding: 30px;">
                            ${getEmailHeader()}
                            <h2 style="color: #d97706; margin-top: 0;">Order Modified</h2>
                            <p><b>Customer:</b> ${user.username} (${user.email})</p>
                            <p><b>Order ID:</b> #${order._id.toString().slice(-8).toUpperCase()}</p>
                            <p><b>Modified At:</b> ${new Date().toLocaleString()}</p>
                            <h4>Updated Products:</h4>
                            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                <thead>
                                    <tr style="background: #228B22;">
                                        <th style="padding: 12px; border: 1px solid #ddd; color: white;">Product</th>
                                        <th style="padding: 12px; border: 1px solid #ddd; color: white;">Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${products.map(p => `
                                        <tr>
                                            <td style="padding: 10px; border: 1px solid #ddd;">${p.name}</td>
                                            <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${p.quantity} ${p.unit || 'kg'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            ${getEmailFooter()}
                        </div>
                    </div>
                `
            }),

            // Notify user about the modification
            transporter.sendMail({
                from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `Order Modified Successfully – #${order._id.toString().slice(-8).toUpperCase()}`,
                attachments: getLogoAttachment(),
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                        <div style="padding: 30px;">
                            ${getEmailHeader()}
                            <h3 style="color: #0f172a; margin-top: 0;">Hello ${user.username},</h3>
                            <p>Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> has been successfully modified.</p>
                            
                            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #228B22;">
                                <h4 style="margin-top: 0; color: #475569;">Updated Items:</h4>
                                <ul style="padding-left: 20px; margin: 10px 0;">
                                    ${products.map(p => `<li>${p.name} - ${p.quantity} ${p.unit || 'kg'}</li>`).join('')}
                                </ul>
                            </div>

                            <p>Our team will update the quotation based on your changes.</p>
                            ${getEmailFooter()}
                        </div>
                    </div>
                `
            })
        ]).catch(err => console.error("❌ Email sending failed (background modification):", err));
        res.json({
            success: true,
            message: "Order modified successfully! You will receive an updated quotation soon.",
            order
        });
    } catch (err) {
        console.error("❌ Error modifying order:", err);
        res.status(500).json({ message: "Failed to modify order" });
    }
});

// ADMIN: Get All Orders
router.get("/all", auth, admin, async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "username email phone").sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ADMIN: Update Order Status
router.put("/:id/status", auth, admin, async (req, res) => {
    const { status, admin_notes, estimated_delivery_date } = req.body;
    try {
        const updateData = { status, admin_notes };

        // Add estimated delivery date if provided
        if (estimated_delivery_date) {
            updateData.estimated_delivery_date = new Date(estimated_delivery_date);
            updateData.delivery_reminder_sent = false; // Reset reminder flag when date changes
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("user", "email username");

        // Status-specific email configuration
        const statusConfig = {
            pending: {
                subject: `Order Status: PENDING – Novel Exporters`,
                bgColor: '#fef9c3',
                textColor: '#854d0e',
                icon: ''
            },
            approved: {
                subject: `Order Approved – Novel Exporters`,
                bgColor: '#dbeafe',
                textColor: '#1e40af',
                icon: ''
            },
            rejected: {
                subject: `Order Declined – Novel Exporters`,
                bgColor: '#fee2e2',
                textColor: '#991b1b',
                icon: ''
            },
            confirmed: {
                subject: `Order Confirmed – Novel Exporters`,
                bgColor: '#dcfce7',
                textColor: '#166534',
                icon: ''
            },
            quoted: {
                subject: `Quotation Ready – Novel Exporters`,
                bgColor: '#dbeafe',
                textColor: '#1e40af',
                icon: ''
            }
        };

        const config = statusConfig[status] || statusConfig.pending;

        let emailSubject = config.subject;
        let emailContent = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="padding: 30px;">
                        ${getEmailHeader()}
                        <h2 style="color: #0c4a6e; text-align: center; margin-top: 0;">Order Status Update</h2>
                        <p>Hello ${order.user.username},</p>
                        <p>Your quotation request (ID: <code>${order._id}</code>) has been updated to:</p>
                        <div style="background: ${config.bgColor}; color: ${config.textColor}; padding: 15px; text-align: center; border-radius: 8px; font-weight: bold; font-size: 1.2em; margin: 20px 0;">
                            ${config.icon} ${status.toUpperCase()}
                        </div>
                        ${admin_notes ? `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #228B22;"><p style="margin: 0;"><strong>Message from Export Desk:</strong></p><p style="margin: 5px 0 0 0;">${admin_notes}</p></div>` : ""}
                        <p style="margin-top: 25px;">Please login to your account to review the full details and next steps.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5173/login" style="background: #228B22; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Order Details</a>
                        </div>
                        ${getEmailFooter()}
                    </div>
                </div>
            `;

        // Special confirmation email when order is confirmed
        if (status === 'confirmed') {
            emailContent = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="padding: 30px;">
                        ${getEmailHeader()}
                        <div style="background: #dcfce7; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                            <h2 style="color: #166534; margin: 0;">Your Order is Confirmed!</h2>
                        </div>
                        <p>Dear ${order.user.username},</p>
                        <p>We are pleased to inform you that your order has been <strong>confirmed</strong> and is now being processed for delivery.</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #228B22;">
                            <h4 style="margin-top: 0; color: #475569;">Order ID: ${order._id}</h4>
                            <p style="margin-bottom: 5px;"><strong>Items Confirmed:</strong></p>
                            <ul style="padding-left: 20px;">
                                ${order.products.map(p => `<li>${p.name} - ${p.quantity} units</li>`).join('')}
                            </ul>
                        </div>

                        ${admin_notes ? `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #228B22; margin: 20px 0;"><p style="margin: 0;"><strong>Message from Export Team:</strong></p><p style="margin: 5px 0 0 0;">${admin_notes}</p></div>` : ""}
                        
                        <p>Our logistics team will coordinate the delivery as per your requirements. You will receive tracking information once the shipment is dispatched.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5173/login" style="background: #228B22; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Your Order</a>
                        </div>
                        ${getEmailFooter()}
                    </div>
                </div>
            `;
        }

        // Special rejection email
        if (status === 'rejected') {
            emailContent = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="padding: 30px;">
                        ${getEmailHeader()}
                        <div style="background: #fee2e2; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                            <h2 style="color: #991b1b; margin: 0;">Order Update</h2>
                        </div>
                        <p>Dear ${order.user.username},</p>
                        <p>We regret to inform you that we are unable to fulfill your quotation request (ID: <code>${order._id}</code>) at this time.</p>
                        
                        ${admin_notes ? `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;"><p style="margin: 0;"><strong>Reason:</strong></p><p style="margin: 5px 0 0 0;">${admin_notes}</p></div>` : ""}
                        
                        <p>If you have any questions or would like to discuss alternative options, please feel free to contact us directly.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="mailto:novelexporters@gmail.com" style="background: #228B22; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Contact Us</a>
                        </div>
                        ${getEmailFooter()}
                    </div>
                </div>
            `;
        }

        // Special approved email
        if (status === 'approved') {
            emailContent = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="padding: 30px;">
                        ${getEmailHeader()}
                        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                            <h2 style="color: #1e40af; margin: 0;">Your Order Has Been Approved!</h2>
                        </div>
                        <p>Dear ${order.user.username},</p>
                        <p>Great news! Your quotation request (ID: <code>${order._id}</code>) has been <strong>approved</strong> by our export team.</p>
                        
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #228B22;">
                            <h4 style="margin-top: 0; color: #475569;">Order ID: ${order._id}</h4>
                            <p style="margin-bottom: 5px;"><strong>Approved Items:</strong></p>
                            <ul style="padding-left: 20px;">
                                ${order.products.map(p => `<li>${p.name} - ${p.quantity} units</li>`).join('')}
                            </ul>
                        </div>

                        ${admin_notes ? `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #228B22; margin: 20px 0;"><p style="margin: 0;"><strong>Message from Export Team:</strong></p><p style="margin: 5px 0 0 0;">${admin_notes}</p></div>` : ""}
                        
                        <p>Your order is now awaiting final confirmation. Our team will be in touch shortly with payment and delivery details.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5173/login" style="background: #228B22; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Order Details</a>
                        </div>
                        ${getEmailFooter()}
                    </div>
                </div>
            `;
        }

        // Send status email asynchronously (background)
        transporter.sendMail({
            from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: emailSubject,
            attachments: getLogoAttachment(),
            html: emailContent
        }).catch(err => console.error("❌ Status email sending failed:", err));

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ADMIN: Analytics (Product counts)
router.get("/analytics", auth, admin, async (req, res) => {
    try {
        const orders = await Order.find();
        const productStats = {};

        orders.forEach(order => {
            order.products.forEach(p => {
                // Normalize to grams for accurate aggregation
                const quantityInGrams = p.unit === 'kg' ? p.quantity * 1000 : p.quantity;
                productStats[p.name] = (productStats[p.name] || 0) + quantityInGrams;
            });
        });

        res.json({ productStats });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Public route for global marketplace analytics
router.get("/total-products-count", async (req, res) => {
    try {
        const orders = await Order.find();
        let totalItemsCount = 0;
        const productStats = {};

        orders.forEach(order => {
            order.products.forEach(p => {
                // Normalize to grams for accurate aggregation
                const quantityInGrams = p.unit === 'kg' ? p.quantity * 1000 : p.quantity;
                totalItemsCount += quantityInGrams;
                productStats[p.name] = (productStats[p.name] || 0) + quantityInGrams;
            });
        });

        let mostOrderedProduct = "None";
        let mostOrderedCount = 0;

        for (const [name, count] of Object.entries(productStats)) {
            if (count > mostOrderedCount) {
                mostOrderedCount = count;
                mostOrderedProduct = name;
            }
        }

        res.json({
            totalOrders: orders.length,
            totalItems: totalItemsCount,
            mostOrderedProduct,
            mostOrderedCount
        });
    } catch (err) {
        res.status(500).json({ message: "Error calculating marketplace analytics" });
    }
});

// ADMIN: Update Order Pricing (can be done anytime, even after confirmation)
router.put("/:id/pricing", auth, admin, async (req, res) => {
    const { products, currency, notes, shippingCharges, deliveryLocation } = req.body;

    try {
        const order = await Order.findById(req.params.id).populate("user", "email username");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Update product prices
        let products_total = 0;
        const updatedProducts = order.products.map((product, index) => {
            const priceUpdate = products[index];
            const unit_price = priceUpdate?.unit_price || product.unit_price || 0;
            const total_price = unit_price * product.quantity;
            products_total += total_price;

            return {
                ...product.toObject(),
                unit_price,
                total_price
            };
        });

        // Calculate total with shipping charges
        const shipping = shippingCharges || order.shipping_charges || 0;
        const total_amount = products_total + shipping;

        // Save price update history
        if (!order.price_update_history) {
            order.price_update_history = [];
        }
        order.price_update_history.push({
            updated_at: new Date(),
            total_amount,
            currency: currency || order.currency || 'INR',
            shipping_charges: shipping,
            products: updatedProducts.map(p => ({
                name: p.name,
                quantity: p.quantity,
                unit: p.unit || 'kg',
                unit_price: p.unit_price || 0
            })),
            notes: notes || ''
        });

        // Update order with new pricing
        const updateData = {
            products: updatedProducts,
            currency: currency || order.currency || 'INR',
            shipping_charges: shipping,
            total_amount,
            price_updated_at: new Date(),
            price_update_history: order.price_update_history
        };

        if (deliveryLocation) {
            updateData.delivery_location = deliveryLocation;
        }

        if (notes) {
            updateData.admin_notes = notes;
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate("user", "email username");

        // Send email notification to user about price update
        const currencySymbols = {
            'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'AED': 'د.إ',
            'SAR': '﷼', 'AUD': 'A$', 'CAD': 'C$', 'SGD': 'S$', 'JPY': '¥'
        };
        const symbol = currencySymbols[currency || 'INR'] || '';

        const productRows = updatedProducts.map(p => `
            <tr>
                <td style="padding: 12px; border: 1px solid #e2e8f0;">${p.name}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: center;">${p.quantity} ${p.unit || 'kg'}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">${symbol}${(p.unit_price || 0).toLocaleString()}</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${symbol}${(p.total_price || 0).toLocaleString()}</td>
            </tr>
        `).join('');

        // Add shipping charges row if present
        const shippingRow = shipping > 0 ? `
            <tr style="background: #fef3c7;">
                <td colspan="3" style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: 600;">Shipping Charges:</td>
                <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #d97706;">${symbol}${shipping.toLocaleString()}</td>
            </tr>
        ` : '';

        // Send pricing email asynchronously (background)
        transporter.sendMail({
            from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: `Quotation Update for Order #${order._id.toString().slice(-8).toUpperCase()} – Novel Exporters`,
            attachments: getLogoAttachment(),
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="padding: 30px;">
                        ${getEmailHeader()}
                        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                            <h2 style="color: #1e40af; margin: 0;">Quotation Update</h2>
                        </div>
                        <p>Dear ${order.user.username},</p>
                        <p>The pricing for your order has been updated. Please review the details below:</p>
                        
                        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                            <thead>
                                <tr style="background: #228B22;">
                                    <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: left;">Product</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: center;">Quantity</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: right;">Unit Price</th>
                                    <th style="padding: 12px; border: 1px solid #ddd; color: white; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productRows}
                                ${shippingRow}
                                <tr style="background: #f0fdf4;">
                                    <td colspan="3" style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">Grand Total:</td>
                                    <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold; font-size: 16px; color: #166534;">${symbol}${total_amount.toLocaleString()} ${currency || 'INR'}</td>
                                </tr>
                            </tbody>
                        </table>

                        ${notes ? `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #228B22; margin: 20px 0;"><p style="margin: 0;"><strong>Message from Export Team:</strong></p><p style="margin: 5px 0 0 0;">${notes}</p></div>` : ""}
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="http://localhost:5173/login" style="background: #228B22; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Order Details</a>
                        </div>
                        ${getEmailFooter()}
                    </div>
                </div>
            `
        }).catch(err => console.error("❌ Pricing email sending failed:", err));

        res.json({ message: "Pricing updated successfully", order: updatedOrder });
    } catch (err) {
        console.error("Error updating pricing:", err);
        res.status(500).json({ message: "Error updating pricing" });
    }
});

module.exports = router;
