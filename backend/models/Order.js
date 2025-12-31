const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            id: String,
            name: String,
            quantity: Number,
            price_info: String, // Since we don't have fixed prices, this could be "Quotation Requested"
        }
    ],
    status: { type: String, enum: ["pending", "quoted", "confirmed", "shipped"], default: "pending" },
    delivery_request: String,
    requested_delivery_date: Date,
    admin_notes: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
