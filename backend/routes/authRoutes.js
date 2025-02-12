const express = require("express");
const { signUp, login } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();

// Sign-up route
router.post("/signup", signUp);

// Login route
router.post("/login", login);

module.exports = router;
