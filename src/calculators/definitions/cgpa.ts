import {
  CalculatorDefinition,
  CalculationOutput,
} from "../engine/types";
import { formatResultNumber } from "../engine/validation";

export interface SubjectGradeItem {
  id: string;
  name: string;
  gradePoint: number;
  credits: number;
}

export interface SemesterSGPAItem {
  id: string;
  name: string;
  sgpa: number;
  credits: number;
}

// Subject-Wise CGPA Calculation Engine
export function calculateSubjectCGPA(subjects: SubjectGradeItem[]): CalculationOutput {
  if (!subjects || subjects.length === 0) {
    return {
      isValid: false,
      error: "Add at least one valid subject.",
    };
  }

  let totalCredits = 0;
  let totalWeighted = 0;

  for (const sub of subjects) {
    if (sub.gradePoint === undefined || !Number.isFinite(sub.gradePoint) || sub.gradePoint < 0 || sub.gradePoint > 10) {
      return {
        isValid: false,
        error: "Grade point must be between 0 and 10.",
      };
    }
    if (sub.credits === undefined || !Number.isFinite(sub.credits) || sub.credits <= 0) {
      return {
        isValid: false,
        error: "Credits must be greater than 0.",
      };
    }
    totalCredits += sub.credits;
    totalWeighted += sub.gradePoint * sub.credits;
  }

  if (totalCredits <= 0) {
    return {
      isValid: false,
      error: "Total credits must be greater than 0.",
    };
  }

  const cgpa = totalWeighted / totalCredits;

  return {
    isValid: true,
    primaryValue: `${formatResultNumber(cgpa, 2)} CGPA`,
    primaryLabel: `Cumulative Grade Point Average (${subjects.length} Subjects)`,
    stepExplanation: `CGPA = \\sum(G_i \\times C_i) \\div \\sum C_i = ${formatResultNumber(totalWeighted, 2)} \\div ${formatResultNumber(totalCredits, 2)} = ${formatResultNumber(cgpa, 4)} CGPA`,
    secondaryValues: [
      { label: "Total Credits", value: formatResultNumber(totalCredits) },
      { label: "Total Weighted Points", value: formatResultNumber(totalWeighted, 2) },
      { label: "Subject Count", value: `${subjects.length}` },
      { label: "Approx. Percentage (9.5 Scale)", value: `${formatResultNumber(cgpa * 9.5, 2)}%` },
    ],
  };
}

// Semester-Wise SGPA to CGPA Calculation Engine
export function calculateSemesterCGPA(semesters: SemesterSGPAItem[]): CalculationOutput {
  if (!semesters || semesters.length === 0) {
    return {
      isValid: false,
      error: "Add at least one valid semester.",
    };
  }

  let totalCredits = 0;
  let totalWeighted = 0;

  for (const sem of semesters) {
    if (sem.sgpa === undefined || !Number.isFinite(sem.sgpa) || sem.sgpa < 0 || sem.sgpa > 10) {
      return {
        isValid: false,
        error: "SGPA must be between 0 and 10.",
      };
    }
    if (sem.credits === undefined || !Number.isFinite(sem.credits) || sem.credits <= 0) {
      return {
        isValid: false,
        error: "Credits must be greater than 0.",
      };
    }
    totalCredits += sem.credits;
    totalWeighted += sem.sgpa * sem.credits;
  }

  if (totalCredits <= 0) {
    return {
      isValid: false,
      error: "Total credits must be greater than 0.",
    };
  }

  const cgpa = totalWeighted / totalCredits;

  return {
    isValid: true,
    primaryValue: `${formatResultNumber(cgpa, 2)} CGPA`,
    primaryLabel: `Cumulative Grade Point Average (${semesters.length} Semesters)`,
    stepExplanation: `CGPA = \\sum(SGPA_i \\times C_i) \\div \\sum C_i = ${formatResultNumber(totalWeighted, 2)} \\div ${formatResultNumber(totalCredits, 2)} = ${formatResultNumber(cgpa, 4)} CGPA`,
    secondaryValues: [
      { label: "Cumulative Credits", value: formatResultNumber(totalCredits) },
      { label: "Weighted SGPA Total", value: formatResultNumber(totalWeighted, 2) },
      { label: "Completed Semesters", value: `${semesters.length}` },
      { label: "Approx. Percentage (9.5 Scale)", value: `${formatResultNumber(cgpa * 9.5, 2)}%` },
    ],
  };
}

export const cgpaCalculatorDefinition: CalculatorDefinition = {
  id: "cgpa-calculator",
  slug: "cgpa-calculator",
  name: "CGPA Calculator",
  category: "Education & Exams",
  categorySlug: "education-exams",
  shortDescription: "Calculate 10-point Indian CGPA from subject grades or credit-weighted semester SGPA scores.",
  longDescription: "A pure, deterministic academic calculation utility for Indian university and college students to calculate cumulative grade point average (CGPA) from individual subject credits or multi-semester SGPA scores.",
  icon: "🎓",
  searchKeywords: [
    "cgpa",
    "cgpa calculator",
    "calculate cgpa",
    "sgpa to cgpa",
    "sgpa",
    "indian cgpa",
    "10 point scale",
    "college cgpa",
    "semester sgpa",
    "credit weighted cgpa",
    "grade points",
    "university cgpa",
    "academic grade",
  ],
  defaultModeId: "subjects-cgpa",
  modes: [
    {
      id: "subjects-cgpa",
      name: "Subject Grades & Credits",
      description: "Compute cumulative grade point average across individual subjects weighted by course credits.",
      formulaText: "CGPA = Σ(Grade Point × Credits) ÷ Σ(Credits)",
      inputs: [],
      calculate: () => ({ isValid: false, error: "Dynamic subject computation required." }),
    },
    {
      id: "sgpa-to-cgpa",
      name: "Semester SGPA to CGPA",
      description: "Aggregate semester SGPA scores into an overall CGPA weighted by semester credit loads.",
      formulaText: "CGPA = Σ(SGPA × Semester Credits) ÷ Σ(Semester Credits)",
      inputs: [],
      calculate: () => ({ isValid: false, error: "Dynamic semester computation required." }),
    },
  ],
  formulas: [
    {
      modeId: "subjects-cgpa",
      title: "1. Subject-Wise CGPA Formula",
      formulaMath: "\\text{CGPA} = \\frac{\\sum (G_i \\times C_i)}{\\sum C_i}",
      explanation: "Multiply each subject's numeric grade point Gᵢ by its credit value Cᵢ, sum all weighted grade points, and divide by the total number of credits.",
      example: "Math (Grade 9, 4 Credits) + Physics (Grade 8, 3 Credits): (9×4 + 8×3) ÷ (4+3) = (36 + 24) ÷ 7 = 60 ÷ 7 = 8.57 CGPA.",
      whenToUse: "Use to calculate semester grade points or overall program standing when individual subject grades and credit allocations are available.",
    },
    {
      modeId: "sgpa-to-cgpa",
      title: "2. Semester SGPA to CGPA Formula",
      formulaMath: "\\text{CGPA} = \\frac{\\sum (\\text{SGPA}_i \\times C_i)}{\\sum C_i}",
      explanation: "Multiply each semester's SGPA by the total credits registered in that semester, sum the weighted semester points, and divide by the cumulative program credits.",
      example: "Sem 1 (8.0 SGPA, 20 Credits) + Sem 2 (9.0 SGPA, 24 Credits): (8.0×20 + 9.0×24) ÷ (20+24) = (160 + 216) ÷ 44 = 376 ÷ 44 = 8.55 CGPA.",
      whenToUse: "Use when you have official semester grade cards (SGPA) and need to find your ongoing cumulative CGPA across multiple semesters.",
    },
  ],
  examples: [
    {
      title: "Example 1: 4 Engineering Subjects (Unequal Credits)",
      description: "Subjects with varied credit weights (4, 4, 3, 2).",
      modeId: "subjects-cgpa",
      inputs: {},
      expectedOutput: "8.69 CGPA",
    },
    {
      title: "Example 2: 5 Subjects with Equal 3 Credits",
      description: "When all credits are identical, CGPA equals the arithmetic mean of grade points.",
      modeId: "subjects-cgpa",
      inputs: {},
      expectedOutput: "8.80 CGPA",
    },
    {
      title: "Example 3: 4 Semesters SGPA Aggregation",
      description: "Sem 1 (8.2), Sem 2 (8.6), Sem 3 (8.8), Sem 4 (9.0) with standard 22 credits per semester.",
      modeId: "sgpa-to-cgpa",
      inputs: {},
      expectedOutput: "8.65 CGPA",
    },
  ],
  faqs: [
    {
      question: "What is a CGPA calculator?",
      answer: "A CGPA calculator is an academic tool that computes your Cumulative Grade Point Average based on individual course grade points or multi-semester SGPA scores weighted by course credits on a standard 10-point grading scale.",
    },
    {
      question: "How do I calculate CGPA using a calculator?",
      answer: "To calculate CGPA, enter each subject's numeric grade point (from 0 to 10) along with its assigned credit hours, or enter each completed semester's SGPA and semester credit load. The calculator multiplies each grade by its credit weight, sums all weighted scores, and divides by the total credits.",
    },
    {
      question: "How is SGPA converted to CGPA?",
      answer: "SGPA is aggregated into CGPA by calculating a credit-weighted average across all completed semesters: Multiply each semester's SGPA by that semester's total credits, sum the products, and divide by the cumulative credit total across all semesters.",
    },
    {
      question: "How do credits affect CGPA?",
      answer: "Credits represent the relative academic weight of each course. A 4-credit course has double the influence on your final CGPA compared to a 2-credit course, meaning earning a high grade point in high-credit subjects will lift your cumulative average much more effectively.",
    },
    {
      question: "What is the multiplying factor in a CGPA calculation?",
      answer: "A multiplying factor is used when converting a 10-point CGPA into an equivalent percentage. For instance, the standard CBSE and AICTE benchmark uses a multiplier of 9.5 (Percentage = CGPA × 9.5), whereas some universities use 10× or specific formulas. Check your university's official grading guidelines for their prescribed multiplier.",
    },
    {
      question: "Can I simply average my semester SGPAs to find CGPA?",
      answer: "You can only take the simple arithmetic mean of your semester SGPAs if every semester has the exact same credit weight. When semester credit loads differ (e.g., 20 credits in Sem 1 and 24 in Sem 2), you must compute a credit-weighted average to ensure accuracy.",
    },
    {
      question: "What is the difference between SGPA and CGPA?",
      answer: "SGPA (Semester Grade Point Average) evaluates your academic performance in a single specific semester, while CGPA (Cumulative Grade Point Average) measures your overall cumulative standing across all completed semesters to date.",
    },
  ],
  relatedCalculators: [
    {
      id: "gpa-calculator",
      name: "GPA Calculator",
      category: "Education & Exams",
      slug: "/gpa-calculator",
      isAvailable: true,
    },
    {
      id: "percentage-to-cgpa-calculator",
      name: "Percentage to CGPA Calculator",
      category: "Education & Exams",
      slug: "/percentage-to-cgpa-calculator",
      isAvailable: true,
    },
    {
      id: "percentage-calculator",
      name: "Percentage Calculator",
      category: "Math",
      slug: "/percentage-calculator",
      isAvailable: true,
    },
    {
      id: "average-calculator",
      name: "Average Calculator",
      category: "Math",
      slug: "/average-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "CGPA Calculator - Calculate 10-Point CGPA & SGPA to CGPA | YourCalculate",
    description: "Free CGPA calculator for Indian universities and colleges. Calculate cumulative GPA from subject grades and credits, or convert semester SGPA to CGPA accurately.",
    canonicalPath: "/cgpa-calculator",
    keywords: [
      "cgpa calculator",
      "calculate cgpa",
      "sgpa to cgpa calculator",
      "cgpa calculator with credits",
      "cgpa calculator india",
      "college cgpa calculator",
      "semester to cgpa",
    ],
  },
};
