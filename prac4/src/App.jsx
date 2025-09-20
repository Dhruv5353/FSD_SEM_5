import { useState } from "react";
import "./App.css";

function App() {
  // Counter state using React Hook
  const [count, setCount] = useState(0);

  // Name states using React Hooks
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Counter functions
  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  const reset = () => {
    setCount(0);
  };

  const incrementFive = () => {
    setCount(count + 5);
  };

  // Handle input changes
  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  };

  return (
    <div className="app-container">
      <div className="counter-section">
        <h1>Count: {count}</h1>

        <div className="button-group">
          <button onClick={reset}>Reset</button>
          <button onClick={increment}>Increment</button>
          <button onClick={decrement}>Decrement</button>
          <button onClick={incrementFive}>Increment 5</button>
        </div>
      </div>

      <div className="name-section">
        <h2>Welcome to CHARUSAT!!!</h2>

        <div className="input-group">
          <label>
            First Name:
            <input
              type="text"
              value={firstName}
              onChange={handleFirstNameChange}
              placeholder="Enter first name"
            />
          </label>

          <label>
            Last Name:
            <input
              type="text"
              value={lastName}
              onChange={handleLastNameChange}
              placeholder="Enter last name"
            />
          </label>
        </div>

        <div className="display-names">
          <p>
            <strong>First Name:</strong> {firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {lastName}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
