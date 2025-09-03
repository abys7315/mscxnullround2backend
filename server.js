const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./src/routes/auth.js");
const contestRoutes = require("./src/routes/contest.js");
//const adminRoutes = require("./src/routes/admin.js");

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*", // fallback for local dev
    credentials: false,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", contestRoutes); // protected inside routes
//app.use("/api/admin", adminRoutes); // protected by admin middleware

const PORT = process.env.PORT || 4000;

// Start server with DB connection
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`🚀 API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
