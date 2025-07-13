// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        status: 400,
        message: "All fields are required.",
        data: null,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: "User already exists.",
        data: null,
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user full name
    const fullName = `${firstName} ${lastName}`;

    // Create a new user
    const user = new User({
      name: fullName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await user.save();

    return res.status(201).json({
      status: 201,
      message: "User registered successfully.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      data: null,
      error: err.message,
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        status: 400,
        message: "Invalid credentials.",
        data: null,
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 400,
        message: "Invalid credentials.",
        data: null,
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: 200,
      message: "Login successful.",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Server error",
      data: null,
      error: err.message,
    });
  }
};
