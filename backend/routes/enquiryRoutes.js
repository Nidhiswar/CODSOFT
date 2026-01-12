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
      subject: "✅ Enquiry Received – Novel Exporters",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 25px; color: #334155; line-height: 1.6;">
          <h2 style="color: #0c4a6e; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">Hello ${username},</h2>
          <p>Thank you for reaching out to <strong>Novel Exporters</strong>. We have successfully received your business enquiry.</p>
          <p>Our team is reviewing your requirements and one of our export specialists will contact you within 24-48 hours with the requested information.</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <p style="margin: 0;"><strong>Your Message:</strong></p>
             <p style="font-style: italic; color: #64748b;">"${message}"</p>
          </div>
          <p>In the meantime, feel free to explore our <a href="http://localhost:8080/products" style="color: #0284c7; text-decoration: none; font-weight: 600;">latest product catalog</a>.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 0.9em;">Best Regards,<br><strong>Novel Exporters Team</strong><br><small>Quality Spices. Global Reach.</small></p>
        </div>
      `,
    });

    res.json({ message: "Enquiry sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Process failed" });
  }
});

module.exports = router;
