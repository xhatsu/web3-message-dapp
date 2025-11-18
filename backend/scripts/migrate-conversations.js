const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

async function migrateConversations() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    // Step 1: Drop all existing indexes on conversations collection
    try {
      const collection = db.collection("conversations");
      const indexes = await collection.listIndexes().toArray();
      console.log("Existing indexes:", indexes.map(i => i.name));
      
      // Drop all indexes except _id_
      for (const indexInfo of indexes) {
        if (indexInfo.name !== "_id_") {
          await collection.dropIndex(indexInfo.name);
          console.log(`Dropped index: ${indexInfo.name}`);
        }
      }
    } catch (e) {
      console.log("Info about indexes:", e.message);
    }

    // Step 2: Migrate all conversations by adding participantsKey
    const conversations = await db.collection("conversations").find({}).toArray();
    console.log(`Found ${conversations.length} conversations to migrate`);

    for (const conv of conversations) {
      if (!conv.participants || conv.participants.length !== 2) {
        console.log(`Deleting invalid conversation: ${conv._id}`);
        await db.collection("conversations").deleteOne({ _id: conv._id });
        continue;
      }

      const sorted = conv.participants
        .map(p => p.toLowerCase())
        .sort();

      const participantsKey = sorted.join("_");

      console.log(`Migrating ${conv._id}: ${sorted.join(", ")} -> ${participantsKey}`);
      await db.collection("conversations").updateOne(
        { _id: conv._id },
        { 
          $set: { 
            participants: sorted,
            participantsKey: participantsKey
          } 
        }
      );
    }

    // Step 3: Create new unique indexes
    await db.collection("conversations").createIndex(
      { participantsKey: 1 },
      { unique: true }
    );
    console.log("Created unique index on participantsKey");

    // Step 4: Check for any remaining duplicates
    const duplicates = await db.collection("conversations").aggregate([
      { $group: { _id: "$participantsKey", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]).toArray();

    if (duplicates.length > 0) {
      console.log("Found duplicate participantsKeys:");
      for (const dup of duplicates) {
        console.log(`  ${dup._id}: ${dup.count} conversations`);
        // Keep only the latest one
        const convs = await db
          .collection("conversations")
          .find({ participantsKey: dup._id })
          .sort({ createdAt: -1 })
          .skip(1)
          .toArray();
        
        for (const conv of convs) {
          await db.collection("conversations").deleteOne({ _id: conv._id });
          console.log(`  Deleted duplicate: ${conv._id}`);
        }
      }
    } else {
      console.log("✅ No duplicates found!");
    }

    await mongoose.disconnect();
    console.log("Database migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrateConversations();
