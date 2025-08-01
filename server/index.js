require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const authRoutes = require("./Routes/authRoutes");
const messageRoutes = require("./Routes/messageRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://chat-app-two-nu-23.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Store online users (userId -> socketId)
const onlineUsers = new Map();

// Broadcast list of online users
const broadcastOnlineUsers = () => {
  io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
};

io.on("connection", (socket) => {
  console.log(" New connection:", socket.id);

  // Register user
  socket.on("registerUser", (userId) => {
    if (userId) {
      onlineUsers.set(userId.toString(), socket.id);
      console.log(` User ${userId} registered with socket ${socket.id}`);
      broadcastOnlineUsers();
    }
  });

  // Send private message
  socket.on("sendMessage", async (data) => {
    try {
      if (!data.sender?._id || !data.receiver?._id || !data.message) {
        console.error("Invalid message payload:", data);
        return;
      }

      const newMessage = new Message({
        sender: data.sender._id,
        receiver: data.receiver._id,
        message: data.message,
      });

      const savedMessage = await newMessage.save();
      await savedMessage.populate("sender receiver", "username");

      // Send to receiver
      const receiverSocket = onlineUsers.get(data.receiver._id.toString());
      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", savedMessage);
      } else {
        console.log(` Receiver ${data.receiver._id} is offline`);
      }

      // Also send to sender (mirror message)
      const senderSocket = onlineUsers.get(data.sender._id.toString());
      if (senderSocket) {
        io.to(senderSocket).emit("receiveMessage", savedMessage);
      }

    } catch (error) {
      console.error(" Error saving/sending message:", error);
    }
  });

  // Mark messages as read
  socket.on("markAsRead", async ({ senderId, receiverId }) => {
    try {
      // Update DB
      await Message.updateMany(
        { sender: senderId, receiver: receiverId, isRead: false },
        { $set: { isRead: true } }
      );

      // Notify sender
      const senderSocket = onlineUsers.get(senderId.toString());
      if (senderSocket) {
        io.to(senderSocket).emit("messageRead", { senderId, receiverId });
        console.log(`Notified sender ${senderId} that their message was read by ${receiverId}`);
      } else {
        console.log(`Sender ${senderId} is offline`);
      }
    } catch (err) {
      console.error("Error updating messages as read:", err);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(` User ${userId} disconnected`);
        broadcastOnlineUsers();
        break;
      }
    }
  });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(process.env.PORT, () => {
      console.log(` Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(" DB error:", err));
