const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key_here";

/**
 * @route GET /api/auth/nonce/:address
 * @desc Get nonce for message signing
 */
router.get("/nonce/:address", async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    let user = await User.findOne({ address: address.toLowerCase() });

    if (!user) {
      user = new User({
        address: address.toLowerCase(),
        nonce: Math.random().toString(36).substring(2, 15),
      });
      await user.save();
    } else {
      // Generate new nonce
      user.nonce = Math.random().toString(36).substring(2, 15);
      await user.save();
    }

    res.json({
      address: user.address,
      nonce: user.nonce,
      message: `Sign this message to authenticate: ${user.nonce}`,
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    res.status(500).json({ error: "Failed to generate nonce" });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Verify signed message and issue JWT
 */
router.post("/login", async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid Ethereum address" });
    }

    // Find user or auto-create new user
    let user = await User.findOne({ address: address.toLowerCase() });

    if (!user) {
      // Auto-register new user
      user = new User({
        address: address.toLowerCase(),
        nonce: Math.random().toString(36).substring(2, 15),
      });
      await user.save();
    }

    // Verify signature
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        return res.status(401).json({ error: "Signature verification failed" });
      }
    } catch (error) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Update user status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, address: user.address },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        address: user.address,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 */
router.post("/logout", async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address required" });
    }

    const user = await User.findOne({ address: address.toLowerCase() });
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
      await user.save();
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

module.exports = router;
