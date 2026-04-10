const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        mobile: {
            type: String,
            required: true,
            trim: true,
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },

        productTitle: String,
        productPrice: Number,
        productImage: String,
        productLink: String,
        sku: String,

        size: String,
        color: String,
        quantity: Number,

        message: String,

        status: {
            type: String,
            enum: ["new", "contacted", "closed"],
            default: "new",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);