// backend/config/db.js
// Handles MongoDB connection and switches to local JSON mock database if MongoDB is unavailable.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to database...');
    // Set a short timeout of 4 seconds for DNS or connection checks so developers aren't kept waiting
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    
    console.log(`\x1b[32m%s\x1b[0m`, `✓ MongoDB Connected Successfully: ${conn.connection.host}`);
    process.env.MOCK_DB = 'false';
  } catch (error) {
    console.error(`\x1b[33m%s\x1b[0m`, `⚠ Database connection timed out or blocked: ${error.message}`);
    console.log(`\x1b[33m%s\x1b[0m`, `→ Enabling Smart Offline Mock Database Mode (Data saved to local JSON file)`);
    
    // Set global environment flag to switch controller actions
    process.env.MOCK_DB = 'true';
  }
};

module.exports = connectDB;
