const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

/**
 * @route GET /api/messages/list
 * @desc Get all conversations for user
 * @access Private
 */
router.get(
  '/list',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userAddress = req.userAddress;

    const conversations = await Conversation.find({
      participants: userAddress,
    })
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 })
      .lean();

    // Enrich with other user info
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserAddress = conv.participants.find((p) => p !== userAddress);
        const otherUser = await User.findOne({ address: otherUserAddress }).lean();

        return {
          conversation: {
            _id: conv._id,
            participants: conv.participants,
            lastMessageTime: conv.lastMessageTime,
          },
          otherUser: {
            address: otherUserAddress,
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
 * @route GET /api/messages/conversation/:otherUserAddress
 * @desc Get conversation messages with specific user
 * @access Private
 */
router.get(
  '/conversation/:otherUserAddress',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const userAddress = req.userAddress;
    const otherUserAddress = req.params.otherUserAddress?.toLowerCase();

    if (!otherUserAddress) {
      return res.status(400).json({ error: 'Invalid user address' });
    }

    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: userAddress, recipient: otherUserAddress },
        { sender: otherUserAddress, recipient: userAddress },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // Get other user info
    const otherUser = await User.findOne({ address: otherUserAddress }).lean();

    res.json({
      messages,
      otherUser: {
        address: otherUserAddress,
        username: otherUser?.username || null,
        isOnline: otherUser?.isOnline || false,
      },
    });
  })
);

/**
 * @route POST /api/messages/send
 * @desc Send a message
 * @access Private
 */
router.post(
  '/send',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { recipient, content } = req.body;
    const sender = req.userAddress;

    if (!recipient || !content) {
      return res.status(400).json({ error: 'Missing recipient or content' });
    }

    // Create message
    const message = new Message({
      sender,
      recipient: recipient.toLowerCase(),
      content,
      transfer: 'none',
    });

    await message.save();

    // Update or create conversation
    const participants = [sender.toLowerCase(), recipient.toLowerCase()].sort();
    const participantsKey = participants.join('_');

    let conversation = await Conversation.findOne({ participantsKey });

    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
    }

    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    await conversation.save();

    res.status(201).json({
      success: true,
      message: {
        _id: message._id,
        sender: message.sender,
        recipient: message.recipient,
        content: message.content,
        transfer: message.transfer,
        createdAt: message.createdAt,
      },
    });
  })
);

/**
 * @route DELETE /api/messages/:messageId
 * @desc Delete a message
 * @access Private
 */
router.delete(
  '/:messageId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.sender !== req.userAddress) {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.messageId);

    res.json({ success: true, message: 'Message deleted' });
  })
);

module.exports = router;
