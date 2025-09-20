const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Data file path for persistence
const dataFile = path.join(__dirname, "data", "counter.json");

// Ensure data directory exists
const dataDir = path.dirname(dataFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFile)) {
  const initialData = {
    counters: {
      main: {
        value: 0,
        exercise: "General Exercise",
        lastUpdated: new Date().toISOString(),
      },
    },
  };
  fs.writeFileSync(dataFile, JSON.stringify(initialData, null, 2));
}

// Helper function to read counter data
function readCounterData() {
  try {
    const data = fs.readFileSync(dataFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading counter data:", error);
    return {
      counters: {
        main: {
          value: 0,
          exercise: "General Exercise",
          lastUpdated: new Date().toISOString(),
        },
      },
    };
  }
}

// Helper function to write counter data
function writeCounterData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error("Error writing counter data:", error);
    return false;
  }
}

// Routes

// GET - Get all counters
app.get("/api/counters", (req, res) => {
  const data = readCounterData();
  res.json(data.counters);
});

// GET - Get specific counter
app.get("/api/counters/:id", (req, res) => {
  const { id } = req.params;
  const data = readCounterData();

  if (data.counters[id]) {
    res.json(data.counters[id]);
  } else {
    res.status(404).json({ error: "Counter not found" });
  }
});

// POST - Create new counter
app.post("/api/counters", (req, res) => {
  const { id, exercise = "Exercise", value = 0 } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Counter ID is required" });
  }

  const data = readCounterData();
  data.counters[id] = {
    value: parseInt(value) || 0,
    exercise,
    lastUpdated: new Date().toISOString(),
  };

  if (writeCounterData(data)) {
    res.status(201).json(data.counters[id]);
  } else {
    res.status(500).json({ error: "Failed to create counter" });
  }
});

// PUT - Update counter value
app.put("/api/counters/:id/increment", (req, res) => {
  const { id } = req.params;
  const { amount = 1 } = req.body;

  const data = readCounterData();

  if (!data.counters[id]) {
    return res.status(404).json({ error: "Counter not found" });
  }

  data.counters[id].value += parseInt(amount) || 1;
  data.counters[id].lastUpdated = new Date().toISOString();

  if (writeCounterData(data)) {
    res.json(data.counters[id]);
  } else {
    res.status(500).json({ error: "Failed to update counter" });
  }
});

// PUT - Decrement counter
app.put("/api/counters/:id/decrement", (req, res) => {
  const { id } = req.params;
  const { amount = 1 } = req.body;

  const data = readCounterData();

  if (!data.counters[id]) {
    return res.status(404).json({ error: "Counter not found" });
  }

  data.counters[id].value = Math.max(
    0,
    data.counters[id].value - (parseInt(amount) || 1)
  );
  data.counters[id].lastUpdated = new Date().toISOString();

  if (writeCounterData(data)) {
    res.json(data.counters[id]);
  } else {
    res.status(500).json({ error: "Failed to update counter" });
  }
});

// PUT - Reset counter
app.put("/api/counters/:id/reset", (req, res) => {
  const { id } = req.params;

  const data = readCounterData();

  if (!data.counters[id]) {
    return res.status(404).json({ error: "Counter not found" });
  }

  data.counters[id].value = 0;
  data.counters[id].lastUpdated = new Date().toISOString();

  if (writeCounterData(data)) {
    res.json(data.counters[id]);
  } else {
    res.status(500).json({ error: "Failed to reset counter" });
  }
});

// PUT - Set exercise name
app.put("/api/counters/:id/exercise", (req, res) => {
  const { id } = req.params;
  const { exercise } = req.body;

  if (!exercise) {
    return res.status(400).json({ error: "Exercise name is required" });
  }

  const data = readCounterData();

  if (!data.counters[id]) {
    return res.status(404).json({ error: "Counter not found" });
  }

  data.counters[id].exercise = exercise;
  data.counters[id].lastUpdated = new Date().toISOString();

  if (writeCounterData(data)) {
    res.json(data.counters[id]);
  } else {
    res.status(500).json({ error: "Failed to update exercise name" });
  }
});

// DELETE - Delete counter
app.delete("/api/counters/:id", (req, res) => {
  const { id } = req.params;

  const data = readCounterData();

  if (!data.counters[id]) {
    return res.status(404).json({ error: "Counter not found" });
  }

  delete data.counters[id];

  if (writeCounterData(data)) {
    res.json({ message: "Counter deleted successfully" });
  } else {
    res.status(500).json({ error: "Failed to delete counter" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏋️‍♂️ Gym Rep Counter Server running on http://localhost:${PORT}`);
  console.log(`📊 Data stored in: ${dataFile}`);
});

module.exports = app;
