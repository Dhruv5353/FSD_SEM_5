const mongoose = require("mongoose");

// Define the Note schema
const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted creation date
noteSchema.virtual("formattedCreatedAt").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Virtual for content preview (first 100 characters)
noteSchema.virtual("preview").get(function () {
  return this.content.length > 100
    ? this.content.substring(0, 100) + "..."
    : this.content;
});

// Index for better search performance
noteSchema.index({ title: "text", content: "text" });
noteSchema.index({ createdAt: -1 });
noteSchema.index({ priority: 1 });

// Pre-save middleware to update the updatedAt field
noteSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// Instance method to toggle archive status
noteSchema.methods.toggleArchive = function () {
  this.isArchived = !this.isArchived;
  return this.save();
};

// Static method to find notes by priority
noteSchema.statics.findByPriority = function (priority) {
  return this.find({ priority, isArchived: false });
};

// Static method to search notes
noteSchema.statics.searchNotes = function (searchTerm) {
  return this.find({
    $and: [
      { isArchived: false },
      {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { content: { $regex: searchTerm, $options: "i" } },
          { tags: { $in: [new RegExp(searchTerm, "i")] } },
        ],
      },
    ],
  });
};

// Create and export the model
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
