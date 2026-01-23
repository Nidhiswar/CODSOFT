const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    cart: { type: Array, default: [] },
    hasConsented: { type: Boolean, default: false },
    consentDetails: {
        version: { type: String, default: "1.0.0" },
        timestamp: { type: Date },
        ipAddress: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
