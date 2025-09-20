const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Import routes
const notesRoutes = require("./routes/notes");

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/notesapp";

    await mongoose.connect(mongoURI);

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// MongoDB connection event listeners
mongoose.connection.on("disconnected", () => {
  console.log("📡 MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error);
});

// Routes
app.use("/api/notes", notesRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Notes API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Notes API",
    version: "1.0.0",
    endpoints: {
      notes: {
        "GET /api/notes":
          "Get all notes with optional filtering and pagination",
        "GET /api/notes/:id": "Get a specific note by ID",
        "POST /api/notes": "Create a new note",
        "PUT /api/notes/:id": "Update a note",
        "DELETE /api/notes/:id": "Delete a note",
        "PATCH /api/notes/:id/archive": "Toggle archive status of a note",
        "GET /api/notes/priority/:priority":
          "Get notes by priority (low/medium/high)",
        "GET /api/notes/search/:term":
          "Search notes by title, content, or tags",
      },
      utility: {
        "GET /api/health": "Check API health status",
        "GET /api": "API documentation",
      },
    },
    queryParameters: {
      "GET /api/notes": {
        page: "Page number (default: 1)",
        limit: "Items per page (default: 10)",
        priority: "Filter by priority (low/medium/high)",
        search: "Search term for title/content/tags",
        archived: "Show archived notes (true/false, default: false)",
        sortBy: "Sort field (default: createdAt)",
        sortOrder: "Sort order (asc/desc, default: desc)",
      },
    },
    sampleNote: {
      title: "My First Note",
      content: "This is the content of my note.",
      tags: ["personal", "important"],
      priority: "medium",
    },
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedPath: req.originalUrl,
    availableEndpoints: "/api",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");

  try {
    await mongoose.connection.close();
    console.log("📊 MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n🚀 Notes API Server Started");
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log("=".repeat(50));
});

module.exports = app;
