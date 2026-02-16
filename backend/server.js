const config = require('./config');
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const cors = require("cors");
const dns = require("dns");

// Use Google DNS to resolve MongoDB Atlas SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const authRoutes = require("./routes/authRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const { startDeliveryReminderScheduler, triggerDeliveryReminders } = require("./utils/deliveryReminder");

const app = express();


// 1. Set Security HTTP Headers
app.use(helmet());

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// 3. Data Sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// 4. Prevent Parameter Pollution
app.use(hpp());

// 5. Secure CORS
app.use(cors({
  origin: [
    config.clientUrl,
    'https://novelexporters.com',
    'https://www.novelexporters.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body

// MongoDB Connection
console.log("🔍 Attempting to connect to MongoDB...");

mongoose.connect(config.mongoUri, {
  serverSelectionTimeoutMS: 5000,
  family: 4,
})
  .then(() => {
    console.log("🚀 MongoDB Integrated Successfully");

    // Start the delivery reminder scheduler
    startDeliveryReminderScheduler();
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

mongoose.connection.on("error", err => {
  console.error("❌ MongoDB Runtime Error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

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
      ollama: "Check http://127.0.0.1:11434 manually",
      deliveryReminder: "Scheduler Active (9:00 AM IST daily)"
    },
    endpoints: {
      auth: "/api/auth",
      enquiry: "/api/enquiry",
      orders: "/api/orders",
      chat: "/api/chat",
      triggerReminders: "/api/admin/trigger-delivery-reminders (POST)"
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

// Manual trigger for delivery reminders (Admin only - for testing)
app.post("/api/admin/trigger-delivery-reminders", async (req, res) => {
  try {
    // You can add auth middleware here for security
    await triggerDeliveryReminders();
    res.json({
      success: true,
      message: "Delivery reminder check triggered successfully"
    });
  } catch (err) {
    console.error("❌ Error triggering delivery reminders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to trigger delivery reminders",
      error: err.message
    });
  }
});

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
=== NOVEL EXPORTERS - COMPLETE WEBSITE KNOWLEDGE BASE ===

## COMPANY OVERVIEW
Name: Novel Exporters
Tagline: "Your trusted global bridge for authentic Indian spices"
Location: Novel Exporters, 2/202-C, Dhanam Nagar, Mylampatti, Coimbatore - 641062, Tamil Nadu, India
Founded: 10+ years of expertise in spice exports
Mission: Sourcing 100% authentic spices directly from South Indian farms for global export markets

## CONTACT INFORMATION
Email: novelexporters@gmail.com
Phone: +91 80128 04316
Business Hours: Monday - Saturday, 9:00 AM - 6:00 PM IST
Website: www.novelexporters.com

## PRODUCTS CATALOG (10 Premium Spices)

1. CURRY LEAVES (கறிவேப்பிலை - Kariveppilai)
   - Type: Fresh & Dry Curry Leaves
   - Category: Leaves
   - Origin: Tamil Nadu (Coimbatore & Karur)
   - Harvest Peak: March - July
   - Description: Aromatic curry leaves sourced from Tamil Nadu. Essential for South Indian cuisine, picked at peak freshness. Available in fresh and premium cold-dried grades.
   - Quality: Cold-dried, Grade A color retention, Pesticide-free
   - Certifications: FSSAI, ISO 22000, IEC, APEDA

2. BLACK PEPPER (மிளகு - Milagu)
   - Type: Tellicherry Bold Black Pepper
   - Category: Seeds
   - Origin: Kerala (Wayanad) & Tamil Nadu (Nilgiris)
   - Harvest: December - March
   - Description: Known as 'Black Gold', sourced from high-altitude plantations. Large, bold peppercorns, hand-harvested and sun-dried for high piperine content.
   - Quality: 550-600 G/L density, <12% moisture, Machine cleaned
   - Certifications: FSSAI, Spices Board of India, ISO 22000

3. GREEN CARDAMOM (ஏலக்காய் - Elakkai)
   - Type: Bold Green Cardamom Pods
   - Category: Seeds
   - Origin: Kerala (Idukki & Munnar)
   - Harvest: August - February
   - Description: 'Queen of Spices'. 8mm+ bold green pods from misty Kerala hills. Deep green color with high essential oil content.
   - Quality: 7-11mm bold pods, Deep green, High essential oil
   - Certifications: FSSAI, IEC, Spices Board Approved

4. CLOVES (கிராம்பு - Kirambu)
   - Type: Clove Flowers / Buds
   - Category: Flowers
   - Origin: Tamil Nadu (Kanyakumari) & Kerala
   - Harvest: January - April
   - Description: Grown in Kerala's hilly regions, rich in eugenol. Full-headed, deep reddish-brown buds with powerful aroma.
   - Quality: Full headed buds, High volatile oil, Sun dried
   - Certifications: FSSAI, ISO 22000, Quality Grade A

5. NUTMEG (ஜாதிக்காய் - Jathikkai)
   - Type: Whole Nutmeg Seeds
   - Category: Seeds
   - Origin: Kerala (Kottayam & Idukki)
   - Harvest: June - August
   - Description: From lush Kerala spice gardens. Carefully dried and graded. Warm, sweet aroma with rich, nutty flavor.
   - Quality: ABCD Grade, Sun dried, Natural aroma
   - Certifications: FSSAI, Export Certified, Non-GMO

6. NUTMEG MACE (ஜாதிப்பத்திரி - Jathipathiri)
   - Type: Mace Aril (Nutmeg covering)
   - Category: Seeds
   - Origin: Kerala (Thrissur & Ernakulam)
   - Harvest: June - August
   - Description: Delicate, bright red aril covering nutmeg seed. Hand-collected and shade-dried to preserve vibrant color.
   - Quality: Red mace star pieces, Pure fragrance
   - Certifications: FSSAI, IEC, Purity Guaranteed

7. KAPOK BUDS (இலவம் பூ - Ilavam Poo)
   - Type: Dried Kapok Buds
   - Category: Flowers
   - Origin: Tamil Nadu (Theni & Dindigul)
   - Harvest: February - April
   - Description: Unique traditional spice with cooling medicinal properties. Staple in authentic medicinal and culinary traditions.
   - Quality: Rare indigenous variety, Cooling medicinal properties
   - Certifications: FSSAI, Wild Harvested, Medicinal Grade

8. CINNAMON (பட்டை - Pattai)
   - Type: Cinnamon Sticks (Malabar Grade)
   - Category: Bark
   - Origin: Kerala (Malabar Region)
   - Harvest: May - August
   - Description: Malabar Cinnamon with thin, cigar-like rolls. Sweet, delicate flavor with high cinnamaldehyde content.
   - Quality: Cigar roll cut, High cinnamaldehyde
   - Certifications: FSSAI, ISO 22000, No Additives

9. STAR ANISE (அன்னாசிப்பூ - Annasipoo)
   - Type: Whole Star Anise Pods
   - Category: Seeds
   - Origin: Kerala
   - Harvest: October - December
   - Description: Beautiful 8-pointed star pods from Kerala spice gardens. Whole and unbroken with powerful licorice-like aroma.
   - Quality: Complete 8-petal stars, Strong anethole aroma
   - Certifications: FSSAI, Grade A sorting, IEC

10. BAY LEAVES (பிரியாணி இலை - Biriyani Ilai)
    - Type: Dried Bay Leaves
    - Category: Leaves
    - Origin: Kerala & Tamil Nadu (Western Ghats)
    - Harvest: October - December
    - Description: Thick, aromatic leaves air-dried to retain volatile oils. Deep, woodsy fragrance.
    - Quality: Uniform green, Zero moisture/fungus
    - Certifications: FSSAI, Ethically Sourced, Organic Practices

## CERTIFICATIONS & QUALITY STANDARDS
- FSSAI (Food Safety and Standards Authority of India)
- ISO 22000 (Food Safety Management System)
- IEC (Import-Export Code)
- APEDA (Agricultural and Processed Food Products Export Development Authority)
- Spices Board of India Certification
- 100% Pesticide-free, naturally sourced
- Rigorous quality testing at every stage

## LOGISTICS & SHIPPING
Export Ports: Tuticorin (Tamil Nadu) & Kochi (Kerala)
Shipping Methods:
  - Air Export: 48-72 hour priority delivery worldwide
  - Sea Freight: Cost-effective bulk shipping via containers
Features:
  - Full traceability with real-time tracking
  - Temperature-controlled shipments
  - Complete customs clearance documentation
  - Vacuum-sealed, moisture-proof packaging

## PACKAGING & PRESERVATION
- State-of-the-art vacuum-sealing facility
- Food-grade, multi-layered packaging materials
- FSSAI Grade packaging standards
- Tamper-proof seals
- Moisture, oxygen, and light protection
- Extended shelf-life preservation of essential oils

## ORDERING & PRICING
- Custom quotes available based on product, quantity, and shipping method
- Bulk order discounts available
- Seasonal pricing variations
- MOQ (Minimum Order Quantity) varies by product
- For quotes: Email novelexporters@gmail.com or call +91 80128 04316

## ABOUT NOVEL EXPORTERS
- Based in Coimbatore, Tamil Nadu
- Direct sourcing network with farmers across Tamil Nadu and Kerala
- Focus on the rich soil of Tamil Nadu and aromatic plantations of Kerala
- Deep-rooted farmer relationships ensure finest harvests at peak quality
- Transparency and traceability for every spice shipment
- Every spice carries the story of its origin farm

## SOURCING REGIONS
Tamil Nadu Districts: Coimbatore, Karur, Theni, Dindigul, Nilgiris, Kanyakumari
Kerala Districts: Wayanad, Idukki, Munnar, Kottayam, Thrissur, Ernakulam, Malabar region, Western Ghats

## WEBSITE PAGES
- Home: Overview and featured products
- About: Company story, mission, packaging, logistics
- Products: Full spice catalog with details
- Contact: Email, phone, address, business hours
- Enquiry: Submit bulk order inquiries
- Login/Register: User account management
`;

const systemInstruction = `
You are the official AI assistant for Novel Exporters, a premium Indian spice export company. You are powered by advanced AI technology and have comprehensive knowledge of the entire Novel Exporters website and product catalog.

${productCatalog}

RESPONSE GUIDELINES:
1. Always use the provided knowledge base to answer questions accurately
2. For product inquiries, include: Tamil name, origin, harvest timing, quality details, and certifications
3. For pricing/quotes, direct users to: novelexporters@gmail.com or +91 80128 04316
4. Maintain a professional, warm, and knowledgeable tone befitting a premium spice brand
5. Use appropriate emojis sparingly to enhance responses (🌿🌶️💚🤎✨📦✈️🚢📧📞)
6. If you don't know something specific, provide the contact email and phone number
7. **MULTI-LINGUAL SUPPORT (CRITICAL):** Automatically detect the language of the user's message and ALWAYS respond in the SAME language. If the user writes in Tamil, respond entirely in Tamil. If in Hindi, respond in Hindi. If in German, respond in German. If in Japanese, respond in Japanese. Match the user's language exactly without them needing to ask.
8. For shipping queries, mention both air (48-72h) and sea (Tuticorin/Kochi) options
9. Highlight certifications (FSSAI, ISO 22000, IEC) when discussing quality
10. Be helpful with related topics like spice usage, storage tips, and culinary applications
`;


// Built-in Fallback: Comprehensive response handler based on website data
function buildInChatResponse(message) {
  const msg = message.toLowerCase();

  // === PRODUCT INQUIRIES ===

  if (msg.includes("curry leaves") || msg.includes("curry leaf") || msg.includes("kariveppilai")) {
    return "🌿 **Curry Leaves (கறிவேப்பிலை - Kariveppilai)**\n\n📍 Origin: Coimbatore & Karur, Tamil Nadu\n📅 Harvest Peak: March – July\n\nAromatic curry leaves, essential for South Indian cuisine. Available in:\n• Fresh grade (for immediate use)\n• Premium cold-dried (extended shelf life)\n\n✅ Quality: Grade A color retention, pesticide-free\n🏆 Certifications: FSSAI, ISO 22000, IEC, APEDA\n\n📦 Available for bulk export\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("black pepper") || msg.includes("pepper") || msg.includes("milagu")) {
    return "🌶️ **Black Pepper (மிளகு - Milagu) – Tellicherry Bold**\n\n📍 Origin: Wayanad (Kerala) & Nilgiris (Tamil Nadu)\n📅 Harvest: December – March\n\nKnown as 'Black Gold', hand-harvested from high-altitude plantations:\n• 550–600 G/L density\n• <12% moisture content\n• Machine cleaned & sorted\n\n✅ High piperine content for pungent, complex aroma\n🏆 Certifications: FSSAI, Spices Board of India, ISO 22000\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("cardamom") || msg.includes("green cardamom") || msg.includes("elakkai") || msg.includes("elaichi")) {
    return "💚 **Green Cardamom (ஏலக்காய் - Elakkai) – Queen of Spices**\n\n📍 Origin: Idukki & Munnar, Kerala\n📅 Harvest: August – February\n\n8mm+ bold green pods from misty Kerala hills:\n• Deep green color\n• High essential oil content\n• 7-11mm premium sizing\n\n🏆 Certifications: FSSAI, IEC, Spices Board Approved\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("clove") || msg.includes("kirambu")) {
    return "🔴 **Cloves (கிராம்பு - Kirambu)**\n\n📍 Origin: Kanyakumari (Tamil Nadu) & Kerala\n📅 Harvest: January – April\n\nFull-headed, deep reddish-brown buds:\n• Rich in eugenol\n• High volatile oil content\n• Sun-dried for quality preservation\n\n🏆 Certifications: FSSAI, ISO 22000, Quality Grade A\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("cinnamon") || msg.includes("pattai")) {
    return "🤎 **Cinnamon Sticks (பட்டை - Pattai) – Malabar Grade**\n\n📍 Origin: Malabar Region, Kerala\n📅 Harvest: May – August\n\nPremium Malabar Cinnamon features:\n• Thin, cigar-like rolls\n• Sweet, delicate flavor\n• High cinnamaldehyde content\n\n🏆 Certifications: FSSAI, ISO 22000, No Additives\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("nutmeg") || msg.includes("jathikkai") || msg.includes("mace") || msg.includes("jathipathiri")) {
    return "🟤 **Nutmeg & Mace**\n\n**Nutmeg (ஜாதிக்காய் - Jathikkai)**\n📍 Origin: Kottayam & Idukki, Kerala\n📅 Harvest: June – August\nABCD Grade, sun-dried, warm sweet aroma\n\n**Mace (ஜாதிப்பத்திரி - Jathipathiri)**\nDelicate bright red aril, shade-dried for vibrant color\n\n🏆 Certifications: FSSAI, IEC, Export Certified, Non-GMO\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("star anise") || msg.includes("annasipoo")) {
    return "⭐ **Star Anise (அன்னாசிப்பூ - Annasipoo)**\n\n📍 Origin: Kerala\n📅 Harvest: October – December\n\nBeautiful 8-pointed star pods:\n• Whole and unbroken\n• Powerful licorice-like aroma\n• Strong anethole content\n\n🏆 Certifications: FSSAI, Grade A sorting, IEC\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("bay leaves") || msg.includes("bay leaf") || msg.includes("biriyani ilai")) {
    return "🍃 **Bay Leaves (பிரியாணி இலை - Biriyani Ilai)**\n\n📍 Origin: Western Ghats (Kerala & Tamil Nadu)\n📅 Harvest: October – December\n\nThick, aromatic leaves:\n• Air-dried to retain volatile oils\n• Deep, woodsy fragrance\n• Uniform green, zero moisture\n\n🏆 Certifications: FSSAI, Ethically Sourced, Organic Practices\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  if (msg.includes("kapok") || msg.includes("ilavam poo")) {
    return "🌸 **Kapok Buds (இலவம் பூ - Ilavam Poo)**\n\n📍 Origin: Theni & Dindigul, Tamil Nadu\n📅 Harvest: February – April\n\nUnique traditional spice:\n• Rare indigenous variety\n• Cooling medicinal properties\n• Staple in authentic traditions\n\n🏆 Certifications: FSSAI, Wild Harvested, Medicinal Grade\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  // === PRODUCT LISTING ===
  if (msg.includes("product") || msg.includes("spice") || msg.includes("what do you sell") || msg.includes("catalog") || msg.includes("list")) {
    return "🌿 **Novel Exporters Product Catalog**\n\nWe export 10 premium South Indian spices:\n\n🌿 **Leaves:** Curry Leaves, Bay Leaves\n🌶️ **Seeds:** Black Pepper, Green Cardamom, Nutmeg, Star Anise\n🌸 **Flowers:** Cloves, Kapok Buds\n🤎 **Bark:** Cinnamon (Malabar)\n🟤 **Others:** Nutmeg Mace\n\n✅ All products are FSSAI & ISO 22000 certified\n📍 Sourced from Tamil Nadu & Kerala farms\n\nWhich spice would you like to know more about?";
  }

  // === COMPANY INFO ===
  if (msg.includes("about") || msg.includes("company") || msg.includes("who are you") || msg.includes("novel exporters")) {
    return "🏢 **About Novel Exporters**\n\n📍 Location: Coimbatore, Tamil Nadu, India\n📅 Experience: 10+ years in spice exports\n\n🌱 **Our Story:**\nWe bridge the gap between South Indian farms and global markets, sourcing 100% authentic spices directly from farmers in Tamil Nadu and Kerala.\n\n✨ **What Sets Us Apart:**\n• Direct farmer relationships\n• Complete traceability\n• Premium quality standards\n• FSSAI & ISO 22000 certified\n\n🌍 Exporting to markets worldwide via Tuticorin & Kochi ports\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  // === LOGISTICS & SHIPPING ===
  if (msg.includes("export") || msg.includes("shipping") || msg.includes("logistics") || msg.includes("delivery") || msg.includes("port")) {
    return "🚢 **Export & Logistics**\n\n**Shipping Methods:**\n✈️ **Air Export:** 48-72 hour priority delivery worldwide\n🚢 **Sea Freight:** Via Tuticorin (TN) & Kochi (KL) ports\n\n**Features:**\n✅ Full traceability with real-time tracking\n🌡️ Temperature-controlled shipments\n📋 Complete customs clearance documentation\n📦 Vacuum-sealed, moisture-proof packaging\n\n**Coverage:** Worldwide delivery to all major markets\n\n📧 For shipping quotes: novelexporters@gmail.com\n📞 +91 80128 04316";
  }

  // === CERTIFICATIONS & QUALITY ===
  if (msg.includes("certification") || msg.includes("quality") || msg.includes("standard") || msg.includes("fssai") || msg.includes("iso")) {
    return "🏆 **Certifications & Quality Standards**\n\n**Our Certifications:**\n✓ FSSAI (Food Safety – India)\n✓ ISO 22000 (Food Safety Management)\n✓ IEC (Import-Export Code)\n✓ APEDA (Export Development Authority)\n✓ Spices Board of India\n\n**Quality Commitment:**\n🌿 100% pesticide-free, naturally sourced\n🔬 Rigorous testing at every stage\n👨‍🌾 Direct sourcing from verified farms\n📦 State-of-the-art packaging facility\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  // === PRICING ===
  if (msg.includes("price") || msg.includes("cost") || msg.includes("quote") || msg.includes("rate") || msg.includes("how much")) {
    return "💰 **Pricing & Quotations**\n\nOur prices depend on:\n• Product type & grade\n• Order quantity (MOQ varies)\n• Shipping method (air vs. sea)\n• Seasonal availability\n\n**Get a Custom Quote:**\n📧 Email: novelexporters@gmail.com\n📞 Phone: +91 80128 04316\n\n💡 We offer competitive rates for bulk orders!\n🕐 Response within 24 business hours";
  }

  // === CONTACT ===
  if (msg.includes("contact") || msg.includes("reach") || msg.includes("phone") || msg.includes("email") || msg.includes("address") || msg.includes("location")) {
    return "📞 **Contact Novel Exporters**\n\n📧 **Email:** novelexporters@gmail.com\n☎️ **Phone:** +91 80128 04316\n\n📍 **Address:**\nNovel Exporters\n2/202-C, Dhanam Nagar\nMylampatti, Coimbatore - 641062\nTamil Nadu, India\n\n🕐 **Business Hours:**\nMonday – Saturday\n9:00 AM – 6:00 PM IST\n\n🌐 www.novelexporters.com";
  }

  // === ORDERING ===
  if (msg.includes("order") || msg.includes("buy") || msg.includes("purchase") || msg.includes("enquiry") || msg.includes("inquiry")) {
    return "🛒 **How to Order**\n\n**For Bulk Orders:**\n1️⃣ Visit our website's Enquiry page\n2️⃣ Email us at novelexporters@gmail.com\n3️⃣ Call +91 80128 04316\n\n**We'll Need:**\n• Product(s) you're interested in\n• Required quantity\n• Delivery destination\n• Preferred shipping method\n\n📋 We'll send you a custom quotation within 24 hours!\n\n💡 Tip: Mention your business type for special rates";
  }

  // === PACKAGING ===
  if (msg.includes("packaging") || msg.includes("pack") || msg.includes("storage")) {
    return "📦 **Packaging & Preservation**\n\n**Our Packaging Standards:**\n✅ State-of-the-art vacuum-sealing\n✅ Food-grade, multi-layered materials\n✅ FSSAI Grade compliant\n✅ Tamper-proof seals\n\n**Protection Features:**\n🌡️ Moisture control\n💨 Oxygen barrier\n☀️ Light protection\n🌿 Essential oil preservation\n\n📦 Extended shelf-life guaranteed\n\n📧 novelexporters@gmail.com | 📞 +91 80128 04316";
  }

  // === ORIGIN/SOURCING ===
  if (msg.includes("origin") || msg.includes("source") || msg.includes("farm") || msg.includes("where") || msg.includes("tamil nadu") || msg.includes("kerala")) {
    return "🌾 **Sourcing Regions**\n\n**Tamil Nadu:**\n• Coimbatore – Curry Leaves\n• Karur – Curry Leaves\n• Theni & Dindigul – Kapok Buds\n• Nilgiris – Black Pepper\n• Kanyakumari – Cloves\n\n**Kerala:**\n• Wayanad – Black Pepper\n• Idukki & Munnar – Cardamom\n• Kottayam – Nutmeg\n• Malabar – Cinnamon\n• Western Ghats – Bay Leaves\n\n👨‍🌾 Direct farmer relationships ensure peak quality!\n\n📧 novelexporters@gmail.com";
  }

  // === GREETINGS ===
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("good morning") || msg.includes("good evening")) {
    return "👋 **Welcome to Novel Exporters!**\n\nI'm your AI assistant, here to help with:\n\n🌶️ **Products:** Info on our 10 premium spices\n🚢 **Shipping:** Air & sea export options\n🏆 **Quality:** Certifications & standards\n💰 **Pricing:** Custom quotes for bulk orders\n📞 **Contact:** Get in touch with our team\n\nHow can I assist you today?";
  }

  // === THANKS ===
  if (msg.includes("thank") || msg.includes("thanks")) {
    return "🙏 **You're welcome!**\n\nWe're glad to help. If you have any more questions about our spices or export services, feel free to ask!\n\n📧 novelexporters@gmail.com\n📞 +91 80128 04316\n\n✨ Have a great day!";
  }

  // === DEFAULT RESPONSE ===
  return "👋 **Hello! I'm the Novel Exporters AI Assistant**\n\nI can help you with:\n\n🌶️ **Products:** Curry leaves, black pepper, cardamom, cloves, cinnamon, nutmeg, star anise, bay leaves, mace, kapok buds\n🚢 **Shipping:** Air (48-72h) & sea exports via Tuticorin/Kochi\n🏆 **Quality:** FSSAI, ISO 22000, IEC certifications\n💰 **Pricing:** Custom quotes for bulk orders\n📍 **About Us:** Company info & sourcing\n📞 **Contact:** Email, phone, address\n\n**Try asking:**\n• \"Tell me about cardamom\"\n• \"What are your shipping options?\"\n• \"How do I place an order?\"\n\nWhat would you like to know?";
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

const PORT = config.port;
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
