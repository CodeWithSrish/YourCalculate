import { formatResultNumber } from "../engine/validation";
import { getGradingScaleById, isNonGpaGrade } from "./gpaScales";

export type CourseLevel = "regular" | "honors" | "ap" | "ib" | "custom";

export interface CourseInput {
  id: string;
  name?: string;
  grade: string;
  gradePoint?: number;
  credits: number;
  level?: CourseLevel;
  customBoost?: number;
}

export interface CourseBreakdownItem {
  id: string;
  name: string;
  grade: string;
  gradePoint: number;
  credits: number;
  qualityPoints: number;
  isNonGpa: boolean;
  earnedCredits: boolean;
  level?: CourseLevel;
  weightBoost?: number;
  weightedQualityPoints?: number;
}

export interface SemesterGpaOutput {
  isValid: boolean;
  gpa?: number;
  formattedGpa?: string;
  totalCredits?: number;
  gpaCredits?: number;
  earnedCredits?: number;
  totalQualityPoints?: number;
  courseBreakdown?: CourseBreakdownItem[];
  stepExplanation?: string;
  error?: string;
}

export interface SimpleGpaOutput {
  isValid: boolean;
  gpa?: number;
  formattedGpa?: string;
  totalCourses?: number;
  gpaCourses?: number;
  totalGradePoints?: number;
  stepExplanation?: string;
  error?: string;
}

export interface CumulativeGpaInput {
  previousGpa: number;
  previousCredits: number;
  currentGpa: number;
  currentCredits: number;
  maxGpa?: number;
}

export interface CumulativeGpaOutput {
  isValid: boolean;
  cumulativeGpa?: number;
  formattedCumulativeGpa?: string;
  previousQualityPoints?: number;
  currentQualityPoints?: number;
  totalQualityPoints?: number;
  totalCredits?: number;
  gpaDelta?: number;
  stepExplanation?: string;
  error?: string;
}

export interface WeightingConfig {
  regular?: number;
  honors?: number;
  ap?: number;
  ib?: number;
}

export interface WeightedGpaOutput {
  isValid: boolean;
  unweightedGpa?: number;
  weightedGpa?: number;
  formattedUnweightedGpa?: string;
  formattedWeightedGpa?: string;
  totalCredits?: number;
  gpaCredits?: number;
  unweightedQualityPoints?: number;
  weightedQualityPoints?: number;
  maxUnweightedScale?: number;
  courseBreakdown?: CourseBreakdownItem[];
  stepExplanation?: string;
  error?: string;
}

// 1. Core Course & Semester GPA Calculation
export function calculateCourseGpa(
  courses: CourseInput[],
  scaleId?: string
): SemesterGpaOutput {
  if (!courses || courses.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one course.",
    };
  }

  const scale = getGradingScaleById(scaleId);
  const gradeMap = new Map(scale.grades.map((g) => [g.grade.toUpperCase(), g]));

  let totalQualityPoints = 0;
  let gpaCredits = 0;
  let totalCredits = 0;
  let earnedCredits = 0;
  const courseBreakdown: CourseBreakdownItem[] = [];

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    const courseName = (c.name && c.name.trim()) || `Course ${i + 1}`;
    const rawGrade = (c.grade || "").trim().toUpperCase();

    // Validate credits
    if (c.credits === undefined || !Number.isFinite(c.credits) || c.credits <= 0) {
      return {
        isValid: false,
        error: `Course "${courseName}" must have credit hours greater than 0.`,
      };
    }

    const credits = c.credits;
    totalCredits += credits;

    // Check for Pass/Fail or non-GPA grade
    if (isNonGpaGrade(rawGrade)) {
      const isPass = rawGrade === "P" || rawGrade === "S";
      if (isPass) {
        earnedCredits += credits;
      }
      courseBreakdown.push({
        id: c.id,
        name: courseName,
        grade: rawGrade,
        gradePoint: 0,
        credits,
        qualityPoints: 0,
        isNonGpa: true,
        earnedCredits: isPass,
      });
      continue;
    }

    // Resolve Grade Point
    let gradePoint = 0;
    if (c.gradePoint !== undefined && Number.isFinite(c.gradePoint)) {
      gradePoint = c.gradePoint;
    } else {
      const gradeDef = gradeMap.get(rawGrade);
      if (!gradeDef) {
        return {
          isValid: false,
          error: `Invalid grade "${c.grade}" for course "${courseName}".`,
        };
      }
      gradePoint = gradeDef.gradePoint;
    }

    if (gradePoint < 0 || gradePoint > scale.maxGradePoint) {
      return {
        isValid: false,
        error: `Grade point for "${courseName}" must be between 0.0 and ${scale.maxGradePoint}.`,
      };
    }

    const qp = gradePoint * credits;
    totalQualityPoints += qp;
    gpaCredits += credits;
    if (gradePoint > 0) {
      earnedCredits += credits;
    }

    courseBreakdown.push({
      id: c.id,
      name: courseName,
      grade: rawGrade || `${gradePoint}`,
      gradePoint,
      credits,
      qualityPoints: qp,
      isNonGpa: false,
      earnedCredits: gradePoint > 0,
    });
  }

  if (gpaCredits === 0) {
    if (totalCredits > 0) {
      return {
        isValid: true,
        gpa: 0,
        formattedGpa: "N/A",
        totalCredits,
        gpaCredits: 0,
        earnedCredits,
        totalQualityPoints: 0,
        courseBreakdown,
        stepExplanation: "All courses are non-GPA credit courses (P/NP). Earned credits recorded with no GPA impact.",
      };
    }
    return {
      isValid: false,
      error: "Total GPA credit hours must be greater than 0.",
    };
  }

  const gpa = totalQualityPoints / gpaCredits;
  const formattedGpa = formatResultNumber(gpa, 2);
  const exactGpa = formatResultNumber(gpa, 4);

  return {
    isValid: true,
    gpa,
    formattedGpa,
    totalCredits,
    gpaCredits,
    earnedCredits,
    totalQualityPoints,
    courseBreakdown,
    stepExplanation: `${formatResultNumber(totalQualityPoints, 2)} Total Quality Points ÷ ${formatResultNumber(gpaCredits, 1)} Total GPA Credits = ${formattedGpa} GPA (Exact: ${exactGpa})`,
  };
}

// 2. Simple GPA Mode (Fast equal-credit calculation)
export function calculateSimpleGpa(
  grades: string[],
  scaleId?: string
): SimpleGpaOutput {
  if (!grades || grades.length === 0) {
    return {
      isValid: false,
      error: "Please enter at least one letter grade.",
    };
  }

  const scale = getGradingScaleById(scaleId);
  const gradeMap = new Map(scale.grades.map((g) => [g.grade.toUpperCase(), g]));

  let totalGradePoints = 0;
  let gpaCourses = 0;

  for (let i = 0; i < grades.length; i++) {
    const raw = (grades[i] || "").trim().toUpperCase();
    if (!raw) continue;

    if (isNonGpaGrade(raw)) {
      continue; // P/NP excluded from arithmetic GPA
    }

    const def = gradeMap.get(raw);
    if (!def) {
      return {
        isValid: false,
        error: `Grade "${grades[i]}" is not recognized under the ${scale.name}.`,
      };
    }

    totalGradePoints += def.gradePoint;
    gpaCourses += 1;
  }

  if (gpaCourses === 0) {
    return {
      isValid: false,
      error: "Please enter at least one graded course.",
    };
  }

  const gpa = totalGradePoints / gpaCourses;
  const formattedGpa = formatResultNumber(gpa, 2);

  return {
    isValid: true,
    gpa,
    formattedGpa,
    totalCourses: grades.length,
    gpaCourses,
    totalGradePoints,
    stepExplanation: `${formatResultNumber(totalGradePoints, 2)} Total Grade Points ÷ ${gpaCourses} Courses = ${formattedGpa} GPA (Calculated assuming equal credit weight for each course)`,
  };
}

// 3. Cumulative GPA Mode
export function calculateCumulativeGpa(
  input: CumulativeGpaInput
): CumulativeGpaOutput {
  const { previousGpa, previousCredits, currentGpa, currentCredits, maxGpa = 4.0 } = input;

  if (previousCredits === undefined || !Number.isFinite(previousCredits) || previousCredits <= 0) {
    return {
      isValid: false,
      error: "Previous completed credits must be greater than 0.",
    };
  }

  if (currentCredits === undefined || !Number.isFinite(currentCredits) || currentCredits <= 0) {
    return {
      isValid: false,
      error: "Current semester credits must be greater than 0.",
    };
  }

  if (previousGpa === undefined || !Number.isFinite(previousGpa) || previousGpa < 0 || previousGpa > maxGpa) {
    return {
      isValid: false,
      error: `Previous cumulative GPA must be between 0.00 and ${formatResultNumber(maxGpa, 2)}.`,
    };
  }

  if (currentGpa === undefined || !Number.isFinite(currentGpa) || currentGpa < 0 || currentGpa > maxGpa) {
    return {
      isValid: false,
      error: `Current semester GPA must be between 0.00 and ${formatResultNumber(maxGpa, 2)}.`,
    };
  }

  const prevQP = previousGpa * previousCredits;
  const currQP = currentGpa * currentCredits;
  const totalQP = prevQP + currQP;
  const totalCredits = previousCredits + currentCredits;

  const cumulativeGpa = totalQP / totalCredits;
  const formattedCumulativeGpa = formatResultNumber(cumulativeGpa, 2);
  const gpaDelta = cumulativeGpa - previousGpa;

  return {
    isValid: true,
    cumulativeGpa,
    formattedCumulativeGpa,
    previousQualityPoints: prevQP,
    currentQualityPoints: currQP,
    totalQualityPoints: totalQP,
    totalCredits,
    gpaDelta,
    stepExplanation: `[(${previousGpa} × ${previousCredits}) + (${currentGpa} × ${currentCredits})] ÷ (${previousCredits} + ${currentCredits}) = ${formatResultNumber(totalQP, 2)} ÷ ${formatResultNumber(totalCredits, 1)} = ${formattedCumulativeGpa} Cumulative GPA`,
  };
}

// 4. Weighted GPA Mode
export function calculateWeightedGpa(
  courses: CourseInput[],
  weights?: WeightingConfig,
  scaleId?: string
): WeightedGpaOutput {
  if (!courses || courses.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one course.",
    };
  }

  const scale = getGradingScaleById(scaleId);
  const gradeMap = new Map(scale.grades.map((g) => [g.grade.toUpperCase(), g]));

  const weightBoostMap: Record<CourseLevel, number> = {
    regular: weights?.regular ?? 0.0,
    honors: weights?.honors ?? 0.5,
    ap: weights?.ap ?? 1.0,
    ib: weights?.ib ?? 1.0,
    custom: 0.0,
  };

  let unweightedQP = 0;
  let weightedQP = 0;
  let gpaCredits = 0;
  let totalCredits = 0;
  const courseBreakdown: CourseBreakdownItem[] = [];

  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    const courseName = (c.name && c.name.trim()) || `Course ${i + 1}`;
    const rawGrade = (c.grade || "").trim().toUpperCase();

    if (c.credits === undefined || !Number.isFinite(c.credits) || c.credits <= 0) {
      return {
        isValid: false,
        error: `Course "${courseName}" must have credit hours greater than 0.`,
      };
    }

    const credits = c.credits;
    totalCredits += credits;

    if (isNonGpaGrade(rawGrade)) {
      courseBreakdown.push({
        id: c.id,
        name: courseName,
        grade: rawGrade,
        gradePoint: 0,
        credits,
        qualityPoints: 0,
        isNonGpa: true,
        earnedCredits: rawGrade === "P" || rawGrade === "S",
      });
      continue;
    }

    let baseGradePoint = 0;
    if (c.gradePoint !== undefined && Number.isFinite(c.gradePoint)) {
      baseGradePoint = c.gradePoint;
    } else {
      const gradeDef = gradeMap.get(rawGrade);
      if (!gradeDef) {
        return {
          isValid: false,
          error: `Invalid grade "${c.grade}" for course "${courseName}".`,
        };
      }
      baseGradePoint = gradeDef.gradePoint;
    }

    if (baseGradePoint < 0 || baseGradePoint > scale.maxGradePoint) {
      return {
        isValid: false,
        error: `Base grade point for "${courseName}" must be between 0.0 and ${scale.maxGradePoint}.`,
      };
    }

    const level: CourseLevel = c.level || "regular";
    const boost = level === "custom" ? (c.customBoost ?? 0.0) : (weightBoostMap[level] ?? 0.0);
    const weightedPoint = baseGradePoint > 0 ? baseGradePoint + boost : 0; // F usually receives no boost

    const unweightedItemQP = baseGradePoint * credits;
    const weightedItemQP = weightedPoint * credits;

    unweightedQP += unweightedItemQP;
    weightedQP += weightedItemQP;
    gpaCredits += credits;

    courseBreakdown.push({
      id: c.id,
      name: courseName,
      grade: rawGrade || `${baseGradePoint}`,
      gradePoint: baseGradePoint,
      credits,
      qualityPoints: unweightedItemQP,
      isNonGpa: false,
      earnedCredits: baseGradePoint > 0,
      level,
      weightBoost: boost,
      weightedQualityPoints: weightedItemQP,
    });
  }

  if (gpaCredits === 0) {
    return {
      isValid: false,
      error: "Total GPA credit hours must be greater than 0.",
    };
  }

  const unweightedGpa = unweightedQP / gpaCredits;
  const weightedGpa = weightedQP / gpaCredits;

  return {
    isValid: true,
    unweightedGpa,
    weightedGpa,
    formattedUnweightedGpa: formatResultNumber(unweightedGpa, 2),
    formattedWeightedGpa: formatResultNumber(weightedGpa, 2),
    totalCredits,
    gpaCredits,
    unweightedQualityPoints: unweightedQP,
    weightedQualityPoints: weightedQP,
    maxUnweightedScale: scale.maxGradePoint,
    courseBreakdown,
    stepExplanation: `Weighted Quality Points (${formatResultNumber(weightedQP, 2)}) ÷ ${formatResultNumber(gpaCredits, 1)} Total Credits = ${formatResultNumber(weightedGpa, 2)} Weighted GPA (Unweighted: ${formatResultNumber(unweightedGpa, 2)} GPA)`,
  };
}
