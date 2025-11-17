const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
      required: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return v.length === 2 && v.every(addr => /^0x[a-fA-F0-9]{40}$/.test(addr));
        },
        message: "Conversation must have exactly 2 valid Ethereum addresses",
      },
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true }
);

// Ensure unique conversations between two addresses
conversationSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
