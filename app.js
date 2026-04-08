// app.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const cors = require("cors");
// Import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const collageRoutes = require("./routes/collageRoute");
const cartRoutes = require("./routes/cartRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: "*", // ✅ Allow all origins
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Allow pre-flight (OPTIONS) requests

// Connect to MongoDB
connectDB();

// Middlewares
app.use(bodyParser.json());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/collage", collageRoutes);
app.use("/api/cart", cartRoutes);


//Watsapp Api
app.use("/api", whatsappRoutes);

// Basic Home Route
app.get("/", (req, res) => {
  res.send("Welcome to My E-commerce Backend");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
