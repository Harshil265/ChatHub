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
    (req, res, next) => {
        console.log("🔥 UPLOAD ROUTE HIT");
        next();
    },
    auth,
    upload.single("profilePic"),
    uploadProfilePicture
);

module.exports = router;
