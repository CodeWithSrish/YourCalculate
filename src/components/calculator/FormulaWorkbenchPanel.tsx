"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  FormulaDefinition,
  FormulaCategory,
  getAllFormulas,
  getFormulaById,
  evaluateFormula,
  searchFormulaLibrary,
  FormulaEvaluationOutput,
} from "@/calculators/definitions/scientificFormulas";
import { MathFormula } from "./MathFormula";
import { AngleMode } from "@/calculators/definitions/scientific";

interface FormulaWorkbenchPanelProps {
  angleMode?: AngleMode;
  initialFormulaId?: string;
}

const CATEGORIES: (FormulaCategory | "All")[] = [
  "All",
  "Geometry",
  "Physics",
  "Finance",
  "Trigonometry",
  "Algebra",
];

export function FormulaWorkbenchPanel({
  angleMode = "DEG",
  initialFormulaId = "geom-circle-area",
}: FormulaWorkbenchPanelProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<FormulaCategory | "All">("All");

  // Filtered Formulas based on Category and Search Query
  const filteredFormulas = useMemo(() => {
    return searchFormulaLibrary({
      category: selectedCategory,
      searchQuery,
    });
  }, [selectedCategory, searchQuery]);

  // Selected Formula State ID
  const [selectedFormulaId, setSelectedFormulaId] = useState<string>(initialFormulaId);

  // Active Selected Formula: strictly derived and verified against visible filteredFormulas
  const selectedFormula: FormulaDefinition | null = useMemo(() => {
    if (filteredFormulas.length === 0) return null;
    const found = filteredFormulas.find((f) => f.id === selectedFormulaId);
    return found || filteredFormulas[0];
  }, [filteredFormulas, selectedFormulaId]);

  // Form Input States
  const [variableValues, setVariableValues] = useState<Record<string, number>>(() => {
    const initFormula = getFormulaById(initialFormulaId) || getAllFormulas()[0];
    const init: Record<string, number> = {};
    for (const v of initFormula.variables) {
      init[v.symbol] = v.defaultValue;
    }
    return init;
  });

  const [variableUnits, setVariableUnits] = useState<Record<string, string>>(() => {
    const initFormula = getFormulaById(initialFormulaId) || getAllFormulas()[0];
    const init: Record<string, string> = {};
    for (const v of initFormula.variables) {
      if (v.defaultUnit) {
        init[v.symbol] = v.defaultUnit;
      }
    }
    return init;
  });

  const [outputUnit, setOutputUnit] = useState<string>(() => {
    const initFormula = getFormulaById(initialFormulaId) || getAllFormulas()[0];
    return initFormula.targetVariable.defaultUnit || "";
  });

  const [showSteps, setShowSteps] = useState<boolean>(true);

  // Synchronize formula inputs whenever the active selectedFormula changes
  const [lastFormulaId, setLastFormulaId] = useState<string>(initialFormulaId);

  if (selectedFormula && selectedFormula.id !== lastFormulaId) {
    setLastFormulaId(selectedFormula.id);
    const newVals: Record<string, number> = {};
    const newUnits: Record<string, string> = {};
    for (const v of selectedFormula.variables) {
      newVals[v.symbol] = v.defaultValue;
      if (v.defaultUnit) {
        newUnits[v.symbol] = v.defaultUnit;
      }
    }
    setVariableValues(newVals);
    setVariableUnits(newUnits);
    setOutputUnit(selectedFormula.targetVariable.defaultUnit || "");
  }

  // Handle Category Selection with automatic formula reconciliation
  const handleSelectCategory = useCallback(
    (newCat: FormulaCategory | "All") => {
      setSelectedCategory(newCat);
      const nextFiltered = searchFormulaLibrary({ category: newCat, searchQuery });
      if (nextFiltered.length > 0) {
        const stillValid = nextFiltered.find((f) => f.id === selectedFormulaId);
        const target = stillValid || nextFiltered[0];
        setSelectedFormulaId(target.id);
      } else {
        setSelectedFormulaId("");
      }
    },
    [searchQuery, selectedFormulaId]
  );

  // Handle Search Query changes with automatic formula reconciliation
  const handleSearchChange = useCallback(
    (newQuery: string) => {
      setSearchQuery(newQuery);
      const nextFiltered = searchFormulaLibrary({ category: selectedCategory, searchQuery: newQuery });
      if (nextFiltered.length > 0) {
        const stillValid = nextFiltered.find((f) => f.id === selectedFormulaId);
        const target = stillValid || nextFiltered[0];
        setSelectedFormulaId(target.id);
      } else {
        setSelectedFormulaId("");
      }
    },
    [selectedCategory, selectedFormulaId]
  );

  // Handle clearing search query
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    const nextFiltered = searchFormulaLibrary({ category: selectedCategory, searchQuery: "" });
    if (nextFiltered.length > 0) {
      const stillValid = nextFiltered.find((f) => f.id === selectedFormulaId);
      const target = stillValid || nextFiltered[0];
      setSelectedFormulaId(target.id);
    }
  }, [selectedCategory, selectedFormulaId]);

  // Handle manual formula selection from dropdown
  const handleSelectFormula = useCallback(
    (id: string) => {
      const f = getFormulaById(id);
      if (!f) return;
      setSelectedFormulaId(id);

      // Defensive category sync: if specific category active and selected formula belongs elsewhere, sync category
      if (selectedCategory !== "All" && f.category !== selectedCategory) {
        setSelectedCategory(f.category);
      }
    },
    [selectedCategory]
  );

  // Update a single variable value
  const handleVariableChange = useCallback((symbol: string, valStr: string) => {
    const parsed = valStr === "" ? NaN : parseFloat(valStr);
    setVariableValues((prev) => ({
      ...prev,
      [symbol]: parsed,
    }));
  }, []);

  // Update a variable unit
  const handleUnitChange = useCallback((symbol: string, newUnit: string) => {
    setVariableUnits((prev) => ({
      ...prev,
      [symbol]: newUnit,
    }));
  }, []);

  // Load Example Preset
  const handleLoadExample = useCallback(
    (exampleIdx = 0) => {
      if (!selectedFormula || !selectedFormula.examples || selectedFormula.examples.length === 0) return;
      const ex = selectedFormula.examples[exampleIdx] || selectedFormula.examples[0];
      setVariableValues({ ...ex.variableValues });
      if (ex.variableUnits) {
        setVariableUnits({ ...ex.variableUnits });
      }
      if (ex.outputUnit) {
        setOutputUnit(ex.outputUnit);
      }
    },
    [selectedFormula]
  );

  // Compute evaluation result
  const evaluationResult: FormulaEvaluationOutput | null = useMemo(() => {
    if (!selectedFormula) return null;
    return evaluateFormula(selectedFormula, variableValues, variableUnits, {
      angleMode,
      userOutputUnit: outputUnit || undefined,
    });
  }, [selectedFormula, variableValues, variableUnits, outputUnit, angleMode]);

  // Category library totals (constant library counts)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: getAllFormulas().length };
    for (const f of getAllFormulas()) {
      counts[f.category] = (counts[f.category] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          1. FORMULA SEARCH & CATEGORY SELECTOR
      ========================================================================= */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-muted)] pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search formulas (e.g., circle, speed, compound, pythagorean)..."
              aria-label="Search formulas"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear formula search"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Formula Selector Quick Dropdown */}
          <div className="w-full sm:w-72">
            <label htmlFor="formula-select-quick" className="sr-only">
              Select Formula
            </label>
            <select
              id="formula-select-quick"
              value={selectedFormula?.id || ""}
              disabled={filteredFormulas.length === 0}
              onChange={(e) => handleSelectFormula(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {filteredFormulas.length === 0 ? (
                <option value="" disabled>
                  No matching formulas
                </option>
              ) : (
                filteredFormulas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.category})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                  isSelected
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--background)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-[var(--surface)] text-[var(--text-muted)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. ACTIVE FORMULA CARD OR EMPTY STATE
      ========================================================================= */}
      {!selectedFormula ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="text-4xl sm:text-5xl">🔍</div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              No formulas found
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              No formulas match &ldquo;{searchQuery}&rdquo; in the{" "}
              <strong className="text-[var(--text-primary)]">{selectedCategory}</strong> category.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-3 flex-wrap">
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)] text-white hover:opacity-90 transition-all shadow-xs"
              >
                Clear Search Query
              </button>
            )}
            {selectedCategory !== "All" && (
              <button
                type="button"
                onClick={() => handleSelectCategory("All")}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface)] transition-all"
              >
                Show All Categories
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[var(--border)] pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {selectedFormula.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {selectedFormula.name}
                </h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
                {selectedFormula.description}
              </p>
            </div>

          {/* Load Example Preset Button */}
          {selectedFormula.examples.length > 0 && (
            <button
              type="button"
              onClick={() => handleLoadExample(0)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 self-start shrink-0"
            >
              <span>⚡</span>
              <span>Load Sample Values</span>
            </button>
          )}
        </div>

        {/* Formula Mathematical Display Container */}
        <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-inner overflow-x-auto">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mb-2">
            Mathematical Formula Definition
          </span>
          <div className="py-2">
            <MathFormula formula={selectedFormula.displayFormula} size="lg" />
          </div>
        </div>

        {/* =========================================================================
            3. DYNAMIC VARIABLE INPUTS
        ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Input Variables
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              {selectedFormula.variables.length} variable{selectedFormula.variables.length > 1 ? "s" : ""} required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedFormula.variables.map((v) => {
              const currentVal = variableValues[v.symbol];
              const valStr = Number.isNaN(currentVal) || currentVal === undefined ? "" : String(currentVal);
              const hasUnits = v.dimension !== "dimensionless" && v.allowedUnits && v.allowedUnits.length > 0;
              const activeUnit = variableUnits[v.symbol] || v.defaultUnit || "";

              return (
                <div
                  key={v.symbol}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-2.5 transition-all hover:border-[var(--primary)]/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`var-input-${v.symbol}`}
                      className="text-xs sm:text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5"
                    >
                      <span className="font-serif italic font-semibold text-indigo-500 dark:text-indigo-400 px-1 py-0.5 bg-[var(--surface)] rounded border border-[var(--border)]">
                        {v.symbol}
                      </span>
                      <span>{v.name}</span>
                    </label>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      {v.dimension !== "dimensionless" ? v.dimension : "scalar"}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                    {v.description}
                  </p>

                  <div className="flex items-center gap-2">
                    <input
                      id={`var-input-${v.symbol}`}
                      type="number"
                      step={v.step || "any"}
                      min={v.min !== undefined ? v.min : undefined}
                      max={v.max !== undefined ? v.max : undefined}
                      value={valStr}
                      onChange={(e) => handleVariableChange(v.symbol, e.target.value)}
                      placeholder={`Enter ${v.name}...`}
                      className="flex-1 px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all"
                    />

                    {/* Unit Selector Dropdown if dimensional */}
                    {hasUnits && (
                      <div className="w-24 shrink-0">
                        <label htmlFor={`var-unit-${v.symbol}`} className="sr-only">
                          Unit for {v.name}
                        </label>
                        <select
                          id={`var-unit-${v.symbol}`}
                          value={activeUnit}
                          onChange={(e) => handleUnitChange(v.symbol, e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer"
                        >
                          {v.allowedUnits!.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            4. TARGET OUTPUT UNIT SELECTOR (IF APPLICABLE)
        ========================================================================= */}
        {selectedFormula.targetVariable.dimension !== "dimensionless" &&
          selectedFormula.targetVariable.supportedUnits &&
          selectedFormula.targetVariable.supportedUnits.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase text-indigo-500 dark:text-indigo-400">
                  Target Output Unit ({selectedFormula.targetVariable.name})
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Computed result will be converted automatically to your chosen unit.
                </p>
              </div>

              <div className="w-full sm:w-44">
                <label htmlFor="target-output-unit" className="sr-only">
                  Select Output Unit
                </label>
                <select
                  id="target-output-unit"
                  value={outputUnit}
                  onChange={(e) => setOutputUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer"
                >
                  {selectedFormula.targetVariable.supportedUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

        {/* =========================================================================
            5. CALCULATION RESULTS AREA
        ========================================================================= */}
        <div aria-live="polite" className="space-y-4 pt-2">
          {evaluationResult && evaluationResult.isValid ? (
            <div className="rounded-2xl border-2 border-[var(--primary)]/30 bg-[var(--surface)] overflow-hidden shadow-md">
              {/* Result Header */}
              <div className="bg-slate-900 text-slate-100 p-5 sm:p-6 border-b border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800 text-slate-400">
                  <span>TARGET RESULT: {evaluationResult.targetName} ({evaluationResult.targetSymbol})</span>
                  {evaluationResult.outputUnit && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                      Unit: {evaluationResult.outputUnit}
                    </span>
                  )}
                </div>

                {/* Primary Dual Result Display */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div>
                    {evaluationResult.formattedExact ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            EXACT
                          </span>
                          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-mono">
                            {evaluationResult.formattedExact}
                            {evaluationResult.outputUnit ? ` ${evaluationResult.outputUnit}` : ""}
                          </span>
                        </div>
                        <div className="text-sm font-mono text-slate-400 pl-1">
                          ≈ {evaluationResult.formattedDecimal}
                          {evaluationResult.outputUnit ? ` ${evaluationResult.outputUnit}` : ""} (decimal)
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            DECIMAL
                          </span>
                          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-mono">
                            {evaluationResult.formattedDecimal}
                            {evaluationResult.outputUnit ? ` ${evaluationResult.outputUnit}` : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Substituted Formula Card */}
              {evaluationResult.substitutedFormulaText && (
                <div className="p-4 bg-[var(--background)] border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <span className="font-bold text-[var(--text-secondary)] uppercase tracking-wider text-[11px]">
                    Substituted Formula:
                  </span>
                  <span className="font-mono text-[var(--text-primary)] font-semibold bg-[var(--surface)] px-3 py-1.5 rounded-lg border border-[var(--border)] select-all overflow-x-auto">
                    {evaluationResult.substitutedFormulaText}
                  </span>
                </div>
              )}

              {/* =========================================================================
                  6. CALCULATION STEPS ACCORDION
              ========================================================================= */}
              <div className="p-4 sm:p-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSteps((prev) => !prev)}
                  className="flex items-center justify-between w-full text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    <span>📜</span>
                    <span>How it was calculated ({evaluationResult.steps.length} steps)</span>
                  </span>
                  <span className="text-lg font-mono text-[var(--text-muted)]">
                    {showSteps ? "▲" : "▼"}
                  </span>
                </button>

                {showSteps && (
                  <div className="space-y-2.5 pt-2">
                    {evaluationResult.steps.map((st) => (
                      <div
                        key={st.id}
                        className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold flex items-center justify-center shrink-0 text-[11px]">
                            {st.stepNumber}
                          </span>
                          <div className="space-y-0.5">
                            <span className="font-bold text-[var(--text-primary)]">
                              {st.operation}
                            </span>
                            <p className="text-[var(--text-secondary)]">
                              {st.explanation}
                            </p>
                          </div>
                        </div>

                        <div className="font-mono font-semibold text-[var(--text-primary)] bg-[var(--surface)] px-2.5 py-1 rounded border border-[var(--border)] self-start sm:self-auto shrink-0 select-all">
                          {st.exactSubResult || st.formattedSubResult}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : evaluationResult ? (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{evaluationResult.error || "Please enter valid numeric values for all variables."}</span>
            </div>
          ) : null}
        </div>

        {/* Formula Mathematical Notes Callout */}
        {selectedFormula.notes && selectedFormula.notes.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-[var(--text-secondary)] space-y-1">
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <span>💡</span>
              <span>Domain Notes & Constraints</span>
            </span>
            <ul className="list-disc list-inside space-y-0.5 text-[var(--text-muted)]">
              {selectedFormula.notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
