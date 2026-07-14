const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// ==========================
// Register User
// ==========================
const registerUser = async (req, res) => {

    try {

        const { name, email, mobile, password } = req.body;

        if (!name || !email || !mobile || !password) {

            return res.status(400).json({
                success: false,
                message: "Please fill all fields."
            });

        }

        const userExists = await User.findOne({ email });

        if (userExists) {

            return res.status(400).json({
                success: false,
                message: "Email already registered."
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({

            name,
            email,
            mobile,
            password: hashedPassword

        });

        await user.save();

        res.status(201).json({

            success: true,
            message: "Registration Successful!"

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

// ==========================
// Login User
// ==========================
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,
                message: "Please enter email and password."

            });

        }

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(400).json({

                success: false,
                message: "User not found."

            });

        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.status(400).json({

                success: false,
                message: "Incorrect password."

            });

        }

        // User is now online
        // user.isOnline = true;
        // user.isLoggedIn = true;

        // await user.save();

        const token = jwt.sign(

            {
                id: user._id
            },

            process.env.JWT_SECRET,

            {
                expiresIn: "7d"
            }

        );

        res.status(200).json({

            success: true,

            message: "Login Successful!",

            token,

            user: {

                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                profilePic: user.profilePic

            }

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

// ==========================
// Logout User
// ==========================


const logoutUser = async (req, res) => {

    try {

        const user = await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                success: false,
                message: "User not found"

            });

        }

        // user.isOnline = false;
        // user.isLoggedIn = false;

        // await user.save();

        res.json({

            success: true,
            message: "Logout Successful"

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

module.exports = {

    registerUser,
    loginUser,
    logoutUser

};