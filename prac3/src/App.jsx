import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Set up interval to update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, []);

  // Format date function
  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    };
    return date.toLocaleDateString("en-US", options);
  };

  // Format time function
  const formatTime = (date) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options);
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <h1 className="welcome-title">Welcome to CHARUSAT!!!!</h1>
          <div className="subtitle">Real-time Date & Time Display</div>
        </div>

        <div className="time-display">
          <div className="date-section">
            <div className="date-label">Today is</div>
            <div className="date-value">{formatDate(currentTime)}</div>
          </div>

          <div className="time-section">
            <div className="time-label">Current Time</div>
            <div className="time-value">{formatTime(currentTime)}</div>
          </div>
        </div>

        <div className="digital-clock">
          <div className="clock-display">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
