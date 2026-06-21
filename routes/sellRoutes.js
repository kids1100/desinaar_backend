const express = require("express");
const router = express.Router();

const {
  createSell,
  getAllSells,
  getSellById,
  deleteSell,
} = require("../controllers/sellController");

router.post("/", createSell);
router.get("/", getAllSells);
router.get("/:id", getSellById);
router.delete("/:id", deleteSell);

module.exports = router;
