const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
    getAllUsers,
    getCurrentUser,
    updateProfile,
    uploadProfilePicture
} = require("../controllers/userController");

router.get("/", auth, getAllUsers);

router.get("/me", auth, getCurrentUser);

router.put(
    "/update-profile",
    auth,
    updateProfile
);

router.post(
    "/upload-profile",
    auth,
    upload.single("profilePic"),
    uploadProfilePicture
);

module.exports = router;
