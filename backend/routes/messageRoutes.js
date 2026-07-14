const express = require("express");

const router = express.Router();

const {
    sendMessage,
    getMessages
} = require("../controllers/messageController");

// Send Message
router.post("/", sendMessage);

// Get Conversation
router.get("/:senderId/:receiverId", getMessages);

module.exports = router;