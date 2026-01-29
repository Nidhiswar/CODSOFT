const express = require("express");
const Enquiry = require("../models/Enquiry");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { auth, admin } = require("../middleware/auth");
const pdfkit = require("pdfkit");
const { getEmailHeader, getEmailFooter, getLogoAttachment } = require("../utils/emailTemplate");
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
      to: "novelexporters@gmail.com",
      subject: `New Enquiry from ${username}`,
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="padding: 30px;">
            ${getEmailHeader()}
            <h2 style="color: #d97706; margin-top: 0;">Business Enquiry</h2>
            <p><b>Name:</b> ${username}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone}</p>
            <p><b>Message:</b></p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 5px; border-left: 4px solid #228B22;">${message}</div>
            ${userId ? `<p style="color: #228B22; margin-top: 15px;"><b>Logged-in User ID:</b> ${userId}</p>` : '<p style="margin-top: 15px;"><i>Guest Enquiry</i></p>'}
            ${getEmailFooter()}
          </div>
        </div>
      `,
    });

    // Customer confirmation mail
    await transporter.sendMail({
      from: `"Novel Exporters" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Enquiry Received – Novel Exporters",
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="padding: 30px;">
            ${getEmailHeader()}
            <h2 style="color: #0f172a; margin-top: 0;">Hello ${username},</h2>
            <p>Thank you for reaching out to <strong>Novel Exporters</strong>. We have successfully received your business enquiry.</p>
            <p>Our team is reviewing your requirements and one of our export specialists will contact you within 24-48 hours with the requested information.</p>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #228B22;">
               <p style="margin: 0;"><strong>Your Message:</strong></p>
               <p style="font-style: italic; color: #64748b; margin: 10px 0 0 0;">"${message}"</p>
            </div>
            <p>In the meantime, feel free to explore our <a href="http://localhost:5173/products" style="color: #228B22; text-decoration: none; font-weight: 600;">latest product catalog</a>.</p>
            ${getEmailFooter()}
          </div>
        </div>
      `,
    });

    res.json({ message: "Enquiry sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Process failed" });
  }
});

// Generate PDF for Enquiry History
router.get("/enquiry-history/pdf", auth, async (req, res) => {
    try {
        const enquiries = await Enquiry.find({ user: req.user.id });
        if (!enquiries || enquiries.length === 0) {
            return res.status(404).json({ message: "No enquiry history found." });
        }

        const doc = new pdfkit();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=enquiry-history.pdf");

        doc.pipe(res);

        doc.fontSize(20).text("Enquiry History", { align: "center" });
        doc.moveDown();

        enquiries.forEach((enquiry, index) => {
            doc.fontSize(14).text(`Enquiry ${index + 1}:`, { underline: true });
            doc.text(`Date: ${enquiry.createdAt}`);
            doc.text(`Message: ${enquiry.message}`);
            doc.moveDown();
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: "Error generating PDF." });
    }
});

module.exports = router;
