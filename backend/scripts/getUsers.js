#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const main = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get all users
    const users = await User.find().lean();
    
    console.log('\n📋 Users in Database:');
    console.log('═'.repeat(80));
    
    if (users.length === 0) {
      console.log('No users found');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. Address: ${user.address}`);
        console.log(`   Username: ${user.username || '(not set)'}`);
        console.log(`   Nonce: ${user.nonce}`);
        console.log(`   Online: ${user.isOnline}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log(`   Updated: ${user.updatedAt}`);
      });
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log(`Total Users: ${users.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

main();
