const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getCartItems, addtoCards,updateQuantity ,deleteCart } = require("../controllers/CartController");

router.post("/saveCart/:productID",authMiddleware, addtoCards);
router.post("/getCartItems",authMiddleware, getCartItems);
router.post("/updateCart/:cartId",authMiddleware, updateQuantity);
router.post("/deleteCart/:cartId",authMiddleware, deleteCart);

module.exports = router;
