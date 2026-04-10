const express = require("express");
const router = express.Router();

const {
    createEnquiry,
    getAllEnquiries,
    updateStatus,
} = require("../controllers/enquiryController");

router.post("/create", createEnquiry);
router.get("/all", getAllEnquiries);
router.put("/status/:id", updateStatus);

module.exports = router;