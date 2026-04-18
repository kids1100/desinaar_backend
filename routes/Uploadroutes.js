// ===================== IMAGE UPLOAD API =====================
// routes/uploadRoutes.js mein add karo

const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, filename) => {
    return new Promise((resolve, reject) => {
        const cleanName = filename
            ? filename.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_")
            : `upload_${Date.now()}`;

        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                use_filename: true,
                unique_filename: false,
                public_id: cleanName,
            },
            (error, result) => {
                if (error) return reject(error);
                const cleanUrl = result.secure_url.replace(/\/v\d+\//, "/");
                resolve(cleanUrl);
            }
        );
        stream.end(buffer);
    });
};

// ===================== POST /api/upload/images =====================
// Product main images upload
router.post("/images", upload.array("images"), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                status: "error",
                statusCode: 400,
                message: "No images provided",
            });
        }

        const urls = [];
        for (const file of files) {
            const url = await uploadToCloudinary(
                file.buffer,
                "desinaar/productImage",
                file.originalname
            );
            urls.push(url);
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Images uploaded successfully",
            data: { urls },
        });
    } catch (err) {
        console.error("Image upload error:", err.message);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Error uploading images",
            error: err.message,
        });
    }
});

// ===================== POST /api/upload/detail-images =====================
// Product detail images upload
router.post("/detail-images", upload.array("detailImages"), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({
                status: "error",
                statusCode: 400,
                message: "No detail images provided",
            });
        }

        const urls = [];
        for (const file of files) {
            const url = await uploadToCloudinary(
                file.buffer,
                "desinaar/detailImages",
                file.originalname
            );
            urls.push(url);
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "Detail images uploaded successfully",
            data: { urls },
        });
    } catch (err) {
        console.error("Detail image upload error:", err.message);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Error uploading detail images",
            error: err.message,
        });
    }
});

module.exports = router;

// ===================== app.js / server.js mein add karo =====================
// const uploadRoutes = require('./routes/uploadRoutes');
// app.use('/api/upload', uploadRoutes);