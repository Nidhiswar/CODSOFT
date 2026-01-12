require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // List models is not directly available on the SDK instance in some versions?
        // Actually we can use the rest API or a helper.
        // In newer SDKs:
        // const models = await genAI.listModels();
        // But let's try a simpler way.
        console.log("Attempting to call generative AI...");
    } catch (err) {
        console.error(err);
    }
}
listModels();
