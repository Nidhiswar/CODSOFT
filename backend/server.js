require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const nodemailer = require("nodemailer");
const cors = require("cors");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/novel_exporters";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("🚀 MongoDB Integrated Successfully"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());

// Health Check / Integration Route
app.get("/api", (req, res) => {
  res.json({
    status: "Integrated",
    message: "Novel Exporters Backend + API + DB Link Active",
    version: "2.0.0"
  });
});

// Routes
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/orders", orderRoutes);

// Initialize Gemini
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not found in environment variables.");
}
const genAI = new GoogleGenerativeAI(API_KEY || "");

const productCatalog = `
Novel Exporters Detailed Product Knowledge Base:
- Curry Leaves: Origin: Coimbatore (TN) & Karur (TN). Harvest: Peak Mar-Jul. Quality: Cold-dried, Grade A color retention, Pesticide free.
- Black Pepper (Tellicherry Bold): Origin: Wayanad (KL) & Nilgiris (TN). Harvest: Dec-Mar. Quality: 550-600 G/L density, <12% moisture, Machine cleaned.
- Green Cardamom: Origin: Idukki (KL) & Munnar (KL). Harvest: Aug-Feb. Quality: 7mm-11mm bold pods, Deep green, High essential oil.
- Cloves: Origin: Kanyakumari (TN). Harvest: Jan-Apr. Quality: Full headed buds, High volatile oil, Sun dried.
- Nutmeg: Origin: Kottayam (KL) & Idukki (KL). Harvest: Jun-Aug. Quality: ABCD Grade, Sun dried, Natural aroma.
- Nutmeg Mace: Origin: Thrissur (KL) & Ernakulam (KL). Harvest: Jun-Aug. Quality: Red mace star pieces, Pure fragrance.
- Kapok Buds: Origin: Theni (TN) & Dindigul (TN). Harvest: Feb-Apr. Quality: Rare indigenous variety, cooling medicinal properties.
- Cinnamon (Malabar): Origin: Malabar Region (KL). Harvest: May-Aug. Quality: Cigar roll cut, High Cinnamaldehyde contents.
- Star Anise: Origin: Kerala. Harvest: Oct-Dec. Quality: Complete 8 petal stars, Strong anethole aroma.
- Bay Leaves: Origin: Western Ghats (TN/KL). Harvest: Oct-Dec. Quality: Uniform green, zero moisture/fungus.

Certifications: FSSAI (India), ISO 22000 (Food Safety), HACCP (Hazard Analysis).
Logistics: Bulk Sea Exports (via Tuticorin or Kochi ports), Priority Air Exports for high-value orders.
Company Mission: Sourcing 100% authentic spices directly from South Indian farms for global export markets.
`;

const systemInstruction = `
You are the official AI assistant for Novel Exporters. Your goal is to provide accurate product descriptions, current export availability, and shipping enquiries based on the provided catalog.
${productCatalog}
Rules:
1. Use only the provided catalog data.
2. If you don't know an answer, provide the contact email: internationalsupport@novelexporters.com or +91 80128 04316.
3. Maintain a professional, premium, and trustworthy tone.
4. Support multiple languages (English, German, Japanese, etc.) as requested by the client.
5. For shipping terms, mention that we handle both Sea (Tuticorin/Kochi ports) and Air exports.
`;

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: systemInstruction,
});

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  // Check if API key exists
  if (!process.env.GEMINI_API_KEY) {
    return res.status(401).json({
      message: "API Key Missing: Please provide a GEMINI_API_KEY in your .env file."
    });
  }

  try {
    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ text });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ message: "AI response failed. Ensure your Gemini API key is valid and has sufficient quota." });
  }
});

// 404 JSON Handler (Prevents "Unexpected token <" on frontend)
app.use((req, res) => {
  res.status(404).json({
    message: "Requested API endpoint not found on this server.",
    path: req.originalUrl
  });
});

// Global Error Handler (Ensures all errors return JSON, not HTML)
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    status: "error",
    message: "Critical Backend Error",
    details: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Novel Exporters Backend Active: http://127.0.0.1:${PORT}`);
  console.log(`📂 API Gateway: http://127.0.0.1:${PORT}/api`);
});
