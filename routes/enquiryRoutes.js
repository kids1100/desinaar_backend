const express = require("express");
const router = express.Router();

const {
    createEnquiry,
    getAllEnquiries,
    updateStatus,
} = require("../controllers/enquiryController");

// Health Check API
router.get("/health", (req, res) => {
    res.status(200).send("ok");
});

router.post("/create", createEnquiry);
router.get("/all", getAllEnquiries);
router.put("/status/:id", updateStatus);

module.exports = router;