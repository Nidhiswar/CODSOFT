require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB connection to:", process.env.MONGODB_URI ? "URI found" : "URI MISSING");

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB Connection Success");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Failed:", err.message);
        process.exit(1);
    });
