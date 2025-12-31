const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for guest enquiries
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Enquiry", EnquirySchema);
