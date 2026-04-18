// routes/newArrivalRoutes.js
const express = require("express");
const multer = require("multer");
const router = express.Router();

const {
    uploadNewArrival,
    getAllNewArrivals,
    getNewArrivalById,
    updateNewArrival,
    deleteNewArrival,
} = require("../controllers/newArrivalController");

// ✅ Multer setup - memory storage (for Cloudinary buffer upload)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
    },
});

// Multiple fields for images + detailImages
const multiUpload = upload.fields([
    { name: "images", maxCount: 10 },
    { name: "detailImages", maxCount: 10 },
]);

// ===================== ROUTES =====================

// Create
router.post("/upload", multiUpload, uploadNewArrival);

// Read
router.get("/", getAllNewArrivals);
router.get("/:id", getNewArrivalById);

// Update
router.put("/:id", multiUpload, updateNewArrival);

// Delete
router.delete("/:id", deleteNewArrival);

module.exports = router;