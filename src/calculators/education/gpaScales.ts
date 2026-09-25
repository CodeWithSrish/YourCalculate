export type GradeScaleType =
  | "standard-4-0-plus-minus"
  | "standard-4-0-letter"
  | "scale-5-0"
  | "custom";

export interface GradeDefinition {
  grade: string;
  gradePoint: number;
  isNonGpa?: boolean;      // e.g. Pass/Fail, Satisfactory/Unsatisfactory
  earnedCredit?: boolean;  // whether credits are awarded
  percentageMin?: number;  // optional profile-specific percentage threshold
  percentageMax?: number;  // optional profile-specific percentage threshold
  description?: string;
}

export interface GradingScale {
  id: string;
  name: string;
  shortName: string;
  scaleType: GradeScaleType;
  maxGradePoint: number;
  grades: GradeDefinition[];
  isStandardDefault?: boolean;
  notes: string;
  source: string;
  sourceUrl?: string;
  verificationStatus: "official" | "standard_recognized" | "custom_user";
}

export const GRADING_SCALES: Record<string, GradingScale> = {
  "standard-4-0-plus-minus": {
    id: "standard-4-0-plus-minus",
    name: "Standard 4.0 — Plus/Minus",
    shortName: "4.0 (±)",
    scaleType: "standard-4-0-plus-minus",
    maxGradePoint: 4.0,
    isStandardDefault: true,
    notes: "Standard 4.0 scale with plus/minus subdivisions widely recognized in North American and international higher education institutions.",
    source: "Standard US College Board & AACRAO Grading Guidelines",
    verificationStatus: "standard_recognized",
    grades: [
      { grade: "A+", gradePoint: 4.0, description: "Highest Distinction / Outstanding" },
      { grade: "A", gradePoint: 4.0, description: "Excellent" },
      { grade: "A-", gradePoint: 3.7, description: "Very Good" },
      { grade: "B+", gradePoint: 3.3, description: "Good / Above Average" },
      { grade: "B", gradePoint: 3.0, description: "Competent / Average" },
      { grade: "B-", gradePoint: 2.7, description: "Below Average" },
      { grade: "C+", gradePoint: 2.3, description: "Marginal Pass" },
      { grade: "C", gradePoint: 2.0, description: "Satisfactory / Minimum Pass" },
      { grade: "C-", gradePoint: 1.7, description: "Conditional Pass" },
      { grade: "D+", gradePoint: 1.3, description: "Poor" },
      { grade: "D", gradePoint: 1.0, description: "Minimum Passing" },
      { grade: "F", gradePoint: 0.0, description: "Failing" },
      { grade: "P", gradePoint: 0.0, isNonGpa: true, earnedCredit: true, description: "Pass (Credits earned, excluded from GPA)" },
      { grade: "NP", gradePoint: 0.0, isNonGpa: true, earnedCredit: false, description: "No Pass (No credit, excluded from GPA)" },
    ],
  },
  "standard-4-0-letter": {
    id: "standard-4-0-letter",
    name: "Standard 4.0 — Letter Grades",
    shortName: "4.0 (Letter)",
    scaleType: "standard-4-0-letter",
    maxGradePoint: 4.0,
    notes: "Classic 4.0 unweighted scale without plus/minus distinctions utilized by colleges and universities using discrete letter bands.",
    source: "Standard Collegiate Letter Grade System",
    verificationStatus: "standard_recognized",
    grades: [
      { grade: "A", gradePoint: 4.0, description: "Excellent (4.0)" },
      { grade: "B", gradePoint: 3.0, description: "Good (3.0)" },
      { grade: "C", gradePoint: 2.0, description: "Satisfactory (2.0)" },
      { grade: "D", gradePoint: 1.0, description: "Passing (1.0)" },
      { grade: "F", gradePoint: 0.0, description: "Failing (0.0)" },
      { grade: "P", gradePoint: 0.0, isNonGpa: true, earnedCredit: true, description: "Pass (Credits earned, excluded from GPA)" },
      { grade: "NP", gradePoint: 0.0, isNonGpa: true, earnedCredit: false, description: "No Pass (No credit, excluded from GPA)" },
    ],
  },
  "scale-5-0": {
    id: "scale-5-0",
    name: "5.0 Scale",
    shortName: "5.0 Scale",
    scaleType: "scale-5-0",
    maxGradePoint: 5.0,
    notes: "5.0 maximum grading scale employed by specific international universities, polytechnics, and honors curricula.",
    source: "International 5-Point University Grading Systems",
    verificationStatus: "standard_recognized",
    grades: [
      { grade: "A", gradePoint: 5.0, description: "Excellent (5.0)" },
      { grade: "B", gradePoint: 4.0, description: "Very Good (4.0)" },
      { grade: "C", gradePoint: 3.0, description: "Good (3.0)" },
      { grade: "D", gradePoint: 2.0, description: "Pass (2.0)" },
      { grade: "E", gradePoint: 1.0, description: "Conditional Pass (1.0)" },
      { grade: "F", gradePoint: 0.0, description: "Fail (0.0)" },
      { grade: "P", gradePoint: 0.0, isNonGpa: true, earnedCredit: true, description: "Pass (Credits earned, excluded from GPA)" },
      { grade: "NP", gradePoint: 0.0, isNonGpa: true, earnedCredit: false, description: "No Pass (No credit, excluded from GPA)" },
    ],
  },
  "custom": {
    id: "custom",
    name: "Custom Scale",
    shortName: "Custom",
    scaleType: "custom",
    maxGradePoint: 4.0,
    notes: "User-defined grading scale for non-standard institutional schemas with custom grade points.",
    source: "User Defined",
    verificationStatus: "custom_user",
    grades: [
      { grade: "A+", gradePoint: 4.0 },
      { grade: "A", gradePoint: 4.0 },
      { grade: "A-", gradePoint: 3.7 },
      { grade: "B+", gradePoint: 3.3 },
      { grade: "B", gradePoint: 3.0 },
      { grade: "B-", gradePoint: 2.7 },
      { grade: "C+", gradePoint: 2.3 },
      { grade: "C", gradePoint: 2.0 },
      { grade: "D", gradePoint: 1.0 },
      { grade: "F", gradePoint: 0.0 },
      { grade: "P", gradePoint: 0.0, isNonGpa: true, earnedCredit: true },
      { grade: "NP", gradePoint: 0.0, isNonGpa: true, earnedCredit: false },
    ],
  },
};

export function getGradingScaleById(id?: string): GradingScale {
  if (id && GRADING_SCALES[id]) {
    return GRADING_SCALES[id];
  }
  return GRADING_SCALES["standard-4-0-plus-minus"];
}

export function getAllGradingScales(): GradingScale[] {
  return Object.values(GRADING_SCALES);
}

export function isNonGpaGrade(grade: string): boolean {
  const normalized = grade.trim().toUpperCase();
  return normalized === "P" || normalized === "NP" || normalized === "S" || normalized === "U" || normalized === "W" || normalized === "AUD";
}
