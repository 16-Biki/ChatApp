const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");

// Fetch messages between two specific users
router.get("/:userId/:receiverId", async (req, res) => {
  try {
    const { userId, receiverId } = req.params;

    // Validate user IDs
    if (!userId || !receiverId) {
      return res.status(400).json({ msg: "Both user IDs are required." });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({ msg: "Invalid user ID format." });
    }

    // Fetch messages (both directions)
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .populate("sender receiver", "username email")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({
      msg: "Internal server error while fetching messages.",
      error: error.message,
    });
  }
});

// Mark messages as read
router.put("/read", async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    await Message.updateMany(
      { sender, receiver, isRead: false },
      { $set: { isRead: true } },
    );

    res.status(200).json({ msg: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ msg: "Error updating messages", error });
  }
});

//  unread message counts
router.get("/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const unread = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};

    unread.forEach((u) => {
      result[u._id.toString()] = u.count;
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching unread counts:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
