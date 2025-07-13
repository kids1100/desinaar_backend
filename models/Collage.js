// models/Collage.js

const mongoose = require("mongoose");

const collageSchema = new mongoose.Schema(
  {
    collageName: { type: String, required: true },
    imageUrls: [String], // store multiple image URLs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collage", collageSchema);
