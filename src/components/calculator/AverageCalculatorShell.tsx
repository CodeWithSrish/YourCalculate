"use client";

import React, { useState, useMemo } from "react";
import {
  calculateSimpleAverage,
  calculateWeightedAverage,
  formatSimpleAverageOutput,
  formatWeightedAverageOutput,
} from "@/calculators/definitions/average";
import { parseNumericInput } from "@/calculators/engine/validation";
import { CalculatorResult } from "./CalculatorResult";
import { CalculationOutput } from "@/calculators/engine/types";

type AverageMode = "simple-average" | "weighted-average";

interface SimpleValueItem {
  id: string;
  val: string;
}

interface WeightedValueItem {
  id: string;
  val: string;
  weight: string;
}

const INITIAL_SIMPLE_VALUES: SimpleValueItem[] = [
  { id: "s1", val: "10" },
  { id: "s2", val: "20" },
  { id: "s3", val: "30" },
];

const INITIAL_WEIGHTED_VALUES: WeightedValueItem[] = [
  { id: "w1", val: "80", weight: "40" },
  { id: "w2", val: "90", weight: "60" },
];

export function AverageCalculatorShell() {
  const [activeMode, setActiveMode] = useState<AverageMode>("simple-average");
  const [simpleValues, setSimpleValues] = useState<SimpleValueItem[]>(
    INITIAL_SIMPLE_VALUES
  );
  const [weightedValues, setWeightedValues] = useState<WeightedValueItem[]>(
    INITIAL_WEIGHTED_VALUES
  );

  // --- SIMPLE AVERAGE ACTIONS ---
  const handleAddSimpleValue = () => {
    if (simpleValues.length >= 50) return;
    setSimpleValues((prev) => [
      ...prev,
      {
        id: `s_${Date.now()}_${prev.length + 1}`,
        val: "",
      },
    ]);
  };

  const handleRemoveSimpleValue = (id: string) => {
    if (simpleValues.length <= 2) return;
    setSimpleValues((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSimpleValueChange = (id: string, value: string) => {
    setSimpleValues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, val: value } : item))
    );
  };

  const handleResetSimple = () => {
    setSimpleValues(INITIAL_SIMPLE_VALUES);
  };

  // --- WEIGHTED AVERAGE ACTIONS ---
  const handleAddWeightedRow = () => {
    if (weightedValues.length >= 50) return;
    setWeightedValues((prev) => [
      ...prev,
      {
        id: `w_${Date.now()}_${prev.length + 1}`,
        val: "",
        weight: "",
      },
    ]);
  };

  const handleRemoveWeightedRow = (id: string) => {
    if (weightedValues.length <= 2) return;
    setWeightedValues((prev) => prev.filter((item) => item.id !== id));
  };

  const handleWeightedRowChange = (
    id: string,
    field: "val" | "weight",
    value: string
  ) => {
    setWeightedValues((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleResetWeighted = () => {
    setWeightedValues(INITIAL_WEIGHTED_VALUES);
  };

  // --- DETERMINISTIC CALCULATION ---
  const calculationOutput: CalculationOutput = useMemo(() => {
    if (activeMode === "simple-average") {
      const parsedValues: number[] = [];
      for (let i = 0; i < simpleValues.length; i++) {
        const item = simpleValues[i];
        if (!item.val.trim()) {
          return {
            isValid: false,
            error: `Please enter a value for item #${i + 1}.`,
          };
        }
        const num = parseNumericInput(item.val);
        if (num === null) {
          return {
            isValid: false,
            error: `Value #${i + 1} ("${item.val}") is not a valid number.`,
          };
        }
        parsedValues.push(num);
      }

      const result = calculateSimpleAverage(parsedValues);
      return formatSimpleAverageOutput(result);
    } else {
      const parsedEntries: { value: number; weight: number }[] = [];
      for (let i = 0; i < weightedValues.length; i++) {
        const item = weightedValues[i];
        if (!item.val.trim()) {
          return {
            isValid: false,
            error: `Please enter a value for row #${i + 1}.`,
          };
        }
        if (!item.weight.trim()) {
          return {
            isValid: false,
            error: `Please enter a weight for row #${i + 1}.`,
          };
        }
        const valNum = parseNumericInput(item.val);
        const weightNum = parseNumericInput(item.weight);

        if (valNum === null) {
          return {
            isValid: false,
            error: `Value in row #${i + 1} ("${item.val}") is not a valid number.`,
          };
        }
        if (weightNum === null) {
          return {
            isValid: false,
            error: `Weight in row #${i + 1} ("${item.weight}") is not a valid number.`,
          };
        }
        if (weightNum < 0) {
          return {
            isValid: false,
            error: `Weight in row #${i + 1} cannot be negative.`,
          };
        }
        parsedEntries.push({ value: valNum, weight: weightNum });
      }

      const result = calculateWeightedAverage(parsedEntries);
      return formatWeightedAverageOutput(result);
    }
  }, [activeMode, simpleValues, weightedValues]);

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-[var(--border)] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveMode("simple-average")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeMode === "simple-average"
              ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-muted)]/50"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Simple Average (Arithmetic Mean)
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("weighted-average")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeMode === "weighted-average"
              ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-muted)]/50"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Weighted Average
        </button>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel Column */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          {activeMode === "simple-average" ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Values List
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Enter individual numbers to compute the total sum and arithmetic mean.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetSimple}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Dynamic Value Input Rows */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {simpleValues.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 sm:gap-3 bg-[var(--surface-muted)]/40 p-2 sm:p-2.5 rounded-xl border border-[var(--border)]/60"
                  >
                    <span className="text-xs font-bold text-[var(--text-muted)] w-14 sm:w-16 shrink-0 text-center bg-[var(--surface)] py-1.5 px-2 rounded-md border border-[var(--border)]">
                      #{index + 1}
                    </span>

                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.val}
                      onChange={(e) =>
                        handleSimpleValueChange(item.id, e.target.value)
                      }
                      placeholder={`e.g. ${index === 0 ? "10" : index === 1 ? "20" : "30"}`}
                      aria-label={`Value ${index + 1}`}
                      className="flex-1 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] outline-none transition-all"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveSimpleValue(item.id)}
                      disabled={simpleValues.length <= 2}
                      aria-label={`Remove value ${index + 1}`}
                      className="p-2 text-[var(--text-muted)] hover:text-red-500 disabled:opacity-30 disabled:hover:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                      title={
                        simpleValues.length <= 2
                          ? "Minimum 2 values required"
                          : "Delete row"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Value Action Bar */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={handleAddSimpleValue}
                  disabled={simpleValues.length >= 50}
                  className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                >
                  + Add Value
                </button>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {simpleValues.length} / 50 values
                </span>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Values & Weights
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Enter numbers alongside their corresponding weights. Percentage weights or arbitrary non-negative weights are accepted and normalized by their total.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetWeighted}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Table Column Headers */}
              <div className="grid grid-cols-12 gap-2 sm:gap-3 px-2 pb-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                <span className="col-span-1 text-center">#</span>
                <span className="col-span-6">Value / Score</span>
                <span className="col-span-4">Weight</span>
                <span className="col-span-1 text-center">Del</span>
              </div>

              {/* Dynamic Weighted Input Rows */}
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {weightedValues.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 sm:gap-3 items-center bg-[var(--surface-muted)]/40 p-2 rounded-xl border border-[var(--border)]/60"
                  >
                    <span className="col-span-1 text-xs font-bold text-[var(--text-muted)] text-center">
                      {index + 1}
                    </span>

                    <div className="col-span-6">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.val}
                        onChange={(e) =>
                          handleWeightedRowChange(
                            item.id,
                            "val",
                            e.target.value
                          )
                        }
                        placeholder={`e.g. ${index === 0 ? "80" : "90"}`}
                        aria-label={`Value for row ${index + 1}`}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] outline-none transition-all"
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.weight}
                        onChange={(e) =>
                          handleWeightedRowChange(
                            item.id,
                            "weight",
                            e.target.value
                          )
                        }
                        placeholder={`e.g. ${index === 0 ? "40" : "60"}`}
                        aria-label={`Weight for row ${index + 1}`}
                        className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] outline-none transition-all"
                      />
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveWeightedRow(item.id)}
                        disabled={weightedValues.length <= 2}
                        aria-label={`Remove row ${index + 1}`}
                        className="p-1.5 text-[var(--text-muted)] hover:text-red-500 disabled:opacity-30 disabled:hover:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                        title={
                          weightedValues.length <= 2
                            ? "Minimum 2 rows required"
                            : "Delete row"
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Weighted Row Action Bar */}
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={handleAddWeightedRow}
                  disabled={weightedValues.length >= 50}
                  className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                >
                  + Add Row
                </button>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  {weightedValues.length} / 50 rows
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results Panel Column */}
        <div className="lg:col-span-5">
          <CalculatorResult result={calculationOutput} />
        </div>
      </div>
    </div>
  );
}
