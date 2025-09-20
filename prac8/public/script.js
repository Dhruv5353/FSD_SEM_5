// API Configuration
const API_BASE = "/api/counters";
let currentCounterId = "main";

// DOM Elements
const elements = {
  counterValue: document.getElementById("counter-value"),
  currentExercise: document.getElementById("current-exercise"),
  exerciseInput: document.getElementById("exercise-input"),
  updateExerciseBtn: document.getElementById("update-exercise"),
  incrementBtn: document.getElementById("increment-btn"),
  decrementBtn: document.getElementById("decrement-btn"),
  resetBtn: document.getElementById("reset-btn"),
  quickBtns: document.querySelectorAll(".btn-quick"),
  newCounterId: document.getElementById("new-counter-id"),
  newCounterExercise: document.getElementById("new-counter-exercise"),
  createCounterBtn: document.getElementById("create-counter"),
  counterList: document.getElementById("counter-list"),
  lastUpdated: document.getElementById("last-updated"),
  loading: document.getElementById("loading"),
  errorMessage: document.getElementById("error-message"),
};

// State Management
let counters = {};
let isLoading = false;

// Utility Functions
function showLoading() {
  isLoading = true;
  elements.loading.style.display = "flex";
}

function hideLoading() {
  isLoading = false;
  elements.loading.style.display = "none";
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorMessage.style.display = "block";
  setTimeout(() => {
    elements.errorMessage.style.display = "none";
  }, 5000);
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// API Functions
async function apiRequest(url, options = {}) {
  try {
    showLoading();
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    showError(error.message || "Network error occurred");
    throw error;
  } finally {
    hideLoading();
  }
}

async function loadCounters() {
  try {
    const data = await apiRequest(API_BASE);
    counters = data;
    updateCounterDisplay();
    renderCounterList();
  } catch (error) {
    console.error("Failed to load counters:", error);
  }
}

async function incrementCounter(id = currentCounterId, amount = 1) {
  try {
    const data = await apiRequest(`${API_BASE}/${id}/increment`, {
      method: "PUT",
      body: JSON.stringify({ amount }),
    });

    counters[id] = data;
    updateCounterDisplay();
    renderCounterList();

    // Add visual feedback
    elements.counterValue.style.transform = "scale(1.1)";
    setTimeout(() => {
      elements.counterValue.style.transform = "scale(1)";
    }, 200);
  } catch (error) {
    console.error("Failed to increment counter:", error);
  }
}

async function decrementCounter(id = currentCounterId, amount = 1) {
  try {
    const data = await apiRequest(`${API_BASE}/${id}/decrement`, {
      method: "PUT",
      body: JSON.stringify({ amount }),
    });

    counters[id] = data;
    updateCounterDisplay();
    renderCounterList();

    // Add visual feedback
    elements.counterValue.style.transform = "scale(0.9)";
    setTimeout(() => {
      elements.counterValue.style.transform = "scale(1)";
    }, 200);
  } catch (error) {
    console.error("Failed to decrement counter:", error);
  }
}

async function resetCounter(id = currentCounterId) {
  if (confirm("Are you sure you want to reset this counter?")) {
    try {
      const data = await apiRequest(`${API_BASE}/${id}/reset`, {
        method: "PUT",
      });

      counters[id] = data;
      updateCounterDisplay();
      renderCounterList();

      // Add visual feedback
      elements.counterValue.style.color = "#e74c3c";
      setTimeout(() => {
        elements.counterValue.style.color = "#2c3e50";
      }, 500);
    } catch (error) {
      console.error("Failed to reset counter:", error);
    }
  }
}

async function updateExerciseName(id = currentCounterId, exercise) {
  try {
    const data = await apiRequest(`${API_BASE}/${id}/exercise`, {
      method: "PUT",
      body: JSON.stringify({ exercise }),
    });

    counters[id] = data;
    updateCounterDisplay();
    renderCounterList();
  } catch (error) {
    console.error("Failed to update exercise name:", error);
  }
}

async function createCounter(id, exercise, value = 0) {
  try {
    const data = await apiRequest(API_BASE, {
      method: "POST",
      body: JSON.stringify({ id, exercise, value }),
    });

    counters[id] = data;
    renderCounterList();

    // Clear form
    elements.newCounterId.value = "";
    elements.newCounterExercise.value = "";
  } catch (error) {
    console.error("Failed to create counter:", error);
  }
}

async function deleteCounter(id) {
  if (confirm("Are you sure you want to delete this counter?")) {
    try {
      await apiRequest(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      delete counters[id];

      // Switch to main counter if current counter was deleted
      if (id === currentCounterId) {
        currentCounterId = "main";
      }

      updateCounterDisplay();
      renderCounterList();
    } catch (error) {
      console.error("Failed to delete counter:", error);
    }
  }
}

// UI Update Functions
function updateCounterDisplay() {
  const counter = counters[currentCounterId];
  if (counter) {
    elements.counterValue.textContent = counter.value;
    elements.currentExercise.textContent = counter.exercise;
    elements.exerciseInput.value = counter.exercise;
    elements.lastUpdated.textContent = formatDateTime(counter.lastUpdated);
  }
}

function renderCounterList() {
  elements.counterList.innerHTML = "";

  Object.entries(counters).forEach(([id, counter]) => {
    const counterItem = document.createElement("div");
    counterItem.className = `counter-item ${
      id === currentCounterId ? "active" : ""
    }`;

    counterItem.innerHTML = `
            <div class="counter-info">
                <div class="counter-name">${id}</div>
                <div class="counter-exercise">${counter.exercise}</div>
            </div>
            <div class="counter-value-small">${counter.value}</div>
            <div class="counter-actions">
                <button class="btn btn-small btn-secondary" onclick="switchCounter('${id}')">
                    ${id === currentCounterId ? "Active" : "Switch"}
                </button>
                ${
                  id !== "main"
                    ? `<button class="btn btn-small btn-reset" onclick="deleteCounter('${id}')">Delete</button>`
                    : ""
                }
            </div>
        `;

    elements.counterList.appendChild(counterItem);
  });
}

function switchCounter(id) {
  currentCounterId = id;
  updateCounterDisplay();
  renderCounterList();
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  // Load initial data
  loadCounters();

  // Counter controls
  elements.incrementBtn.addEventListener("click", () => incrementCounter());
  elements.decrementBtn.addEventListener("click", () => decrementCounter());
  elements.resetBtn.addEventListener("click", () => resetCounter());

  // Quick increment buttons
  elements.quickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const amount = parseInt(btn.dataset.amount);
      incrementCounter(currentCounterId, amount);
    });
  });

  // Exercise name update
  elements.updateExerciseBtn.addEventListener("click", () => {
    const exercise = elements.exerciseInput.value.trim();
    if (exercise) {
      updateExerciseName(currentCounterId, exercise);
    }
  });

  // Enter key for exercise update
  elements.exerciseInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      elements.updateExerciseBtn.click();
    }
  });

  // Create new counter
  elements.createCounterBtn.addEventListener("click", () => {
    const id = elements.newCounterId.value.trim();
    const exercise = elements.newCounterExercise.value.trim();

    if (id && exercise) {
      if (counters[id]) {
        showError("Counter with this name already exists");
        return;
      }
      createCounter(id, exercise);
    } else {
      showError("Please fill in both counter name and exercise");
    }
  });

  // Enter key for creating counter
  [elements.newCounterId, elements.newCounterExercise].forEach((input) => {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        elements.createCounterBtn.click();
      }
    });
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;

    switch (e.key) {
      case "ArrowUp":
      case "+":
        e.preventDefault();
        incrementCounter();
        break;
      case "ArrowDown":
      case "-":
        e.preventDefault();
        decrementCounter();
        break;
      case "r":
      case "R":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          resetCounter();
        }
        break;
      case "5":
        if (e.shiftKey) {
          e.preventDefault();
          incrementCounter(currentCounterId, 5);
        }
        break;
      case "1":
        if (e.shiftKey && e.key === "!") {
          e.preventDefault();
          incrementCounter(currentCounterId, 10);
        }
        break;
    }
  });
});

// Auto-refresh every 30 seconds to sync with other clients
setInterval(() => {
  if (!isLoading) {
    loadCounters();
  }
}, 30000);

// Expose functions globally for onclick handlers
window.switchCounter = switchCounter;
window.deleteCounter = deleteCounter;

// Service Worker Registration for PWA capabilities (if needed)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
