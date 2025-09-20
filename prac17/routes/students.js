const express = require("express");
const { body, validationResult, param, query } = require("express-validator");
const Student = require("../models/Student");

const router = express.Router();

// Validation middleware
const validateStudent = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("phone")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please enter a valid phone number"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),
  body("course").notEmpty().withMessage("Course is required"),
  body("batchTime").trim().notEmpty().withMessage("Batch time is required"),
  body("feeAmount")
    .isNumeric()
    .withMessage("Fee amount must be a number")
    .custom((value) => {
      if (value < 0) throw new Error("Fee amount cannot be negative");
      if (value > 50000) throw new Error("Fee amount cannot exceed ₹50,000");
      return true;
    }),
  body("feeStatus")
    .optional()
    .isIn(["paid", "pending", "overdue"])
    .withMessage("Fee status must be paid, pending, or overdue"),
  body("guardianName")
    .trim()
    .notEmpty()
    .withMessage("Guardian name is required")
    .isLength({ max: 100 })
    .withMessage("Guardian name cannot exceed 100 characters"),
  body("guardianPhone")
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please enter a valid guardian phone number"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
];

const validateStudentUpdate = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("phone")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please enter a valid phone number"),
  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty")
    .isLength({ max: 500 })
    .withMessage("Address cannot exceed 500 characters"),
  body("course").optional().notEmpty().withMessage("Course cannot be empty"),
  body("batchTime")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Batch time cannot be empty"),
  body("feeAmount")
    .optional()
    .isNumeric()
    .withMessage("Fee amount must be a number")
    .custom((value) => {
      if (value < 0) throw new Error("Fee amount cannot be negative");
      if (value > 50000) throw new Error("Fee amount cannot exceed ₹50,000");
      return true;
    }),
  body("feeStatus")
    .optional()
    .isIn(["paid", "pending", "overdue"])
    .withMessage("Fee status must be paid, pending, or overdue"),
  body("guardianName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Guardian name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Guardian name cannot exceed 100 characters"),
  body("guardianPhone")
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Please enter a valid guardian phone number"),
  body("notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Notes cannot exceed 1000 characters"),
];

const validateObjectId = [
  param("id").isMongoId().withMessage("Invalid student ID format"),
];

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// GET /api/students - Get all students with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      course,
      feeStatus,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      isActive = "true",
    } = req.query;

    // Build filter object
    const filter = {};

    if (isActive !== "all") {
      filter.isActive = isActive === "true";
    }

    if (course) {
      filter.course = course;
    }

    if (feeStatus) {
      filter.feeStatus = feeStatus;
    }

    // Handle search
    let query = Student.find(filter);

    if (search) {
      query = Student.searchStudents(search);
    }

    // Apply sorting
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;
    query = query.sort(sortObj);

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    query = query.skip(skip).limit(limitNum);

    // Execute query
    const students = await query.exec();
    const total = await Student.countDocuments(filter);

    res.json({
      success: true,
      message: "Students retrieved successfully",
      data: {
        students,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalStudents: total,
          studentsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students",
      error: error.message,
    });
  }
});

// GET /api/students/:id - Get a specific student by ID
router.get(
  "/:id",
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      res.json({
        success: true,
        message: "Student retrieved successfully",
        data: student,
      });
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve student",
        error: error.message,
      });
    }
  }
);

// POST /api/students - Create a new student
router.post("/", validateStudent, handleValidationErrors, async (req, res) => {
  try {
    const studentData = req.body;

    // Check if student with email already exists
    const existingStudent = await Student.findOne({ email: studentData.email });
    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Student with this email already exists",
      });
    }

    const student = new Student(studentData);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error creating student:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create student",
      error: error.message,
    });
  }
});

// PUT /api/students/:id - Update a student by ID
router.put(
  "/:id",
  validateObjectId,
  validateStudentUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      // Check if email is being updated and if it already exists
      if (updateData.email && updateData.email !== student.email) {
        const existingStudent = await Student.findOne({
          email: updateData.email,
        });
        if (existingStudent) {
          return res.status(409).json({
            success: false,
            message: "Student with this email already exists",
          });
        }
      }

      const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: "Student updated successfully",
        data: updatedStudent,
      });
    } catch (error) {
      console.error("Error updating student:", error);

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Student with this email already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update student",
        error: error.message,
      });
    }
  }
);

// DELETE /api/students/:id - Delete a student by ID
router.delete(
  "/:id",
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      await Student.findByIdAndDelete(id);

      res.json({
        success: true,
        message: "Student deleted successfully",
        data: student,
      });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete student",
        error: error.message,
      });
    }
  }
);

// PUT /api/students/:id/deactivate - Deactivate a student
router.put(
  "/:id/deactivate",
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      await student.deactivate();

      res.json({
        success: true,
        message: "Student deactivated successfully",
        data: student,
      });
    } catch (error) {
      console.error("Error deactivating student:", error);
      res.status(500).json({
        success: false,
        message: "Failed to deactivate student",
        error: error.message,
      });
    }
  }
);

// PUT /api/students/:id/fee-paid - Mark student fee as paid
router.put(
  "/:id/fee-paid",
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;

      const student = await Student.findById(id);

      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found",
        });
      }

      await student.markFeePaid();

      res.json({
        success: true,
        message: "Student fee marked as paid successfully",
        data: student,
      });
    } catch (error) {
      console.error("Error updating fee status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update fee status",
        error: error.message,
      });
    }
  }
);

// GET /api/students/search/:term - Search students
router.get("/search/:term", async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const students = await Student.searchStudents(term)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.searchStudents(term).countDocuments();

    res.json({
      success: true,
      message: `Search results for "${term}"`,
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStudents: total,
          studentsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search students",
      error: error.message,
    });
  }
});

// GET /api/students/course/:course - Get students by course
router.get("/course/:course", async (req, res) => {
  try {
    const { course } = req.params;
    const { limit = 10, page = 1 } = req.query;

    const students = await Student.findByCourse(course)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.findByCourse(course).countDocuments();

    res.json({
      success: true,
      message: `Students enrolled in ${course}`,
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStudents: total,
          studentsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching students by course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students by course",
      error: error.message,
    });
  }
});

// GET /api/students/fees/status/:status - Get students by fee status
router.get("/fees/status/:status", async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 10, page = 1 } = req.query;

    if (!["paid", "pending", "overdue"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fee status. Must be paid, pending, or overdue",
      });
    }

    const students = await Student.findByFeeStatus(status)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Student.findByFeeStatus(status).countDocuments();

    res.json({
      success: true,
      message: `Students with ${status} fee status`,
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStudents: total,
          studentsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching students by fee status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve students by fee status",
      error: error.message,
    });
  }
});

// GET /api/students/fees/overdue - Get students with overdue fees
router.get("/fees/overdue", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const students = await Student.getOverdueStudents()
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ nextFeePayment: 1 });

    const total = await Student.getOverdueStudents().countDocuments();

    res.json({
      success: true,
      message: "Students with overdue fees",
      data: {
        students,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalStudents: total,
          studentsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching overdue students:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve overdue students",
      error: error.message,
    });
  }
});

// GET /api/students/dashboard/stats - Get dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const stats = await Student.getDashboardStats();

    res.json({
      success: true,
      message: "Dashboard statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve dashboard statistics",
      error: error.message,
    });
  }
});

module.exports = router;
