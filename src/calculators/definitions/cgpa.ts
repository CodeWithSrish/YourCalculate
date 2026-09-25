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
      question: "What is the difference between SGPA and CGPA?",
      answer: "SGPA (Semester Grade Point Average) measures academic performance in a single specific semester. CGPA (Cumulative Grade Point Average) represents the cumulative performance across all completed semesters, weighted by the credits earned in each semester.",
    },
    {
      question: "How is CGPA calculated from individual subjects?",
      answer: "CGPA is calculated by multiplying each subject's grade point by its course credits, adding those products together, and dividing that sum by the total credits registered. Formula: CGPA = Σ(Grade × Credits) ÷ Total Credits.",
    },
    {
      question: "Can I simply average my semester SGPAs to find CGPA?",
      answer: "You can only take the direct arithmetic average of SGPAs if every semester has the exact same number of credits. If semesters have different credit loads (e.g. 20 credits in Sem 1 and 24 credits in Sem 2), you must use credit-weighted aggregation.",
    },
    {
      question: "How do I convert CGPA to percentage?",
      answer: "In Indian education boards and universities, conversion methods vary. Under the standard CBSE/AICTE convention, Percentage = CGPA × 9.5. Some universities employ direct 10× scales (Percentage = CGPA × 10) or specific institutional formulas. Always check your university transcript guidelines.",
    },
    {
      question: "What is a good CGPA on a 10-point scale?",
      answer: "Generally, a CGPA of 8.0 or above (out of 10.0) is considered First Class with Distinction / Honors at most Indian universities and engineering institutes, while 6.5 to 7.9 is typically First Class.",
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
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "Finance",
      slug: "/emi-calculator",
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
