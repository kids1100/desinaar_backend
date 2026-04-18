// controllers/newArrivalController.js
const NewArrival = require("../models/NewArrival");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Helper: Upload a single buffer to Cloudinary with original filename
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

// ✅ Helper: Parse & normalize colors array
// Supports 3 input formats from frontend:
//   1. JSON string: '[{"name":"Beige","code":"#C2A27A"}]'
//   2. Array of objects: [{ name: "Beige", code: "#C2A27A" }]
//   3. Array of strings (legacy): ["#C2A27A", "#000000"] → auto-fills name
const parseColors = (rawColors) => {
    if (!rawColors) return [];

    let parsed = rawColors;

    // If string, parse JSON
    if (typeof rawColors === "string") {
        try {
            parsed = JSON.parse(rawColors);
        } catch (err) {
            console.error("Invalid colors JSON:", err.message);
            return [];
        }
    }

    if (!Array.isArray(parsed)) return [];

    // Normalize each item
    return parsed
        .map((item) => {
            // Legacy format: just a hex string
            if (typeof item === "string") {
                return { name: item, code: item };
            }
            // Object format
            if (item && typeof item === "object" && item.code) {
                return {
                    name: (item.name || item.code).trim(),
                    code: item.code.trim(),
                };
            }
            return null;
        })
        .filter(Boolean);
};

// ===================== CREATE NEW ARRIVAL =====================
const uploadNewArrival = async (req, res) => {
    let imageUrls = [];

    try {
        console.log("Uploading new arrival:", req.body);

        const {
            title,
            sku,
            price,
            sizes,
            colors,
            fabric,
            color,
            workType,
            deliveryTimeline,
            setIncludes,
            kurtaLength,
            pantsLength,
            washCare,
            styleCode,
            additionalNotes,
            domesticShipping,
            internationalShipping,
            domesticTime,
            internationalTime,
            returnPolicy,
            collectionType,
            sequenceNo,
            description,
            videoUrl,
            isActive,
        } = req.body;

        const images = req.files?.images || req.files || [];

        if (!title?.trim() || !sku?.trim() || isNaN(parseFloat(price))) {
            return res.status(400).json({
                status: "error",
                statusCode: 400,
                message: "Missing or invalid required fields (title, sku, price)",
            });
        }

        // ✅ Upload main images
        if (images && images.length > 0) {
            for (const image of images) {
                const url = await uploadToCloudinary(
                    image.buffer,
                    "desinaar/newArrivalImage",
                    image.originalname
                );
                imageUrls.push(url);
                console.log("New arrival image uploaded:", url);
            }
        }

        // ✅ Upload detail images
        let detailImageUrls = [];
        const detailImages = req.files?.detailImages || [];
        if (detailImages.length > 0) {
            for (const image of detailImages) {
                const url = await uploadToCloudinary(
                    image.buffer,
                    "desinaar/newArrivalDetailImages",
                    image.originalname
                );
                detailImageUrls.push(url);
                console.log("New arrival detail image uploaded:", url);
            }
        }

        const newArrival = new NewArrival({
            title: title?.trim(),
            description: description || "",
            sku: sku?.trim(),
            price: price ? parseFloat(price) : undefined,
            sizes: sizes ? JSON.parse(sizes) : [],
            colors: parseColors(colors), // ✅ normalized { name, code }
            imageUrls,
            detailImages: detailImageUrls,
            videoUrl: videoUrl || "",

            fabric,
            color,
            workType,
            deliveryTimeline,
            setIncludes,
            kurtaLength,
            pantsLength,
            washCare,
            styleCode,
            additionalNotes,

            domesticShipping,
            internationalShipping,
            domesticTime,
            internationalTime,
            returnPolicy,

            collectionType: collectionType?.trim(),
            sequenceNo: sequenceNo ? parseInt(sequenceNo) : 0,
            isActive: isActive === "false" ? false : true,
        });

        await newArrival.save();

        return res.status(201).json({
            status: "success",
            statusCode: 201,
            message: "New arrival uploaded successfully!",
            data: newArrival,
        });
    } catch (error) {
        console.error("Upload New Arrival Error:", error);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Error uploading new arrival",
            error: error.message,
        });
    }
};

// ===================== GET ALL NEW ARRIVALS =====================
const getAllNewArrivals = async (req, res) => {
    try {
        let { collectionType, limit, active } = req.query;

        collectionType = collectionType?.replace(/"/g, "").trim();

        const filter = {};

        if (collectionType) {
            filter.collectionType = new RegExp(`^${collectionType}$`, "i");
        }

        if (active === "true") {
            filter.isActive = true;
        } else if (active === "false") {
            filter.isActive = false;
        }

        let query = NewArrival.find(filter).sort({
            sequenceNo: 1,
            createdAt: -1,
        });

        if (limit) {
            query = query.limit(parseInt(limit));
        }

        const newArrivals = await query;

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "New arrivals retrieved successfully",
            count: newArrivals.length,
            data: newArrivals,
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Server error while retrieving new arrivals",
            error: err.message,
        });
    }
};

// ===================== GET NEW ARRIVAL BY ID =====================
const getNewArrivalById = async (req, res) => {
    try {
        const { id } = req.params;
        const newArrival = await NewArrival.findById(id);

        if (!newArrival) {
            return res.status(404).json({
                status: "error",
                statusCode: 404,
                message: "New arrival not found",
                data: null,
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "New arrival retrieved successfully",
            data: newArrival,
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Server error while retrieving new arrival",
            error: err.message,
        });
    }
};

// ===================== UPDATE NEW ARRIVAL =====================
const updateNewArrival = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        console.log("Request body updates:", updates);
        console.log("Update id:", id);

        const newArrival = await NewArrival.findById(id);
        if (!newArrival) {
            return res.status(404).json({
                status: "error",
                statusCode: 404,
                message: "New arrival not found",
                data: null,
            });
        }

        // ---------- Handle main images ----------
        const newImageFiles = req.files?.images || [];
        let newImageUrls = [];

        for (const image of newImageFiles) {
            const url = await uploadToCloudinary(
                image.buffer,
                "desinaar/newArrivalImage",
                image.originalname
            );
            newImageUrls.push(url);
        }

        let existingImages = updates.existingImages || [];
        if (typeof existingImages === "string") existingImages = [existingImages];

        const finalImageUrls = [...existingImages, ...newImageUrls];
        updates.imageUrls =
            finalImageUrls.length > 0 ? finalImageUrls : newArrival.imageUrls;

        delete updates.existingImages;

        // ---------- Handle detail images ----------
        const newDetailFiles = req.files?.detailImages || [];
        let newDetailUrls = [];

        for (const image of newDetailFiles) {
            const url = await uploadToCloudinary(
                image.buffer,
                "desinaar/newArrivalDetailImages",
                image.originalname
            );
            newDetailUrls.push(url);
        }

        let existingDetailImages = updates.existingDetailImages || [];
        if (typeof existingDetailImages === "string")
            existingDetailImages = [existingDetailImages];

        const finalDetailUrls = [...existingDetailImages, ...newDetailUrls];
        updates.detailImages =
            finalDetailUrls.length > 0 ? finalDetailUrls : newArrival.detailImages;

        delete updates.existingDetailImages;

        // ---------- Parse structured fields ----------
        const parseIfString = (field) =>
            typeof field === "string" ? JSON.parse(field) : field;

        if (updates.sizes) updates.sizes = parseIfString(updates.sizes);

        // ✅ Colors ko bhi normalize karo
        if (updates.colors !== undefined) {
            updates.colors = parseColors(updates.colors);
        }

        if (updates.sequenceNo) updates.sequenceNo = parseInt(updates.sequenceNo);
        if (updates.price) updates.price = parseFloat(updates.price);
        if (updates.isActive !== undefined) {
            updates.isActive = updates.isActive === "false" ? false : true;
        }

        // ---------- Trim string fields ----------
        [
            "title",
            "description",
            "sku",
            "videoUrl",
            "collectionType",
            "fabric",
            "color",
            "workType",
            "deliveryTimeline",
            "setIncludes",
            "kurtaLength",
            "pantsLength",
            "washCare",
            "styleCode",
            "additionalNotes",
            "domesticShipping",
            "internationalShipping",
            "domesticTime",
            "internationalTime",
            "returnPolicy",
        ].forEach((key) => {
            if (updates[key] && typeof updates[key] === "string") {
                updates[key] = updates[key].trim();
            }
        });

        const updatedNewArrival = await NewArrival.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true, // ✅ color hex validation bhi chale
        });

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "New arrival updated successfully",
            data: updatedNewArrival,
        });
    } catch (err) {
        console.error("Update New Arrival Error:", err.message);
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Server error while updating new arrival",
            error: err.message,
        });
    }
};

// ===================== DELETE NEW ARRIVAL =====================
const deleteNewArrival = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await NewArrival.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                status: "error",
                statusCode: 404,
                message: "New arrival not found",
                data: null,
            });
        }

        return res.status(200).json({
            status: "success",
            statusCode: 200,
            message: "New arrival deleted successfully",
            data: null,
        });
    } catch (err) {
        return res.status(500).json({
            status: "error",
            statusCode: 500,
            message: "Server error while deleting new arrival",
            error: err.message,
        });
    }
};

module.exports = {
    uploadNewArrival,
    getAllNewArrivals,
    getNewArrivalById,
    updateNewArrival,
    deleteNewArrival,
};