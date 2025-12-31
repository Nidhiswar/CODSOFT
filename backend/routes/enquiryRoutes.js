const express = require("express");
const Enquiry = require("../models/Enquiry");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { auth, admin } = require("../middleware/auth");
const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Admin view all enquiries
router.get("/all", auth, admin, async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Submit new enquiry (Public or Logged in)
router.post("/", async (req, res) => {
  const { username, email, phone, message } = req.body;
  const token = req.header("x-auth-token");

  if (!username || !email || !phone || !message) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (e) {
        // Ignore invalid token for enquiry
      }
    }

    // Save to Database
    const newEnquiry = new Enquiry({
      user: userId,
      username,
      email,
      phone,
      message
    });
    await newEnquiry.save();

    // Admin mail
    await transporter.sendMail({
      from: `"Website Enquiry" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Enquiry from ${username}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d97706;">Business Enquiry</h2>
          <p><b>Name:</b> ${username}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Phone:</b> ${phone}</p>
          <p><b>Message:</b></p>
          <div style="background: #f9fafb; padding: 15px; border-radius: 5px;">${message}</div>
          ${userId ? `<p style="color: #6366f1;"><b>Logged-in User ID:</b> ${userId}</p>` : '<p><i>Guest Enquiry</i></p>'}
        </div>
      `,
    });

    // Customer confirmation mail
    await transporter.sendMail({
      from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Enquiry Received – Novel Exporters",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h3>Hello ${username},</h3>
          <p>We've received your enquiry regarding our premium spices. Our team will get back to you shortly.</p>
          <p>Regards,<br><strong>Novel Exporters Team</strong></p>
        </div>
      `,
    });

    res.json({ message: "Enquiry sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Process failed" });
  }
});

module.exports = router;
