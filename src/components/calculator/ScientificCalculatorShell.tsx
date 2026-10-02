"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  evaluateExpression,
  formatResultNumber,
  AngleMode,
  DisplayNotationMode,
  HistoryItem,
  MathematicalResult,
  CalculationStep,
} from "@/calculators/definitions/scientific";
import {
  MathValue,
  formatComplexRectangular,
  formatComplexPolar,
} from "@/calculators/definitions/scientificComplex";
import {
  verifyEquationAnswer,
  VerificationResult,
} from "@/calculators/definitions/scientificVerify";
import {
  diagnoseAnswerDifference,
  DiagnosticResult,
} from "@/calculators/definitions/scientificDiagnostics";
import { FormulaWorkbenchPanel } from "./FormulaWorkbenchPanel";

export function ScientificCalculatorShell() {
  const [workspaceMode, setWorkspaceMode] = useState<"calculator" | "formula" | "verify">("calculator");
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [diagnosticUserAnswer, setDiagnosticUserAnswer] = useState<string>("");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [expression, setExpression] = useState<string>("sin(30) + √144");
  const [result, setResult] = useState<string>("25/2");
  const [error, setError] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState<boolean>(true);
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [isComplexMode, setIsComplexMode] = useState<boolean>(false);
  const [notation, setNotation] = useState<DisplayNotationMode>("NORM");
  const [fixDigits, setFixDigits] = useState<number>(2);
  const [is2nd, setIs2nd] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [ans, setAns] = useState<number>(12.5);
  const [ansCanonical, setAnsCanonical] = useState<MathValue>({ kind: "real", value: 12.5 });
  const [mathResult, setMathResult] = useState<MathematicalResult | null>(() => {
    const init = evaluateExpression("sin(30) + √144", { angleMode: "DEG" });
    return init.mathematicalResult || null;
  });
  const [activeResultTab, setActiveResultTab] = useState<"exact" | "decimal">("exact");
  const [activeDisplayForm, setActiveDisplayForm] = useState<"rect" | "polar">("rect");
  const [steps, setSteps] = useState<CalculationStep[]>(() => {
    const init = evaluateExpression("sin(30) + √144", { angleMode: "DEG" });
    return init.steps || [];
  });
  const [showStepsAccordion, setShowStepsAccordion] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "init-1",
      expression: "sin(30) + √144",
      result: "12.5",
      numericResult: 12.5,
      exactResult: "25/2",
      angleMode: "DEG",
      timestamp: Date.now(),
    },
  ]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showUnitsPicker, setShowUnitsPicker] = useState<boolean>(false);
  const [showComplexPicker, setShowComplexPicker] = useState<boolean>(false);
  const [unitCategory, setUnitCategory] = useState<"Length" | "Mass" | "Time" | "Temperature" | "Speed" | "Area" | "Volume">("Length");

  // Verification Workspace State
  const [verifyEquation, setVerifyEquation] = useState<string>("2x + 5 = 15");
  const [verifyAnswer, setVerifyAnswer] = useState<string>("x = 5");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(() => {
    return verifyEquationAnswer("2x + 5 = 15", "x = 5", { angleMode: "DEG" });
  });

  const expressionContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll expression display horizontally without scrolling the browser viewport
  useEffect(() => {
    if (expressionContainerRef.current) {
      expressionContainerRef.current.scrollLeft = expressionContainerRef.current.scrollWidth;
    }
  }, [expression]);

  // Execute calculation
  const handleCalculate = useCallback(() => {
    if (!expression.trim()) return;

    const evalResult = evaluateExpression(expression, {
      angleMode,
      isComplexMode,
      notation,
      fixDigits,
      ans,
      ansMathValue: ansCanonical,
    });
    if (evalResult.isValid && evalResult.result !== undefined) {
      const mr = evalResult.mathematicalResult || null;
      setMathResult(mr);
      setSteps(evalResult.steps || []);
      setActiveDisplayForm("rect");

      if (mr?.hasExact && mr.formattedExact) {
        setActiveResultTab("exact");
        setResult(mr.formattedExact);
      } else {
        setActiveResultTab("decimal");
        setResult(evalResult.formattedResult || String(evalResult.result));
      }

      setError(null);
      setIsCalculated(true);
      setAns(evalResult.result);
      if (evalResult.canonicalResult) {
        setAnsCanonical(evalResult.canonicalResult);
      }
      setDiagnosticResult(null);

      // Add to session history (capped at 50)
      const newItem: HistoryItem = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        expression: expression.trim(),
        result: evalResult.formattedResult || String(evalResult.result),
        numericResult: evalResult.result,
        exactResult: mr?.formattedExact,
        canonicalResult: evalResult.canonicalResult,
        isComplex: mr?.isComplex,
        angleMode,
        timestamp: Date.now(),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
    } else {
      setError(evalResult.error || "Math Error");
      setMathResult(null);
      setSteps([]);
      setIsCalculated(true);
    }
  }, [expression, angleMode, isComplexMode, notation, fixDigits, ans, ansCanonical]);

  // Cycle angle mode: DEG -> RAD -> GRAD -> DEG
  const cycleAngleMode = useCallback(() => {
    setAngleMode((prev) => {
      if (prev === "DEG") return "RAD";
      if (prev === "RAD") return "GRAD";
      return "DEG";
    });
  }, []);

  // Cycle notation mode: NORM -> SCI -> ENG -> FIX (2) -> FIX (4) -> FIX (0) -> NORM
  const cycleNotation = useCallback(() => {
    setNotation((prev) => {
      if (prev === "NORM") return "SCI";
      if (prev === "SCI") return "ENG";
      if (prev === "ENG") {
        setFixDigits(2);
        return "FIX";
      }
      if (prev === "FIX") {
        if (fixDigits === 2) {
          setFixDigits(4);
          return "FIX";
        }
        if (fixDigits === 4) {
          setFixDigits(0);
          return "FIX";
        }
        setFixDigits(2);
        return "NORM";
      }
      return "NORM";
    });
  }, [fixDigits]);

  // Insert token / character into expression
  const handleInsert = useCallback(
    (token: string, isOperator = false) => {
      setError(null);
      if (isCalculated) {
        if (isOperator) {
          // Continue from previous result
          setExpression(`Ans ${token} `);
        } else {
          // Start fresh expression
          setExpression(token);
        }
        setIsCalculated(false);
      } else {
        setExpression((prev) => prev + token);
      }

      // Auto-reset 2nd function after single secondary key press
      if (is2nd) {
        setIs2nd(false);
      }
    },
    [isCalculated, is2nd]
  );

  // Run Answer Diagnostic
  const handleRunDiagnostic = useCallback(() => {
    if (!expression || !diagnosticUserAnswer) return;
    const diag = diagnoseAnswerDifference(expression, diagnosticUserAnswer, {
      angleMode,
      notation,
      fixDigits,
      ans,
    });
    setDiagnosticResult(diag);
  }, [expression, diagnosticUserAnswer, angleMode, notation, fixDigits, ans]);

  // Clear All
  const handleAllClear = useCallback(() => {
    setExpression("");
    setResult("0");
    setError(null);
    setIsCalculated(false);
    setDiagnosticResult(null);
    setDiagnosticUserAnswer("");
  }, []);

  // Delete last character/token
  const handleDelete = useCallback(() => {
    setError(null);
    if (isCalculated) {
      setExpression("");
      setResult("0");
      setIsCalculated(false);
      return;
    }
    setExpression((prev) => {
      if (!prev) return "";
      // Smart deletion for function names
      const trailingFunctions = [
        "sin(",
        "cos(",
        "tan(",
        "asin(",
        "acos(",
        "atan(",
        "sinh(",
        "cosh(",
        "tanh(",
        "asinh(",
        "acosh(",
        "atanh(",
        "conj(",
        "arg(",
        "real(",
        "re(",
        "imag(",
        "im(",
        "log(",
        "ln(",
        "sqrt(",
        "abs(",
        "cbrt(",
        "exp(",
        "nPr(",
        "nCr(",
        "randInt(",
        "rand",
        "Ans",
      ];
      for (const fn of trailingFunctions) {
        if (prev.endsWith(fn)) {
          return prev.slice(0, -fn.length);
        }
      }
      return prev.slice(0, -1);
    });
  }, [isCalculated]);

  // Memory operations
  const handleMemoryAdd = useCallback(() => {
    const evalResult = evaluateExpression(expression, { angleMode, isComplexMode, ans, ansMathValue: ansCanonical });
    if (evalResult.isValid && evalResult.result !== undefined) {
      setMemory((prev) => prev + evalResult.result!);
    }
  }, [expression, angleMode, isComplexMode, ans, ansCanonical]);

  const handleMemorySub = useCallback(() => {
    const evalResult = evaluateExpression(expression, { angleMode, isComplexMode, ans, ansMathValue: ansCanonical });
    if (evalResult.isValid && evalResult.result !== undefined) {
      setMemory((prev) => prev - evalResult.result!);
    }
  }, [expression, angleMode, isComplexMode, ans, ansCanonical]);

  const handleMemoryRecall = useCallback(() => {
    handleInsert(String(memory));
  }, [handleInsert, memory]);

  const handleMemoryClear = useCallback(() => {
    setMemory(0);
  }, []);

  const handleVerify = useCallback(() => {
    const res = verifyEquationAnswer(verifyEquation, verifyAnswer, {
      angleMode,
      notation,
      fixDigits,
    });
    setVerificationResult(res);
  }, [verifyEquation, verifyAnswer, angleMode, notation, fixDigits]);

  const handleLoadSample = useCallback((eq: string, ansStr: string) => {
    setVerifyEquation(eq);
    setVerifyAnswer(ansStr);
    const res = verifyEquationAnswer(eq, ansStr, {
      angleMode,
      notation,
      fixDigits,
    });
    setVerificationResult(res);
  }, [angleMode, notation, fixDigits]);

  // Desktop Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle calculator shortcuts when in calculator mode
      if (workspaceMode !== "calculator") return;

      // Ignore if user is inside a form input element elsewhere on the page
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleInsert(key);
      } else if (key === "+" || key === "-" || key === "*" || key === "/" || key === "^" || key === "%") {
        e.preventDefault();
        handleInsert(` ${key} `, true);
      } else if (key === "(" || key === ")") {
        e.preventDefault();
        handleInsert(key);
      } else if (key === ".") {
        e.preventDefault();
        handleInsert(".");
      } else if (key === "!" || key === "π") {
        e.preventDefault();
        handleInsert(key);
      } else if (key === "i" || key === "I") {
        e.preventDefault();
        handleInsert("i");
      } else if (key === "Enter" || key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (key === "Escape") {
        e.preventDefault();
        if (showHistory) {
          setShowHistory(false);
        } else {
          handleAllClear();
        }
      } else if (key === "s") {
        e.preventDefault();
        handleInsert(is2nd ? "asin(" : "sin(");
      } else if (key === "c") {
        e.preventDefault();
        handleInsert(is2nd ? "acos(" : "cos(");
      } else if (key === "t") {
        e.preventDefault();
        handleInsert(is2nd ? "atan(" : "tan(");
      } else if (key === "l") {
        e.preventDefault();
        handleInsert("log(");
      } else if (key === "n") {
        e.preventDefault();
        handleInsert("ln(");
      } else if (key === "e") {
        e.preventDefault();
        handleInsert("e");
      } else if (key === "p") {
        e.preventDefault();
        handleInsert("π");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInsert, handleCalculate, handleDelete, handleAllClear, is2nd, showHistory, workspaceMode]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* =========================================================================
          WORKSPACE NAVIGATION PILL (CALCULATOR VS FORMULA WORKBENCH VS CHECK MY ANSWER)
      ========================================================================= */}
      <div className="flex items-center justify-between gap-3 p-1.5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setWorkspaceMode("calculator")}
            aria-pressed={workspaceMode === "calculator"}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] whitespace-nowrap ${
              workspaceMode === "calculator"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]"
            }`}
          >
            <span>🧮</span>
            <span>Calculator</span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode("formula")}
            aria-pressed={workspaceMode === "formula"}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] whitespace-nowrap ${
              workspaceMode === "formula"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]"
            }`}
          >
            <span>📐</span>
            <span>Formula Workbench</span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceMode("verify")}
            aria-pressed={workspaceMode === "verify"}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] whitespace-nowrap ${
              workspaceMode === "verify"
                ? "bg-[var(--primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]"
            }`}
          >
            <span>✓</span>
            <span>Check My Answer</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] pr-2">
          <span>
            {workspaceMode === "calculator"
              ? "Exact + Decimal + Complex Engine"
              : workspaceMode === "formula"
              ? "Unit-Aware Formula Workbench"
              : "Mathematical Verification"}
          </span>
        </div>
      </div>

      {/* =========================================================================
          WORKSPACE 1: DIGITAL SCIENTIFIC CALCULATOR
      ========================================================================= */}
      {workspaceMode === "calculator" && (
        <>
          <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden transition-all">
        {/* =========================================================================
            DISPLAY AREA
        ========================================================================= */}
        <div className="bg-slate-900 text-slate-100 p-4 sm:p-6 border-b border-slate-800">
          {/* Status Header Bar */}
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Angle Mode Toggle (DEG / RAD / GRAD) */}
              <button
                type="button"
                onClick={cycleAngleMode}
                aria-label={`Switch angle mode. Currently ${angleMode}`}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                {angleMode}
              </button>

              {/* Domain Mode Toggle (REAL / CPLX) */}
              <button
                type="button"
                id="toggle-domain-mode-btn"
                onClick={() => setIsComplexMode((prev) => !prev)}
                aria-label={`Switch domain mode. Currently ${isComplexMode ? "CPLX" : "REAL"}`}
                className={`px-2 py-0.5 rounded font-semibold transition-colors focus:outline-none focus:ring-1 ${
                  isComplexMode
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-300"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 focus:ring-slate-400"
                }`}
              >
                {isComplexMode ? "CPLX" : "REAL"}
              </button>

              {/* Display Notation Toggle (NORM / SCI / ENG / FIX) */}
              <button
                type="button"
                onClick={cycleNotation}
                aria-label={`Switch display notation. Currently ${notation}${notation === "FIX" ? ` ${fixDigits}` : ""}`}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400"
              >
                {notation === "FIX" ? `FIX ${fixDigits}` : notation}
              </button>

              {is2nd && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                  2nd
                </span>
              )}
              {memory !== 0 && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  M ({formatResultNumber(memory, notation, fixDigits)})
                </span>
              )}
              {ans !== 0 && (
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  Ans: {ansCanonical.kind === "complex"
                    ? formatComplexRectangular(ansCanonical.value, (n) => formatResultNumber(n, notation, fixDigits))
                    : formatResultNumber(ans, notation, fixDigits)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Complex Quick Palette Toggle */}
              <button
                type="button"
                id="toggle-complex-btn"
                onClick={() => setShowComplexPicker((c) => !c)}
                aria-label="Toggle complex functions palette"
                aria-expanded={showComplexPicker}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  showComplexPicker
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                    : "text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800"
                }`}
              >
                <span>💫 Complex</span>
              </button>

              {/* Physical Units Palette Toggle */}
              <button
                type="button"
                id="toggle-units-btn"
                onClick={() => setShowUnitsPicker((u) => !u)}
                aria-label="Toggle physical units palette"
                aria-expanded={showUnitsPicker}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  showUnitsPicker
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800"
                }`}
              >
                <span>📏 Units</span>
              </button>

              {/* History Toggle */}
              <button
                type="button"
                onClick={() => setShowHistory((h) => !h)}
                aria-label="Toggle calculation history"
                aria-expanded={showHistory}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  showHistory
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800"
                }`}
              >
                <span>📜 History</span>
                <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded-full font-bold">
                  {history.length}
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Complex Quick Palette */}
          {showComplexPicker && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300">Complex Functions & Operations</span>
                <button
                  type="button"
                  onClick={() => setShowComplexPicker(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 font-mono pl-2"
                >
                  ✕
                </button>
              </div>

              {/* Complex Buttons */}
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleInsert("i")}
                  aria-label="Imaginary unit i"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 font-bold transition-colors"
                >
                  i
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert("conj(")}
                  aria-label="Complex conjugate"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  conj(z)
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert("arg(")}
                  aria-label="Complex argument"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  arg(z)
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert("abs(")}
                  aria-label="Complex magnitude"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  |z| (abs)
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert("real(")}
                  aria-label="Real component"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  real(z)
                </button>
                <button
                  type="button"
                  onClick={() => handleInsert("imag(")}
                  aria-label="Imaginary component"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  imag(z)
                </button>
              </div>

              {/* Complex Examples */}
              <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 flex-wrap text-[11px] font-sans text-slate-400">
                <span className="text-slate-500">Examples:</span>
                {[
                  "(2 + 3i) * (4 - i)",
                  "sqrt(-4)",
                  "exp(i * π)",
                  "abs(3 + 4i)",
                  "conj(1 + 2i)",
                  "arg(1 + i)",
                ].map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setExpression(ex);
                      setIsCalculated(false);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-indigo-200 border border-slate-800 font-mono transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Unit Quick Palette */}
          {showUnitsPicker && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 text-xs font-sans">
                  {(["Length", "Mass", "Time", "Temperature", "Speed", "Area", "Volume"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setUnitCategory(cat)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        unitCategory === cat
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowUnitsPicker(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 font-mono pl-2"
                >
                  ✕
                </button>
              </div>

              {/* Unit Buttons */}
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {unitCategory === "Length" &&
                  ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleInsert(` ${u} `)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {u}
                    </button>
                  ))}
                {unitCategory === "Mass" &&
                  ["mg", "g", "kg", "oz", "lb"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleInsert(` ${u} `)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {u}
                    </button>
                  ))}
                {unitCategory === "Time" &&
                  ["ms", "s", "min", "h", "day"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleInsert(` ${u} `)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {u}
                    </button>
                  ))}
                {unitCategory === "Temperature" &&
                  ["°C", "°F", "K", "to °F", "to °C", "to K"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleInsert(` ${u} `)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {u}
                    </button>
                  ))}
                {unitCategory === "Speed" &&
                  ["m/s", "km/h", "mph"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleInsert(` ${u} `)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {u}
                    </button>
                  ))}
                {unitCategory === "Area" &&
                  ["mm²", "cm²", "m²", "km²", "ft²"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleInsert(` ${u} `)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {u}
                    </button>
                  ))}
                {unitCategory === "Volume" &&
                  ["mL", "L", "cm³", "m³", "gal"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => handleInsert(` ${u} `)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 hover:border-amber-500/40 transition-colors"
                    >
                      {u}
                    </button>
                  ))}

                {/* Quick conversion operator */}
                <button
                  type="button"
                  onClick={() => handleInsert(" to ")}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/50 font-sans text-xs font-semibold"
                >
                  to →
                </button>
              </div>

              {/* Quick Preset Unit Examples */}
              <div className="pt-2 border-t border-slate-900 flex items-center gap-1.5 flex-wrap text-[11px] font-sans text-slate-400">
                <span className="text-slate-500">Examples:</span>
                {[
                  "5 km + 300 m",
                  "60 km / 2 h",
                  "5 kg + 500 g",
                  "100 cm * 2",
                  "0 °C to °F",
                ].map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setExpression(ex);
                      setIsCalculated(false);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-200 border border-slate-800 font-mono transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expression Input Line (Horizontal Scroll Only) */}
          <div
            ref={expressionContainerRef}
            className="mt-3 overflow-x-auto whitespace-nowrap scrollbar-thin py-1 min-h-[32px] text-right font-mono text-base sm:text-xl text-slate-300 select-all"
          >
            {expression || <span className="text-slate-600">0</span>}
          </div>

          {/* Result / Error Line & Exact/Decimal/Polar Switcher */}
          <div className="mt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 font-mono">
            {/* Toggles Container (Exact/Decimal and Rect/Polar) */}
            <div className="min-h-[28px] flex items-center gap-2 flex-wrap">
              {/* Exact / Decimal Pill Toggle (only when exact form exists) */}
              {!error && mathResult?.hasExact && (
                <div className="inline-flex rounded-lg bg-slate-800 p-0.5 text-xs font-sans border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveResultTab("exact");
                      setActiveDisplayForm("rect");
                      if (mathResult.formattedExact) {
                        setResult(mathResult.formattedExact);
                      }
                    }}
                    aria-pressed={activeResultTab === "exact"}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-all ${
                      activeResultTab === "exact"
                        ? "bg-cyan-500 text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Exact
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveResultTab("decimal");
                      if (activeDisplayForm === "polar" && mathResult.canonical.kind === "complex") {
                        setResult(
                          formatComplexPolar(mathResult.canonical.value, angleMode, (n) =>
                            formatResultNumber(n, notation, fixDigits)
                          )
                        );
                      } else {
                        setResult(mathResult.formattedDecimal);
                      }
                    }}
                    aria-pressed={activeResultTab === "decimal"}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-all ${
                      activeResultTab === "decimal"
                        ? "bg-cyan-500 text-slate-950 shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Decimal
                  </button>
                </div>
              )}

              {/* Rect / Polar Pill Toggle (when result is complex) */}
              {!error && mathResult?.isComplex && (
                <div className="inline-flex rounded-lg bg-slate-800 p-0.5 text-xs font-sans border border-slate-700/80">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDisplayForm("rect");
                      if (activeResultTab === "exact" && mathResult.hasExact && mathResult.formattedExact) {
                        setResult(mathResult.formattedExact);
                      } else {
                        setResult(mathResult.formattedDecimal);
                      }
                    }}
                    aria-pressed={activeDisplayForm === "rect"}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-all ${
                      activeDisplayForm === "rect"
                        ? "bg-indigo-500 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Rect
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDisplayForm("polar");
                      if (mathResult.canonical.kind === "complex") {
                        setResult(
                          formatComplexPolar(mathResult.canonical.value, angleMode, (n) =>
                            formatResultNumber(n, notation, fixDigits)
                          )
                        );
                      }
                    }}
                    aria-pressed={activeDisplayForm === "polar"}
                    className={`px-2.5 py-0.5 rounded-md font-semibold transition-all ${
                      activeDisplayForm === "polar"
                        ? "bg-indigo-500 text-white shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Polar
                  </button>
                </div>
              )}

              {!error && isCalculated && (
                <button
                  type="button"
                  id="toggle-diagnostics-btn"
                  onClick={() => {
                    setShowDiagnostics((d) => !d);
                    setDiagnosticResult(null);
                  }}
                  aria-expanded={showDiagnostics}
                  className={`text-xs font-sans font-medium px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    showDiagnostics
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                  }`}
                >
                  <span>💡</span>
                  <span>Why is my answer different?</span>
                </button>
              )}
            </div>

            {/* Main Result Display */}
            <div className="text-right flex-1 truncate">
              {error ? (
                <span className="text-base sm:text-xl font-semibold text-rose-400">
                  {error}
                </span>
              ) : (
                <span className="text-2xl sm:text-4xl font-bold tracking-tight text-white select-all">
                  {result}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            ANSWER DIAGNOSTICS PANEL (WHY IS MY ANSWER DIFFERENT?)
        ========================================================================= */}
        {showDiagnostics && !error && (
          <div className="bg-slate-950 border-b border-slate-800 p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-slate-950 font-bold text-xs">
                  💡
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Why is my answer different?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDiagnostics(false)}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
                aria-label="Close diagnostic panel"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-400">
              Enter the answer you calculated or expected for <span className="font-mono text-slate-200 font-semibold">{expression}</span>. We will determine the exact mathematical reason for the divergence.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                id="diagnostic-answer-input"
                value={diagnosticUserAnswer}
                onChange={(e) => setDiagnosticUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRunDiagnostic();
                }}
                placeholder="e.g. 20, 24, 0.5, 3.14, 1/2"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                aria-label="Your expected or calculated answer"
              />
              <button
                type="button"
                id="diagnostic-analyze-btn"
                onClick={handleRunDiagnostic}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs shrink-0 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                Analyze Difference
              </button>
            </div>

            {diagnosticResult && (
              <div className="mt-3 p-4 rounded-xl border border-slate-800 bg-slate-900/90 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-sm sm:text-base text-cyan-300 flex items-center gap-1.5">
                    <span>{diagnosticResult.primaryHypothesis.cause === "same_answer" ? "✓" : "🔍"}</span>
                    <span>{diagnosticResult.primaryHypothesis.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                    {diagnosticResult.primaryHypothesis.confidence === "exact_match"
                      ? "Verified Math Proof"
                      : diagnosticResult.primaryHypothesis.confidence === "approximate_match"
                      ? "Approximate Match"
                      : "Analysis"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {diagnosticResult.primaryHypothesis.explanation}
                </p>

                {diagnosticResult.primaryHypothesis.userInterpretationExpression && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="p-3 rounded-lg bg-slate-950 border border-amber-500/20 space-y-1">
                      <span className="text-amber-400/80 block text-[10px] font-sans font-semibold uppercase tracking-wide">
                        Your Interpretation
                      </span>
                      <span className="text-amber-200 font-bold block text-sm">
                        {diagnosticResult.primaryHypothesis.userInterpretationExpression}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/20 space-y-1">
                      <span className="text-emerald-400/80 block text-[10px] font-sans font-semibold uppercase tracking-wide">
                        Calculator Evaluation (PEMDAS)
                      </span>
                      <span className="text-emerald-200 font-bold block text-sm">
                        {diagnosticResult.primaryHypothesis.calculatorExpression}
                      </span>
                    </div>
                  </div>
                )}

                {diagnosticResult.primaryHypothesis.recommendation && (
                  <div className="text-xs text-cyan-200 bg-cyan-950/40 p-3 rounded-lg border border-cyan-800/40 flex items-start gap-2">
                    <span className="text-base leading-none">💡</span>
                    <div>
                      <span className="font-bold text-cyan-300">Recommendation: </span>
                      <span>{diagnosticResult.primaryHypothesis.recommendation}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            KEYPAD & HISTORY OVERLAY CONTAINER
        ========================================================================= */}
        <div className="relative">
          {/* Keypad Area */}
          <div className="p-4 sm:p-6 bg-[var(--surface)] grid grid-cols-6 gap-2 sm:gap-3 select-none">
            {/* ROW 1: Mode & Memory Row */}
            <button
              type="button"
              onClick={() => setIs2nd((v) => !v)}
              aria-pressed={is2nd}
              className={`col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                is2nd
                  ? "bg-amber-500 text-slate-950 shadow-md scale-95"
                  : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              2nd
            </button>
            <button
              type="button"
              onClick={cycleAngleMode}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-all"
            >
              {angleMode}
            </button>
            <button
              type="button"
              onClick={handleMemoryClear}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-all"
            >
              MC
            </button>
            <button
              type="button"
              onClick={handleMemoryRecall}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-all"
            >
              MR
            </button>
            <button
              type="button"
              onClick={handleMemoryAdd}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-all"
            >
              M+
            </button>
            <button
              type="button"
              onClick={handleMemorySub}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)] transition-all"
            >
              M−
            </button>

            {/* ROW 2: Trigonometric & Primary Controls */}
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "asin(" : "sin(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "sin⁻¹" : "sin"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "acos(" : "cos(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "cos⁻¹" : "cos"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "atan(" : "tan(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "tan⁻¹" : "tan"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "i" : "π")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
              aria-label={is2nd ? "Imaginary unit i" : "Pi constant"}
            >
              {is2nd ? "i" : "π"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert("e")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              e
            </button>
            <button
              type="button"
              onClick={handleAllClear}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-all"
            >
              AC
            </button>

            {/* ROW 3: Powers, Logarithms, Parentheses */}
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "10^(" : "log(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "10ˣ" : "log"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "exp(" : "ln(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "eˣ" : "ln"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "²" : "√(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "x²" : "√"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(" ^ ")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              xʸ
            </button>
            <button
              type="button"
              onClick={() => handleInsert("(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              (
            </button>
            <button
              type="button"
              onClick={() => handleInsert(")")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              )
            </button>

            {/* ROW 4: Numeric 7 8 9 & Division / Permutations */}
            <button
              type="button"
              onClick={() => handleInsert("7")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              7
            </button>
            <button
              type="button"
              onClick={() => handleInsert("8")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              8
            </button>
            <button
              type="button"
              onClick={() => handleInsert("9")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              9
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "P" : " ÷ ", true)}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all"
            >
              {is2nd ? "nPr" : "÷"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(" % ", true)}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              %
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-all"
            >
              DEL
            </button>

            {/* ROW 5: Numeric 4 5 6 & Multiplication / Combinations */}
            <button
              type="button"
              onClick={() => handleInsert("4")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleInsert("5")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              5
            </button>
            <button
              type="button"
              onClick={() => handleInsert("6")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              6
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "C" : " × ", true)}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all"
            >
              {is2nd ? "nCr" : "×"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "cosh(" : "1 / (")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "cosh" : "1/x"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "tanh(" : "!")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "tanh" : "n!"}
            </button>

            {/* ROW 6: Numeric 1 2 3 & Subtraction */}
            <button
              type="button"
              onClick={() => handleInsert("1")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleInsert("2")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleInsert("3")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleInsert(" - ", true)}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "sinh(" : "abs(")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "sinh" : "|x|"}
            </button>
            <button
              type="button"
              onClick={() => handleInsert(is2nd ? "rand" : "Ans")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              {is2nd ? "Rand" : "Ans"}
            </button>

            {/* ROW 7: Numeric 0, Decimal, Sign, Addition, Equals */}
            <button
              type="button"
              onClick={() => handleInsert("0")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleInsert(".")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--secondary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all"
            >
              .
            </button>
            <button
              type="button"
              onClick={() => handleInsert("-")}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-xs sm:text-sm font-semibold bg-[var(--surface-muted)] text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-all"
            >
              ±
            </button>
            <button
              type="button"
              onClick={() => handleInsert(" + ", true)}
              className="col-span-1 rounded-xl py-3 sm:py-3.5 text-sm sm:text-base font-bold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-all"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleCalculate}
              className="col-span-2 rounded-xl py-3 sm:py-3.5 text-base sm:text-lg font-bold bg-[var(--primary)] text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            >
              =
            </button>
          </div>

          {/* =========================================================================
              CALCULATION HISTORY OVERLAY (INSTANTLY VISIBLE OVER KEYPAD)
          ========================================================================= */}
          {showHistory && (
            <div
              className="absolute inset-0 z-20 bg-[var(--surface)] flex flex-col p-4 sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-label="Calculation History"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    Calculation History
                  </span>
                  <span className="text-xs bg-[var(--secondary)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full font-mono">
                    {history.length}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setHistory([])}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--secondary)] hover:bg-[var(--border)] text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    aria-label="Close calculation history"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {history.length === 0 ? (
                  <div className="py-16 text-center text-xs sm:text-sm text-[var(--text-muted)]">
                    No calculations performed yet.
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between gap-3 text-sm hover:border-[var(--primary)] transition-colors"
                    >
                      <div
                        className="truncate flex-1 cursor-pointer"
                        onClick={() => {
                          setExpression(item.expression);
                          setResult(item.result);
                          setIsCalculated(true);
                          setShowHistory(false);
                        }}
                        title="Click to load into calculator"
                      >
                        <div className="text-xs text-[var(--text-secondary)] truncate font-mono">
                          {item.expression}
                        </div>
                        <div className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-mono">
                          = {item.result}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setExpression(item.expression);
                            setResult(item.result);
                            setIsCalculated(true);
                            setShowHistory(false);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-[var(--secondary)] hover:bg-[var(--border)] rounded-md text-[var(--text-primary)] transition-colors"
                          title="Load expression"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleInsert(item.isComplex ? `(${item.result})` : String(item.numericResult ?? item.result));
                            setShowHistory(false);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 rounded-md transition-colors"
                          title="Insert result"
                        >
                          Ans
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          HOW IT WAS CALCULATED (SHOW STEPS ACCORDION)
      ========================================================================= */}
      {steps.length > 0 && !error && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowStepsAccordion((s) => !s)}
            aria-expanded={showStepsAccordion}
            className="w-full flex items-center justify-between p-4 sm:p-5 bg-[var(--surface-muted)] hover:bg-[var(--surface-hover)] transition-colors text-left font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📐</span>
              <span className="text-base sm:text-lg font-bold">How it was calculated</span>
              <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] font-bold px-2 py-0.5 rounded-full border border-[var(--primary)]/20">
                {steps.length} {steps.length === 1 ? "step" : "steps"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <span>{showStepsAccordion ? "Hide steps" : "Show steps"}</span>
              <span className={`transform transition-transform duration-200 ${showStepsAccordion ? "rotate-180" : ""}`}>
                ▼
              </span>
            </div>
          </button>

          {showStepsAccordion && (
            <div className="p-4 sm:p-6 divide-y divide-[var(--border)] bg-[var(--surface)] space-y-4">
              <div className="space-y-3">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)] text-white text-xs font-bold">
                        {step.stepNumber}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-sm sm:text-base font-bold text-[var(--text-primary)]">
                          {step.expression} = {step.exactSubResult || step.formattedSubResult}
                        </div>
                        <div className="text-xs sm:text-sm text-[var(--text-secondary)]">
                          {step.explanation}
                        </div>
                        {step.rule && (
                          <div className="text-[11px] font-medium text-[var(--primary)]">
                            Rule: {step.rule}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 font-mono text-xs text-[var(--text-muted)] bg-[var(--surface)] px-2.5 py-1.5 rounded-lg border border-[var(--border)] self-end sm:self-center">
                      {step.exactSubResult && step.exactSubResult !== step.formattedSubResult && (
                        <div>
                          Exact: <span className="font-semibold text-[var(--text-primary)]">{step.exactSubResult}</span>
                        </div>
                      )}
                      <div>
                        Decimal: <span className="font-semibold text-[var(--text-primary)]">{step.formattedSubResult}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Deterministic AST evaluation trace (PEMDAS order)</span>
                <span>Mode: {angleMode}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )}

      {/* =========================================================================
          WORKSPACE 2: CHECK MY ANSWER (MATHEMATICAL VERIFICATION)
      ========================================================================= */}
      {workspaceMode === "verify" && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden transition-all space-y-0">
          {/* Header Bar */}
          <div className="bg-slate-900 text-slate-100 p-4 sm:p-6 border-b border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-slate-950 font-bold text-xs">
                    ✓
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Check My Answer
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Verify whether your proposed answer satisfies a single-variable equation.
                </p>
              </div>

              {/* Mode indicator */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cycleAngleMode}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-semibold transition-colors"
                >
                  {angleMode}
                </button>
                <button
                  type="button"
                  onClick={cycleNotation}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-xs font-semibold transition-colors"
                >
                  {notation === "FIX" ? `FIX ${fixDigits}` : notation}
                </button>
              </div>
            </div>
          </div>

          {/* Verification Form Area */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* Quick Sample Equation Pills */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Try standard examples:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { eq: "2x + 5 = 15", ans: "x = 5" },
                  { eq: "3x = 12", ans: "x = 4" },
                  { eq: "2(x + 3) = 14", ans: "x = 4" },
                  { eq: "x/2 = 5", ans: "x = 10" },
                  { eq: "2x = 1", ans: "x = 1/2" },
                  { eq: "4y - 2 = 10", ans: "y = 3" },
                ].map((sample) => (
                  <button
                    key={sample.eq}
                    type="button"
                    onClick={() => handleLoadSample(sample.eq, sample.ans)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[var(--surface-muted)] hover:bg-[var(--secondary)] text-[var(--text-primary)] border border-[var(--border)] transition-colors cursor-pointer"
                  >
                    {sample.eq} ({sample.ans})
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="verify-eq-input"
                  className="block text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
                >
                  Equation <span className="text-[var(--text-muted)] font-normal">(e.g. 2x + 5 = 15)</span>
                </label>
                <input
                  id="verify-eq-input"
                  type="text"
                  value={verifyEquation}
                  onChange={(e) => setVerifyEquation(e.target.value)}
                  placeholder="2x + 5 = 15"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] font-mono text-sm sm:text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="verify-ans-input"
                  className="block text-xs sm:text-sm font-semibold text-[var(--text-primary)]"
                >
                  Your Answer <span className="text-[var(--text-muted)] font-normal">(e.g. x = 5 or 5)</span>
                </label>
                <input
                  id="verify-ans-input"
                  type="text"
                  value={verifyAnswer}
                  onChange={(e) => setVerifyAnswer(e.target.value)}
                  placeholder="x = 5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] font-mono text-sm sm:text-base text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleVerify}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-bold text-sm shadow-md shadow-[var(--primary)]/20 hover:opacity-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer"
              >
                <span>✓</span>
                <span>Check Answer</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVerifyEquation("");
                  setVerifyAnswer("");
                  setVerificationResult(null);
                }}
                className="px-4 py-3 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold text-sm border border-[var(--border)] transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>

            {/* Verification Result Output */}
            {verificationResult && (
              <div className="pt-2 space-y-4">
                {/* Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                    verificationResult.status === "valid"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                      : verificationResult.status === "invalid"
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${
                      verificationResult.status === "valid"
                        ? "bg-emerald-600"
                        : verificationResult.status === "invalid"
                        ? "bg-rose-600"
                        : "bg-amber-600"
                    }`}
                  >
                    {verificationResult.status === "valid" ? "✓" : verificationResult.status === "invalid" ? "✕" : "!"}
                  </div>
                  <div className="space-y-1">
                    <div className="font-bold text-sm sm:text-base">
                      {verificationResult.status === "valid"
                        ? "Correct — Satisfies Equation"
                        : verificationResult.status === "invalid"
                        ? "Does Not Satisfy Equation"
                        : "Verification Notice"}
                    </div>
                    <div className="text-xs sm:text-sm font-medium opacity-90">
                      {verificationResult.message}
                    </div>
                  </div>
                </div>

                {/* Substituted Side-by-Side Comparison */}
                {verificationResult.lhs && verificationResult.rhs && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-sm">
                    {/* LHS Card */}
                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 space-y-1.5">
                      <div className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] font-sans">
                        Left-Hand Side (LHS)
                      </div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {verificationResult.lhs.substitutedExpression}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Evaluates to:{" "}
                        <span className="font-bold text-[var(--text-primary)]">
                          {verificationResult.lhs.formattedExact || verificationResult.lhs.formattedResult}
                        </span>
                        {verificationResult.lhs.formattedExact && (
                          <span className="text-[var(--text-muted)] ml-1">
                            ({verificationResult.lhs.formattedResult})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RHS Card */}
                    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/60 space-y-1.5">
                      <div className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)] font-sans">
                        Right-Hand Side (RHS)
                      </div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        {verificationResult.rhs.substitutedExpression}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Evaluates to:{" "}
                        <span className="font-bold text-[var(--text-primary)]">
                          {verificationResult.rhs.formattedExact || verificationResult.rhs.formattedResult}
                        </span>
                        {verificationResult.rhs.formattedExact && (
                          <span className="text-[var(--text-muted)] ml-1">
                            ({verificationResult.rhs.formattedResult})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Breakdown Card */}
                {verificationResult.detailedSteps.length > 0 && (
                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Verification Breakdown
                    </div>
                    <div className="space-y-1.5 text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
                      {verificationResult.detailedSteps.map((stepStr, idx) => (
                        <div key={idx} className="leading-relaxed">
                          {stepStr}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          WORKSPACE 3: FORMULA WORKBENCH
      ========================================================================= */}
      {workspaceMode === "formula" && (
        <FormulaWorkbenchPanel angleMode={angleMode} />
      )}
    </div>
  );
}
