import {
  CalculatorDefinition,
  CalculationOutput,
} from "../engine/types";
import { formatResultNumber } from "../engine/validation";
import { calculateCumulativeGpa } from "../education/gpaEngine";

export const gpaCalculatorDefinition: CalculatorDefinition = {
  id: "gpa-calculator",
  slug: "gpa-calculator",
  name: "GPA Calculator",
  category: "Education & Exams",
  categorySlug: "education-exams",
  shortDescription: "Calculate course, semester, cumulative, and weighted GPA using credit hours and your chosen grading scale.",
  longDescription: "A pure, deterministic International GPA calculator designed for university, college, and high school students. Computes course-by-course quality points, semester GPA, multi-term cumulative GPA, and weighted Honors/AP/IB scales.",
  icon: "📚",
  searchKeywords: [
    "gpa",
    "gpa calculator",
    "calculate gpa",
    "4.0 gpa",
    "college gpa",
    "semester gpa",
    "cumulative gpa",
    "cum gpa",
    "cum-gpa",
    "weighted gpa",
    "honors gpa",
    "ap gpa",
    "quality points",
    "credit hours",
    "grade point average",
    "high school gpa",
  ],
  defaultModeId: "course-gpa",
  modes: [
    {
      id: "course-gpa",
      name: "Course & Semester GPA",
      description: "Enter your courses, letter grades, and credit hours to calculate your semester GPA and total quality points.",
      formulaText: "GPA = Σ(Grade Point × Credits) ÷ Σ(Credits)",
      inputs: [
        {
          id: "totalQualityPoints",
          label: "Total Quality Points (Q)",
          type: "number",
          defaultValue: 49.0,
          min: 0,
          step: 0.1,
          placeholder: "e.g. 49.0",
          helperText: "Sum of (Grade Point × Credits) across all semester courses.",
        },
        {
          id: "totalCredits",
          label: "Total Credit Hours (C)",
          type: "number",
          defaultValue: 14.0,
          min: 0.5,
          step: 0.5,
          placeholder: "e.g. 14.0",
          helperText: "Sum of credit hours for all GPA-graded courses.",
        },
      ],
      calculate: (inputs: Record<string, number>): CalculationOutput => {
        const qp = inputs.totalQualityPoints;
        const credits = inputs.totalCredits;

        if (qp === undefined || !Number.isFinite(qp) || qp < 0) {
          return { isValid: false, error: "Total Quality Points must be 0 or greater." };
        }
        if (credits === undefined || !Number.isFinite(credits) || credits <= 0) {
          return { isValid: false, error: "Total Credit Hours must be greater than 0." };
        }

        const gpa = qp / credits;
        const formattedGpa = formatResultNumber(gpa, 2);
        const exactGpa = formatResultNumber(gpa, 4);

        return {
          isValid: true,
          primaryValue: `${formattedGpa} GPA`,
          primaryLabel: `Calculated from ${formatResultNumber(credits, 1)} credit hours`,
          stepExplanation: `${formatResultNumber(qp, 2)} Total Quality Points ÷ ${formatResultNumber(credits, 1)} Total Credits = ${formattedGpa} GPA (Exact: ${exactGpa})`,
          secondaryValues: [
            { label: "Total Quality Points", value: formatResultNumber(qp, 2) },
            { label: "Total Credit Hours", value: formatResultNumber(credits, 1) },
            { label: "Exact GPA Value", value: exactGpa },
            { label: "Calculation Method", value: "Credit-Weighted Quality Points" },
          ],
        };
      },
    },
    {
      id: "cumulative-gpa",
      name: "Cumulative GPA",
      description: "Combine your previous cumulative GPA and completed credits with your current semester performance to project your updated cumulative GPA.",
      formulaText: "Cumulative GPA = [(Prior GPA × Prior Credits) + (Current GPA × Current Credits)] ÷ Total Credits",
      inputs: [
        {
          id: "previousGpa",
          label: "Prior Cumulative GPA",
          type: "number",
          defaultValue: 3.6,
          min: 0,
          max: 5.0,
          step: 0.01,
          placeholder: "e.g. 3.60",
          helperText: "Your existing cumulative GPA prior to this semester.",
        },
        {
          id: "previousCredits",
          label: "Prior Completed Credits",
          type: "number",
          defaultValue: 60,
          min: 1,
          step: 1,
          placeholder: "e.g. 60",
          helperText: "Total graded credit hours completed prior to this semester.",
        },
        {
          id: "currentGpa",
          label: "Current Semester GPA",
          type: "number",
          defaultValue: 3.8,
          min: 0,
          max: 5.0,
          step: 0.01,
          placeholder: "e.g. 3.80",
          helperText: "Your GPA for the current semester.",
        },
        {
          id: "currentCredits",
          label: "Current Semester Credits",
          type: "number",
          defaultValue: 15,
          min: 1,
          step: 1,
          placeholder: "e.g. 15",
          helperText: "Total graded credit hours in the current semester.",
        },
      ],
      calculate: (inputs: Record<string, number>): CalculationOutput => {
        const res = calculateCumulativeGpa({
          previousGpa: inputs.previousGpa,
          previousCredits: inputs.previousCredits,
          currentGpa: inputs.currentGpa,
          currentCredits: inputs.currentCredits,
        });

        if (!res.isValid || res.cumulativeGpa === undefined) {
          return { isValid: false, error: res.error || "Please enter valid cumulative inputs." };
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
            { label: "Prior Cumulative Record", value: `${formatResultNumber(inputs.previousGpa, 2)} GPA (${inputs.previousCredits} cr)` },
            { label: "Current Semester Record", value: `${formatResultNumber(inputs.currentGpa, 2)} GPA (${inputs.currentCredits} cr)` },
            { label: "GPA Delta (Change)", value: deltaFormatted },
          ],
        };
      },
    },
    {
      id: "simple-gpa",
      name: "Simple Grade List",
      description: "Quick calculation for equal-credit courses. Enter average grade points to obtain an immediate GPA.",
      formulaText: "GPA = Σ(Grade Points) ÷ Number of Courses",
      inputs: [
        {
          id: "totalGradePoints",
          label: "Sum of Grade Points",
          type: "number",
          defaultValue: 14.0,
          min: 0,
          step: 0.1,
          placeholder: "e.g. 14.0",
          helperText: "Sum of numeric grade points (e.g. A=4.0, A-=3.7, B+=3.3, B=3.0 -> 14.0).",
        },
        {
          id: "totalCourses",
          label: "Number of Graded Courses",
          type: "number",
          defaultValue: 4,
          min: 1,
          step: 1,
          placeholder: "e.g. 4",
          helperText: "Number of courses assuming equal credit weight.",
        },
      ],
      calculate: (inputs: Record<string, number>): CalculationOutput => {
        const gp = inputs.totalGradePoints;
        const count = inputs.totalCourses;

        if (gp === undefined || !Number.isFinite(gp) || gp < 0) {
          return { isValid: false, error: "Sum of Grade Points must be 0 or greater." };
        }
        if (count === undefined || !Number.isFinite(count) || count <= 0) {
          return { isValid: false, error: "Number of courses must be at least 1." };
        }

        const gpa = gp / count;
        const formattedGpa = formatResultNumber(gpa, 2);

        return {
          isValid: true,
          primaryValue: `${formattedGpa} GPA`,
          primaryLabel: `Calculated assuming equal credit weight across ${count} courses`,
          stepExplanation: `${formatResultNumber(gp, 2)} Total Grade Points ÷ ${count} Courses = ${formattedGpa} GPA`,
          secondaryValues: [
            { label: "Total Grade Points", value: formatResultNumber(gp, 2) },
            { label: "Number of Courses", value: `${count}` },
            { label: "Credit Weighting Assumption", value: "Equal 1.0 credit per course" },
          ],
        };
      },
    },
  ],
  formulas: [
    {
      modeId: "course-gpa",
      title: "1. Quality Points & Semester GPA Formula",
      formulaMath: "\\text{GPA} = \\frac{\\sum_{i=1}^{n} (\\text{Grade Point}_i \\times \\text{Credits}_i)}{\\sum_{i=1}^{n} \\text{Credits}_i} = \\frac{\\text{Total Quality Points}}{\\text{Total Credit Hours}}",
      explanation: "Each course's letter grade maps to a numeric grade point value on your chosen grading scale. Multiply each grade point by the course credit hours to find Quality Points ($Q_i = G_i \\times C_i$). Sum all quality points and divide by total GPA credit hours.",
      example: "4 courses: Calculus (A-, 3.7 × 4 cr = 14.8 QP), Physics (B+, 3.3 × 4 cr = 13.2 QP), Literature (A, 4.0 × 3 cr = 12.0 QP), History (B, 3.0 × 3 cr = 9.0 QP). Total QP = 49.0; Total Credits = 14.0. GPA = 49.0 ÷ 14.0 = 3.50 GPA.",
      whenToUse: "Standard methodology used by universities and colleges worldwide for semester and term grade point averages.",
    },
    {
      modeId: "cumulative-gpa",
      title: "2. Cumulative GPA Formula",
      formulaMath: "\\text{Cumulative GPA} = \\frac{(\\text{GPA}_{\\text{prior}} \\times C_{\\text{prior}}) + (\\text{GPA}_{\\text{current}} \\times C_{\\text{current}})}{C_{\\text{prior}} + C_{\\text{current}}}",
      explanation: "To combine your prior multi-semester academic history with your current semester performance without re-entering all past courses, weight each GPA by its respective completed credit hours.",
      example: "Prior record of 3.60 GPA on 60 credits + Current semester of 3.80 GPA on 15 credits. New Cumulative GPA = [(3.60 × 60) + (3.80 × 15)] ÷ (60 + 15) = (216 + 57) ÷ 75 = 273 ÷ 75 = 3.64 Cumulative GPA.",
      whenToUse: "Use when projecting your updated graduation standing, scholarship eligibility, or academic honor qualifications.",
    },
    {
      modeId: "weighted-gpa",
      title: "3. Weighted GPA Formula (Honors / AP / IB)",
      formulaMath: "\\text{Weighted GPA} = \\frac{\\sum_{i=1}^{n} [(\\text{Base Grade Point}_i + \\text{Weight Boost}_i) \\times \\text{Credits}_i]}{\\sum_{i=1}^{n} \\text{Credits}_i}",
      explanation: "In weighted high school systems, rigorous coursework receives a point boost (e.g. +0.5 for Honors courses, +1.0 for Advanced Placement / International Baccalaureate courses) above the standard 4.0 unweighted ceiling.",
      example: "With A (4.0 base): Regular (4.0 × 3cr = 12 QP), Honors (4.5 × 3cr = 13.5 QP), AP (5.0 × 3cr = 15 QP). Total Weighted QP = 40.5 ÷ 9cr = 4.50 Weighted GPA (vs 4.00 Unweighted).",
      whenToUse: "Widely utilized in US high school transcripts and selective college admissions.",
    },
  ],
  examples: [
    {
      title: "Example 1: Standard College Semester (4.0 Scale)",
      description: "Calculating a standard full-time semester with 4 courses and 14 credit hours.",
      modeId: "course-gpa",
      inputs: { totalQualityPoints: 49.0, totalCredits: 14.0 },
      expectedOutput: "3.50 GPA",
    },
    {
      title: "Example 2: Dean's List Distinction Semester",
      description: "16 credit hours with straight A and A- grades totaling 62.4 Quality Points.",
      modeId: "course-gpa",
      inputs: { totalQualityPoints: 62.4, totalCredits: 16.0 },
      expectedOutput: "3.90 GPA",
    },
    {
      title: "Example 3: Cumulative GPA Progression",
      description: "Updating a 3.60 GPA (60 credits) with a 3.80 semester (15 credits).",
      modeId: "cumulative-gpa",
      inputs: { previousGpa: 3.6, previousCredits: 60, currentGpa: 3.8, currentCredits: 15 },
      expectedOutput: "3.64 Cumulative GPA",
    },
    {
      title: "Example 4: Equal-Credit Quick Calculation",
      description: "4 courses with grades [A (4.0), A- (3.7), B+ (3.3), B (3.0)].",
      modeId: "simple-gpa",
      inputs: { totalGradePoints: 14.0, totalCourses: 4 },
      expectedOutput: "3.50 GPA",
    },
  ],
  faqs: [
    {
      question: "What is GPA and how is it calculated?",
      answer: "Grade Point Average (GPA) is a standardized measure of academic achievement used in higher education and secondary schools. It is calculated by converting letter grades into numeric grade points, multiplying each grade point by the course credit hours to obtain Quality Points, and dividing the total quality points by total credit hours.",
    },
    {
      question: "What is the difference between GPA and Indian CGPA?",
      answer: "GPA is typically computed on a 4.0 (or 5.0) scale using credit hours and quality points, and is standard in North American and international universities. Indian CGPA (Cumulative Grade Point Average) is an academic metric operating on a 10-point scale governed by UGC/AICTE credit framework. They are distinct systems with different grading curves and credit weights.",
    },
    {
      question: "How do Pass / Fail (P/NP or S/U) courses affect GPA?",
      answer: "Pass/Fail or Satisfactory/Unsatisfactory courses do not contribute numeric grade points and are excluded from the GPA denominator (total quality points and GPA credits). When passed, they award earned degree credits toward graduation requirements without lowering or raising your GPA.",
    },
    {
      question: "What is a good GPA on a 4.0 scale?",
      answer: "On a standard 4.0 scale: 3.7 to 4.0 is generally considered Magna/Summa Cum Laude distinction (A/A-), 3.5 to 3.7 is Honors (Dean's List), 3.0 to 3.4 is good standing (B average), and 2.0 is usually the minimum threshold required for undergraduate graduation.",
    },
    {
      question: "How does Cumulative GPA differ from Semester GPA?",
      answer: "Semester GPA represents your academic performance during a single academic term (e.g. Fall semester). Cumulative GPA represents your aggregate performance across all semesters and credit hours completed throughout your degree program.",
    },
    {
      question: "What is the difference between Weighted and Unweighted GPA?",
      answer: "Unweighted GPA calculates all courses on the same scale (usually 4.0 max), regardless of difficulty. Weighted GPA awards extra point boost (such as +0.5 for Honors courses, +1.0 for AP or IB courses) to reflect academic rigor, allowing GPAs above 4.0.",
    },
    {
      question: "How do decimal credit hours (e.g. 1.5 or 0.5) work?",
      answer: "Courses with non-integer credits (like 1.5-credit lab sessions or 0.5-credit workshops) are factored proportionally into the quality points formula: Grade Point × 1.5 credits = Quality Points.",
    },
    {
      question: "Can I convert Percentage to GPA directly?",
      answer: "Direct percentage-to-GPA conversion requires referencing the official grading rubric of your institution or a credential evaluation service (such as WES). To calculate Indian 10-point CGPA from percentage, use our standalone Percentage to CGPA Converter (/percentage-to-cgpa-calculator).",
    },
    {
      question: "Is the 4.0 scale universal across all international universities?",
      answer: "No. While the 4.0 scale with plus/minus subdivisions is the most widely adopted standard in the US, Canada, and many international institutions, some universities use 4.33 scales, 5.0 scales, 7.0 scales, or British honours classification systems (First Class, 2:1, 2:2).",
    },
    {
      question: "How do I calculate GPA if all my courses have equal credits?",
      answer: "If all courses have the same credit value (e.g., 3 credits each), you can use the Simple Grade List tab to take the arithmetic mean of your numeric grade points by adding them together and dividing by the number of courses.",
    },
  ],
  relatedCalculators: [
    {
      id: "cgpa-calculator",
      name: "CGPA Calculator",
      category: "Education & Exams",
      slug: "/cgpa-calculator",
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
    title: "GPA Calculator - Calculate Course, Semester & Cumulative GPA | YourCalculate",
    description: "Free international GPA calculator with credit hours, cumulative GPA projection, weighted Honors/AP calculations, and standard 4.0 scale quality points.",
    canonicalPath: "/gpa-calculator",
    keywords: [
      "gpa calculator",
      "college gpa calculator",
      "semester gpa calculator",
      "cumulative gpa calculator",
      "4.0 gpa calculator",
      "weighted gpa calculator",
      "gpa calculator with credits",
      "high school gpa calculator",
      "international gpa calculator",
    ],
  },
};
