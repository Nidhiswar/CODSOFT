require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const nodemailer = require("nodemailer");
const cors = require("cors");

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authRoutes = require("./routes/authRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
console.log("🔍 Attempting to connect to MongoDB...");


if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env file");
}

console.log("Mongo URI loaded:", !!process.env.MONGODB_URI);


mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4,
})
.then(() => {
  console.log("🚀 MongoDB Integrated Successfully");

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error("❌ MongoDB Connection Error:", err.message);
  process.exit(1); // 🔴 STOP the server
});

mongoose.connection.on("error", err => {
  console.error("❌ MongoDB Runtime Error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(mongoSanitize());

// Health Check / Integration Route
app.get("/", (req, res) => {
  res.json({
    status: "Active",
    message: "Novel Exporters Backend Server is running.",
    endpoints: {
      health: "/api",
      chat: "/api/chat",
      healthDetail: "/api/health"
    }
  });
});

// Detailed health check (helps diagnose AI service issues)
app.get("/api/health", (req, res) => {
  const googleKeyConfigured = !!process.env.GOOGLE_API_KEY;
  const mongoConnected = require("mongoose").connection.readyState === 1;
  
  res.json({
    status: mongoConnected ? "Healthy" : "Degraded",
    backend: "Active",
    version: "2.0.0",
    services: {
      mongodb: mongoConnected ? "Connected" : "Disconnected",
      googleAI: googleKeyConfigured ? "Configured" : "Missing GOOGLE_API_KEY",
      ollama: "Check http://127.0.0.1:11434 manually"
    },
    endpoints: {
      auth: "/api/auth",
      enquiry: "/api/enquiry",
      orders: "/api/orders",
      chat: "/api/chat"
    }
  });
});

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

// Initialize Google Generative AI (Google AI Studio)
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
if (!GOOGLE_API_KEY) {
  console.warn("⚠️ GOOGLE_API_KEY not found in environment variables.");
} else {
  console.log("🤖 Google Generative AI API Key Loaded");
}

const genAI = GOOGLE_API_KEY ? new GoogleGenerativeAI(GOOGLE_API_KEY) : null;
const GEMINI_MODEL_NAME = "gemma-3-4b-it"; // Using the requested Gemma 3 4B model


const productCatalog = `
Novel Exporters Detailed Product Knowledge Base:
- Curry Leaves: Origin: Coimbatore (TN) & Karur (TN). Harvest: Peak Mar-Jul. Quality: Cold-dried, Grade A color retention, Pesticide free.
- Black Pepper (Tellicherry Bold): Origin: Wayanad (KL) & Nilgiris (TN). Harvest: Dec-Mar. Quality: 550-600 G/L density, <12% moisture, Machine cleaned.
- Green Cardamom: Origin: Idukki (KL) & Munnar (KL). Harvest: Aug-Feb. Quality: 7mm-11mm bold pods, Deep green, High essential oil.
- Cloves: Origin:Kanyakumari (TN). Harvest: Jan-Apr. Quality: Full headed buds, High volatile oil, Sun dried.
- Nutmeg: Origin: Kottayam (KL) & Idukki (KL). Harvest: Jun-Aug. Quality: ABCD

 Grade, Sun dried, Natural aroma.
- Nutmeg Mace: Origin: Thrissur (KL) & Ernakulam (KL). Harvest: Jun-Aug. Quality: Red mace star pieces, Pure fragrance.
- Kapok Buds: Origin: Theni (TN) & Dindigul (TN). Harvest: Feb-Apr. Quality: Rare indigenous variety, cooling medicinal properties.
- Cinnamon (Malabar): Origin: Malabar Region (KL). Harvest: May-Aug. Quality: Cigar roll cut, High Cinnamaldehyde contents.
- Star Anise: Origin: Kerala. Harvest: Oct-Dec. Quality: Complete 8 petal stars, Strong anethole aroma.
- Bay Leaves: Origin: Western Ghats (TN/KL). Harvest: Oct-Dec. Quality: Uniform green, zero moisture/fungus.

Certifications: FSSAI (India), ISO 22000 (Food Safety), IEC.
Logistics: Bulk Sea Exports (via Tuticorin or Kochi ports), Priority Air Exports for high-value orders.
Company Mission: Sourcing 100% authentic spices directly from South Indian farms for global export markets.
`;

const systemInstruction = `
You are the official AI assistant for Novel Exporters, powered by the Gemma 3 4B model from Google. Your goal is to provide accurate product descriptions, current export availability, and shipping enquiries based on the provided catalog.
${productCatalog}
Rules:
1. Use only the provided catalog data.
2. If you don't know an answer, provide the contact email: novelexporters@gmail.com or +91 80128 04316.
3. Maintain a professional, premium, and trustworthy tone.
4. Support multiple languages (English, German, Japanese, etc.) as requested by the client.
5. For shipping terms, mention that we handle both Sea (Tuticorin/Kochi ports) and Air exports.
`;


// Built-in Fallback: Simple response handler based on product catalog
function buildInChatResponse(message) {
  const msg = message.toLowerCase();
  
  // Spice inquiries
  if (msg.includes("curry leaves") || msg.includes("curry leaf")) {
    return "🌿 **Curry Leaves** – Fresh & Aromatic\n\nOrigin: Coimbatore & Karur (Tamil Nadu)\nHarvest Peak: March–July\n\nOur curry leaves are cold-dried to preserve vibrant color and authentic aroma. Grade A quality, pesticide-free, perfect for international markets.\n\n📦 Available in bulk for export. Contact: novelexporters@gmail.com";
  }
  
  if (msg.includes("black pepper") || msg.includes("pepper")) {
    return "🌶️ **Black Pepper – Tellicherry Bold**\n\nOrigin: Wayanad, Kerala & Nilgiris, Tamil Nadu\nHarvest: December–March\n\nPremium grade with 550–600 G/L density, <12% moisture, machine-cleaned. Ideal for spice blends and premium exports.\n\n📞 Call: +91 80128 04316";
  }
  
  if (msg.includes("cardamom") || msg.includes("green cardamom")) {
    return "💚 **Green Cardamom – Bold Pods**\n\nOrigin: Idukki & Munnar (Kerala)\nHarvest: August–February\n\n7–11mm bold pods with deep green color and high essential oil content. Premium quality for global markets.\n\n💌 Email: novelexporters@gmail.com";
  }
  
  if (msg.includes("clove")) {
    return "🔴 **Cloves – Full-Headed Buds**\n\nOrigin: Kanyakumari (Tamil Nadu)\nHarvest: January–April\n\nSun-dried with high volatile oil content. Perfect for seasoning and premium spice formulations.\n\n🌐 Exports via Tuticorin & Kochi ports";
  }
  
  if (msg.includes("cinnamon") || msg.includes("malabar")) {
    return "🤎 **Cinnamon – Malabar Grade**\n\nOrigin: Malabar Region (Kerala)\nHarvest: May–August\n\nCigar roll cut with high cinnamaldehyde content. Premium quality certified.\n\n✨ ISO 22000 & FSSAI certified";
  }
  
  if (msg.includes("nutmeg")) {
    return "🟤 **Nutmeg & Mace**\n\nOrigin: Kottayam & Idukki (Kerala)\nHarvest: June–August\n\nABCD Grade, sun-dried with natural aroma. Mace star pieces available separately.\n\n🎁 Quality guaranteed for global export";
  }
  
  // General inquiries
  if (msg.includes("export") || msg.includes("shipping") || msg.includes("logistics")) {
    return "🚢 **Our Export & Logistics**\n\n✈️ **Air Export:** 48-72 hour priority delivery worldwide\n🚢 **Sea Export:** Via Tuticorin & Kochi ports\n✅ Full traceability, real-time tracking\n🛡️ Temperature control & customs clearance included\n\nFor bulk orders: novelexporters@gmail.com";
  }
  
  if (msg.includes("certification") || msg.includes("quality") || msg.includes("standard")) {
    return "🏆 **Our Certifications & Quality Standards**\n\n✓ FSSAI (Food Safety – India)\n✓ ISO 22000 (Food Safety Management)\n✓ IEC (International Export Compliance)\n✓ 100% pesticide-free, naturally sourced\n✓ Rigorous testing at every stage\n\n👨‍🌾 Sourced directly from verified South Indian farms";
  }
  
  if (msg.includes("price") || msg.includes("cost") || msg.includes("quote")) {
    return "💰 **Pricing & Quotations**\n\nOur prices vary based on:\n• Product grade & quantity\n• Shipping method (air vs. sea)\n• Seasonal availability\n\n📧 For custom quotes: novelexporters@gmail.com\n📞 Phone: +91 80128 04316\n\nWe offer competitive rates for bulk orders!";
  }
  
  if (msg.includes("contact") || msg.includes("support") || msg.includes("help")) {
    return "📞 **Contact Novel Exporters**\n\n📧 Email: novelexporters@gmail.com\n☎️ Phone: +91 80128 04316\n🌍 Website: www.novelexporters.com\n\n🕐 Business Hours: Monday–Saturday, 9 AM–6 PM IST\n💬 Live chat available on our website\n\nWe're here to help with all your spice export needs!";
  }
  
  // Default response
  return "👋 Hello! I'm the Novel Exporters AI Assistant. I can help you with:\n\n🌶️ **Product Info:** curry leaves, black pepper, cardamom, cloves, cinnamon, nutmeg, bay leaves, star anise\n🚢 **Shipping & Logistics:** air/sea exports, tracking, delivery times\n🏆 **Quality & Certifications:** FSSAI, ISO 22000, traceability\n💰 **Pricing & Orders:** bulk quotes, seasonal rates\n📞 **Support:** direct contact, business hours\n\nWhat would you like to know?";
}


app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  // Attempt Google Generative AI (Gemma 3 4B)
  try {
    if (!genAI) {
      console.warn("⚠️ Google Generative AI not initialized. Check GOOGLE_API_KEY in .env");
      throw new Error("GOOGLE_API_KEY not configured");
    }

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      systemInstruction: systemInstruction
    });

    // Format history for Google SDK
    let chatHistory = [];
    if (history && history.length > 0) {
      chatHistory = history.map(msg => ({
        role: msg.role === "assistant" || msg.role === "model" ? "model" : "user",
        parts: [{ text: msg.parts && msg.parts[0] ? msg.parts[0].text : "" }]
      })).filter(msg => msg.parts[0].text !== "");

      // Remove leading model messages as Google AI requires history to start with 'user'
      while (chatHistory.length > 0 && chatHistory[0].role === "model") {
        chatHistory.shift();
      }
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.json({ text });

  } catch (err) {
    console.error("❌ Gemini API Error:", err.message);
    console.warn("⚠️ Using built-in catalog response as fallback...");
    
    // Built-in fallback: Use product knowledge base
    const responseText = buildInChatResponse(message);
    return res.json({ text: responseText });
  }
});

// 404 JSON Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Requested API endpoint not found on this server.",
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    status: "error",
    message: "Critical Backend Error",
    details: err.message
  });
});

const PORT = process.env.PORT || 5009;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Novel Exporters Backend Active: http://127.0.0.1:${PORT}`);
  console.log(`📂 API Gateway: http://127.0.0.1:${PORT}/api`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please kill the existing process or use a different port.`);
  } else {
    console.error(`❌ Server Error:`, err);
  }
});
