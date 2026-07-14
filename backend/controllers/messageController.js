const Message = require("../models/Message");

// ======================================
// Send Message
// ======================================

const sendMessage = async (req, res) => {

    try {

        const { sender, receiver, message } = req.body;

        if (!sender || !receiver || !message) {

            return res.status(400).json({

                success: false,
                message: "All fields are required."

            });

        }

        const newMessage = new Message({

            sender,
            receiver,
            message

        });

        await newMessage.save();

        const io = req.app.get("io");

        const messageData = {
            _id: newMessage._id,
            sender: sender.toString(),
            receiver: receiver.toString(),
            message: newMessage.message,
            createdAt: newMessage.createdAt
        };

        io.to(receiver.toString()).emit("receiveMessage", messageData);

        io.to(sender.toString()).emit("receiveMessage", messageData);

        res.status(201).json({

            success: true,
            message: "Message sent successfully.",
            data: newMessage

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

// ======================================
// Get Conversation
// ======================================

const getMessages = async (req, res) => {

    try {

        const { senderId, receiverId } = req.params;

        const messages = await Message.find({

            $or: [

                {

                    sender: senderId,
                    receiver: receiverId

                },

                {

                    sender: receiverId,
                    receiver: senderId

                }

            ]

        }).sort({ createdAt: 1 });

        res.status(200).json({

            success: true,
            messages

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: "Server Error"

        });

    }

};

module.exports = {

    sendMessage,
    getMessages

};