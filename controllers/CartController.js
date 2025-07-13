const Cart = require("../models/Cart");

exports.addtoCards = async (req, res) => {
  try {
    const { productID } = req.params;
    const userID = req.user.userId;

    if (!productID || !userID) {
      return res.status(400).json({
        status: 400,
        msg: "Product ID and user ID are required",
        data: null,
      });
    }

    let existingItem = await Cart.findOne({ productID, userID });

    if (existingItem) {
      existingItem.quantity += 1;
      await existingItem.save();
      return res.status(200).json({
        status: 200,
        msg: "Product quantity updated",
        data: existingItem,
      });
    }

    const cartItem = new Cart({ productID, userID, quantity: 1 });
    await cartItem.save();

    res.status(200).json({
      status: 200,
      msg: "Product added to cart",
      data: cartItem,
    });
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ status: 500, message: "Internal server error", data: null });
  }
};


exports.getCartItems = async (req, res) => {
  try {
    const userID = req.user.userId;

    const cartItems = await Cart.find({ userID }).populate("productID");

    res.status(200).json({
      status: 200,
      msg: "Successfully fetched cart data",
      data: cartItems,
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ status: 500, msg: "Something went wrong", data: null });
  }
};

exports.deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const userID = req.user.userId;

    if (!cartId) {
      return res.status(400).json({
        status: 400,
        msg: "Cart ID is required",
        data: null,
      });
    }

    const deletedItem = await Cart.findOneAndDelete({ _id: cartId, userID });

    if (!deletedItem) {
      return res.status(404).json({
        status: 404,
        msg: "Item not found in cart",
        data: null,
      });
    }

    res.status(200).json({
      status: 200,
      msg: "Item removed from cart",
      data: deletedItem,
    });
  } catch (error) {
    console.error("Delete Cart Item Error:", error);
    res.status(500).json({ status: 500, msg: "Internal server error", data: null });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;
    const userID = req.user.userId;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 400,
        msg: "Quantity must be at least 1",
      });
    }

    const updated = await Cart.findOneAndUpdate(
      { _id: cartId, userID },
      { quantity },
      { new: true }
    ).populate("productID");

    if (!updated) {
      return res.status(404).json({
        status: 404,
        msg: "Cart item not found",
      });
    }

    res.status(200).json({
      status: 200,
      msg: "Quantity updated",
      data: updated,
    });
  } catch (error) {
    console.error("Update Cart Quantity Error:", error);
    res.status(500).json({ status: 500, msg: "Internal server error" });
  }
};

