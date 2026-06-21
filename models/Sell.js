const mongoose = require("mongoose");

const SoldProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false,
    },
    title: { type: String, default: "" },
    price: { type: Number, default: 0 },
    sku: { type: String, default: "" },
    collectionType: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const SellSchema = new mongoose.Schema(
  {
    selectedProducts: {
      type: [SoldProductSchema],
      default: [],
      validate: {
        validator: (products) => Array.isArray(products) && products.length > 0,
        message: "At least one sold product is required",
      },
    },
    sellAmount: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sell", SellSchema);
