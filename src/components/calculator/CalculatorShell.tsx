"use client";

import React, { useState, useMemo } from "react";
import { getCalculatorBySlug } from "@/calculators/registry";
import { parseNumericInput } from "@/calculators/engine/validation";
import { CalculatorInput } from "./CalculatorInput";
import { CalculatorResult } from "./CalculatorResult";
import { AmortizationTable } from "./AmortizationTable";
import { SIPGrowthTable } from "./SIPGrowthTable";

interface CalculatorShellProps {
  slug: string;
}

export function CalculatorShell({ slug }: CalculatorShellProps) {
  const definition = getCalculatorBySlug(slug);

  const [activeModeId, setActiveModeId] = useState<string>(
    definition?.defaultModeId || ""
  );

  const activeMode = useMemo(() => {
    if (!definition) return null;
    return (
      definition.modes.find((m) => m.id === activeModeId) || definition.modes[0]
    );
  }, [definition, activeModeId]);

  // Maintain input state for each mode
  const [inputState, setInputState] = useState<Record<string, Record<string, number | string>>>(() => {
    if (!definition) return {};
    const initial: Record<string, Record<string, number | string>> = {};
    for (const mode of definition.modes) {
      initial[mode.id] = {};
      for (const input of mode.inputs) {
        if (input.type === "date" && input.defaultValue === "today") {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          initial[mode.id][input.id] = `${year}-${month}-${day}`;
        } else {
          initial[mode.id][input.id] = input.defaultValue !== undefined ? input.defaultValue : "";
        }
      }
    }
    return initial;
  });

  if (!definition || !activeMode) {
    return null;
  }

  const handleInputChange = (inputId: string, value: number | string) => {
    setInputState((prev) => ({
      ...prev,
      [activeMode.id]: {
        ...prev[activeMode.id],
        [inputId]: value,
      },
    }));
  };

  const handleReset = () => {
    setInputState((prev) => {
      const resetModeInputs: Record<string, number | string> = {};
      for (const input of activeMode.inputs) {
        if (input.type === "date" && input.defaultValue === "today") {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, "0");
          const day = String(now.getDate()).padStart(2, "0");
          resetModeInputs[input.id] = `${year}-${month}-${day}`;
        } else {
          resetModeInputs[input.id] = input.defaultValue !== undefined ? input.defaultValue : "";
        }
      }
      return {
        ...prev,
        [activeMode.id]: resetModeInputs,
      };
    });
  };

  // Compute result deterministically
  const calculationResult = () => {
    const currentInputs = inputState[activeMode.id] || {};
    const parsedInputs: Record<string, number | string> = {};

    for (const inputDef of activeMode.inputs) {
      const rawVal = currentInputs[inputDef.id];
      if (inputDef.type === "date") {
        if (!rawVal || typeof rawVal !== "string" || !rawVal.trim()) {
          return {
            isValid: false,
            error: `Please enter your ${inputDef.label.toLowerCase()}.`,
          };
        }
        parsedInputs[inputDef.id] = String(rawVal).trim();
      } else if (inputDef.type === "select") {
        const val =
          rawVal !== undefined && rawVal !== ""
            ? rawVal
            : inputDef.defaultValue ?? (inputDef.options?.[0]?.value ?? "");
        parsedInputs[inputDef.id] = val;
      } else {
        const parsed = parseNumericInput(rawVal);
        if (parsed === null) {
          return {
            isValid: false,
            error: `Please enter a valid number for "${inputDef.label}".`,
          };
        }
        parsedInputs[inputDef.id] = parsed;
      }
    }

    return activeMode.calculate(parsedInputs);
  };

  const result = calculationResult();

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 lg:p-9 shadow-xs">
        {/* Mode Selector Tabs (only shown if there are multiple calculation modes) */}
        {definition.modes.length > 1 && (
          <div className="border-b border-[var(--border)] pb-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Calculation Mode
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {definition.modes.map((mode) => {
                const isActive = mode.id === activeMode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setActiveModeId(mode.id)}
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
        )}

        {/* Main Interactive Calculation Layout */}
        <div className={`${definition.modes.length > 1 ? "mt-6 sm:mt-8" : ""} grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10`}>
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-[15px] sm:text-base text-[var(--text-secondary)] mb-5 leading-relaxed">
                {activeMode.description}
              </p>

              <div className="space-y-4 sm:space-y-5">
                {activeMode.inputs.map((inputDef) => (
                  <CalculatorInput
                    key={inputDef.id}
                    definition={inputDef}
                    value={inputState[activeMode.id]?.[inputDef.id] ?? ""}
                    onChange={handleInputChange}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:underline"
              >
                Reset Inputs
              </button>
              <span className="text-xs sm:text-sm font-medium tabular-nums text-[var(--text-muted)]">
                Instant Computation
              </span>
            </div>
          </div>

          {/* Right Column: Calculated Results */}
          <div className="lg:col-span-6">
            <CalculatorResult result={result} />
          </div>
        </div>
      </div>

      {/* Amortization Schedule (if produced by the active calculation mode) */}
      {result.isValid && result.amortizationSchedule && result.amortizationSchedule.length > 0 && (
        <AmortizationTable schedule={result.amortizationSchedule} />
      )}

      {/* SIP Growth Projection Schedule (if produced by the active calculation mode) */}
      {result.isValid && result.sipGrowthSchedule && result.sipGrowthSchedule.length > 0 && (
        <SIPGrowthTable growthSchedule={result.sipGrowthSchedule} />
      )}
    </div>
  );
}
