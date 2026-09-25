"use client";

import React, { useState, useMemo } from "react";
import {
  calculateSimplifiedRatio,
  solveProportion,
  splitAmountByRatio,
  formatSimplifyOutput,
  formatProportionOutput,
  formatSplitOutput,
  ProportionPosition,
} from "@/calculators/definitions/ratio";
import { parseNumericInput } from "@/calculators/engine/validation";
import { CalculatorResult } from "./CalculatorResult";
import { CalculationOutput } from "@/calculators/engine/types";

type RatioMode = "simplify-ratio" | "solve-proportion" | "split-amount";

interface RatioPartItem {
  id: string;
  val: string;
}

const INITIAL_RATIO_PARTS: RatioPartItem[] = [
  { id: "p1", val: "2" },
  { id: "p2", val: "3" },
];

export function RatioCalculatorShell() {
  const [activeMode, setActiveMode] = useState<RatioMode>("simplify-ratio");

  // Mode 1: Simplify Ratio State
  const [termA, setTermA] = useState<string>("12");
  const [termB, setTermB] = useState<string>("18");

  // Mode 2: Solve Proportion State
  const [unknownPos, setUnknownPos] = useState<ProportionPosition>("D");
  const [propA, setPropA] = useState<string>("2");
  const [propB, setPropB] = useState<string>("3");
  const [propC, setPropC] = useState<string>("4");
  const [propD, setPropD] = useState<string>("");

  // Mode 3: Split Amount State
  const [splitTotal, setSplitTotal] = useState<string>("1000");
  const [ratioParts, setRatioParts] = useState<RatioPartItem[]>(INITIAL_RATIO_PARTS);

  // --- ACTIONS ---
  const handleResetSimplify = () => {
    setTermA("12");
    setTermB("18");
  };

  const handleResetProportion = () => {
    setUnknownPos("D");
    setPropA("2");
    setPropB("3");
    setPropC("4");
    setPropD("");
  };

  const handleResetSplit = () => {
    setSplitTotal("1000");
    setRatioParts(INITIAL_RATIO_PARTS);
  };

  const handleAddRatioPart = () => {
    if (ratioParts.length >= 10) return;
    setRatioParts((prev) => [
      ...prev,
      {
        id: `p_${Date.now()}_${prev.length + 1}`,
        val: "",
      },
    ]);
  };

  const handleRemoveRatioPart = (id: string) => {
    if (ratioParts.length <= 2) return;
    setRatioParts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRatioPartChange = (id: string, value: string) => {
    setRatioParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, val: value } : p))
    );
  };

  // --- CALCULATION RESULT COMPUTATION ---
  const calculationOutput: CalculationOutput = useMemo(() => {
    if (activeMode === "simplify-ratio") {
      if (!termA.trim()) {
        return { isValid: false, error: "Please enter a value for Term A." };
      }
      if (!termB.trim()) {
        return { isValid: false, error: "Please enter a value for Term B." };
      }

      const numA = parseNumericInput(termA);
      const numB = parseNumericInput(termB);

      if (numA === null) {
        return { isValid: false, error: `Term A ("${termA}") is not a valid number.` };
      }
      if (numB === null) {
        return { isValid: false, error: `Term B ("${termB}") is not a valid number.` };
      }

      const result = calculateSimplifiedRatio(numA, numB);
      return formatSimplifyOutput(result);
    } else if (activeMode === "solve-proportion") {
      const getVal = (pos: ProportionPosition, raw: string): number | null => {
        if (unknownPos === pos) return null;
        if (!raw.trim()) return NaN;
        return parseNumericInput(raw);
      };

      const valA = getVal("A", propA);
      const valB = getVal("B", propB);
      const valC = getVal("C", propC);
      const valD = getVal("D", propD);

      if (valA !== null && (Number.isNaN(valA) || valA === null)) {
        return { isValid: false, error: "Please enter a valid numeric value for A." };
      }
      if (valB !== null && (Number.isNaN(valB) || valB === null)) {
        return { isValid: false, error: "Please enter a valid numeric value for B." };
      }
      if (valC !== null && (Number.isNaN(valC) || valC === null)) {
        return { isValid: false, error: "Please enter a valid numeric value for C." };
      }
      if (valD !== null && (Number.isNaN(valD) || valD === null)) {
        return { isValid: false, error: "Please enter a valid numeric value for D." };
      }

      const result = solveProportion({
        a: valA,
        b: valB,
        c: valC,
        d: valD,
      });
      return formatProportionOutput(result);
    } else {
      if (!splitTotal.trim()) {
        return { isValid: false, error: "Please enter a total amount to split." };
      }
      const totalNum = parseNumericInput(splitTotal);
      if (totalNum === null) {
        return { isValid: false, error: `Total amount ("${splitTotal}") is not a valid number.` };
      }

      const parsedRatios: number[] = [];
      for (let i = 0; i < ratioParts.length; i++) {
        const p = ratioParts[i];
        if (!p.val.trim()) {
          return { isValid: false, error: `Please enter a value for Ratio Part #${i + 1}.` };
        }
        const num = parseNumericInput(p.val);
        if (num === null) {
          return { isValid: false, error: `Ratio Part #${i + 1} ("${p.val}") is not a valid number.` };
        }
        parsedRatios.push(num);
      }

      const result = splitAmountByRatio(totalNum, parsedRatios);
      return formatSplitOutput(result);
    }
  }, [activeMode, termA, termB, unknownPos, propA, propB, propC, propD, splitTotal, ratioParts]);

  return (
    <div className="space-y-6">
      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-[var(--border)] overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveMode("simplify-ratio")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeMode === "simplify-ratio"
              ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-muted)]/50"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Simplify Ratio
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("solve-proportion")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeMode === "solve-proportion"
              ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-muted)]/50"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Solve Proportion (A : B = C : D)
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("split-amount")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeMode === "split-amount"
              ? "border-[var(--primary)] text-[var(--primary)] bg-[var(--surface-muted)]/50"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Split Amount by Ratio
        </button>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel Column */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* MODE 1: SIMPLIFY RATIO */}
          {activeMode === "simplify-ratio" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Ratio Terms (A : B)
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Enter positive integer or decimal terms to reduce the ratio to simplest integer form.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetSimplify}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl bg-[var(--surface-muted)]/40 border border-[var(--border)]/60">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Term A (Antecedent)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={termA}
                    onChange={(e) => setTermA(e.target.value)}
                    placeholder="e.g. 12"
                    aria-label="Term A"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-lg px-3.5 py-2 text-base font-semibold text-[var(--text-primary)] outline-none transition-all"
                  />
                </div>

                <div className="text-2xl font-bold text-[var(--text-muted)] self-end pb-2">
                  :
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                    Term B (Consequent)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={termB}
                    onChange={(e) => setTermB(e.target.value)}
                    placeholder="e.g. 18"
                    aria-label="Term B"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-lg px-3.5 py-2 text-base font-semibold text-[var(--text-primary)] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--text-muted)] font-medium mr-1">
                  Try examples:
                </span>
                {[
                  { label: "12 : 18", a: "12", b: "18" },
                  { label: "1.5 : 2.5", a: "1.5", b: "2.5" },
                  { label: "24 : 36", a: "24", b: "36" },
                  { label: "100 : 250", a: "100", b: "250" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTermA(preset.a);
                      setTermB(preset.b);
                    }}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MODE 2: SOLVE PROPORTION */}
          {activeMode === "solve-proportion" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Proportion Equality (A : B = C : D)
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Select which variable to solve for, then enter the 3 known values.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetProportion}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Unknown Variable Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Select Variable to Solve For (?):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["A", "B", "C", "D"] as ProportionPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setUnknownPos(pos)}
                      className={`py-2 px-3 text-xs sm:text-sm font-bold rounded-lg border transition-all cursor-pointer ${
                        unknownPos === pos
                          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
                          : "bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-muted)]"
                      }`}
                    >
                      Find {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Proportion Inputs Grid */}
              <div className="p-4 rounded-xl bg-[var(--surface-muted)]/40 border border-[var(--border)]/60 space-y-3">
                <div className="grid grid-cols-11 gap-2 items-center">
                  {/* Left Ratio: A : B */}
                  <div className="col-span-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      A {unknownPos === "A" && <span className="text-[var(--primary)]">(Unknown)</span>}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={unknownPos === "A"}
                      value={unknownPos === "A" ? "?" : propA}
                      onChange={(e) => setPropA(e.target.value)}
                      placeholder="e.g. 2"
                      aria-label="Value A"
                      className={`w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all ${
                        unknownPos === "A"
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-2 border-[var(--primary)] text-center cursor-not-allowed"
                          : "bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--text-primary)]"
                      }`}
                    />
                  </div>

                  <div className="col-span-1 text-center font-bold text-lg text-[var(--text-muted)]">
                    :
                  </div>

                  <div className="col-span-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      B {unknownPos === "B" && <span className="text-[var(--primary)]">(Unknown)</span>}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={unknownPos === "B"}
                      value={unknownPos === "B" ? "?" : propB}
                      onChange={(e) => setPropB(e.target.value)}
                      placeholder="e.g. 3"
                      aria-label="Value B"
                      className={`w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all ${
                        unknownPos === "B"
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-2 border-[var(--primary)] text-center cursor-not-allowed"
                          : "bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--text-primary)]"
                      }`}
                    />
                  </div>

                  <div className="col-span-2 text-center font-bold text-lg text-[var(--text-muted)]">
                    =
                  </div>
                </div>

                <div className="grid grid-cols-11 gap-2 items-center pt-2 border-t border-[var(--border)]/40">
                  {/* Right Ratio: C : D */}
                  <div className="col-span-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      C {unknownPos === "C" && <span className="text-[var(--primary)]">(Unknown)</span>}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={unknownPos === "C"}
                      value={unknownPos === "C" ? "?" : propC}
                      onChange={(e) => setPropC(e.target.value)}
                      placeholder="e.g. 4"
                      aria-label="Value C"
                      className={`w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all ${
                        unknownPos === "C"
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-2 border-[var(--primary)] text-center cursor-not-allowed"
                          : "bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--text-primary)]"
                      }`}
                    />
                  </div>

                  <div className="col-span-1 text-center font-bold text-lg text-[var(--text-muted)]">
                    :
                  </div>

                  <div className="col-span-4">
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      D {unknownPos === "D" && <span className="text-[var(--primary)]">(Unknown)</span>}
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      disabled={unknownPos === "D"}
                      value={unknownPos === "D" ? "?" : propD}
                      onChange={(e) => setPropD(e.target.value)}
                      placeholder="e.g. 6"
                      aria-label="Value D"
                      className={`w-full rounded-lg px-3 py-2 text-sm font-semibold outline-none transition-all ${
                        unknownPos === "D"
                          ? "bg-[var(--primary)]/10 text-[var(--primary)] border-2 border-[var(--primary)] text-center cursor-not-allowed"
                          : "bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--text-primary)]"
                      }`}
                    />
                  </div>

                  <div className="col-span-2" />
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: SPLIT AMOUNT */}
          {activeMode === "split-amount" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Total Amount & Ratio Shares
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Divide a monetary amount or dataset into multiple proportional parts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetSplit}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Total Amount Input */}
              <div className="mb-5">
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5">
                  Total Amount to Divide
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-muted)]">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={splitTotal}
                    onChange={(e) => setSplitTotal(e.target.value)}
                    placeholder="e.g. 1000"
                    aria-label="Total Amount"
                    className="w-full bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-lg pl-8 pr-3.5 py-2 text-base font-semibold text-[var(--text-primary)] outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Ratio Parts */}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-2">
                  Ratio Parts (R1 : R2 : ...)
                </label>
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {ratioParts.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 sm:gap-3 bg-[var(--surface-muted)]/40 p-2 sm:p-2.5 rounded-xl border border-[var(--border)]/60"
                    >
                      <span className="text-xs font-bold text-[var(--text-muted)] w-16 sm:w-20 shrink-0 text-center bg-[var(--surface)] py-1.5 px-2 rounded-md border border-[var(--border)]">
                        Part {index + 1}
                      </span>

                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.val}
                        onChange={(e) =>
                          handleRatioPartChange(item.id, e.target.value)
                        }
                        placeholder={`e.g. ${index === 0 ? "2" : index === 1 ? "3" : "5"}`}
                        aria-label={`Ratio Part ${index + 1}`}
                        className="flex-1 bg-[var(--surface)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] outline-none transition-all"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveRatioPart(item.id)}
                        disabled={ratioParts.length <= 2}
                        aria-label={`Remove Part ${index + 1}`}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 disabled:opacity-30 disabled:hover:text-[var(--text-muted)] disabled:cursor-not-allowed transition-colors cursor-pointer rounded-lg hover:bg-red-500/10"
                        title={
                          ratioParts.length <= 2
                            ? "Minimum 2 parts required"
                            : "Delete part"
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

                {/* Add Part Action Bar */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[var(--border)]/60">
                  <button
                    type="button"
                    onClick={handleAddRatioPart}
                    disabled={ratioParts.length >= 10}
                    className="inline-flex items-center px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
                  >
                    + Add Part
                  </button>
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    {ratioParts.length} / 10 parts
                  </span>
                </div>
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
