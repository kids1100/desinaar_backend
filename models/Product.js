const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  imageUrls: [String], // ✅ Retain only this field
  // Other fields are optional / can be removed:
  title: { type: String, default: undefined },
  description: { type: String, default: undefined },
  sku: { type: String, default: undefined },
  price: { type: Number, default: undefined },
  videoUrl: { type: String, default: undefined },
  detailImages: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  colors: { type: [String], default: [] },

  fabricCare: {
    fabric: { type: String, default: undefined },
    color: { type: String, default: undefined },
    workType: { type: String, default: undefined },
    deliveryTimeline: { type: String, default: undefined },
    setIncludes: { type: String, default: undefined },
    kurtaLength: { type: String, default: undefined },
    pantsLength: { type: String, default: undefined },
    washCare: { type: String, default: undefined },
    styleCode: { type: String, default: undefined },
    additionalNotes: { type: String, default: undefined },
  },

  deliveryAndReturns: {
    domesticShipping: { type: String, default: undefined },
    internationalShipping: { type: String, default: undefined },
    domesticTime: { type: String, default: undefined },
    internationalTime: { type: String, default: undefined },
    returnPolicy: { type: String, default: undefined },
  },

  collectionType: {
    type: String,
    required: false, // true if mandatory
  },
  sequenceNo: {
    type: Number,
    required: false,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
