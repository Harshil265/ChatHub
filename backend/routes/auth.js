const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
    registerUser,
    loginUser,
    logoutUser
} = require("../controllers/authController");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", auth, logoutUser);

module.exports = router;