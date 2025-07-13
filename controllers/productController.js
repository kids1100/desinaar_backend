// controllers/productController.js
const Product = require("../models/Product");
const { createClient } = require("@supabase/supabase-js");
const supabase = require("../Supabase/supabase");
const multer = require("multer");
require("dotenv").config();

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
      fabricCare,
      deliveryAndReturns,
      collectionType,
      sequenceNo,
    } = req.body;

    const images = req.files;

    const productData = {
      title: title?.trim(),
      sku: sku?.trim(),
      price:
        price !== undefined && price !== null
          ? parseFloat(typeof price === "string" ? price.trim() : price)
          : undefined,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      fabricCare: fabricCare ? JSON.parse(fabricCare) : {},
      deliveryAndReturns: deliveryAndReturns
        ? JSON.parse(deliveryAndReturns)
        : {},
      collectionType: collectionType?.trim() || "general", // default if needed
      sequenceNo: sequenceNo ? parseInt(sequenceNo) : 0, // or default to 0
    };

    // Check required fields
    if (!productData.title || !productData.sku || isNaN(productData.price)) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Missing or invalid required fields (title, sku, price)",
      });
    }

    // 🔹 Upload images to Supabase
    if (images && images.length > 0) {
      for (const image of images) {
        const fileName = image.originalname;
        const folderName = "desinaar/productImage";
        const filePath = `${folderName}/${fileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("3gContent")
          .upload(filePath, image.buffer, {
            contentType: image.mimetype,
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError.message);
          throw new Error(`Supabase upload error: ${uploadError.message}`);
        }

        const SUPABASE_URL =
          "https://ewppyeqhqylgauppwvjd.supabase.co/storage/v1/object/public";
        const publicUrl = `${SUPABASE_URL}/3gContent/${data.path}`;
        imageUrls.push(publicUrl);
        console.log("Image uploaded:", publicUrl);
      }
    }

    // Save to DB
    const product = new Product({
      ...productData,
      imageUrls,
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
      // Get all products and sort by collectionType first, then sequenceNo
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

    console.log("Request Files:", req.files);
    console.log("Detail Images from request:", req.files?.detailImages);

    const images = req.files?.images || [];
    let imageUrls = [];

    for (const image of images) {
      const fileName = image.originalname;
      const folderName = "desinaar/productImage";
      const filePath = `${folderName}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("3gContent")
        .upload(filePath, image.buffer, {
          contentType: image.mimetype,
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Supabase upload error: ${uploadError.message}`);
      }

      const publicUrl = `https://ewppyeqhqylgauppwvjd.supabase.co/storage/v1/object/public/3gContent/${data.path}`;
      imageUrls.push(publicUrl);
    }

    if (imageUrls.length > 0) updates.imageUrls = imageUrls;

    // ---------- Handle detail images ----------
    const detailImages = req.files?.detailImages || [];
    console.log("Detail Images array:", detailImages);
    let detailImageUrls = [];

    for (const image of detailImages) {
      const fileName = image.originalname;
      const folderName = "desinaar/detailImages";
      const filePath = `${folderName}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("3gContent")
        .upload(filePath, image.buffer, {
          contentType: image.mimetype,
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Supabase upload error: ${uploadError.message}`);
      }

      const publicUrl = `https://ewppyeqhqylgauppwvjd.supabase.co/storage/v1/object/public/3gContent/${data.path}`;
      detailImageUrls.push(publicUrl);
      console.log("Detail image uploaded:", publicUrl);
    }

    console.log("Final detailImageUrls:", detailImageUrls);

    if (detailImageUrls.length > 0) {
      updates.detailImages = detailImageUrls;
      console.log("Setting detailImages in updates:", updates.detailImages);
    } else if (updates.detailImages) {
      updates.detailImages = JSON.parse(updates.detailImages);
      console.log("Parsed existing detailImages:", updates.detailImages);
    }

    const parseIfString = (field) =>
      typeof field === "string" ? JSON.parse(field) : field;

    // Convert fields safely
    updates.fabricCare = parseIfString(updates.fabricCare);
    updates.deliveryAndReturns = parseIfString(updates.deliveryAndReturns);
    updates.additionalInfo = parseIfString(updates.additionalInfo);
    updates.shippingInfo = parseIfString(updates.shippingInfo);
    updates.specifications = parseIfString(updates.specifications);
    updates.sizes = parseIfString(updates.sizes);
    updates.colors = parseIfString(updates.colors);

    if (updates.sequenceNo) updates.sequenceNo = parseInt(updates.sequenceNo);
    if (updates.price) updates.price = parseFloat(updates.price);

    // Trim string fields
    ["title", "description", "sku", "videoUrl", "collectionType"].forEach((key) => {
      if (updates[key] && typeof updates[key] === "string") {
        updates[key] = updates[key].trim();
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProduct) {
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
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
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
