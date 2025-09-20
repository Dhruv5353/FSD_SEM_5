const mongoose = require("mongoose");

// Define the Student schema
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    course: {
      type: String,
      required: [true, "Course is required"],
      trim: true,
      enum: {
        values: [
          "Mathematics - Class 9",
          "Mathematics - Class 10",
          "Mathematics - Class 11",
          "Mathematics - Class 12",
          "Physics - Class 9",
          "Physics - Class 10",
          "Physics - Class 11",
          "Physics - Class 12",
          "Chemistry - Class 9",
          "Chemistry - Class 10",
          "Chemistry - Class 11",
          "Chemistry - Class 12",
          "Biology - Class 11",
          "Biology - Class 12",
          "English - Class 9",
          "English - Class 10",
          "English - Class 11",
          "English - Class 12",
          "Computer Science - Class 11",
          "Computer Science - Class 12",
        ],
        message: "Please select a valid course",
      },
    },
    batchTime: {
      type: String,
      required: [true, "Batch time is required"],
      trim: true,
    },
    feeAmount: {
      type: Number,
      required: [true, "Fee amount is required"],
      min: [0, "Fee amount cannot be negative"],
      max: [50000, "Fee amount cannot exceed ₹50,000"],
    },
    feeStatus: {
      type: String,
      required: true,
      enum: {
        values: ["paid", "pending", "overdue"],
        message: "Fee status must be paid, pending, or overdue",
      },
      default: "pending",
    },
    joinDate: {
      type: Date,
      required: [true, "Join date is required"],
      default: Date.now,
    },
    guardianName: {
      type: String,
      required: [true, "Guardian name is required"],
      trim: true,
      maxlength: [100, "Guardian name cannot exceed 100 characters"],
    },
    guardianPhone: {
      type: String,
      required: [true, "Guardian phone number is required"],
      trim: true,
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        "Please enter a valid guardian phone number",
      ],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastFeePayment: {
      type: Date,
    },
    nextFeePayment: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for student age (if we had birthDate)
studentSchema.virtual("displayName").get(function () {
  return `${this.name} (${this.course})`;
});

// Virtual for formatted join date
studentSchema.virtual("formattedJoinDate").get(function () {
  return this.joinDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for fee status badge color
studentSchema.virtual("feeStatusColor").get(function () {
  switch (this.feeStatus) {
    case "paid":
      return "green";
    case "pending":
      return "orange";
    case "overdue":
      return "red";
    default:
      return "gray";
  }
});

// Virtual for course subject
studentSchema.virtual("subject").get(function () {
  return this.course.split(" - ")[0];
});

// Virtual for class level
studentSchema.virtual("classLevel").get(function () {
  return this.course.split(" - ")[1];
});

// Indexes for better search performance
studentSchema.index({ name: "text", email: "text", course: "text" });
studentSchema.index({ email: 1 }, { unique: true });
studentSchema.index({ course: 1 });
studentSchema.index({ feeStatus: 1 });
studentSchema.index({ joinDate: -1 });
studentSchema.index({ isActive: 1 });

// Pre-save middleware
studentSchema.pre("save", function (next) {
  // Set next fee payment date (1 month from join date or last payment)
  if (this.isNew || this.isModified("lastFeePayment")) {
    const baseDate = this.lastFeePayment || this.joinDate;
    this.nextFeePayment = new Date(baseDate);
    this.nextFeePayment.setMonth(this.nextFeePayment.getMonth() + 1);
  }

  // Update fee status based on payment dates
  if (this.feeStatus === "paid" && !this.lastFeePayment) {
    this.lastFeePayment = new Date();
  }

  next();
});

// Instance method to mark fee as paid
studentSchema.methods.markFeePaid = function () {
  this.feeStatus = "paid";
  this.lastFeePayment = new Date();
  return this.save();
};

// Instance method to mark fee as overdue
studentSchema.methods.markFeeOverdue = function () {
  this.feeStatus = "overdue";
  return this.save();
};

// Instance method to deactivate student
studentSchema.methods.deactivate = function () {
  this.isActive = false;
  return this.save();
};

// Static method to find students by course
studentSchema.statics.findByCourse = function (course) {
  return this.find({ course, isActive: true });
};

// Static method to find students by fee status
studentSchema.statics.findByFeeStatus = function (status) {
  return this.find({ feeStatus: status, isActive: true });
};

// Static method to search students
studentSchema.statics.searchStudents = function (searchTerm) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { course: { $regex: searchTerm, $options: "i" } },
          { phone: { $regex: searchTerm, $options: "i" } },
        ],
      },
    ],
  });
};

// Static method to get students with overdue fees
studentSchema.statics.getOverdueStudents = function () {
  const today = new Date();
  return this.find({
    isActive: true,
    $or: [
      { feeStatus: "overdue" },
      {
        feeStatus: "pending",
        nextFeePayment: { $lt: today },
      },
    ],
  });
};

// Static method to get dashboard statistics
studentSchema.statics.getDashboardStats = async function () {
  const totalStudents = await this.countDocuments({ isActive: true });
  const paidFees = await this.countDocuments({
    feeStatus: "paid",
    isActive: true,
  });
  const pendingFees = await this.countDocuments({
    feeStatus: "pending",
    isActive: true,
  });
  const overdueFees = await this.countDocuments({
    feeStatus: "overdue",
    isActive: true,
  });

  const totalRevenue = await this.aggregate([
    { $match: { feeStatus: "paid", isActive: true } },
    { $group: { _id: null, total: { $sum: "$feeAmount" } } },
  ]);

  const courseDistribution = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$course", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    totalStudents,
    paidFees,
    pendingFees,
    overdueFees,
    totalRevenue: totalRevenue[0]?.total || 0,
    courseDistribution,
  };
};

// Create and export the model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
