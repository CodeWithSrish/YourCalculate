"use client";

import React, { useState } from "react";
import {
  calculateSubjectCGPA,
  calculateSemesterCGPA,
  SubjectGradeItem,
  SemesterSGPAItem,
} from "@/calculators/definitions/cgpa";
import { CalculatorResult } from "./CalculatorResult";

const INITIAL_SUBJECTS: SubjectGradeItem[] = [
  { id: "1", name: "Subject 1", gradePoint: 9, credits: 4 },
  { id: "2", name: "Subject 2", gradePoint: 8, credits: 4 },
  { id: "3", name: "Subject 3", gradePoint: 9, credits: 3 },
  { id: "4", name: "Subject 4", gradePoint: 8, credits: 3 },
  { id: "5", name: "Subject 5", gradePoint: 10, credits: 2 },
];

const INITIAL_SEMESTERS: SemesterSGPAItem[] = [
  { id: "1", name: "Semester 1", sgpa: 8.2, credits: 22 },
  { id: "2", name: "Semester 2", sgpa: 8.6, credits: 22 },
  { id: "3", name: "Semester 3", sgpa: 8.8, credits: 24 },
  { id: "4", name: "Semester 4", sgpa: 9.0, credits: 24 },
];

export function CGPACalculatorShell() {
  const [activeTab, setActiveTab] = useState<"subjects" | "semesters">("subjects");
  const [subjects, setSubjects] = useState<SubjectGradeItem[]>(INITIAL_SUBJECTS);
  const [semesters, setSemesters] = useState<SemesterSGPAItem[]>(INITIAL_SEMESTERS);

  // --- SUBJECT ACTIONS ---
  const handleAddSubject = () => {
    const nextNum = subjects.length + 1;
    setSubjects((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: `Subject ${nextNum}`,
        gradePoint: 8,
        credits: 3,
      },
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubjectChange = (
    id: string,
    field: "name" | "gradePoint" | "credits",
    value: string | number
  ) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleResetSubjects = () => {
    setSubjects(INITIAL_SUBJECTS);
  };

  // --- SEMESTER ACTIONS ---
  const handleAddSemester = () => {
    const nextNum = semesters.length + 1;
    setSemesters((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: `Semester ${nextNum}`,
        sgpa: 8.5,
        credits: 22,
      },
    ]);
  };

  const handleRemoveSemester = (id: string) => {
    if (semesters.length <= 1) return;
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSemesterChange = (
    id: string,
    field: "name" | "sgpa" | "credits",
    value: string | number
  ) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleResetSemesters = () => {
    setSemesters(INITIAL_SEMESTERS);
  };

  // Compute active result deterministically
  const currentResult =
    activeTab === "subjects"
      ? calculateSubjectCGPA(subjects)
      : calculateSemesterCGPA(semesters);

  return (
    <div className="space-y-10">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7 lg:p-9 shadow-xs">
        {/* Mode Selector Tabs */}
        <div className="border-b border-[var(--border)] pb-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Calculation Mode
          </span>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("subjects")}
              className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                activeTab === "subjects"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              Subject Grades & Credits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("semesters")}
              className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                activeTab === "semesters"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "bg-[var(--secondary)] text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]"
              }`}
            >
              Semester SGPA to CGPA
            </button>
          </div>
        </div>

        {/* Interactive Layout */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Multi-row Inputs */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            {activeTab === "subjects" ? (
              <div>
                <p className="text-[15px] sm:text-base text-[var(--text-secondary)] mb-5 leading-relaxed">
                  Enter each course or subject with its obtained grade point (0.0–10.0) and credit allocation.
                </p>

                <div className="space-y-3">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] pb-1 px-1">
                    <div className="col-span-5">Subject / Course Name</div>
                    <div className="col-span-3 text-right">Grade Point (0–10)</div>
                    <div className="col-span-3 text-right">Credits</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {subjects.map((sub, index) => (
                    <div
                      key={sub.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:p-2 sm:items-center"
                    >
                      <div className="sm:col-span-5">
                        <label className="sm:sr-only text-xs font-medium text-[var(--text-muted)] block mb-1">
                          Subject #{index + 1}
                        </label>
                        <input
                          type="text"
                          value={sub.name}
                          onChange={(e) =>
                            handleSubjectChange(sub.id, "name", e.target.value)
                          }
                          placeholder={`Subject ${index + 1}`}
                          className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="sm:sr-only text-xs font-medium text-[var(--text-muted)] block mb-1">
                          Grade Point
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={sub.gradePoint}
                          onChange={(e) =>
                            handleSubjectChange(
                              sub.id,
                              "gradePoint",
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Grade"
                          className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] text-right tabular-nums transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="sm:sr-only text-xs font-medium text-[var(--text-muted)] block mb-1">
                          Credits
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={sub.credits}
                          onChange={(e) =>
                            handleSubjectChange(
                              sub.id,
                              "credits",
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Credits"
                          className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] text-right tabular-nums transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end sm:justify-center">
                        <button
                          type="button"
                          disabled={subjects.length <= 1}
                          onClick={() => handleRemoveSubject(sub.id)}
                          aria-label={`Remove ${sub.name}`}
                          className="rounded-md p-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    + Add Subject
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSubjects}
                    className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[15px] sm:text-base text-[var(--text-secondary)] mb-5 leading-relaxed">
                  Enter your semester SGPA scores along with the total credits registered in each semester.
                </p>

                <div className="space-y-3">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] pb-1 px-1">
                    <div className="col-span-5">Semester Name</div>
                    <div className="col-span-3 text-right">SGPA (0–10)</div>
                    <div className="col-span-3 text-right">Semester Credits</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {semesters.map((sem, index) => (
                    <div
                      key={sem.id}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 sm:p-2 sm:items-center"
                    >
                      <div className="sm:col-span-5">
                        <label className="sm:sr-only text-xs font-medium text-[var(--text-muted)] block mb-1">
                          Semester #{index + 1}
                        </label>
                        <input
                          type="text"
                          value={sem.name}
                          onChange={(e) =>
                            handleSemesterChange(sem.id, "name", e.target.value)
                          }
                          placeholder={`Semester ${index + 1}`}
                          className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="sm:sr-only text-xs font-medium text-[var(--text-muted)] block mb-1">
                          SGPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={sem.sgpa}
                          onChange={(e) =>
                            handleSemesterChange(
                              sem.id,
                              "sgpa",
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="SGPA"
                          className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] text-right tabular-nums transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="sm:sr-only text-xs font-medium text-[var(--text-muted)] block mb-1">
                          Semester Credits
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={sem.credits}
                          onChange={(e) =>
                            handleSemesterChange(
                              sem.id,
                              "credits",
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                          placeholder="Credits"
                          className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text-primary)] text-right tabular-nums transition-colors focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end sm:justify-center">
                        <button
                          type="button"
                          disabled={semesters.length <= 1}
                          onClick={() => handleRemoveSemester(sem.id)}
                          aria-label={`Remove ${sem.name}`}
                          className="rounded-md p-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--secondary)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddSemester}
                    className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    + Add Semester
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSemesters}
                    className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
              <span className="text-xs sm:text-sm font-medium tabular-nums text-[var(--text-muted)]">
                Credit-Weighted Arithmetic
              </span>
              <span className="text-xs sm:text-sm font-medium tabular-nums text-[var(--text-muted)]">
                Instant Computation
              </span>
            </div>
          </div>

          {/* Right Column: Calculated Results */}
          <div className="lg:col-span-5">
            <CalculatorResult result={currentResult} />
          </div>
        </div>
      </div>
    </div>
  );
}
