// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

  try {
    const decoded = jwt.verify(token, "desinaar");
    req.user = decoded;  // Store user data from token
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

