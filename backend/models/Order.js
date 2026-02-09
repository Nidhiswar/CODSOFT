const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            id: String,
            name: String,
            quantity: Number,
            unit: { type: String, enum: ["kg", "g"], default: "kg" },
            price_info: String, // Since we don't have fixed prices, this could be "Quotation Requested"
            unit_price: Number, // Price per unit set by admin
            total_price: Number, // unit_price * quantity
        }
    ],
    currency: { type: String, default: "INR" },
    shipping_charges: { type: Number, default: 0 }, // Shipping charges set by admin
    total_amount: Number, // Sum of all product total_prices + shipping_charges
    status: { type: String, enum: ["pending", "quoted", "confirmed", "shipped", "approved", "rejected"], default: "pending" },
    delivery_request: String,
    delivery_location: String, // City/Country for delivery
    requested_delivery_date: Date,
    estimated_delivery_date: Date,
    delivery_reminder_sent: { type: Boolean, default: false },
    admin_notes: String,
    price_updated_at: Date, // Track when prices were last updated
    // Modification history - tracks when user modifies products
    modification_history: [{
        modified_at: { type: Date, default: Date.now },
        previous_products: [{
            name: String,
            quantity: Number,
            unit: String
        }],
        new_products: [{
            name: String,
            quantity: Number,
            unit: String
        }]
    }],
    // Price update history - tracks when admin updates prices
    price_update_history: [{
        updated_at: { type: Date, default: Date.now },
        total_amount: Number,
        currency: String,
        shipping_charges: Number,
        products: [{
            name: String,
            quantity: Number,
            unit: String,
            unit_price: Number
        }],
        notes: String
    }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
