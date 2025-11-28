const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { ethers } = require('ethers');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Create provider for verifying transactions
const provider = new ethers.JsonRpcProvider(process.env.CUSTOM_RPC_URL || 'http://127.0.0.1:8545');

/**
 * @route POST /api/transfers/send-token
 * @desc Send token with message
 * @access Private
 */
router.post(
  '/send-token',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { recipient, content, tokenAddress, tokenAmount, transactionHash } = req.body;
    const sender = req.userAddress;

    if (!recipient || !content) {
      return res.status(400).json({ error: 'Missing recipient or content' });
    }

    if (!tokenAmount || !transactionHash) {
      return res.status(400).json({ error: 'Missing token amount or transaction hash' });
    }

    // Create message with token transfer
    const message = new Message({
      sender,
      recipient: recipient.toLowerCase(),
      content,
      transfer: 'token',
      transferData: {
        tokenAddress: tokenAddress ? tokenAddress.toLowerCase() : null,
        tokenAmount: tokenAmount.toString(),
        transactionHash,
        claimed: false,
        confirmed: false,
      },
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
        transferData: message.transferData,
        createdAt: message.createdAt,
      },
    });
  })
);

/**
 * @route POST /api/transfers/send-nft
 * @desc Send NFT with message
 * @access Private
 */
router.post(
  '/send-nft',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { recipient, content, nftAddress, nftTokenId, transactionHash } = req.body;
    const sender = req.userAddress;

    if (!recipient || !content) {
      return res.status(400).json({ error: 'Missing recipient or content' });
    }

    if (!nftTokenId || !transactionHash) {
      return res.status(400).json({ error: 'Missing token ID or transaction hash' });
    }

    // Create message with NFT transfer
    const message = new Message({
      sender,
      recipient: recipient.toLowerCase(),
      content,
      transfer: 'nft',
      transferData: {
        nftAddress: nftAddress ? nftAddress.toLowerCase() : null,
        nftTokenId: nftTokenId.toString(),
        transactionHash,
        claimed: false,
        confirmed: false,
      },
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
        transferData: message.transferData,
        createdAt: message.createdAt,
      },
    });
  })
);

/**
 * @route POST /api/transfers/send-ether
 * @desc Send Ether with message
 * @access Private
 */
router.post(
  '/send-ether',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { recipient, content, etherAmount, transactionHash } = req.body;
    const sender = req.userAddress;

    if (!recipient || !content) {
      return res.status(400).json({ error: 'Missing recipient or content' });
    }

    if (!etherAmount || !transactionHash) {
      return res.status(400).json({ error: 'Missing ether amount or transaction hash' });
    }

    // Create message with ether transfer
    const message = new Message({
      sender,
      recipient: recipient.toLowerCase(),
      content,
      transfer: 'ether',
      transferData: {
        etherAmount: etherAmount.toString(),
        transactionHash,
        claimed: false,
        confirmed: false,
      },
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
        transferData: message.transferData,
        createdAt: message.createdAt,
      },
    });
  })
);

/**
 * @route PUT /api/transfers/:messageId/claim
 * @desc Claim a transfer
 * @access Private
 */
router.put(
  '/:messageId/claim',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.recipient !== req.userAddress) {
      return res.status(403).json({ error: 'Not authorized to claim this transfer' });
    }

    if (!message.transferData) {
      return res.status(400).json({ error: 'No transfer data in message' });
    }

    if (message.transferData.claimed) {
      return res.status(400).json({ error: 'Transfer already claimed' });
    }

    message.transferData.claimed = true;
    await message.save();

    res.json({
      success: true,
      message: {
        _id: message._id,
        transfer: message.transfer,
        transferData: message.transferData,
      },
    });
  })
);

/**
 * @route GET /api/transfers/:messageId/verify
 * @desc Verify transfer on-chain
 * @access Private
 */
router.get(
  '/:messageId/verify',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message.transferData?.transactionHash) {
      return res.status(400).json({ error: 'No transaction hash found' });
    }

    try {
      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(message.transferData.transactionHash);

      if (!receipt) {
        return res.json({
          confirmed: false,
          status: 'pending',
          message: 'Transaction pending on blockchain',
        });
      }

      // Update message if confirmed
      if (receipt.status === 1 && !message.transferData.confirmed) {
        message.transferData.confirmed = true;
        await message.save();
      }

      res.json({
        confirmed: receipt.status === 1,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        blockHash: receipt.blockHash,
        transactionHash: receipt.transactionHash,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify transaction', details: error.message });
    }
  })
);

module.exports = router;
