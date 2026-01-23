
require("dotenv").config();
const mongoose = require("mongoose");

const CANDIDATE_KEYS = [
    "MONGODB_URI",
    "MONGO_URI",
    "DATABASE_URL",
    "MONGOOSE_URI",
];

const foundKey = CANDIDATE_KEYS.find(k => typeof process.env[k] === "string" && process.env[k].length > 0);
const uri = foundKey ? process.env[foundKey] : undefined;

console.log("Testing MongoDB connection to:", foundKey ? foundKey : "URI MISSING");

if (!uri) {
    console.error(
        "❌ No MongoDB URI found. Set one of: " + CANDIDATE_KEYS.join(", ") + " in a .env file or environment variables."
    );
    process.exit(1);
}

mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`✅ MongoDB Connection Success (${foundKey})`);
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    });
