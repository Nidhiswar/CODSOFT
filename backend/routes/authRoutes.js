const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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

// Register
router.post("/register", async (req, res) => {
    const { username, email, phone, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Only internationalsupport@novelexporters.com is admin
        const role = email === "internationalsupport@novelexporters.com" ? "admin" : "user";

        user = new User({ username, email, phone, password: hashedPassword, role });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, username, email, role: user.role, cart: user.cart } });
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, cart: user.cart } });
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

        const resetUrl = `http://localhost:8080/reset-password/${token}`;

        await transporter.sendMail({
            from: `"Novel Exporters Security" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "🔐 Password Reset Request – Novel Exporters",
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background-color: #f8fafc; color: #1e293b; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; margin-bottom: 25px;">
                         <h1 style="color: #0c4a6e; margin: 0; font-size: 24px;">NOVEL EXPORTERS</h1>
                    </div>
                    <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>You recently requested to reset your password for your <strong>Novel Exporters Portal</strong> account. Click the button below to proceed:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: #fbbf24; color: #000; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background 0.2s;">Reset Password</a>
                        </div>
                        <p style="font-size: 0.9em; color: #64748b;">This link will expire in 1 hour. If you did not request this reset, please ignore this email or contact our support team if you have concerns.</p>
                        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
                        <p style="font-size: 0.8em; color: #94a3b8; text-align: center;">&copy; 2026 Novel Exporters. All rights reserved.</p>
                    </div>
                </div>
            `
        });

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

        // Notify admin about cart activity (Throttled or simplified)
        if (cart && cart.length > 0) {
            await transporter.sendMail({
                from: `"Cart Alert" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: `🛒 Active Selection: ${user.username}`,
                html: `
                  <div style="font-family: sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #6366f1;">Interest Detected</h2>
                    <p><b>Client:</b> ${user.username} (${user.email})</p>
                    <ul>
                      ${cart.map(item => `<li>${item.name} (${item.quantity} units)</li>`).join('')}
                    </ul>
                  </div>
                `
            });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
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

module.exports = router;
