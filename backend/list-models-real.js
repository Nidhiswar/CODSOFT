require("dotenv").config();
const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Available Models:", data.models ? data.models.map(m => m.name) : "No models found");
        if (data.error) console.log("Error:", data.error);
    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
}

listModels();
