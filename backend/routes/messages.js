const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

/**
 * @route POST /api/messages
 * @desc Create a new message
 * @access Private
 */
router.post(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { recipient, content } = req.body;
    const sender = req.userAddress;

    if (!recipient || !content) {
      return res.status(400).json({ error: "Recipient and content required" });
    }

    // Create message
    const message = new Message({
      sender,
      recipient,
      content,
    });

    await message.save();

    // Update or create conversation
    const participants = [sender.toLowerCase(), recipient.toLowerCase()].sort();
    const participantsKey = participants.join("_");
    
    let conversation = await Conversation.findOne({
      participantsKey,
    });

    if (!conversation) {
      try {
        conversation = new Conversation({
          participants,
        });
        await conversation.save();
      } catch (error) {
        // Handle duplicate key error - conversation may have been created concurrently
        if (error.code === 11000) {
          conversation = await Conversation.findOne({ participantsKey });
          if (!conversation) {
            throw new Error("Failed to create or retrieve conversation");
          }
        } else {
          throw error;
        }
      }
    }

    // Ensure conversation exists before proceeding
    if (!conversation || !conversation._id) {
      throw new Error("Invalid conversation state");
    }

    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: message,
    });
  })
);

/**
 * @route GET /api/messages/conversation/:otherAddress
 * @desc Get messages with a specific user
 * @access Private
 */
router.get(
  "/conversation/:otherAddress",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { otherAddress } = req.params;
    const userAddress = req.userAddress;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({
      $or: [
        { sender: userAddress, recipient: otherAddress },
        { sender: otherAddress, recipient: userAddress },
      ],
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Message.countDocuments({
      $or: [
        { sender: userAddress, recipient: otherAddress },
        { sender: otherAddress, recipient: userAddress },
      ],
      isDeleted: false,
    });

    res.json({
      messages: messages.reverse(),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  })
);

/**
 * @route GET /api/messages/list
 * @desc Get all conversations for the user
 * @access Private
 */
router.get(
  "/list",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userAddress = req.userAddress;

    const conversations = await Conversation.find({
      participants: userAddress,
    })
      .populate("lastMessage")
      .sort({ lastMessageTime: -1 });

    // Enrich with user data
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherAddress = conv.participants.find(
          (addr) => addr !== userAddress
        );
        const otherUser = await User.findOne({ address: otherAddress });

        return {
          conversation: conv,
          otherUser: {
            address: otherAddress,
            username: otherUser?.username || null,
            avatar: otherUser?.avatar || null,
            isOnline: otherUser?.isOnline || false,
          },
          lastMessage: conv.lastMessage,
        };
      })
    );

    res.json({ conversations: enrichedConversations });
  })
);

/**
 * @route GET /api/messages/:id
 * @desc Get a specific message
 * @access Private
 */
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check authorization
    if (
      message.sender !== req.userAddress &&
      message.recipient !== req.userAddress
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json({ message });
  })
);

/**
 * @route PUT /api/messages/:id/read
 * @desc Mark message as read
 * @access Private
 */
router.put(
  "/:id/read",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    message.isRead = true;
    await message.save();

    res.json({ success: true, message });
  })
);

/**
 * @route DELETE /api/messages/:id
 * @desc Delete a message
 * @access Private
 */
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check authorization
    if (
      message.sender !== req.userAddress &&
      message.recipient !== req.userAddress
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    message.isDeleted = true;
    await message.save();

    res.json({ success: true, message: "Message deleted" });
  })
);

module.exports = router;
