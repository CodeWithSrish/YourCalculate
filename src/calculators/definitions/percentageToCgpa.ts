import {
  CalculatorDefinition,
  CalculationOutput,
} from "../engine/types";
import { formatResultNumber } from "../engine/validation";

function resolveMultiplier(inputs: Record<string, number>): {
  multiplier: number;
  methodName: string;
  formulaDescription: string;
  isCustom: boolean;
  error?: string;
} {
  const method = inputs.method;
  const customMultiplier = inputs.customMultiplier;

  // Option 1: Direct 10x method
  if (method === 10) {
    return {
      multiplier: 10,
      methodName: "Direct 10× method",
      formulaDescription: "10-Point Linear Scale (Multiplier = 10)",
      isCustom: false,
    };
  }

  // Option 2: Custom Multiplier
  if (method === 0 || method === -1) {
    if (customMultiplier === undefined || !Number.isFinite(customMultiplier) || customMultiplier <= 0) {
      return {
        multiplier: 9.5,
        methodName: "Custom multiplier",
        formulaDescription: "Custom Institutional Multiplier",
        isCustom: true,
        error: "Conversion multiplier must be greater than 0.",
      };
    }
    return {
      multiplier: customMultiplier,
      methodName: `Custom multiplier (M = ${formatResultNumber(customMultiplier)})`,
      formulaDescription: `Custom Multiplier M = ${formatResultNumber(customMultiplier)}`,
      isCustom: true,
    };
  }

  // Option 3 / Default: CBSE / 9.5 method
  return {
    multiplier: 9.5,
    methodName: "CBSE / 9.5 method",
    formulaDescription: "CBSE / AICTE 10-Point Scale (Multiplier = 9.5)",
    isCustom: false,
  };
}

// Mode 1: Percentage to CGPA
export function calculatePercentageToCgpa(inputs: Record<string, number>): CalculationOutput {
  const percentage = inputs.percentage;

  if (percentage === undefined || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    return {
      isValid: false,
      error: "Percentage must be between 0 and 100.",
    };
  }

  const { multiplier, methodName, formulaDescription, error: multiplierError } = resolveMultiplier(inputs);
  if (multiplierError) {
    return {
      isValid: false,
      error: multiplierError,
    };
  }

  const cgpa = percentage / multiplier;
  const formattedCgpa = formatResultNumber(cgpa, 2);
  const exactCgpa = formatResultNumber(cgpa, 4);
  const isScaleExceeded = cgpa > 10;

  const secondaryValues = [
    { label: "Conversion Method", value: methodName },
    { label: "Applied Formula", value: `CGPA = Percentage ÷ ${formatResultNumber(multiplier)}` },
    { label: "Calculation", value: `${formatResultNumber(percentage)} ÷ ${formatResultNumber(multiplier)} = ${exactCgpa}` },
    { label: "Rounded CGPA", value: `${formattedCgpa}` },
    { label: "Input Percentage", value: `${formatResultNumber(percentage)}%` },
    { label: "Reference Profile", value: formulaDescription },
  ];

  if (isScaleExceeded) {
    secondaryValues.push({
      label: "Scale Notice",
      value: `Exceeds standard 10.0 ceiling (${formattedCgpa} > 10.0)`,
    });
  }

  return {
    isValid: true,
    primaryValue: `${formattedCgpa} CGPA`,
    primaryLabel: `${formatResultNumber(percentage)}% converted to CGPA (${methodName})`,
    stepExplanation: isScaleExceeded
      ? `${percentage}% ÷ ${multiplier} = ${exactCgpa} (Rounded: ${formattedCgpa} CGPA — Note: mathematically exceeds 10.0 scale ceiling)`
      : `${percentage}% ÷ ${multiplier} = ${exactCgpa} (Rounded: ${formattedCgpa} CGPA)`,
    secondaryValues,
  };
}

// Mode 2: CGPA to Percentage
export function calculateCgpaToPercentage(inputs: Record<string, number>): CalculationOutput {
  const cgpa = inputs.cgpa;

  if (cgpa === undefined || !Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10) {
    return {
      isValid: false,
      error: "CGPA must be between 0 and 10.",
    };
  }

  const { multiplier, methodName, formulaDescription, error: multiplierError } = resolveMultiplier(inputs);
  if (multiplierError) {
    return {
      isValid: false,
      error: multiplierError,
    };
  }

  const percentage = cgpa * multiplier;
  const formattedPercentage = formatResultNumber(percentage, 2);

  return {
    isValid: true,
    primaryValue: `${formattedPercentage}%`,
    primaryLabel: `${formatResultNumber(cgpa)} CGPA converted to Percentage (${methodName})`,
    stepExplanation: `${cgpa} × ${multiplier} = ${formattedPercentage}%`,
    secondaryValues: [
      { label: "Conversion Method", value: methodName },
      { label: "Applied Formula", value: `Percentage = CGPA × ${formatResultNumber(multiplier)}` },
      { label: "Calculation", value: `${formatResultNumber(cgpa)} × ${formatResultNumber(multiplier)} = ${formattedPercentage}%` },
      { label: "Input CGPA", value: `${formatResultNumber(cgpa)} / 10.0` },
      { label: "Scale Maximum", value: `10.0 CGPA = ${formatResultNumber(10 * multiplier, 2)}%` },
      { label: "Reference Profile", value: formulaDescription },
    ],
  };
}

// Mode 3: Custom Conversion (User-defined Multiplier & Direction)
export function calculateCustomConversion(inputs: Record<string, number>): CalculationOutput {
  const direction = inputs.direction !== undefined ? inputs.direction : 1;
  const value = inputs.value;
  const multiplier = inputs.multiplier;

  if (multiplier === undefined || !Number.isFinite(multiplier) || multiplier <= 0) {
    return {
      isValid: false,
      error: "Conversion multiplier must be greater than 0.",
    };
  }

  if (direction === 1) {
    // Percentage to CGPA
    if (value === undefined || !Number.isFinite(value) || value < 0 || value > 100) {
      return {
        isValid: false,
        error: "Percentage must be between 0 and 100.",
      };
    }

    const cgpa = value / multiplier;
    const formattedCgpa = formatResultNumber(cgpa, 2);
    const exactCgpa = formatResultNumber(cgpa, 4);
    const isScaleExceeded = cgpa > 10;

    const secondaryValues = [
      { label: "Conversion Direction", value: "Percentage → CGPA" },
      { label: "Custom Multiplier (M)", value: `${formatResultNumber(multiplier)}` },
      { label: "Applied Formula", value: `CGPA = Percentage ÷ ${formatResultNumber(multiplier)}` },
      { label: "Calculation", value: `${formatResultNumber(value)} ÷ ${formatResultNumber(multiplier)} = ${exactCgpa}` },
      { label: "Rounded CGPA", value: `${formattedCgpa}` },
    ];

    if (isScaleExceeded) {
      secondaryValues.push({
        label: "Scale Notice",
        value: `Calculated value (${formattedCgpa}) exceeds standard 10.0 ceiling`,
      });
    }

    return {
      isValid: true,
      primaryValue: `${formattedCgpa} CGPA`,
      primaryLabel: `${formatResultNumber(value)}% converted with M = ${formatResultNumber(multiplier)}`,
      stepExplanation: `${value}% ÷ ${multiplier} = ${exactCgpa} (Rounded: ${formattedCgpa} CGPA)`,
      secondaryValues,
    };
  } else {
    // CGPA to Percentage
    if (value === undefined || !Number.isFinite(value) || value < 0 || value > 10) {
      return {
        isValid: false,
        error: "CGPA must be between 0 and 10.",
      };
    }

    const percentage = value * multiplier;
    const formattedPercentage = formatResultNumber(percentage, 2);

    return {
      isValid: true,
      primaryValue: `${formattedPercentage}%`,
      primaryLabel: `${formatResultNumber(value)} CGPA converted with M = ${formatResultNumber(multiplier)}`,
      stepExplanation: `${value} × ${multiplier} = ${formattedPercentage}%`,
      secondaryValues: [
        { label: "Conversion Direction", value: "CGPA → Percentage" },
        { label: "Custom Multiplier (M)", value: `${formatResultNumber(multiplier)}` },
        { label: "Applied Formula", value: `Percentage = CGPA × ${formatResultNumber(multiplier)}` },
        { label: "Calculation", value: `${formatResultNumber(value)} × ${formatResultNumber(multiplier)} = ${formattedPercentage}%` },
        { label: "Input CGPA", value: `${formatResultNumber(value)} / 10.0` },
      ],
    };
  }
}

export const percentageToCgpaCalculatorDefinition: CalculatorDefinition = {
  id: "percentage-to-cgpa-calculator",
  slug: "percentage-to-cgpa-calculator",
  name: "Percentage to CGPA Calculator",
  category: "Education & Exams",
  categorySlug: "education-exams",
  shortDescription: "Quickly convert percentage to CGPA and CGPA to percentage using CBSE 9.5, direct 10×, or custom university multipliers.",
  longDescription: "A fast, standalone educational converter designed for instantaneous conversion between aggregate percentage marks and 10-point CGPA. Supports CBSE / AICTE 9.5 multiplier, direct 10× scales, and custom institutional multipliers.",
  icon: "🔄",
  searchKeywords: [
    "percentage to cgpa",
    "cgpa to percentage",
    "cgpa conversion",
    "percentage cgpa",
    "percentage to cgpa calculator",
    "cgpa to percentage calculator",
    "percentage",
    "cgpa",
    "cgpa converter",
    "cbse 9.5",
    "10 point cgpa",
    "convert percentage to cgpa",
    "grade conversion",
    "85 percentage to cgpa",
    "8.5 cgpa to percentage",
  ],
  defaultModeId: "percentage-to-cgpa",
  modes: [
    {
      id: "percentage-to-cgpa",
      name: "Percentage → CGPA",
      description: "Convert an aggregate percentage score into a standard 10-point CGPA using your institution's prescribed conversion method.",
      formulaText: "CGPA = Percentage ÷ 9.5 (or Multiplier)",
      inputs: [
        {
          id: "percentage",
          label: "Your Percentage",
          type: "percentage",
          defaultValue: 85,
          suffix: "%",
          placeholder: "e.g. 85",
          min: 0,
          max: 100,
          step: 0.1,
          helperText: "Enter your aggregate percentage score (0% to 100%).",
        },
        {
          id: "method",
          label: "Conversion Method",
          type: "select",
          defaultValue: 9.5,
          options: [
            { label: "CBSE / 9.5 method", value: 9.5 },
            { label: "Direct 10× method", value: 10 },
            { label: "Custom multiplier", value: 0 },
          ],
          helperText: "Select the conversion method mandated by your board or university.",
        },
        {
          id: "customMultiplier",
          label: "Custom Multiplier (if Custom selected above)",
          type: "number",
          defaultValue: 9.5,
          placeholder: "e.g. 9.5 or 9.25",
          min: 0.01,
          step: 0.05,
          helperText: "Enter your custom multiplier (e.g. 9.5, 10, or 9.25).",
        },
      ],
      calculate: calculatePercentageToCgpa,
    },
    {
      id: "cgpa-to-percentage",
      name: "CGPA → Percentage",
      description: "Convert a cumulative grade point average (CGPA) on a 10-point scale into an equivalent percentage score.",
      formulaText: "Percentage = CGPA × 9.5 (or Multiplier)",
      inputs: [
        {
          id: "cgpa",
          label: "Your CGPA",
          type: "number",
          defaultValue: 8.7,
          placeholder: "e.g. 8.7",
          min: 0,
          max: 10,
          step: 0.01,
          helperText: "Enter your CGPA on a 10-point scale (0.00 to 10.00).",
        },
        {
          id: "method",
          label: "Conversion Method",
          type: "select",
          defaultValue: 9.5,
          options: [
            { label: "CBSE / 9.5 method", value: 9.5 },
            { label: "Direct 10× method", value: 10 },
            { label: "Custom multiplier", value: 0 },
          ],
          helperText: "Select the conversion method mandated by your board or university.",
        },
        {
          id: "customMultiplier",
          label: "Custom Multiplier (if Custom selected above)",
          type: "number",
          defaultValue: 9.5,
          placeholder: "e.g. 9.5 or 9.25",
          min: 0.01,
          step: 0.05,
          helperText: "Enter your custom multiplier (e.g. 9.5, 10, or 9.25).",
        },
      ],
      calculate: calculateCgpaToPercentage,
    },
    {
      id: "custom-conversion",
      name: "Custom Conversion",
      description: "Convert in either direction using a custom institutional multiplier or university-specific formula.",
      formulaText: "Percentage = CGPA × Multiplier  |  CGPA = Percentage ÷ Multiplier",
      inputs: [
        {
          id: "direction",
          label: "Conversion Direction",
          type: "select",
          defaultValue: 1,
          options: [
            { label: "Percentage → CGPA (Divide by Multiplier)", value: 1 },
            { label: "CGPA → Percentage (Multiply by Multiplier)", value: 2 },
          ],
        },
        {
          id: "value",
          label: "Score / Grade Value",
          type: "number",
          defaultValue: 85,
          placeholder: "e.g. 85",
          min: 0,
          step: 0.01,
          helperText: "Enter the percentage (0–100) or CGPA (0–10) to convert.",
        },
        {
          id: "multiplier",
          label: "Conversion Multiplier (M)",
          type: "number",
          defaultValue: 9.5,
          placeholder: "e.g. 9.5, 10, or 9.25",
          min: 0.01,
          step: 0.05,
          helperText: "Enter your board or university's prescribed conversion factor (e.g. 9.5, 10.0, 9.25).",
        },
      ],
      calculate: calculateCustomConversion,
    },
  ],
  formulas: [
    {
      modeId: "percentage-to-cgpa",
      title: "1. Percentage to CGPA Formula",
      formulaMath: "\\text{CGPA} = \\frac{\\text{Percentage}}{M}",
      explanation: "Under the standard CBSE / 9.5 method, divide the overall percentage marks by 9.5. For example, 85% translates to 85 ÷ 9.5 = 8.95 CGPA. Under a direct 10× scale, divide by 10 (85 ÷ 10 = 8.5 CGPA).",
      example: "85% score with CBSE / 9.5 method: 85 ÷ 9.5 = 8.9474... ≈ 8.95 CGPA.",
      whenToUse: "Widely used by CBSE class 10/12 students, AICTE colleges, and universities that prescribe a standard 9.5 or 10× conversion factor.",
    },
    {
      modeId: "cgpa-to-percentage",
      title: "2. CGPA to Percentage Formula",
      formulaMath: "\\text{Percentage} = \\text{CGPA} \\times M",
      explanation: "Under the CBSE / 9.5 method, multiply your 10-point CGPA by 9.5 to determine the equivalent percentage marks. Under a direct 10× method, multiply by 10.",
      example: "8.7 CGPA with CBSE / 9.5 method: 8.7 × 9.5 = 82.65%.",
      whenToUse: "Use when job applications, university admission portals, competitive exam forms, or scholarship programs require an aggregate percentage score.",
    },
    {
      modeId: "custom-conversion",
      title: "3. Custom Multiplier Formula",
      formulaMath: "\\text{CGPA} = \\frac{\\text{Percentage}}{M} \\quad | \\quad \\text{Percentage} = \\text{CGPA} \\times M",
      explanation: "Many universities and autonomous institutions define custom conversion multipliers (such as M = 10, M = 9.25, M = 8.9, or piecewise formulas). Replace M with your board's certified multiplier.",
      example: "With custom multiplier M = 10: 85% = 85 ÷ 10 = 8.5 CGPA; 8.5 CGPA = 8.5 × 10 = 85.0%.",
      whenToUse: "Use for universities that employ specific conversion ordinances (such as VTU, Mumbai University, Anna University, or direct 10× scales).",
    },
  ],
  examples: [
    {
      title: "Example 1: 85% to CGPA (CBSE / 9.5 method)",
      description: "Converting an 85% score to a 10-point CGPA using the standard 9.5 multiplier.",
      modeId: "percentage-to-cgpa",
      inputs: { percentage: 85, method: 9.5, customMultiplier: 9.5 },
      expectedOutput: "8.95 CGPA",
    },
    {
      title: "Example 2: 90% to CGPA (CBSE / 9.5 method)",
      description: "Converting a distinction score of 90% into CGPA using the 9.5 multiplier.",
      modeId: "percentage-to-cgpa",
      inputs: { percentage: 90, method: 9.5, customMultiplier: 9.5 },
      expectedOutput: "9.47 CGPA",
    },
    {
      title: "Example 3: 8.7 CGPA to Percentage (CBSE / 9.5 method)",
      description: "Converting an 8.7 CGPA to equivalent percentage.",
      modeId: "cgpa-to-percentage",
      inputs: { cgpa: 8.7, method: 9.5, customMultiplier: 9.5 },
      expectedOutput: "82.65%",
    },
    {
      title: "Example 4: 8.5 CGPA to Percentage (CBSE / 9.5 method)",
      description: "Converting a first-class 8.5 CGPA to percentage score.",
      modeId: "cgpa-to-percentage",
      inputs: { cgpa: 8.5, method: 9.5, customMultiplier: 9.5 },
      expectedOutput: "80.75%",
    },
    {
      title: "Example 5: 85% to CGPA (Direct 10× method)",
      description: "Direct linear conversion on a 10-point scale.",
      modeId: "percentage-to-cgpa",
      inputs: { percentage: 85, method: 10, customMultiplier: 9.5 },
      expectedOutput: "8.50 CGPA",
    },
    {
      title: "Example 6: Custom Multiplier (85% with M = 9.25)",
      description: "Converting with university-specific multiplier M = 9.25.",
      modeId: "custom-conversion",
      inputs: { direction: 1, value: 85, multiplier: 9.25 },
      expectedOutput: "9.19 CGPA",
    },
  ],
  faqs: [
    {
      question: "How do I convert percentage to CGPA?",
      answer: "Under the standard CBSE / 9.5 method, divide your aggregate percentage marks by 9.5 (CGPA = Percentage ÷ 9.5). For example, 85% ÷ 9.5 = 8.95 CGPA. Under a direct 10× scale, divide by 10 (85% ÷ 10 = 8.50 CGPA). If your institution mandates a custom multiplier M, divide by that factor.",
    },
    {
      question: "How do I convert CGPA to percentage?",
      answer: "Under the standard CBSE / 9.5 method, multiply your 10-point CGPA by 9.5 (Percentage = CGPA × 9.5). For example, 8.7 CGPA × 9.5 = 82.65%, and 8.5 CGPA × 9.5 = 80.75%. Under a direct 10× scale, multiply by 10 (8.5 × 10 = 85.0%).",
    },
    {
      question: "How does the 9.5 CGPA-to-percentage method work?",
      answer: "If your school, board, or academic authority instructs you to use the 9.5 method (such as CBSE or AICTE guidelines), you can apply the supported formulas: Percentage = CGPA × 9.5 and CGPA = Percentage ÷ 9.5. This conversion is derived from historical mark distributions on a 10-point scale, but it is not universally mandated across all institutions. Always confirm with your official transcript instructions before submitting official forms.",
    },
    {
      question: "How do I convert SGPA to percentage?",
      answer: "SGPA-to-percentage conversion depends on the grading rules used by your institution. If your institution specifies a direct multiplier or another formula, use that prescribed method. YourCalculate can perform the mathematical conversion when you provide the applicable multiplier via the Custom Conversion mode.",
    },
    {
      question: "Is the 9.5 multiplier universally used by all Indian universities?",
      answer: "No. Grade conversion policies vary across Indian boards and universities. While CBSE, Kendriya Vidyalayas, and many engineering colleges follow 9.5, other autonomous universities employ direct 10× scales or specific polynomial formulas. Always verify the authorized formula with your university registrar.",
    },
    {
      question: "What is 85 percentage in CGPA?",
      answer: "Using the standard 9.5 multiplier, 85% equals 85 ÷ 9.5 = 8.95 CGPA on a standard 10-point scale. Under the direct 10× method, 85% equals 8.50 CGPA.",
    },
    {
      question: "What is 8.5 CGPA in percentage?",
      answer: "Using the 9.5 multiplier, 8.5 CGPA equals 8.5 × 9.5 = 80.75%. Under the direct 10× method, 8.5 CGPA equals 85.00%.",
    },
    {
      question: "Can I use a custom multiplier for my university?",
      answer: "Yes. Select 'Custom multiplier' from the conversion method dropdown or navigate to the 'Custom Conversion' tab to input your institution's certified multiplier M (such as 10.0, 9.25, or 8.9).",
    },
    {
      question: "What is the difference between this converter and the full CGPA Calculator?",
      answer: "This standalone converter performs direct mathematical conversions between aggregate percentage marks and CGPA scores. If you need to calculate your semester SGPA or cumulative CGPA from individual course grades and credit hours, use the full CGPA Calculator (/cgpa-calculator).",
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
      id: "gpa-calculator",
      name: "GPA Calculator",
      category: "Education & Exams",
      slug: "/gpa-calculator",
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
    title: "Percentage to CGPA Calculator - Convert Percentage ↔ CGPA | YourCalculate",
    description: "Convert percentage to CGPA and CGPA to percentage using CBSE 9.5, direct 10×, or custom university multipliers with step-by-step formula calculations.",
    canonicalPath: "/percentage-to-cgpa-calculator",
    keywords: [
      "percentage to cgpa",
      "cgpa to percentage",
      "percentage to cgpa calculator",
      "cgpa to percentage calculator",
      "85 percentage to cgpa",
      "8.5 cgpa to percentage",
      "8.7 cgpa to percentage",
      "cbse percentage to cgpa",
      "10 point cgpa converter",
    ],
  },
};
