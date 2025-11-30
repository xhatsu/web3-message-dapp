const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');

/**
 * @route GET /api/auth/nonce
 * @desc Get nonce for message signing
 * @access Public
 */
router.get(
  '/nonce/:address',
  asyncHandler(async (req, res) => {
    const address = req.params.address?.toLowerCase();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    let user = await User.findOne({ address });

    if (!user) {
      user = new User({ address, nonce: Math.floor(Math.random() * 1000000) });
      await user.save();
    }

    const message = `Sign this message to login to Web3 Message dApp\n\nAddress: ${address}\nNonce: ${user.nonce}`;

    res.json({ nonce: user.nonce, message });
  })
);

/**
 * @route POST /api/auth/login
 * @desc Login with signed message
 * @access Public
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ error: 'Missing address, signature, or message' });
    }

    const addressLower = address.toLowerCase();

    if (!ethers.isAddress(addressLower)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature).toLowerCase();

      if (recoveredAddress !== addressLower) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch (error) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Get or create user
    let user = await User.findOne({ address: addressLower });

    if (!user) {
      user = new User({ address: addressLower, nonce: Math.floor(Math.random() * 1000000) });
    } else {
      // Update nonce for security
      user.nonce = Math.floor(Math.random() * 1000000);
    }

    await user.save();

    // Create JWT token
    const token = jwt.sign({ address: addressLower }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      token,
      user: {
        address: user.address,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        isOnline: true,
      },
    });
  })
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    // Just acknowledge logout - token invalidation happens on frontend
    res.json({ success: true });
  })
);

module.exports = router;
