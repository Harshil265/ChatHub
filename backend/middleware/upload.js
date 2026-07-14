const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create folder automatically
const uploadPath = path.join(__dirname, "../uploads/profile");

if (!fs.existsSync(uploadPath)) {

    fs.mkdirSync(uploadPath, { recursive: true });

}

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadPath);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + path.extname(file.originalname);

        cb(null, uniqueName);

    }

});

const fileFilter = (req, file, cb) => {

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