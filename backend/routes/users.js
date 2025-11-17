const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

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
