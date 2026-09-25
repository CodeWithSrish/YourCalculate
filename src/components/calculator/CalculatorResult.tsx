import React from "react";
import { CalculationOutput } from "@/calculators/engine/types";

interface CalculatorResultProps {
  result: CalculationOutput;
}

export function CalculatorResult({ result }: CalculatorResultProps) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6"
    >
      <div>
        <span className="text-xs sm:text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Calculated Result
        </span>

        {result.isValid ? (
          <div className="mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl lg:text-[40px] font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-tight">
                {result.primaryValue}
              </span>
            </div>

            {result.primaryLabel && (
              <p className="mt-1.5 text-sm sm:text-[15px] text-[var(--text-secondary)]">
                {result.primaryLabel}
              </p>
            )}

            {result.stepExplanation && (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 text-[14px] sm:text-[15px] text-[var(--text-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--text-primary)]">Calculation: </span>
                <span className="tabular-nums">{result.stepExplanation}</span>
              </div>
            )}

            {result.disclaimer && (
              <div className="mt-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 text-[13px] sm:text-[14px] text-[var(--text-muted)] leading-relaxed">
                <span className="font-semibold text-[var(--text-secondary)]">
                  {result.disclaimerLabel || "Medical Disclaimer"}:{" "}
                </span>
                <span>{result.disclaimer}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            <span className="font-semibold">Notice: </span>
            {result.error || "Please enter valid numeric inputs to calculate."}
          </div>
        )}
      </div>

      {result.isValid && result.secondaryValues && result.secondaryValues.length > 0 && (
        <div className="mt-6 border-t border-[var(--border)] pt-4">
          <span className="text-xs sm:text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Breakdown & Metrics
          </span>
          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {result.secondaryValues.map((sec) => (
              <div
                key={sec.label}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm shadow-2xs"
              >
                <span className="text-sm text-[var(--text-muted)]">{sec.label}</span>
                <span className="text-[15px] font-semibold text-[var(--text-primary)] tabular-nums text-right ml-2">
                  {sec.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
