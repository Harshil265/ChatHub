const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

console.log("CLOUDINARY NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY API KEY EXISTS:", !!process.env.CLOUDINARY_API_KEY);
console.log("CLOUDINARY SECRET EXISTS:", !!process.env.CLOUDINARY_API_SECRET);

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,

    params: {
        folder: "ChatHub_Profile",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

const fileFilter = (req, file, cb) => {

    console.log("FILE RECEIVED:", file.originalname);
    console.log("FILE TYPE:", file.mimetype);

    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"));
    }

};

module.exports = multer({
    storage,
    fileFilter
});
