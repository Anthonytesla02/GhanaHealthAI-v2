import { useState, useEffect } from "react";

interface CalculatorState {
  currentValue: string;
  previousValue: string;
  operation: string;
  isNewCalculation: boolean;
  hasError: boolean;
}

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>({
    currentValue: "0",
    previousValue: "",
    operation: "",
    isNewCalculation: true,
    hasError: false,
  });

  const getOperatorSymbol = (operation: string): string => {
    const symbols: Record<string, string> = {
      add: "+",
      subtract: "−",
      multiply: "×",
      divide: "÷",
    };
    return symbols[operation] || operation;
  };

  const handleNumber = (number: string) => {
    if (state.hasError) {
      setState({
        currentValue: "0",
        previousValue: "",
        operation: "",
        isNewCalculation: true,
        hasError: false,
      });
    }

    setState((prev) => {
      if (prev.isNewCalculation) {
        return { ...prev, currentValue: number, isNewCalculation: false };
      } else {
        return {
          ...prev,
          currentValue: prev.currentValue === "0" ? number : prev.currentValue + number,
        };
      }
    });
  };

  const handleOperator = (operator: string) => {
    if (state.hasError) return;

    setState((prev) => {
      let newState = { ...prev };

      if (prev.operation && !prev.isNewCalculation) {
        // Perform calculation before setting new operator
        const result = performCalculation(prev);
        if (result.hasError) {
          return result;
        }
        newState = result;
      }

      return {
        ...newState,
        previousValue: newState.currentValue,
        operation: operator,
        isNewCalculation: true,
      };
    });
  };

  const performCalculation = (calcState: CalculatorState): CalculatorState => {
    if (!calcState.operation || calcState.hasError) return calcState;

    const prev = parseFloat(calcState.previousValue);
    const current = parseFloat(calcState.currentValue);
    let result: number;

    try {
      switch (calcState.operation) {
        case "add":
          result = prev + current;
          break;
        case "subtract":
          result = prev - current;
          break;
        case "multiply":
          result = prev * current;
          break;
        case "divide":
          if (current === 0) {
            throw new Error("Division by zero");
          }
          result = prev / current;
          break;
        default:
          return calcState;
      }

      // Handle floating point precision
      result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

      return {
        currentValue: result.toString(),
        previousValue: "",
        operation: "",
        isNewCalculation: true,
        hasError: false,
      };
    } catch (error) {
      return {
        currentValue: "Error",
        previousValue: "",
        operation: "",
        isNewCalculation: true,
        hasError: true,
      };
    }
  };

  const handleEquals = () => {
    setState((prev) => performCalculation(prev));
  };

  const handleClear = () => {
    setState({
      currentValue: "0",
      previousValue: "",
      operation: "",
      isNewCalculation: true,
      hasError: false,
    });
  };

  const handleDecimal = () => {
    if (state.hasError) return;

    setState((prev) => {
      if (prev.isNewCalculation) {
        return { ...prev, currentValue: "0.", isNewCalculation: false };
      } else if (!prev.currentValue.includes(".")) {
        return { ...prev, currentValue: prev.currentValue + "." };
      }
      return prev;
    });
  };

  const handlePlusMinus = () => {
    if (state.hasError || state.currentValue === "0") return;

    setState((prev) => ({
      ...prev,
      currentValue: prev.currentValue.startsWith("-")
        ? prev.currentValue.slice(1)
        : "-" + prev.currentValue,
    }));
  };

  const handlePercent = () => {
    if (state.hasError) return;

    setState((prev) => {
      const value = parseFloat(prev.currentValue);
      return { ...prev, currentValue: (value / 100).toString() };
    });
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      if (/^[0-9]$/.test(e.key)) {
        handleNumber(e.key);
      } else {
        switch (e.key) {
          case "+":
            handleOperator("add");
            break;
          case "-":
            handleOperator("subtract");
            break;
          case "*":
            handleOperator("multiply");
            break;
          case "/":
            handleOperator("divide");
            break;
          case "Enter":
          case "=":
            handleEquals();
            break;
          case "Escape":
          case "c":
          case "C":
            handleClear();
            break;
          case ".":
            handleDecimal();
            break;
          case "%":
            handlePercent();
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state]);

  const CalculatorButton = ({
    onClick,
    className,
    children,
    ...props
  }: {
    onClick: () => void;
    className: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`calculator-button ripple font-medium py-4 rounded-xl shadow-md transition-all duration-200 ease-out hover:shadow-lg active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-surface-gray font-roboto min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        {/* Calculator Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Calculator Display */}
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            {/* Previous Operation Display */}
            {state.previousValue && state.operation && (
              <div className="text-right mb-2">
                <span className="text-gray-500 text-sm font-roboto-mono">
                  {state.previousValue} {getOperatorSymbol(state.operation)}
                </span>
              </div>
            )}
            {/* Main Display */}
            <div className="text-right">
              <span
                className={`text-4xl font-roboto-mono font-light tracking-wide ${
                  state.hasError ? "text-material-red" : "text-gray-900"
                }`}
              >
                {state.currentValue}
              </span>
            </div>
            {/* Error State */}
            {state.hasError && (
              <div className="text-right mt-1">
                <span className="text-material-red text-sm font-medium">
                  Error: Division by zero
                </span>
              </div>
            )}
          </div>

          {/* Calculator Buttons */}
          <div className="p-4">
            {/* First Row: Clear, +/-, %, ÷ */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <CalculatorButton
                onClick={handleClear}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                <span className="text-lg">AC</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={handlePlusMinus}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                <span className="text-lg">±</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={handlePercent}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                <span className="text-lg">%</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator("divide")}
                className="bg-material-orange hover:bg-material-orange-dark text-white"
              >
                <span className="text-lg">÷</span>
              </CalculatorButton>
            </div>

            {/* Second Row: 7, 8, 9, × */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <CalculatorButton
                onClick={() => handleNumber("7")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">7</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleNumber("8")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">8</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleNumber("9")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">9</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator("multiply")}
                className="bg-material-orange hover:bg-material-orange-dark text-white"
              >
                <span className="text-lg">×</span>
              </CalculatorButton>
            </div>

            {/* Third Row: 4, 5, 6, - */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <CalculatorButton
                onClick={() => handleNumber("4")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">4</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleNumber("5")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">5</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleNumber("6")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">6</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator("subtract")}
                className="bg-material-orange hover:bg-material-orange-dark text-white"
              >
                <span className="text-lg">−</span>
              </CalculatorButton>
            </div>

            {/* Fourth Row: 1, 2, 3, + */}
            <div className="grid grid-cols-4 gap-3 mb-3">
              <CalculatorButton
                onClick={() => handleNumber("1")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">1</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleNumber("2")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">2</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleNumber("3")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">3</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator("add")}
                className="bg-material-orange hover:bg-material-orange-dark text-white"
              >
                <span className="text-lg">+</span>
              </CalculatorButton>
            </div>

            {/* Fifth Row: 0 (spanning 2 columns), ., = */}
            <div className="grid grid-cols-4 gap-3">
              <CalculatorButton
                onClick={() => handleNumber("0")}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 col-span-2"
              >
                <span className="text-xl">0</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={handleDecimal}
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200"
              >
                <span className="text-xl">.</span>
              </CalculatorButton>
              <CalculatorButton
                onClick={handleEquals}
                className="bg-material-blue hover:bg-material-blue-dark text-white"
              >
                <span className="text-lg">=</span>
              </CalculatorButton>
            </div>
          </div>
        </div>

        {/* Keyboard Instructions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Keyboard shortcuts supported</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
            <span className="bg-white px-2 py-1 rounded border">0-9: Numbers</span>
            <span className="bg-white px-2 py-1 rounded border">+, -, *, /: Operations</span>
            <span className="bg-white px-2 py-1 rounded border">Enter: Equals</span>
            <span className="bg-white px-2 py-1 rounded border">Escape: Clear</span>
          </div>
        </div>
      </div>
    </div>
  );
}
