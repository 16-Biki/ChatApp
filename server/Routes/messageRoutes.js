const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");

// ✅ Fetch messages between two specific users
router.get("/:userId/:receiverId", async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    // ✅ Validate user IDs
    if (!userId || !receiverId) {
      return res.status(400).json({ msg: "Both user IDs are required." });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({ msg: "Invalid user ID format." });
    }

    // ✅ Fetch messages (bi-directional)
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .populate("sender receiver", "username email")
      .sort({ createdAt: 1 });

    // ✅ No messages found
    if (!messages || messages.length === 0) {
      return res.status(200).json([]); // Return empty array
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("🔥 Error fetching messages:", error);
    return res.status(500).json({
      msg: "Internal server error while fetching messages.",
      error: error.message,
    });
  }
});

router.put("/read", async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    await Message.updateMany(
      { sender, receiver, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ msg: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ msg: "Error updating messages", error });
  }
});

module.exports = router;
