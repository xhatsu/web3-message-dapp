const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: String,
        lowercase: true,
      },
    ],
    participantsKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-save hook to generate participantsKey
conversationSchema.pre('save', function (next) {
  if (this.participants && this.participants.length > 0) {
    const sorted = this.participants.slice().sort();
    this.participantsKey = sorted.join('_');
  }
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
