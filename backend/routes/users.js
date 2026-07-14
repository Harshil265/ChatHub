const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");
const { uploadProfilePicture } = require("../controllers/userController");

const {
    getAllUsers,
    getCurrentUser,
    updateProfile
} = require("../controllers/userController");

// Get all users
router.get("/", auth, getAllUsers);

// Get logged-in user
router.get("/me", auth, getCurrentUser);

// Update profile
router.put("/update-profile", auth, updateProfile);

router.post(
    "/upload-profile",
    auth,
    upload.single("profilePic"),
    uploadProfilePicture
);

module.exports = router;