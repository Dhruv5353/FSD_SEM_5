import { useState } from "react";
import "./App.css";

function App() {
  // State management using React Hooks
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Function to add a new task
  const addTask = () => {
    if (inputValue.trim() !== "") {
      const newTask = {
        id: Date.now(), // Simple ID generation
        text: inputValue.trim(),
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setInputValue(""); // Clear input field
    }
  };

  // Function to delete a task
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Function to start editing a task
  const startEdit = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  // Function to save edited task
  const saveEdit = (id) => {
    if (editValue.trim() !== "") {
      setTasks(
        tasks.map((task) =>
          task.id === id ? { ...task, text: editValue.trim() } : task
        )
      );
    }
    setEditingId(null);
    setEditValue("");
  };

  // Function to cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Function to toggle task completion
  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Handle input field changes
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle edit input changes
  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  // Handle Enter key press for adding tasks
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask();
    }
  };

  // Handle Enter key press for saving edits
  const handleEditKeyPress = (e, id) => {
    if (e.key === "Enter") {
      saveEdit(id);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <div className="todo-container">
      <div className="todo-app">
        <h1>Get Things Done!</h1>

        {/* Input section */}
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="What is the task today?"
            className="task-input"
          />
          <button onClick={addTask} className="add-button">
            Add Task
          </button>
        </div>

        {/* Tasks list */}
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <p className="no-tasks">No tasks yet. Add one above!</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                {editingId === task.id ? (
                  /* Edit mode */
                  <div className="edit-section">
                    <input
                      type="text"
                      value={editValue}
                      onChange={handleEditChange}
                      onKeyPress={(e) => handleEditKeyPress(e, task.id)}
                      className="edit-input"
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button
                        onClick={() => saveEdit(task.id)}
                        className="save-button"
                      >
                        ✓
                      </button>
                      <button onClick={cancelEdit} className="cancel-button">
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display mode */
                  <div className="task-content">
                    <div className="task-left">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id)}
                        className="task-checkbox"
                      />
                      <span className="task-text">{task.text}</span>
                    </div>
                    <div className="task-actions">
                      <button
                        onClick={() => startEdit(task.id, task.text)}
                        className="edit-button"
                        disabled={task.completed}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="delete-button"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {tasks.length > 0 && (
          <div className="task-stats">
            <p>
              Total: {tasks.length} | Completed:{" "}
              {tasks.filter((t) => t.completed).length} | Remaining:{" "}
              {tasks.filter((t) => !t.completed).length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
