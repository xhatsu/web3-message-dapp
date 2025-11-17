const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    messageId: {
      type: Number,
      default: null,
    },
    sender: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
    },
    recipient: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
    },
    content: {
      type: String,
      required: true,
    },
    contentHash: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    chainTimestamp: {
      type: Number,
      default: null,
    },
    transactionHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ messageId: 1 });

module.exports = mongoose.model("Message", messageSchema);
