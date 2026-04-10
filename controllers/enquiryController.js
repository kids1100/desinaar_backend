const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");

// ================= CREATE =================
exports.createEnquiry = async (req, res) => {
    try {
        console.log("👉 Request Body:", req.body);
        console.log("👉 DB State:", mongoose.connection.readyState);

        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({
                success: false,
                message: "Database not connected.",
            });
        }

        const {
            name,
            mobile,
            productId,
            productTitle,
            productPrice,
            productImage,
            productLink,
            sku,
            size,
            color,
            quantity,
            message,
        } = req.body;

        if (!name || !mobile) {
            return res.status(400).json({
                success: false,
                message: "Name and mobile are required.",
            });
        }

        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(String(mobile))) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number.",
            });
        }

        const enquiry = await Enquiry.create({
            name: name.trim(),
            mobile: mobile.trim(),

            productId:
                productId && mongoose.Types.ObjectId.isValid(productId)
                    ? productId
                    : null,

            productTitle: productTitle || "",
            productPrice: Number(productPrice) || 0,
            productImage: productImage || "",
            productLink: productLink || "",
            sku: sku || "",

            size: size || "",
            color: color || "",
            quantity: Number(quantity) || 1,

            message: message || "",
        });

        return res.status(201).json({
            success: true,
            message:
                "Request saved successfully. Our designer will connect with you on WhatsApp or call as soon as possible.",
            data: enquiry,
        });
    } catch (error) {
        console.error("❌ createEnquiry error:", error);

        return res.status(500).json({
            success: false,
            message: "Error saving enquiry.",
            error: error.message,
        });
    }
};

// ================= GET =================
exports.getAllEnquiries = async (req, res) => {
    try {
        const data = await Enquiry.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};

// ================= UPDATE =================
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await Enquiry.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        res.json({
            success: true,
            data: updated,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        });
    }
};