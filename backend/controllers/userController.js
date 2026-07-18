const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const getAllUsers = async (req, res) => {

    try {

        const users = await User.find({

            _id: { $ne: req.user.id }

        }).select("-password");

        res.status(200).json({

            success: true,

            users

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};



const updateProfile = async (req, res) => {

    try {

        const { field, value } = req.body;

        console.log("req.user =", req.user);
        console.log("req.user.id =", req.user.id);

        const user = await User.findById(req.user.id);
        console.log("Mongo User =", user);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found."
            });

        }

        switch (field) {

            case "name":
                user.name = value;
                break;

            case "email":
                user.email = value;
                break;

            case "mobile":
                user.mobile = value;
                break;

            case "password":

                const hashedPassword =
                    await bcrypt.hash(value, 10);

                user.password = hashedPassword;

                break;

            default:

                return res.status(400).json({
                    success: false,
                    message: "Invalid Field"
                });

        }

        await user.save();

        res.json({

            success: true,

            message: `${field} updated successfully.`,

            user

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

};

const getCurrentUser = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }

        res.json({

            success: true,

            user

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

}

const uploadProfilePicture = async (req, res) => {

    try {

        console.log("UPLOAD CONTROLLER HIT");

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "No image uploaded"

            });

        }

        console.log("Cloudinary file:", req.file);

        const updatedUser =
            await User.findByIdAndUpdate(

                req.user.id,

                {
                    profilePic: req.file.path
                },

                {
                    new: true
                }

            );

        res.status(200).json({

            success: true,

            message: "Profile picture updated successfully",

            profilePic: updatedUser.profilePic

        });

    }

    catch (error) {

        console.error(
            "UPLOAD CONTROLLER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};
module.exports = {

    getAllUsers,

    updateProfile,
    getCurrentUser,
    uploadProfilePicture

};
