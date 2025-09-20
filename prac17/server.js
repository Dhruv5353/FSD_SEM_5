const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

// Import routes
const studentRoutes = require("./routes/students");

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded bodies

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/tuitionadmin";

    await mongoose.connect(mongoURI);

    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Initialize with sample data if database is empty
    await initializeSampleData();
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("💡 Make sure MongoDB is running on your system");
    console.log("💡 You can start MongoDB with: mongod");
    process.exit(1);
  }
};

// Initialize sample data
async function initializeSampleData() {
  try {
    const Student = require("./models/Student");

    const studentCount = await Student.countDocuments();

    if (studentCount === 0) {
      console.log("🌱 Creating sample student data...");

      const sampleStudents = [
        {
          name: "Rahul Sharma",
          email: "rahul.sharma@email.com",
          phone: "+91-9876543210",
          address: "123 Main Street, Delhi",
          course: "Mathematics - Class 12",
          batchTime: "10:00 AM - 12:00 PM",
          feeAmount: 5000,
          feeStatus: "paid",
          joinDate: new Date("2024-01-15"),
          guardianName: "Mr. Suresh Sharma",
          guardianPhone: "+91-9876543211",
        },
        {
          name: "Priya Patel",
          email: "priya.patel@email.com",
          phone: "+91-9876543212",
          address: "456 Park Avenue, Mumbai",
          course: "Physics - Class 11",
          batchTime: "2:00 PM - 4:00 PM",
          feeAmount: 4500,
          feeStatus: "pending",
          joinDate: new Date("2024-02-01"),
          guardianName: "Mrs. Sita Patel",
          guardianPhone: "+91-9876543213",
        },
        {
          name: "Amit Kumar",
          email: "amit.kumar@email.com",
          phone: "+91-9876543214",
          address: "789 Hill Road, Bangalore",
          course: "Chemistry - Class 12",
          batchTime: "4:00 PM - 6:00 PM",
          feeAmount: 5500,
          feeStatus: "paid",
          joinDate: new Date("2024-01-20"),
          guardianName: "Mr. Raj Kumar",
          guardianPhone: "+91-9876543215",
        },
        {
          name: "Sneha Gupta",
          email: "sneha.gupta@email.com",
          phone: "+91-9876543216",
          address: "321 Lake View, Pune",
          course: "Mathematics - Class 11",
          batchTime: "8:00 AM - 10:00 AM",
          feeAmount: 4000,
          feeStatus: "overdue",
          joinDate: new Date("2024-03-10"),
          guardianName: "Dr. Mohan Gupta",
          guardianPhone: "+91-9876543217",
        },
        {
          name: "Karan Singh",
          email: "karan.singh@email.com",
          phone: "+91-9876543218",
          address: "654 Garden Street, Chennai",
          course: "Physics - Class 12",
          batchTime: "6:00 PM - 8:00 PM",
          feeAmount: 5200,
          feeStatus: "paid",
          joinDate: new Date("2024-02-15"),
          guardianName: "Mrs. Kavita Singh",
          guardianPhone: "+91-9876543219",
        },
      ];

      await Student.insertMany(sampleStudents);
      console.log(`✅ Created ${sampleStudents.length} sample students`);
      console.log('📊 Database "tuitionadmin" is now ready with sample data');
    } else {
      console.log(`📊 Database already has ${studentCount} students`);
    }
  } catch (error) {
    console.error("❌ Error initializing sample data:", error.message);
  }
}

// Connect to database
connectDB();

// MongoDB connection event listeners
mongoose.connection.on("disconnected", () => {
  console.log("📡 MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB error:", error);
});

// API Routes
app.use("/api/students", studentRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Tuition Admin API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Tuition Class Admin Panel API",
    version: "1.0.0",
    endpoints: {
      students: {
        "GET /api/students": "Get all students with pagination and filtering",
        "GET /api/students/:id": "Get specific student by ID",
        "POST /api/students": "Create new student",
        "PUT /api/students/:id": "Update student by ID",
        "DELETE /api/students/:id": "Delete student by ID",
        "GET /api/students/search/:term":
          "Search students by name, email, or course",
        "GET /api/students/course/:course": "Get students by course",
        "GET /api/students/fees/status/:status": "Get students by fee status",
      },
      utility: {
        "GET /api/health": "Check API health status",
        "GET /api": "API documentation",
      },
    },
    queryParameters: {
      "GET /api/students": {
        page: "Page number (default: 1)",
        limit: "Items per page (default: 10)",
        sortBy: "Sort field (default: createdAt)",
        sortOrder: "Sort order: asc or desc (default: desc)",
        course: "Filter by course",
        feeStatus: "Filter by fee status (paid, pending, overdue)",
      },
    },
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log("\n🚀 Tuition Admin Panel Server Started");
  console.log("==================================================");
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log("==================================================\n");
});

module.exports = app;
