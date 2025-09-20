const express = require("express");
const { body, validationResult, param, query } = require("express-validator");
const Note = require("../models/Note");

const router = express.Router();

// Validation middleware
const validateNote = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ max: 5000 })
    .withMessage("Content cannot exceed 5000 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Each tag cannot exceed 30 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];

const validateNoteUpdate = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty")
    .isLength({ max: 5000 })
    .withMessage("Content cannot exceed 5000 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Each tag cannot exceed 30 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priority must be low, medium, or high"),
];

const validateObjectId = [
  param("id").isMongoId().withMessage("Invalid note ID format"),
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

// GET /api/notes - Get all notes with optional filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      priority,
      search,
      archived = "false",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (priority) {
      filter.priority = priority;
    }

    if (archived === "true") {
      filter.isArchived = true;
    } else {
      filter.isArchived = false;
    }

    // Handle search
    let query = Note.find(filter);

    if (search) {
      query = Note.searchNotes(search);
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
    const notes = await query.exec();
    const total = await Note.countDocuments(filter);

    res.json({
      success: true,
      message: "Notes retrieved successfully",
      data: {
        notes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalNotes: total,
          notesPerPage: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notes",
      error: error.message,
    });
  }
});

// GET /api/notes/:id - Get a specific note by ID
router.get(
  "/:id",
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      res.json({
        success: true,
        message: "Note retrieved successfully",
        data: note,
      });
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve note",
        error: error.message,
      });
    }
  }
);

// POST /api/notes - Create a new note
router.post("/", validateNote, handleValidationErrors, async (req, res) => {
  try {
    const { title, content, tags, priority } = req.body;

    const newNote = new Note({
      title,
      content,
      tags: tags || [],
      priority: priority || "medium",
    });

    const savedNote = await newNote.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: savedNote,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create note",
      error: error.message,
    });
  }
});

// PUT /api/notes/:id - Update a note
router.put(
  "/:id",
  validateObjectId,
  validateNoteUpdate,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, content, tags, priority } = req.body;

      const updatedNote = await Note.findByIdAndUpdate(
        req.params.id,
        {
          ...(title && { title }),
          ...(content && { content }),
          ...(tags && { tags }),
          ...(priority && { priority }),
          updatedAt: Date.now(),
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updatedNote) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      res.json({
        success: true,
        message: "Note updated successfully",
        data: updatedNote,
      });
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update note",
        error: error.message,
      });
    }
  }
);

// PATCH /api/notes/:id/archive - Toggle archive status
router.patch(
  "/:id/archive",
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const note = await Note.findById(req.params.id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      await note.toggleArchive();

      res.json({
        success: true,
        message: `Note ${
          note.isArchived ? "archived" : "unarchived"
        } successfully`,
        data: note,
      });
    } catch (error) {
      console.error("Error toggling archive status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle archive status",
        error: error.message,
      });
    }
  }
);

// DELETE /api/notes/:id - Delete a note
router.delete(
  "/:id",
  validateObjectId,
  handleValidationErrors,
  async (req, res) => {
    try {
      const deletedNote = await Note.findByIdAndDelete(req.params.id);

      if (!deletedNote) {
        return res.status(404).json({
          success: false,
          message: "Note not found",
        });
      }

      res.json({
        success: true,
        message: "Note deleted successfully",
        data: deletedNote,
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete note",
        error: error.message,
      });
    }
  }
);

// GET /api/notes/priority/:priority - Get notes by priority
router.get("/priority/:priority", async (req, res) => {
  try {
    const { priority } = req.params;

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Must be low, medium, or high",
      });
    }

    const notes = await Note.findByPriority(priority);

    res.json({
      success: true,
      message: `Notes with ${priority} priority retrieved successfully`,
      data: notes,
    });
  } catch (error) {
    console.error("Error fetching notes by priority:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notes by priority",
      error: error.message,
    });
  }
});

// GET /api/notes/search/:term - Search notes
router.get("/search/:term", async (req, res) => {
  try {
    const { term } = req.params;
    const notes = await Note.searchNotes(term);

    res.json({
      success: true,
      message: `Search results for "${term}"`,
      data: notes,
    });
  } catch (error) {
    console.error("Error searching notes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search notes",
      error: error.message,
    });
  }
});

module.exports = router;
