const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../middleware/auth');

/**
 * @route GET /api/users/:address
 * @desc Get user info by address
 * @access Private
 */
router.get(
  '/:address',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const address = req.params.address?.toLowerCase();

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const user = await User.findOne({ address })
      .select('address username avatar bio isOnline createdAt updatedAt')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  })
);

/**
 * @route GET /api/users
 * @desc Get current user info
 * @access Private
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ address: req.userAddress })
      .select('address username avatar bio isOnline createdAt updatedAt')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  })
);

/**
 * @route GET /api/users/search/:query
 * @desc Search users by address or username
 * @access Private
 */
router.get(
  '/search/:query',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { query } = req.params;

    if (!query || query.length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Search by both address and username
    const users = await User.find({
      $or: [
        { address: { $regex: query, $options: "i" } },
        { username: { $regex: query, $options: "i" } },
      ],
    })
      .select('address username avatar bio isOnline createdAt')
      .limit(10)
      .lean();

    res.json({ users });
  })
);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile (username, avatar, bio)
 * @access Private
 */
router.put(
  '/profile',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { username, avatar, bio } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (bio) updateData.bio = bio;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const user = await User.findOneAndUpdate(
      { address: req.userAddress },
      updateData,
      { new: true }
    ).lean();

    res.json({ user });
  })
);

/**
 * @route POST /api/users/send-message
 * @desc Send first message to a user (creates conversation)
 * @access Private
 */
router.post(
  '/send-message',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { recipient, content } = req.body;
    const sender = req.userAddress;

    if (!recipient || !content) {
      return res.status(400).json({ error: 'Missing recipient or content' });
    }

    const recipientLower = recipient.toLowerCase();

    // Create message
    const message = new Message({
      sender,
      recipient: recipientLower,
      content,
      transfer: 'none',
    });

    await message.save();

    // Update or create conversation
    const participants = [sender.toLowerCase(), recipientLower].sort();
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

module.exports = router;
