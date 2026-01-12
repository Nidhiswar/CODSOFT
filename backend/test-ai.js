require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAI() {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        console.error("❌ GEMINI_API_KEY missing");
        process.exit(1);
    }

    console.log("Testing with key:", API_KEY.substring(0, 5) + "...");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log("✅ AI Response:", response.text());
        process.exit(0);
    } catch (err) {
        console.error("❌ AI Error:", err.message);
        process.exit(1);
    }
}

testAI();
