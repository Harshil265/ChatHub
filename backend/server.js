console.log("SERVER STARTED");
console.log("STEP 0");

require("dotenv").config();
console.log("STEP 1");

const express = require("express");
console.log("STEP 2");

const cors = require("cors");
console.log("STEP 3");

const http = require("http");
console.log("STEP 4");

const { Server } = require("socket.io");
console.log("STEP 5");

const connectDB = require("./config/db");
console.log("STEP 6");

const authRoutes = require("./routes/auth");
console.log("STEP 7");

const userRoutes = require("./routes/users");
console.log("STEP 8");

const messageRoutes = require("./routes/messageRoutes");
console.log("STEP 9");

const User = require("./models/User");
console.log("STEP 10");

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
       console.log("STEP 11 - before connectDB");

        await connectDB();

        console.log("STEP 12 - after connectDB");

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

startServer();
