const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
    },
    username: {
      type: String,
      sparse: true,
    },
    email: {
      type: String,
      sparse: true,
      lowercase: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    nonce: {
      type: String,
      default: () => Math.random().toString(36).substring(2, 15),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
