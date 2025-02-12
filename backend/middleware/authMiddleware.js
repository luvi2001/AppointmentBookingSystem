const jwt = require("jsonwebtoken");

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({ message: "Token is required for authentication." });
  }

  try {
    // Remove "Bearer " part and verify token
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request object
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = { verifyToken };
