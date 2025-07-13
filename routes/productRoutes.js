// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const productController = require("../controllers/productController"); // ✅ Import correctly

const multer = require("multer");

// 🔹 Configure Multer for multiple file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage }).fields([
  { name: "images", maxCount: 8 },
  { name: "detailImages", maxCount: 8 },
]); // ✅ Correct usage

// 🔹 Route for product upload with multiple images
router.post("/upload", upload, productController.uploadProduct);

router.get("/getProduct", productController.getAllProducts);
router.post("/productByid/:id", productController.getProductById);
router.post("/updateProduct/:id", upload, productController.updateProduct);
router.post(
  "/deleteProduct/:id",

  productController.deleteProduct
);

module.exports = router;
