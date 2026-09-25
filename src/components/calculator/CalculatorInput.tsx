"use client";

import React from "react";
import { InputFieldDefinition } from "@/calculators/engine/types";

interface CalculatorInputProps {
  definition: InputFieldDefinition;
  value: number | string;
  onChange: (id: string, value: number | string) => void;
  error?: string;
}

export function CalculatorInput({
  definition,
  value,
  onChange,
  error,
}: CalculatorInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const rawVal = e.target.value;
    onChange(definition.id, rawVal);
  };

  if (definition.type === "date") {
    const isReferenceDate = definition.id === "referenceDate";
    const handleSetToday = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      onChange(definition.id, `${year}-${month}-${day}`);
    };

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={definition.id}
            className="text-[15px] sm:text-base font-semibold text-[var(--text-primary)]"
          >
            {definition.label}
          </label>
          {isReferenceDate && (
            <button
              type="button"
              onClick={handleSetToday}
              className="text-xs font-semibold text-[var(--primary)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--ring)] rounded-xs"
            >
              Set to Today
            </button>
          )}
        </div>

        <div className="relative flex items-center shadow-xs">
          <input
            type="date"
            id={definition.id}
            name={definition.id}
            value={value}
            onChange={handleChange}
            placeholder={definition.placeholder}
            aria-invalid={!!error}
            aria-describedby={error ? `${definition.id}-error` : undefined}
            className={`w-full rounded-lg border bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
              error
                ? "border-[var(--error)] focus:border-[var(--error)]"
                : "border-[var(--border-strong)] focus:border-[var(--primary)]"
            }`}
          />
        </div>

        {error ? (
          <span
            id={`${definition.id}-error`}
            className="text-xs sm:text-sm font-medium text-[var(--error)]"
          >
            {error}
          </span>
        ) : definition.helperText ? (
          <span className="text-xs sm:text-sm text-[var(--text-muted)]">
            {definition.helperText}
          </span>
        ) : null}
      </div>
    );
  }

  if (definition.type === "select") {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={definition.id}
          className="text-[15px] sm:text-base font-semibold text-[var(--text-primary)]"
        >
          {definition.label}
        </label>

        <div className="relative flex items-center shadow-xs">
          <select
            id={definition.id}
            name={definition.id}
            value={value}
            onChange={handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${definition.id}-error` : undefined}
            className={`w-full rounded-lg border bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
              error
                ? "border-[var(--error)] focus:border-[var(--error)]"
                : "border-[var(--border-strong)] focus:border-[var(--primary)]"
            }`}
          >
            {definition.options?.map((opt) => (
              <option key={String(opt.value)} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <span
            id={`${definition.id}-error`}
            className="text-xs sm:text-sm font-medium text-[var(--error)]"
          >
            {error}
          </span>
        ) : definition.helperText ? (
          <span className="text-xs sm:text-sm text-[var(--text-muted)]">
            {definition.helperText}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={definition.id}
        className="text-[15px] sm:text-base font-semibold text-[var(--text-primary)]"
      >
        {definition.label}
      </label>

      <div className="relative flex items-center shadow-xs">
        {definition.prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm sm:text-base font-medium text-[var(--text-muted)]">
            {definition.prefix}
          </span>
        )}

        <input
          type="number"
          id={definition.id}
          name={definition.id}
          value={value}
          onChange={handleChange}
          step={definition.step || "any"}
          min={definition.min}
          max={definition.max}
          placeholder={definition.placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${definition.id}-error` : undefined}
          className={`w-full rounded-lg border bg-[var(--surface)] py-2.5 text-base text-[var(--text-primary)] placeholder-[var(--text-muted)] tabular-nums transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
            definition.prefix ? "pl-9" : "pl-3.5"
          } ${definition.suffix ? "pr-14" : "pr-3.5"} ${
            error
              ? "border-[var(--error)] focus:border-[var(--error)]"
              : "border-[var(--border-strong)] focus:border-[var(--primary)]"
          }`}
        />

        {definition.suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-sm sm:text-base font-medium text-[var(--text-muted)]">
            {definition.suffix}
          </span>
        )}
      </div>

      {error ? (
        <span
          id={`${definition.id}-error`}
          className="text-xs sm:text-sm font-medium text-[var(--error)]"
        >
          {error}
        </span>
      ) : definition.helperText ? (
        <span className="text-xs sm:text-sm text-[var(--text-muted)]">
          {definition.helperText}
        </span>
      ) : null}
    </div>
  );
}
