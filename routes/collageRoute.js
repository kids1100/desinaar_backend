// routes/collageRoute.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const collageController = require("../controllers/collageController");

// 🔹 Using multer for file handling (memory storage in this example)
const upload = multer();

// POST route to handle multiple image uploads
// "collageImages" must match the field name from the client side
router.post(
  "/upload-collage",
  upload.array("collageImages", 10),
  collageController.uploadCollageImages
);

module.exports = router;
