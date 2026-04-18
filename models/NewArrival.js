// models/NewArrival.js
const mongoose = require("mongoose");

// ✅ Color sub-schema: name + hex code dono
const colorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
            // Hex code validation (#FFF ya #FFFFFF dono allow)
            validate: {
                validator: function (v) {
                    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(v);
                },
                message: (props) => `${props.value} is not a valid hex color code!`,
            },
        },
    },
    { _id: false }
);

const newArrivalSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        sku: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },

        // Images
        imageUrls: {
            type: [String],
            default: [],
        },
        detailImages: {
            type: [String],
            default: [],
        },
        videoUrl: {
            type: String,
            default: "",
        },

        // Variants
        sizes: {
            type: [String],
            default: [],
        },
        // ✅ Colors now = array of { name, code }
        colors: {
            type: [colorSchema],
            default: [],
        },

        // Product details
        fabric: { type: String, default: "" },
        color: { type: String, default: "" }, // primary color name (optional)
        workType: { type: String, default: "" },
        deliveryTimeline: { type: String, default: "" },
        setIncludes: { type: String, default: "" },
        kurtaLength: { type: String, default: "" },
        pantsLength: { type: String, default: "" },
        washCare: { type: String, default: "" },
        styleCode: { type: String, default: "" },
        additionalNotes: { type: String, default: "" },

        // Shipping
        domesticShipping: { type: String, default: "" },
        internationalShipping: { type: String, default: "" },
        domesticTime: { type: String, default: "" },
        internationalTime: { type: String, default: "" },
        returnPolicy: { type: String, default: "" },

        // New Arrival specific
        collectionType: {
            type: String,
            trim: true,
            default: "",
        },
        sequenceNo: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("NewArrival", newArrivalSchema);