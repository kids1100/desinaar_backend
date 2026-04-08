const express = require("express");
const router = express.Router();

const {
    verifyWebhook,
    receiveMessage,
} = require("../controllers/whatsappController");

// GET → verification
router.get("/webhook", verifyWebhook);

// POST → incoming messages
router.post("/webhook", receiveMessage);

module.exports = router;