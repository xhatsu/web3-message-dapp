const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

async function getConversations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;
    const collection = db.collection("conversations");

    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`📊 Total Conversations: ${totalCount}\n`);

    // Get all conversations
    const conversations = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    if (conversations.length === 0) {
      console.log("No conversations found.");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Display each conversation
    conversations.forEach((conv, index) => {
      console.log(`--- Conversation ${index + 1} ---`);
      console.log(`ID: ${conv._id}`);
      console.log(`Participants: ${conv.participants.join(", ")}`);
      console.log(`Last Message ID: ${conv.lastMessage || "None"}`);
      console.log(`Last Message Time: ${conv.lastMessageTime || "N/A"}`);
      console.log(`Created: ${conv.createdAt || "N/A"}`);
      console.log(`Updated: ${conv.updatedAt || "N/A"}`);
      console.log();
    });

    // Get statistics
    console.log("\n📈 Statistics:");
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          avgParticipants: { $avg: { $size: "$participants" } },
        },
      },
    ]).toArray();

    if (stats.length > 0) {
      console.log(`Total: ${stats[0].totalConversations}`);
      console.log(`Avg Participants: ${stats[0].avgParticipants.toFixed(2)}`);
    }

    // Check for duplicates
    console.log("\n🔍 Checking for Duplicate Participants:");
    const duplicates = await collection.aggregate([
      { $group: { _id: "$participants", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate(s):`);
      duplicates.forEach(dup => {
        console.log(`  - ${dup._id}: ${dup.count} conversations`);
      });
    } else {
      console.log("✅ No duplicates found!");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

getConversations();
