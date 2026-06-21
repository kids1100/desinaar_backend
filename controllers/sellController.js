const mongoose = require("mongoose");
const Sell = require("../models/Sell");

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeProduct = (product) => {
  const rawId = product?._id || product?.productId;
  const normalized = {
    title: (product?.title || product?.name || "").trim(),
    price: Math.max(toNumber(product?.price), 0),
    sku: (product?.sku || "").trim(),
    collectionType: (product?.collectionType || "").trim(),
    imageUrl:
      product?.imageUrl ||
      product?.imageUrls?.[0] ||
      product?.images?.[0] ||
      "",
  };

  if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
    normalized.productId = rawId;
  }

  return normalized;
};

const buildSalePayload = (body) => {
  const selectedProducts = Array.isArray(body.selectedProducts)
    ? body.selectedProducts.map(normalizeProduct)
    : [];

  const sellAmount = Math.max(toNumber(body.sellAmount), 0);
  const discountPercentage = Math.min(
    Math.max(toNumber(body.discountPercentage), 0),
    100
  );
  const subtotal = selectedProducts.reduce(
    (sum, product) => sum + toNumber(product.price),
    0
  );
  const discountAmount = (subtotal * discountPercentage) / 100;
  const total = Math.max(subtotal - discountAmount + sellAmount, 0);

  return {
    selectedProducts,
    sellAmount,
    discountPercentage,
    subtotal,
    discountAmount,
    total,
    date: body.date ? new Date(body.date) : new Date(),
  };
};

const createSell = async (req, res) => {
  try {
    const payload = buildSalePayload(req.body);

    if (payload.selectedProducts.length === 0) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Please select at least one product",
      });
    }

    const sale = await Sell.create(payload);

    return res.status(201).json({
      status: "success",
      statusCode: 201,
      message: "Sale created successfully",
      data: sale,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while creating sale",
      error: err.message,
    });
  }
};

const getAllSells = async (req, res) => {
  try {
    const sales = await Sell.find({}).sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Sales retrieved successfully",
      count: sales.length,
      data: sales,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while retrieving sales",
      error: err.message,
    });
  }
};

const getSellById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Invalid sale id",
      });
    }

    const sale = await Sell.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        status: "error",
        statusCode: 404,
        message: "Sale not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Sale retrieved successfully",
      data: sale,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while retrieving sale",
      error: err.message,
    });
  }
};

const deleteSell = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Invalid sale id",
      });
    }

    const deleted = await Sell.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        statusCode: 404,
        message: "Sale not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      statusCode: 200,
      message: "Sale deleted successfully",
      data: null,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Server error while deleting sale",
      error: err.message,
    });
  }
};

module.exports = {
  createSell,
  getAllSells,
  getSellById,
  deleteSell,
};
