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
    participantsKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
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

// Pre-save hook to ensure participants are sorted consistently and create key
conversationSchema.pre("save", function (next) {
  if (!this.participants || this.participants.length !== 2) {
    return next(new Error("Conversation must have exactly 2 participants"));
  }
  
  // Sort and lowercase participants to ensure consistency
  this.participants = this.participants
    .map(p => p.toLowerCase())
    .sort();
  
  // Create participants key in format: address1_address2
  this.participantsKey = this.participants.join("_");
  
  next();
});

module.exports = mongoose.model("Conversation", conversationSchema);
