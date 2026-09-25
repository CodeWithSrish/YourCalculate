"use client";

import React, { useState, useMemo } from "react";
import {
  calculateCombinedTwo,
  calculateMultipleCombined,
  formatCombinedTwoOutput,
  formatLCMOutput,
  formatGCDOutput,
  formatMultiNumberOutput,
  lcmCalculatorDefinition,
} from "@/calculators/definitions/lcm";
import { CalculatorResult } from "./CalculatorResult";
import { CalculationOutput } from "@/calculators/engine/types";

type LCMModeId = "combined-two" | "lcm-two" | "gcd-two" | "multi-number";

interface MultiNumberItem {
  id: string;
  val: string;
}

const INITIAL_MULTI_NUMBERS: MultiNumberItem[] = [
  { id: "m1", val: "12" },
  { id: "m2", val: "18" },
  { id: "m3", val: "24" },
];

export function LCMCalculatorShell() {
  const [activeMode, setActiveMode] = useState<LCMModeId>("combined-two");

  // Two-Number Modes State
  const [num1, setNum1] = useState<string>("12");
  const [num2, setNum2] = useState<string>("18");

  // Multiple Numbers Mode State
  const [multiNumbers, setMultiNumbers] = useState<MultiNumberItem[]>(INITIAL_MULTI_NUMBERS);

  // --- ACTIONS ---
  const handleResetTwo = () => {
    setNum1("12");
    setNum2("18");
  };

  const handleResetMulti = () => {
    setMultiNumbers(INITIAL_MULTI_NUMBERS);
  };

  const handleAddMultiNumber = () => {
    if (multiNumbers.length >= 10) return;
    setMultiNumbers((prev) => [
      ...prev,
      {
        id: `m_${Date.now()}_${prev.length + 1}`,
        val: "",
      },
    ]);
  };

  const handleRemoveMultiNumber = (id: string) => {
    if (multiNumbers.length <= 2) return;
    setMultiNumbers((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMultiNumberChange = (id: string, value: string) => {
    setMultiNumbers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, val: value } : item))
    );
  };

  // --- COMPUTED RESULT ---
  const calculationResult: CalculationOutput = useMemo(() => {
    if (activeMode === "multi-number") {
      const parsedNumbers = multiNumbers.map((item) => item.val.trim());
      // Check for empty fields
      const hasEmpty = parsedNumbers.some((val) => val === "");
      if (hasEmpty) {
        return {
          isValid: false,
          error: "Please enter a value for all number fields.",
        };
      }
      const numbers = parsedNumbers.map(Number);
      const result = calculateMultipleCombined(numbers);
      return formatMultiNumberOutput(result);
    }

    // Two-Number Modes
    if (num1.trim() === "" || num2.trim() === "") {
      return {
        isValid: false,
        error: "Please enter valid integers for both Number 1 and Number 2.",
      };
    }

    const valA = Number(num1);
    const valB = Number(num2);
    const result = calculateCombinedTwo(valA, valB);

    if (activeMode === "lcm-two") {
      return formatLCMOutput(result);
    }
    if (activeMode === "gcd-two") {
      return formatGCDOutput(result);
    }
    return formatCombinedTwoOutput(result);
  }, [activeMode, num1, num2, multiNumbers]);

  const activeModeDef = useMemo(() => {
    return (
      lcmCalculatorDefinition.modes.find((m) => m.id === activeMode) ||
      lcmCalculatorDefinition.modes[0]
    );
  }, [activeMode]);

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 lg:p-9 shadow-xs">
        {/* Mode Selector Tabs */}
        <div className="border-b border-[var(--border)] pb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Calculation Mode
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {lcmCalculatorDefinition.modes.map((mode) => {
              const isActive = mode.id === activeMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id as LCMModeId)}
                  className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-xs"
                      : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {mode.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Calculation Layout */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-[15px] sm:text-base text-[var(--text-secondary)] mb-5 leading-relaxed">
                {activeModeDef.description}
              </p>

              {/* TWO-NUMBER MODES INPUTS */}
              {activeMode !== "multi-number" && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="num1-input"
                      className="block text-sm font-semibold text-[var(--text-primary)]"
                    >
                      Number 1 (a)
                    </label>
                    <input
                      id="num1-input"
                      type="number"
                      step={1}
                      value={num1}
                      onChange={(e) => setNum1(e.target.value)}
                      placeholder="e.g. 12"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm sm:text-base text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                    />
                    <p className="text-xs text-[var(--text-muted)]">First integer</p>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="num2-input"
                      className="block text-sm font-semibold text-[var(--text-primary)]"
                    >
                      Number 2 (b)
                    </label>
                    <input
                      id="num2-input"
                      type="number"
                      step={1}
                      value={num2}
                      onChange={(e) => setNum2(e.target.value)}
                      placeholder="e.g. 18"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5 text-sm sm:text-base text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                    />
                    <p className="text-xs text-[var(--text-muted)]">Second integer</p>
                  </div>
                </div>
              )}

              {/* MULTIPLE NUMBERS MODE INPUTS */}
              {activeMode === "multi-number" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                      Input Numbers ({multiNumbers.length}/10)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddMultiNumber}
                      disabled={multiNumbers.length >= 10}
                      className={`inline-flex items-center gap-1 text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-md transition-colors ${
                        multiNumbers.length >= 10
                          ? "opacity-50 cursor-not-allowed text-[var(--text-muted)]"
                          : "text-[var(--primary)] hover:bg-[var(--secondary)]"
                      }`}
                    >
                      + Add Number
                    </button>
                  </div>

                  <div className="space-y-3">
                    {multiNumbers.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <div className="flex-1 space-y-1">
                          <label
                            htmlFor={`multi-input-${item.id}`}
                            className="text-xs font-medium text-[var(--text-secondary)]"
                          >
                            Number {idx + 1}
                          </label>
                          <input
                            id={`multi-input-${item.id}`}
                            type="number"
                            step={1}
                            value={item.val}
                            onChange={(e) => handleMultiNumberChange(item.id, e.target.value)}
                            placeholder={`e.g. ${idx === 0 ? "12" : idx === 1 ? "18" : "24"}`}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] transition-colors"
                          />
                        </div>
                        {multiNumbers.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMultiNumber(item.id)}
                            aria-label={`Remove Number ${idx + 1}`}
                            className="mt-5 p-2 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-[var(--secondary)] transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Defaults Control */}
            <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <button
                type="button"
                onClick={activeMode === "multi-number" ? handleResetMulti : handleResetTwo}
                className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:underline"
              >
                Reset to Default
              </button>
            </div>
          </div>

          {/* Right Column: Live Calculation Results */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <CalculatorResult result={calculationResult} />
          </div>
        </div>
      </div>
    </div>
  );
}
