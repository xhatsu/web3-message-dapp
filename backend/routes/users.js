const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const authMiddleware = require("../middleware/auth");

/**
 * @route POST /api/users/send-message
 * @desc Send first message to a user
 * @access Private
 */
router.post(
  "/send-message",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { recipient, content } = req.body;
    const sender = req.userAddress;

    if (!recipient || !content) {
      return res.status(400).json({ error: "Missing recipient or content" });
    }

    if (sender.toLowerCase() === recipient.toLowerCase()) {
      return res.status(400).json({ error: "Cannot send message to yourself" });
    }

    // Check if recipient exists
    const recipientUser = await User.findOne({
      address: recipient.toLowerCase(),
    });
    if (!recipientUser) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Check or create conversation
    let conversation = await Conversation.findOne({
      participants: {
        $all: [sender.toLowerCase(), recipient.toLowerCase()],
      },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [sender.toLowerCase(), recipient.toLowerCase()],
      });
      await conversation.save();
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      sender: sender.toLowerCase(),
      recipient: recipient.toLowerCase(),
      content,
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json({
      _id: conversation._id,
      participants: conversation.participants,
      lastMessage: message._id,
      updatedAt: conversation.updatedAt,
    });
  })
);

/**
 * @route GET /api/users/:address
 * @desc Get user profile by address
 * @access Public
 */
router.get(
  "/:address",
  asyncHandler(async (req, res) => {
    const { address } = req.params;
    const user = await User.findOne({ address: address.toLowerCase() });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  })
);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { username, avatar, bio } = req.body;
    const address = req.userAddress;

    const user = await User.findOne({ address });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username) user.username = username;
    if (avatar) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      user: {
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  })
);

/**
 * @route GET /api/users/search
 * @desc Search users by username or address
 * @access Public
 */
router.get(
  "/search/:query",
  asyncHandler(async (req, res) => {
    const { query } = req.params;
    const limit = req.query.limit || 10;

    const results = await User.find({
      $or: [
        { address: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    })
      .limit(parseInt(limit));

    res.json({ results });
  })
);

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ address: req.userAddress });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  })
);

module.exports = router;
