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
            subject: "We've received your quotation request",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h3>Hello ${user.username},</h3>
                    <p>Thank you for choosing Novel Exporters. We have received your request for a quotation on ${products.length} items.</p>
                    <p>Our export specialists are reviewing your requirements and will get back to you with pricing, quality certifications, and delivery timelines shortly.</p>
                    <hr />
                    <p>Order ID: <b>${newOrder._id}</b></p>
                    <p>Regards,<br><b>Novel Exporters Team</b></p>
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
        await transporter.sendMail({
            from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
            to: order.user.email,
            subject: `Update on your request: ${status.toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h3>Order Status Update</h3>
                    <p>Your quotation request (ID: ${order._id}) is now <b>${status}</b>.</p>
                    ${admin_notes ? `<p><b>Admin Message:</b> ${admin_notes}</p>` : ""}
                    <p>Login to your profile to see more details.</p>
                </div>
            `
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

module.exports = router;
