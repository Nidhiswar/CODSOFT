require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Quick test script to diagnose chatbot AI service issues
 * Run: node backend/test-chatbot.js
 */

const API_BASE = "http://127.0.0.1:5009";

async function testHealth() {
  console.log("\n🔍 Testing backend health endpoint...");
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    console.log("✅ Health Status:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
  }
}

async function testChat() {
  console.log("\n🤖 Testing chatbot endpoint...");
  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What are your top spice exports?",
        history: []
      })
    });
    const data = await res.json();
    if (res.status === 200) {
      console.log("✅ Chat Response:", data.text);
    } else if (res.status === 503) {
      console.warn("⚠️ Service Unavailable:", data.text);
      console.log("   Details:", data.details);
    } else {
      console.error(`❌ Error (${res.status}):`, data);
    }
  } catch (err) {
    console.error("❌ Chat test failed:", err.message);
  }
}

async function runTests() {
  console.log("═══════════════════════════════════════════════");
  console.log("   NOVEL EXPORTERS CHATBOT DIAGNOSTIC TEST");
  console.log("═══════════════════════════════════════════════");
  
  console.log("\n📋 Environment Check:");
  console.log(`   GOOGLE_API_KEY: ${process.env.GOOGLE_API_KEY ? "✓ Set" : "✗ Missing"}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? "✓ Set" : "✗ Missing"}`);
  console.log(`   PORT: ${process.env.PORT || 5009}`);
  
  await testHealth();
  await testChat();
  
  console.log("\n═══════════════════════════════════════════════");
  console.log("💡 Troubleshooting tips:");
  console.log("   1. Ensure backend server is running (npm run dev)");
  console.log("   2. If 'service_unavailable': Check GOOGLE_API_KEY is valid");
  console.log("   3. Alternative: Install & run Ollama on http://127.0.0.1:11434");
  console.log("   4. Check backend logs for detailed error messages");
  console.log("═══════════════════════════════════════════════\n");
}

runTests();
