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

        // First user can be admin if you want, or just manual setting
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? "admin" : "user";

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

        const resetUrl = `http://localhost:8082/reset-password/${token}`;

        await transporter.sendMail({
            from: `"Novel Exporters Security" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset. Please click the button below to set a new password:</p>
                    <a href="${resetUrl}" style="background: #fbbf24; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                    <p>If you did not request this, please ignore this email.</p>
                </div>
            `
        });

        res.json({ message: "Reset email sent successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error sending reset email" });
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
