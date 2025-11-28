const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      lowercase: true,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    transfer: {
      type: String,
      enum: ['none', 'token', 'nft', 'ether'],
      default: 'none',
    },
    transferData: {
      tokenAddress: String,
      tokenAmount: String,
      nftAddress: String,
      nftTokenId: String,
      etherAmount: String,
      transactionHash: String,
      claimed: {
        type: Boolean,
        default: false,
      },
      confirmed: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
