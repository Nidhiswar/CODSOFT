const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Create new Order (Quotation Request)
router.post("/", auth, async (req, res) => {
    const { products, delivery_request, requested_delivery_date } = req.body;

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
            status: "pending"
        });

        await newOrder.save();

        // Notify Admin
        await transporter.sendMail({
            from: `"Order Desk" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `🔥 NEW QUOTATION REQUEST: ${user.username}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #d97706;">Quotation Required</h2>
                    <p><b>From:</b> ${user.username} (${user.email})</p>
                    <p><b>Phone:</b> ${user.phone || "Not provided"}</p>
                    <p><b>Requested Delivery:</b> ${requested_delivery_date ? new Date(requested_delivery_date).toLocaleDateString() : "Flexible"}</p>
                    <p><b>Delivery Note:</b> ${delivery_request || "Standard shipping"}</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f3f4f6;">
                                <th style="padding: 10px; border: 1px solid #ddd;">Product</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(p => `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${p.name}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${p.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p style="margin-top: 20px;">Please login to the Admin Dashboard to provide pricing and timeline.</p>
                </div>
            `
        });

        // Notify User
        await transporter.sendMail({
            from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "📝 Quotation Request Received – Novel Exporters",
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #0c4a6e; margin: 0; font-size: 24px;">NOVEL EXPORTERS</h1>
                    </div>
                    <h3 style="color: #0f172a;">Hello ${user.username},</h3>
                    <p>Thank you for choosing <strong>Novel Exporters</strong>. We have received your request for a quotation on ${products.length} items.</p>
                    <p>Our export specialists are currently calculating the best possible pricing for your specific requirements, including quality certifications and optimized delivery timelines.</p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h4 style="margin-top: 0; color: #475569;">Order ID: ${newOrder._id}</h4>
                        <p style="margin-bottom: 5px;"><strong>Items Requested:</strong></p>
                        <ul style="padding-left: 20px;">
                            ${products.map(p => `<li>${p.name} - ${p.quantity} units</li>`).join('')}
                        </ul>
                    </div>

                    <p>We will get back to you with the full commercial offer shortly.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                    <p style="font-size: 0.9em; text-align: center;">Regards,<br><strong>Novel Exporters Sales Team</strong></p>
                </div>
            `
        });

        res.json({ message: "Request submitted successfully", order: newOrder });
    } catch (err) {
        console.error("Order Error:", err);
        res.status(500).json({ message: "Failed to process request" });
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

// ADMIN: Get All Orders
router.get("/all", auth, admin, async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "username email").sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ADMIN: Update Order Status
router.put("/:id/status", auth, admin, async (req, res) => {
    const { status, admin_notes } = req.body;
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status, admin_notes },
            { new: true }
        ).populate("user", "email username");

        // Notify user about status update
        let emailSubject = `📦 Quotation Status: ${status.toUpperCase()} – Novel Exporters`;
        let emailContent = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #0c4a6e; text-align: center;">Order Status Update</h2>
                    <p>Hello ${order.user.username},</p>
                    <p>Your quotation request (ID: <code>${order._id}</code>) has been updated to:</p>
                    <div style="background: ${status === 'confirmed' ? '#dcfce7' : '#fef9c3'}; color: ${status === 'confirmed' ? '#166534' : '#854d0e'}; padding: 15px; text-align: center; border-radius: 8px; font-weight: bold; font-size: 1.2em; margin: 20px 0;">
                        ${status.toUpperCase()}
                    </div>
                    ${admin_notes ? `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #0c4a6e;"><p style="margin: 0;"><strong>Message from Export Desk:</strong></p><p style="margin: 5px 0 0 0;">${admin_notes}</p></div>` : ""}
                    <p style="margin-top: 25px;">Please login to your account to review the full details and next steps.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:8080/profile" style="background: #0c4a6e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Order Details</a>
                    </div>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                    <p style="font-size: 0.8em; text-align: center; color: #64748b;">Novel Exporters | International Trading Excellence</p>
                </div>
            `;

        // Special confirmation email when order is confirmed
        if (status === 'confirmed') {
            emailSubject = `✅ Order Confirmed – Novel Exporters`;
            emailContent = `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #0c4a6e; margin: 0; font-size: 24px;">NOVEL EXPORTERS</h1>
                    </div>
                    <div style="background: #dcfce7; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                        <h2 style="color: #166534; margin: 0;">🎉 Your Order is Confirmed!</h2>
                    </div>
                    <p>Dear ${order.user.username},</p>
                    <p>We are pleased to inform you that your order has been <strong>confirmed</strong> and is now being processed for delivery.</p>
                    
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <h4 style="margin-top: 0; color: #475569;">Order ID: ${order._id}</h4>
                        <p style="margin-bottom: 5px;"><strong>Items Confirmed:</strong></p>
                        <ul style="padding-left: 20px;">
                            ${order.products.map(p => `<li>${p.name} - ${p.quantity} units</li>`).join('')}
                        </ul>
                    </div>

                    ${admin_notes ? `<div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #0c4a6e; margin: 20px 0;"><p style="margin: 0;"><strong>Message from Export Team:</strong></p><p style="margin: 5px 0 0 0;">${admin_notes}</p></div>` : ""}
                    
                    <p>Our logistics team will coordinate the delivery as per your requirements. You will receive tracking information once the shipment is dispatched.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="http://localhost:8080/profile" style="background: #0c4a6e; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Track Your Order</a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                    <p style="font-size: 0.9em; text-align: center;">Thank you for choosing Novel Exporters!<br><strong>International Trading Excellence</strong></p>
                </div>
            `;
        }

        await transporter.sendMail({
            from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: emailSubject,
            html: emailContent
        });

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
                productStats[p.name] = (productStats[p.name] || 0) + p.quantity;
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
                totalItemsCount += p.quantity;
                productStats[p.name] = (productStats[p.name] || 0) + p.quantity;
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

module.exports = router;
