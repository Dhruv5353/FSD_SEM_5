import { useState } from "react";
import "./App.css";

function App() {
  // Calculator state management using React hooks
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  // Handle number input
  const inputNumber = (num) => {
    if (waitingForNewValue) {
      setDisplay(String(num));
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? String(num) : display + num);
    }
  };

  // Handle decimal point
  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  // Clear all values
  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  // Perform calculation
  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "*":
        return firstValue * secondValue;
      case "/":
        return secondValue !== 0 ? firstValue / secondValue : 0;
      default:
        return secondValue;
    }
  };

  // Handle operation selection
  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  // Handle equals button
  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  // Calculator button component
  const Button = ({ onClick, className, children }) => (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );

  return (
    <div className="calculator-container">
      <div className="calculator">
        <div className="calculator-display">
          <div className="display-value">{display}</div>
        </div>

        <div className="calculator-buttons">
          {/* First row */}
          <Button className="btn btn-clear" onClick={clear}>
            C
          </Button>
          <Button
            className="btn btn-operation"
            onClick={() => performOperation("/")}
          >
            ÷
          </Button>
          <Button
            className="btn btn-operation"
            onClick={() => performOperation("*")}
          >
            ×
          </Button>
          <Button
            className="btn btn-operation"
            onClick={() => {
              setDisplay(display.slice(0, -1) || "0");
            }}
          >
            ⌫
          </Button>

          {/* Second row */}
          <Button className="btn btn-number" onClick={() => inputNumber(7)}>
            7
          </Button>
          <Button className="btn btn-number" onClick={() => inputNumber(8)}>
            8
          </Button>
          <Button className="btn btn-number" onClick={() => inputNumber(9)}>
            9
          </Button>
          <Button
            className="btn btn-operation"
            onClick={() => performOperation("-")}
          >
            -
          </Button>

          {/* Third row */}
          <Button className="btn btn-number" onClick={() => inputNumber(4)}>
            4
          </Button>
          <Button className="btn btn-number" onClick={() => inputNumber(5)}>
            5
          </Button>
          <Button className="btn btn-number" onClick={() => inputNumber(6)}>
            6
          </Button>
          <Button
            className="btn btn-operation"
            onClick={() => performOperation("+")}
          >
            +
          </Button>

          {/* Fourth row */}
          <Button className="btn btn-number" onClick={() => inputNumber(1)}>
            1
          </Button>
          <Button className="btn btn-number" onClick={() => inputNumber(2)}>
            2
          </Button>
          <Button className="btn btn-number" onClick={() => inputNumber(3)}>
            3
          </Button>
          <Button
            className="btn btn-equals"
            onClick={handleEquals}
            style={{ gridRow: "span 2" }}
          >
            =
          </Button>

          {/* Fifth row */}
          <Button
            className="btn btn-number btn-zero"
            onClick={() => inputNumber(0)}
          >
            0
          </Button>
          <Button className="btn btn-number" onClick={inputDecimal}>
            .
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
