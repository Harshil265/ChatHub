const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "ChatHub_Profile",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

module.exports = multer({
    storage: storage
});
