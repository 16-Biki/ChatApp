require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const authRoutes = require("./Routes/authRoutes");
const messageRoutes = require("./Routes/messageRoutes")

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
  },
});

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Store online users (userId -> socketId)
const onlineUsers = new Map();

// ✅ Helper function to broadcast online users
const broadcastOnlineUsers = () => {
  io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
};

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // ✅ Register user with socket
  socket.on("registerUser", (userId) => {
    if (userId) {
      onlineUsers.set(userId.toString(), socket.id);
      console.log(`🔗 User ${userId} registered with socket ${socket.id}`);

      // Broadcast updated list to all clients
      broadcastOnlineUsers();
    }
  });

  // ✅ Private messaging handler
  socket.on("sendMessage", async (data) => {
    try {
      if (!data.sender?._id || !data.receiver?._id || !data.message) {
        console.error("❌ Invalid message payload:", data);
        return;
      }

      // Save message in DB
      const newMessage = new Message({
        sender: data.sender._id,
        receiver: data.receiver._id,
        message: data.message,
      });
      const savedMessage = await newMessage.save();
      await savedMessage.populate("sender receiver", "username");

      // ✅ Send message only to the receiver if online
      const receiverSocket = onlineUsers.get(data.receiver._id.toString());
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", savedMessage);
      } else {
        console.log(`⚠️ Receiver ${data.receiver._id} is offline`);
      }

      // ✅ Also send the message back to the sender's own chat window
      const senderSocket = onlineUsers.get(data.sender._id.toString());
      if (senderSocket) {
        io.to(senderSocket).emit("receiveMessage", savedMessage);
      }

    } catch (error) {
      console.error("❌ Error saving/sending message:", error);
    }
  });

  // ✅ Handle user disconnect
  socket.on("disconnect", () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected`);

        // Broadcast updated list to all clients
        broadcastOnlineUsers();
        break;
      }
    }
  });
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error("DB error:", err));
