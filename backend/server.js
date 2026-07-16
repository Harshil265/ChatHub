console.log("SERVER STARTED");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messageRoutes");
const User = require("./models/User");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {

    cors: {

        origin: "*",

        methods: ["GET", "POST"]

    }

});
app.set("io", io);


// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================
// ONLINE USERS
// ===============================

const onlineUsers = new Map();

io.on("connection", (socket) => {

    console.log("✅ Socket Connected:", socket.id);

    socket.onAny((event, ...args) => {

        console.log("📡 Event:", event, args);

    });

    // ===========================
    // User Setup
    // ===========================
    socket.on("setup", async (userId) => {

        console.log("🟢 User Online:", userId);

        onlineUsers.set(userId, socket.id);

        socket.join(userId);

        console.log("📦 Joined Room:", userId);

        await User.findByIdAndUpdate(userId, {
            isOnline: true
        });

        io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    });

    // ===========================
    // Typing
    // ===========================
    socket.on("typing", (data) => {

        console.log("⌨️ Typing Room:", data.receiver);

        socket.to(data.receiver).emit("showTyping", {
            sender: data.sender
        });

    });

    // ===========================
    // Stop Typing
    // ===========================
    socket.on("stopTyping", (data) => {

        socket.to(data.receiver).emit("hideTyping");

    });

    // ===========================
    // Disconnect
    // ===========================
    socket.on("disconnect", async () => {

        console.log("❌ Socket Disconnected:", socket.id);

        let disconnectedUser = null;

        for (const [userId, socketId] of onlineUsers.entries()) {

            if (socketId === socket.id) {

                disconnectedUser = userId;

                onlineUsers.delete(userId);

                break;

            }

        }

        if (disconnectedUser) {

            await User.findByIdAndUpdate(disconnectedUser, {
                isOnline: false
            });

        }

        io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    });

});

app.get("/", (req, res) => {
    res.send("🚀 ChatHub Backend is Running!");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

startServer();
