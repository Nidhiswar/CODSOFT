const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profilePicture: { type: String, default: null }, // Base64 or URL for profile image
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    cart: { type: Array, default: [] },
    hasConsented: { type: Boolean, default: false },
    isFirstLogin: { type: Boolean, default: true }, // true = has never logged in, false = has logged in at least once
    consentDetails: {
        version: { type: String, default: "1.0.0" },
        timestamp: { type: Date },
        ipAddress: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
