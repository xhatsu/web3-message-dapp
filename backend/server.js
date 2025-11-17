require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const userRoutes = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - Allow requests from different origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://158.178.228.216:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/web3-messages")
  .then(() => {
    console.log("✓ Connected to MongoDB");
  })
  .catch((err) => {
    console.error("✗ MongoDB connection error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI || "mongodb://localhost:27017/web3-messages"}`);
});
