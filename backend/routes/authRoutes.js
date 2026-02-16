const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { auth, admin } = require("../middleware/auth");
const config = require("../config");
const nodemailer = require("nodemailer");
const { generateOrderHistoryPDF } = require("../utils/pdfFormatter");
const { getEmailHeader, getEmailFooter, getLogoAttachment } = require("../utils/emailTemplate");
const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.emailUser,
        pass: config.emailPass,
    },
});

// Register
router.post("/register", async (req, res) => {
    const { username, email, phone, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Only novelexporters@gmail.com is admin
        const role = email === "novelexporters@gmail.com" ? "admin" : "user";

        user = new User({ username, email, phone, password: hashedPassword, role, hasConsented: false, isFirstLogin: true });
        await user.save();

        const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "7d" });
        // On registration, show consent overlay for non-admin users
        const showConsentOverlay = role !== "admin";
        res.json({ token, user: { id: user._id, username, email, role: user.role, cart: user.cart, hasConsented: false, isFirstLogin: true, showConsentOverlay } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body; // identifier can be email or phone
    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Ensure novelexporters@gmail.com always has admin role
        if (user.email === "novelexporters@gmail.com" && user.role !== "admin") {
            user.role = "admin";
            await user.save();
        }

        // Never show consent overlay on login - only during registration
        const showConsentOverlay = false;

        const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, cart: user.cart, hasConsented: user.hasConsented, isFirstLogin: user.isFirstLogin, showConsentOverlay } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User with this email does not exist" });

        const token = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `${config.clientUrl}/reset-password/${token}`;

        // Send reset email asynchronously (background)
        transporter.sendMail({
            from: `"Novel Exporters Security" <${config.emailUser}>`,
            to: user.email,
            subject: "Password Reset Request – Novel Exporters",
            attachments: getLogoAttachment(),
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="padding: 30px;">
                        ${getEmailHeader()}
                        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>You recently requested to reset your password for your <strong>Novel Exporters Portal</strong> account. Click the button below to proceed:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: #228B22; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
                        </div>
                        <p style="font-size: 0.9em; color: #64748b;">This link will expire in 1 hour. If you did not request this reset, please ignore this email or contact our support team if you have concerns.</p>
                        ${getEmailFooter()}
                    </div>
                </div>
            `
        }).catch(err => console.error("❌ Forgot Password email sending failed:", err));

        res.json({ message: "Reset email sent successfully" });
    } catch (err) {
        console.error("❌ Forgot Password Error:", err);
        res.status(500).json({ message: "Error sending reset email. Please try again later." });
    }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Password reset token is invalid or has expired" });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password has been reset successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error resetting password" });
    }
});

// Get User Data
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        // Ensure novelexporters@gmail.com always has admin role
        if (user && user.email === "novelexporters@gmail.com" && user.role !== "admin") {
            user.role = "admin";
            await user.save();
        }

        // For /me endpoint, don't show consent overlay (only on fresh login)
        // Once user has a valid session, they don't need to see consent again
        const userResponse = user.toObject();
        userResponse.showConsentOverlay = false;

        res.json(userResponse);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update Consent Status
router.post("/consent", auth, async (req, res) => {
    const { version, ipAddress } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                hasConsented: true,
                isFirstLogin: false, // Mark first login as complete after consent
                consentDetails: {
                    version: version || "1.0.0",
                    timestamp: new Date(),
                    ipAddress: ipAddress || req.ip
                }
            },
            { new: true }
        ).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update Cart
router.post("/cart", auth, async (req, res) => {
    const { cart } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.user.id, { cart }, { new: true }).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update Profile
router.put("/profile", auth, async (req, res) => {
    const { username, phone, profilePicture } = req.body;
    try {
        const updateData = {};
        if (username) updateData.username = username;
        if (phone !== undefined) updateData.phone = phone;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Generate PDF for Order History
router.get("/order-history/pdf", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("orders");
        if (!user || !user.orders || user.orders.length === 0) {
            return res.status(404).json({ message: "No order history found." });
        }

        generateOrderHistoryPDF(user.orders, res);
    } catch (err) {
        res.status(500).json({ message: "Error generating PDF." });
    }
});

// ADMIN: Get specific user details (including cart)
router.get("/users/:id", auth, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// ADMIN: Get all users
router.get("/all-users", auth, admin, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Send Order Request
router.post("/order", auth, async (req, res) => {
    const { orderDetails } = req.body;
    try {
        const user = await User.findById(req.user.id);

        // Send order request email asynchronously (background)
        transporter.sendMail({
            from: `"Order Request" <${process.env.EMAIL_USER}>`,
            to: "novelexporters@gmail.com",
            subject: `New Order Request from ${user.username}`,
            html: `
                <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #6366f1;">New Order Request</h2>
                    <p><b>Client:</b> ${user.username} (${user.email})</p>
                    <ul>
                        ${orderDetails.map(item => `<li>${item.name} (${item.quantity} units)</li>`).join('')}
                    </ul>
                </div>
            `
        }).catch(err => console.error("❌ Order request email failed:", err));

        res.json({ message: "Order request sent successfully." });
    } catch (err) {
        res.status(500).json({ message: "Error sending order request." });
    }
});

module.exports = router;
