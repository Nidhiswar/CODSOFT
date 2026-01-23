require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAI() {
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
        console.error("❌ GOOGLE_API_KEY missing");
        process.exit(1);
    }

    console.log("Testing with key:", API_KEY.substring(0, 5) + "...");
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemma-3-4b-it" });

    try {
        const result = await model.generateContent("Hello! Are you Gemma 3?");
        const response = await result.response;
        console.log("✅ AI Response:", response.text());
        process.exit(0);
    } catch (err) {
        console.error("❌ AI Error:", err.message);
        process.exit(1);
    }
}

testAI();
