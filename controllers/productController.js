// controllers/productController.js
const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Configure Cloudinary using env variables
// Add these to your .env file:
// CLOUDINARY_CLOUD_NAME=your_cloud_name
// CLOUDINARY_API_KEY=your_api_key
// CLOUDINARY_API_SECRET=your_api_secret
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload a single buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,                  // ✅ this sets desinaar/productImage
        resource_type: "image",
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        const cleanUrl = result.secure_url.replace(/\/v\d+\//, "/");
        resolve(cleanUrl);
      }
    );
    stream.end(buffer);
  });
};

const uploadProduct = async (req, res) => {
  let imageUrls = [];

  try {
    console.log("Uploading product:", req.body);

    const {
      title,
      sku,
      price,
      sizes,
      colors,
      fabric,
      color,
      workType,
      deliveryTimeline,
      setIncludes,
      kurtaLength,
      pantsLength,
      washCare,
      styleCode,
      additionalNotes,
      domesticShipping,
      internationalShipping,
      domesticTime,
      internationalTime,
      returnPolicy,
      collectionType,
      sequenceNo,
    } = req.body;

    const images = req.files?.images || req.files || [];

    // Check required fields
    if (!title?.trim() || !sku?.trim() || isNaN(parseFloat(price))) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Missing or invalid required fields (title, sku, price)",
      });
    }

    // Upload main images to Cloudinary
    if (images && images.length > 0) {
      for (const image of images) {
        const url = await uploadToCloudinary(
          image.buffer,
          "desinaar/productImage"
        );
        imageUrls.push(url);
        console.log("Image uploaded to Cloudinary:", url);
      }
    }

    const product = new Product({
      title: title?.trim(),
      sku: sku?.trim(),
      price: price ? parseFloat(price) : undefined,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      imageUrls,

      fabric,
      color,
      workType,
      deliveryTimeline,
      setIncludes,
      kurtaLength,
      pantsLength,
      washCare,
      styleCode,
      additionalNotes,

      domesticShipping,
      internationalShipping,
      domesticTime,
      internationalTime,
      returnPolicy,

      collectionType: collectionType?.trim(),
      sequenceNo: sequenceNo ? parseInt(sequenceNo) : 0,
    });

    await product.save();

    return res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "Product uploaded successfully!",
      data: product,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Error uploading product",
      error: error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let { collectionType } = req.query;

    collectionType = collectionType?.replace(/"/g, "").trim();

    let products;

    if (collectionType) {
      const filter = { collectionType: new RegExp(`^${collectionType}$`, "i") };
      products = await Product.find(filter).sort({ sequenceNo: 1 });
    } else {
      products = await Product.find({}).sort({
        collectionType: 1,
        sequenceNo: 1,
      });
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while retrieving products",
      error: err.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        statusCode: 404,
        message: "Product not found",
        data: null,
      });
    }
    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while retrieving product",
      error: err.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    console.log("Request body updates:", updates);
    console.log("Update id:", id);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        status: "error",
        statusCode: 404,
        message: "Product not found",
        data: null,
      });
    }

    console.log("Existing product:", product);

    // ---------- Handle main images ----------
    const images = req.files?.images || [];
    let imageUrls = [];

    for (const image of images) {
      const url = await uploadToCloudinary(image.buffer, "desinaar/productImage");
      imageUrls.push(url);
    }

    // Preserve old images if none are uploaded
    updates.imageUrls = imageUrls.length > 0 ? imageUrls : product.imageUrls;

    // ---------- Handle detail images ----------
    const detailImages = req.files?.detailImages || [];
    let detailImageUrls = [];

    for (const image of detailImages) {
      const url = await uploadToCloudinary(image.buffer, "desinaar/detailImages");
      detailImageUrls.push(url);
    }

    // Preserve old detailImages if none are uploaded
    if (detailImageUrls.length > 0) {
      updates.detailImages = detailImageUrls;
    } else if (updates.detailImages) {
      updates.detailImages = JSON.parse(updates.detailImages);
    } else {
      updates.detailImages = product.detailImages;
    }

    // ---------- Parse structured fields ----------
    const parseIfString = (field) =>
      typeof field === "string" ? JSON.parse(field) : field;

    if (updates.fabricCare) updates.fabricCare = parseIfString(updates.fabricCare);
    if (updates.deliveryAndReturns) updates.deliveryAndReturns = parseIfString(updates.deliveryAndReturns);
    if (updates.additionalInfo) updates.additionalInfo = parseIfString(updates.additionalInfo);
    if (updates.shippingInfo) updates.shippingInfo = parseIfString(updates.shippingInfo);
    if (updates.specifications) updates.specifications = parseIfString(updates.specifications);
    if (updates.sizes) updates.sizes = parseIfString(updates.sizes);
    if (updates.colors) updates.colors = parseIfString(updates.colors);

    if (updates.sequenceNo) updates.sequenceNo = parseInt(updates.sequenceNo);
    if (updates.price) updates.price = parseFloat(updates.price);

    // ---------- Trim string fields ----------
    [
      "title",
      "description",
      "sku",
      "videoUrl",
      "collectionType",
      "fabric",
      "color",
      "workType",
      "deliveryTimeline",
      "setIncludes",
      "kurtaLength",
      "pantsLength",
      "washCare",
      "styleCode",
      "additionalNotes",
      "domesticShipping",
      "internationalShipping",
      "domesticTime",
      "internationalTime",
      "returnPolicy",
    ].forEach((key) => {
      if (updates[key] && typeof updates[key] === "string") {
        updates[key] = updates[key].trim();
      }
    });

    // ---------- Update in DB ----------
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    console.error("Update Product Error:", err.message);
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while updating product",
      error: err.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        status: "error",
        statusCode: 404,
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while deleting product",
      error: err.message,
    });
  }
};

module.exports = {
  uploadProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};