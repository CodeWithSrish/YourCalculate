"use client";

import React, { useState, useMemo } from "react";
import { formatResultNumber } from "@/calculators/engine/validation";
import {
  getAllGradingScales,
  getGradingScaleById,
} from "@/calculators/education/gpaScales";
import {
  calculateCourseGpa,
  calculateSimpleGpa,
  calculateCumulativeGpa,
  calculateWeightedGpa,
  CourseInput,
  CourseLevel,
} from "@/calculators/education/gpaEngine";
import { CalculatorResult } from "./CalculatorResult";
import { CalculationOutput } from "@/calculators/engine/types";

type GPAMode = "course-gpa" | "cumulative-gpa" | "simple-gpa" | "weighted-gpa";

interface CourseRowState {
  id: string;
  name: string;
  grade: string;
  gradePoint?: number;
  credits: string; // string for fluid numeric typing
  level: CourseLevel;
  customBoost?: string;
}

const INITIAL_COURSES: CourseRowState[] = [
  { id: "c1", name: "Calculus I", grade: "A-", credits: "4.0", level: "regular" },
  { id: "c2", name: "Physics II", grade: "B+", credits: "4.0", level: "honors" },
  { id: "c3", name: "Literature", grade: "A", credits: "3.0", level: "regular" },
  { id: "c4", name: "History", grade: "B", credits: "3.0", level: "regular" },
];

export function GPACalculatorShell() {
  const [activeMode, setActiveMode] = useState<GPAMode>("course-gpa");
  const [selectedScaleId, setSelectedScaleId] = useState<string>("standard-4-0-plus-minus");
  const [courses, setCourses] = useState<CourseRowState[]>(INITIAL_COURSES);

  // Simple Mode State
  const [simpleGrades, setSimpleGrades] = useState<string[]>(["A", "A-", "B+", "B"]);

  // Cumulative Mode State
  const [cumulativeInputs, setCumulativeInputs] = useState({
    previousGpa: "3.60",
    previousCredits: "60",
    currentGpa: "3.80",
    currentCredits: "15",
  });

  const activeScale = useMemo(() => {
    return getGradingScaleById(selectedScaleId);
  }, [selectedScaleId]);

  const availableScales = useMemo(() => {
    return getAllGradingScales();
  }, []);

  // Course management helpers
  const handleAddCourse = () => {
    const nextIndex = courses.length + 1;
    const defaultGrade = activeScale.grades[0]?.grade || "A";
    const newCourse: CourseRowState = {
      id: `c_${Date.now()}_${nextIndex}`,
      name: `Course ${nextIndex}`,
      grade: defaultGrade,
      credits: "3.0",
      level: "regular",
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleRemoveCourse = (id: string) => {
    if (courses.length <= 1) return;
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateCourse = (id: string, field: keyof CourseRowState, value: string | number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleResetCourses = () => {
    setCourses(INITIAL_COURSES);
  };

  // Simple grade list helpers
  const handleAddSimpleGrade = (grade: string) => {
    setSimpleGrades((prev) => [...prev, grade]);
  };

  const handleRemoveSimpleGrade = (index: number) => {
    if (simpleGrades.length <= 1) return;
    setSimpleGrades((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute Calculation Result based on active mode
  const calculationOutput: CalculationOutput = useMemo(() => {
    // Mode 1: Course & Semester GPA
    if (activeMode === "course-gpa") {
      const parsedCourses: CourseInput[] = courses.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        gradePoint: selectedScaleId === "custom" ? parseFloat(c.grade) : undefined,
        credits: parseFloat(c.credits) || 0,
      }));

      const res = calculateCourseGpa(parsedCourses, selectedScaleId);
      if (!res.isValid) {
        return { isValid: false, error: res.error };
      }

      return {
        isValid: true,
        primaryValue: `${res.formattedGpa} GPA`,
        primaryLabel: `Calculated from ${res.courseBreakdown?.length || 0} courses across ${formatResultNumber(res.gpaCredits ?? 0, 1)} credit hours`,
        stepExplanation: res.stepExplanation,
        secondaryValues: [
          { label: "Total GPA Credits", value: formatResultNumber(res.gpaCredits ?? 0, 1) },
          { label: "Total Quality Points", value: formatResultNumber(res.totalQualityPoints ?? 0, 2) },
          { label: "Earned Credits", value: formatResultNumber(res.earnedCredits ?? 0, 1) },
          { label: "Grading Scale", value: activeScale.name },
        ],
      };
    }

    // Mode 2: Cumulative GPA
    if (activeMode === "cumulative-gpa") {
      const prevG = parseFloat(cumulativeInputs.previousGpa);
      const prevC = parseFloat(cumulativeInputs.previousCredits);
      const currG = parseFloat(cumulativeInputs.currentGpa);
      const currC = parseFloat(cumulativeInputs.currentCredits);

      const res = calculateCumulativeGpa({
        previousGpa: prevG,
        previousCredits: prevC,
        currentGpa: currG,
        currentCredits: currC,
        maxGpa: activeScale.maxGradePoint,
      });

      if (!res.isValid) {
        return { isValid: false, error: res.error };
      }

      const delta = res.gpaDelta ?? 0;
      const deltaFormatted = delta >= 0 ? `+${formatResultNumber(delta, 2)}` : `${formatResultNumber(delta, 2)}`;

      return {
        isValid: true,
        primaryValue: `${res.formattedCumulativeGpa} Cumulative GPA`,
        primaryLabel: `Updated over ${formatResultNumber(res.totalCredits ?? 0)} total credit hours (${deltaFormatted} change)`,
        stepExplanation: res.stepExplanation,
        secondaryValues: [
          { label: "New Cumulative GPA", value: res.formattedCumulativeGpa ?? "N/A" },
          { label: "Total Completed Credits", value: formatResultNumber(res.totalCredits ?? 0) },
          { label: "Total Quality Points", value: formatResultNumber(res.totalQualityPoints ?? 0, 2) },
          { label: "Prior Record", value: `${formatResultNumber(prevG, 2)} GPA (${prevC} cr)` },
          { label: "Current Semester", value: `${formatResultNumber(currG, 2)} GPA (${currC} cr)` },
          { label: "GPA Delta (Change)", value: deltaFormatted },
        ],
      };
    }

    // Mode 3: Simple Grade List
    if (activeMode === "simple-gpa") {
      const res = calculateSimpleGpa(simpleGrades, selectedScaleId);
      if (!res.isValid) {
        return { isValid: false, error: res.error };
      }

      return {
        isValid: true,
        primaryValue: `${res.formattedGpa} GPA`,
        primaryLabel: `Calculated assuming equal credit weight across ${res.gpaCourses} courses`,
        stepExplanation: res.stepExplanation,
        secondaryValues: [
          { label: "Total Grade Points", value: formatResultNumber(res.totalGradePoints ?? 0, 2) },
          { label: "Graded Courses", value: `${res.gpaCourses}` },
          { label: "Grading Scale", value: activeScale.name },
          { label: "Weighting Assumption", value: "Equal credit weight per course" },
        ],
      };
    }

    // Mode 4: Weighted GPA
    if (activeMode === "weighted-gpa") {
      const parsedCourses: CourseInput[] = courses.map((c) => ({
        id: c.id,
        name: c.name,
        grade: c.grade,
        credits: parseFloat(c.credits) || 0,
        level: c.level,
        customBoost: c.customBoost ? parseFloat(c.customBoost) : undefined,
      }));

      const res = calculateWeightedGpa(parsedCourses, undefined, selectedScaleId);
      if (!res.isValid) {
        return { isValid: false, error: res.error };
      }

      return {
        isValid: true,
        primaryValue: `${res.formattedWeightedGpa} Weighted GPA`,
        primaryLabel: `Unweighted GPA: ${res.formattedUnweightedGpa} (Max Unweighted: ${res.maxUnweightedScale?.toFixed(1)})`,
        stepExplanation: res.stepExplanation,
        secondaryValues: [
          { label: "Weighted GPA", value: res.formattedWeightedGpa ?? "N/A" },
          { label: "Unweighted GPA", value: res.formattedUnweightedGpa ?? "N/A" },
          { label: "Total GPA Credits", value: formatResultNumber(res.gpaCredits ?? 0, 1) },
          { label: "Weighted Quality Points", value: formatResultNumber(res.weightedQualityPoints ?? 0, 2) },
          { label: "Unweighted Quality Points", value: formatResultNumber(res.unweightedQualityPoints ?? 0, 2) },
          { label: "Grading Scale", value: activeScale.name },
        ],
      };
    }

    return { isValid: false, error: "Please choose a valid calculation mode." };
  }, [activeMode, selectedScaleId, courses, simpleGrades, cumulativeInputs, activeScale]);

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 lg:p-9 shadow-xs">
        {/* Top Control Bar: Grading Scale & Mode Selector */}
        <div className="border-b border-[var(--border)] pb-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label htmlFor="gpa-scale-select" className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                Grading Scale
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <select
                  id="gpa-scale-select"
                  value={selectedScaleId}
                  onChange={(e) => setSelectedScaleId(e.target.value)}
                  className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                >
                  {availableScales.map((scale) => (
                    <option key={scale.id} value={scale.id}>
                      {scale.name} (Max: {scale.maxGradePoint.toFixed(1)})
                    </option>
                  ))}
                </select>
                <span className="text-xs text-[var(--text-muted)] hidden md:inline">
                  {activeScale.notes}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                Scale Maximum
              </span>
              <span className="text-base sm:text-lg font-bold text-[var(--primary)] tabular-nums">
                {activeScale.maxGradePoint.toFixed(2)} Scale
              </span>
            </div>
          </div>

          {/* Mode Selector Tabs */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Calculation Mode
            </span>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveMode("course-gpa")}
                className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                  activeMode === "course-gpa"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                Course & Semester GPA
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("cumulative-gpa")}
                className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                  activeMode === "cumulative-gpa"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                Cumulative GPA
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("simple-gpa")}
                className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                  activeMode === "simple-gpa"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                Simple Grade List
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("weighted-gpa")}
                className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                  activeMode === "weighted-gpa"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                Weighted GPA (Honors / AP)
              </button>
            </div>
          </div>
        </div>

        {/* Main Interactive Grid */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Form Content */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {/* Mode 1 & 4: Course Table */}
            {(activeMode === "course-gpa" || activeMode === "weighted-gpa") && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {activeMode === "weighted-gpa" ? "Weighted Course Entries" : "Semester Course Entries"}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                      {activeMode === "weighted-gpa"
                        ? "Select course rigor levels to calculate weighted and unweighted GPA side-by-side."
                        : "Enter courses with letter grades and credit hours for quality points."}
                    </p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)]">
                    {courses.length} Courses
                  </span>
                </div>

                <div className="space-y-3">
                  {courses.map((course, idx) => {
                    const creditsNum = parseFloat(course.credits) || 0;
                    const gradeDef = activeScale.grades.find((g) => g.grade.toUpperCase() === course.grade.toUpperCase());
                    const gp = gradeDef?.gradePoint ?? 0;
                    const qp = gradeDef?.isNonGpa ? 0 : gp * creditsNum;

                    return (
                      <div
                        key={course.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 shadow-2xs"
                      >
                        {/* Course Name */}
                        <div className="w-full sm:w-1/3">
                          <label className="text-[11px] font-semibold text-[var(--text-muted)] block sm:hidden">
                            Course {idx + 1}
                          </label>
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => handleUpdateCourse(course.id, "name", e.target.value)}
                            placeholder={`Course ${idx + 1}`}
                            aria-label={`Course ${idx + 1} Name`}
                            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                          />
                        </div>

                        {/* Grade Dropdown / Custom Point */}
                        <div className="w-full sm:w-1/4">
                          <label className="text-[11px] font-semibold text-[var(--text-muted)] block sm:hidden">
                            Grade
                          </label>
                          {selectedScaleId === "custom" ? (
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="5"
                              value={course.grade}
                              onChange={(e) => handleUpdateCourse(course.id, "grade", e.target.value)}
                              placeholder="Grade Pt"
                              aria-label="Grade Point"
                              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                            />
                          ) : (
                            <select
                              value={course.grade}
                              onChange={(e) => handleUpdateCourse(course.id, "grade", e.target.value)}
                              aria-label={`Course ${idx + 1} Grade`}
                              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-semibold text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                            >
                              {activeScale.grades.map((g) => (
                                <option key={g.grade} value={g.grade}>
                                  {g.grade} {g.isNonGpa ? "(Non-GPA)" : `(${g.gradePoint.toFixed(1)})`}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Weighted Level Selector (Mode 4 only) */}
                        {activeMode === "weighted-gpa" && (
                          <div className="w-full sm:w-1/4">
                            <label className="text-[11px] font-semibold text-[var(--text-muted)] block sm:hidden">
                              Rigor Level
                            </label>
                            <select
                              value={course.level}
                              onChange={(e) => handleUpdateCourse(course.id, "level", e.target.value as CourseLevel)}
                              aria-label={`Course ${idx + 1} Rigor Level`}
                              className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                            >
                              <option value="regular">Regular (+0.0)</option>
                              <option value="honors">Honors (+0.5)</option>
                              <option value="ap">AP (+1.0)</option>
                              <option value="ib">IB (+1.0)</option>
                            </select>
                          </div>
                        )}

                        {/* Credits Input */}
                        <div className="w-full sm:w-1/5">
                          <label className="text-[11px] font-semibold text-[var(--text-muted)] block sm:hidden">
                            Credits
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            max="12"
                            value={course.credits}
                            onChange={(e) => handleUpdateCourse(course.id, "credits", e.target.value)}
                            placeholder="Credits"
                            aria-label={`Course ${idx + 1} Credit Hours`}
                            className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2.5 py-1.5 text-sm tabular-nums text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                          />
                        </div>

                        {/* Quality Points Readout */}
                        <div className="hidden sm:flex flex-col items-end justify-center min-w-[65px] text-right">
                          <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase">
                            QP
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-[var(--text-primary)]">
                            {formatResultNumber(qp, 2)}
                          </span>
                        </div>

                        {/* Delete Action */}
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(course.id)}
                          disabled={courses.length <= 1}
                          aria-label={`Delete ${course.name}`}
                          className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors disabled:opacity-30 disabled:hover:text-[var(--text-muted)] p-1.5"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Course Row Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddCourse}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    <span>+ Add Course</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCourses}
                    className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:underline"
                  >
                    Reset Courses
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Cumulative GPA Inputs */}
            {activeMode === "cumulative-gpa" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Cumulative GPA Progression
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    Project your updated cumulative grade point average by combining prior completed units with your current term results.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--text-primary)]">
                      Prior Cumulative GPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={activeScale.maxGradePoint}
                      value={cumulativeInputs.previousGpa}
                      onChange={(e) => setCumulativeInputs({ ...cumulativeInputs, previousGpa: e.target.value })}
                      placeholder="e.g. 3.60"
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] tabular-nums focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      Scale maximum: {activeScale.maxGradePoint.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--text-primary)]">
                      Prior Completed Credits
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={cumulativeInputs.previousCredits}
                      onChange={(e) => setCumulativeInputs({ ...cumulativeInputs, previousCredits: e.target.value })}
                      placeholder="e.g. 60"
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] tabular-nums focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      Total graded credit hours completed before this term
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--text-primary)]">
                      Current Semester GPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={activeScale.maxGradePoint}
                      value={cumulativeInputs.currentGpa}
                      onChange={(e) => setCumulativeInputs({ ...cumulativeInputs, currentGpa: e.target.value })}
                      placeholder="e.g. 3.80"
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] tabular-nums focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      GPA for the current term
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-[var(--text-primary)]">
                      Current Semester Credits
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={cumulativeInputs.currentCredits}
                      onChange={(e) => setCumulativeInputs({ ...cumulativeInputs, currentCredits: e.target.value })}
                      placeholder="e.g. 15"
                      className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-base text-[var(--text-primary)] tabular-nums focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                    />
                    <span className="text-xs text-[var(--text-muted)]">
                      Graded credit hours taken this term
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Simple Grade List UI */}
            {activeMode === "simple-gpa" && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Simple Grade List (Equal Credits)
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                    Fast calculation for uniform credit courses. Add letter grades directly to obtain an instantaneous average GPA.
                  </p>
                </div>

                {/* Explicit assumption banner */}
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 p-3.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <p className="font-semibold text-[var(--text-primary)]">
                    💡 Equal Credit Weight Assumption
                  </p>
                  <p className="mt-0.5">
                    Calculated assuming equal credit weight for each course. Have different credit hours? Switch to{" "}
                    <button
                      type="button"
                      onClick={() => setActiveMode("course-gpa")}
                      className="font-semibold text-[var(--primary)] underline focus:outline-none"
                    >
                      Course & Semester GPA →
                    </button>
                  </p>
                </div>

                {/* Current Grade List Tags */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                    Current Course Grades ({simpleGrades.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {simpleGrades.map((grade, idx) => (
                      <span
                        key={`${grade}_${idx}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--background)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] shadow-2xs"
                      >
                        <span>{grade}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSimpleGrade(idx)}
                          aria-label={`Remove ${grade}`}
                          className="text-xs text-[var(--text-muted)] hover:text-[var(--error)] transition-colors ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick Add Grade Palette */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                    Click to Add Grade
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {activeScale.grades
                      .filter((g) => !g.isNonGpa)
                      .map((g) => (
                        <button
                          key={g.grade}
                          type="button"
                          onClick={() => handleAddSimpleGrade(g.grade)}
                          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--ring)]"
                        >
                          + {g.grade}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom info banner */}
            <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                {activeScale.name} • {activeScale.verificationStatus === "standard_recognized" ? "Recognized Standard" : "Configurable"}
              </span>
              <span className="text-xs font-medium tabular-nums text-[var(--text-muted)]">
                Instant Pure Computation
              </span>
            </div>
          </div>

          {/* Right Column: Calculated Results */}
          <div className="lg:col-span-5">
            <CalculatorResult result={calculationOutput} />
          </div>
        </div>
      </div>
    </div>
  );
}
