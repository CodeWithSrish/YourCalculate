import {
  CalculatorDefinition,
  CalculationOutput,
} from "../engine/types";
import { formatResultNumber } from "../engine/validation";

// Mode 1: What is X% of Y?
function calculatePercentageOf(inputs: Record<string, number>): CalculationOutput {
  const percentage = inputs.percentage;
  const number = inputs.number;

  if (percentage === undefined || number === undefined || !Number.isFinite(percentage) || !Number.isFinite(number)) {
    return { isValid: false, error: "Enter a valid number." };
  }

  const result = (percentage / 100) * number;

  return {
    isValid: true,
    primaryValue: formatResultNumber(result),
    primaryLabel: `${percentage}% of ${number}`,
    stepExplanation: `(${percentage} ÷ 100) × ${number} = ${formatResultNumber(result)}`,
    secondaryValues: [
      { label: "Base Number (Y)", value: formatResultNumber(number) },
      { label: "Percentage Rate (X)", value: `${formatResultNumber(percentage)}%` },
    ],
  };
}

// Mode 2: X is what percentage of Y?
function calculateWhatPercentageOf(inputs: Record<string, number>): CalculationOutput {
  const value = inputs.value;
  const total = inputs.total;

  if (value === undefined || total === undefined || !Number.isFinite(value) || !Number.isFinite(total)) {
    return { isValid: false, error: "Enter a valid number." };
  }

  if (total === 0) {
    return {
      isValid: false,
      error: "Total cannot be 0.",
    };
  }

  const result = (value / total) * 100;

  return {
    isValid: true,
    primaryValue: `${formatResultNumber(result)}%`,
    primaryLabel: `${value} as a percentage of ${total}`,
    unit: "%",
    stepExplanation: `(${value} ÷ ${total}) × 100 = ${formatResultNumber(result)}%`,
    secondaryValues: [
      { label: "Part (X)", value: formatResultNumber(value) },
      { label: "Total (Y)", value: formatResultNumber(total) },
      { label: "Decimal Equivalent", value: formatResultNumber(value / total, 6) },
    ],
  };
}

// Mode 3: Percentage Increase from A to B
function calculatePercentageIncrease(inputs: Record<string, number>): CalculationOutput {
  const initialValue = inputs.initialValue;
  const finalValue = inputs.finalValue;

  if (initialValue === undefined || finalValue === undefined || !Number.isFinite(initialValue) || !Number.isFinite(finalValue)) {
    return { isValid: false, error: "Enter a valid number." };
  }

  if (initialValue === 0) {
    return {
      isValid: false,
      error: "Starting value cannot be 0.",
    };
  }

  const difference = finalValue - initialValue;
  const percentageIncrease = (difference / initialValue) * 100;

  return {
    isValid: true,
    primaryValue: `${formatResultNumber(percentageIncrease)}%`,
    primaryLabel: `Percentage increase from ${initialValue} to ${finalValue}`,
    unit: "%",
    stepExplanation: `((${finalValue} − ${initialValue}) ÷ ${initialValue}) × 100 = ${formatResultNumber(percentageIncrease)}%`,
    secondaryValues: [
      { label: "Absolute Difference", value: formatResultNumber(difference) },
      { label: "Starting Value (A)", value: formatResultNumber(initialValue) },
      { label: "Final Value (B)", value: formatResultNumber(finalValue) },
    ],
  };
}

// Mode 4: Percentage Decrease from A to B
function calculatePercentageDecrease(inputs: Record<string, number>): CalculationOutput {
  const initialValue = inputs.initialValue;
  const finalValue = inputs.finalValue;

  if (initialValue === undefined || finalValue === undefined || !Number.isFinite(initialValue) || !Number.isFinite(finalValue)) {
    return { isValid: false, error: "Enter a valid number." };
  }

  if (initialValue === 0) {
    return {
      isValid: false,
      error: "Starting value cannot be 0.",
    };
  }

  const difference = initialValue - finalValue;
  const percentageDecrease = (difference / initialValue) * 100;

  return {
    isValid: true,
    primaryValue: `${formatResultNumber(percentageDecrease)}%`,
    primaryLabel: `Percentage decrease from ${initialValue} to ${finalValue}`,
    unit: "%",
    stepExplanation: `((${initialValue} − ${finalValue}) ÷ ${initialValue}) × 100 = ${formatResultNumber(percentageDecrease)}%`,
    secondaryValues: [
      { label: "Absolute Reduction", value: formatResultNumber(difference) },
      { label: "Starting Value (A)", value: formatResultNumber(initialValue) },
      { label: "Final Value (B)", value: formatResultNumber(finalValue) },
    ],
  };
}

// Mode 5: Percentage Difference between A and B
function calculatePercentageDifference(inputs: Record<string, number>): CalculationOutput {
  const valueA = inputs.valueA;
  const valueB = inputs.valueB;

  if (valueA === undefined || valueB === undefined || !Number.isFinite(valueA) || !Number.isFinite(valueB)) {
    return { isValid: false, error: "Enter a valid number." };
  }

  const average = (valueA + valueB) / 2;
  if (average === 0) {
    return {
      isValid: false,
      error: "Average of both values cannot be 0.",
    };
  }

  const difference = Math.abs(valueA - valueB);
  const percentageDiff = (difference / Math.abs(average)) * 100;

  return {
    isValid: true,
    primaryValue: `${formatResultNumber(percentageDiff)}%`,
    primaryLabel: `Relative difference between ${valueA} and ${valueB}`,
    unit: "%",
    stepExplanation: `|${valueA} − ${valueB}| ÷ ((${valueA} + ${valueB}) ÷ 2) × 100 = ${formatResultNumber(percentageDiff)}%`,
    secondaryValues: [
      { label: "Absolute Difference", value: formatResultNumber(difference) },
      { label: "Average Value", value: formatResultNumber(average) },
    ],
  };
}

export const percentageCalculatorDefinition: CalculatorDefinition = {
  id: "percentage-calculator",
  slug: "percentage-calculator",
  name: "Percentage Calculator",
  category: "Math",
  categorySlug: "math",
  shortDescription: "Calculate percentage values, fractions of totals, percentage increases, decreases, and differences.",
  longDescription: "A comprehensive, deterministic utility for computing percentage values, proportional ratios, percentage change over time, and comparative differences between numbers.",
  icon: "%",
  searchKeywords: [
    "percentage",
    "percent",
    "percentage calculator",
    "increase",
    "percentage increase",
    "decrease",
    "percentage decrease",
    "discount",
    "markup",
    "ratio",
    "what percentage of",
    "calculate percentage",
  ],
  defaultModeId: "percentage-of",
  modes: [
    {
      id: "percentage-of",
      name: "What is X% of Y?",
      description: "Find the numerical value of a percentage applied to a number.",
      formulaText: "Result = (Percentage ÷ 100) × Number",
      inputs: [
        {
          id: "percentage",
          label: "Percentage (X)",
          type: "percentage",
          defaultValue: 15,
          suffix: "%",
          placeholder: "e.g. 15",
        },
        {
          id: "number",
          label: "Total / Number (Y)",
          type: "number",
          defaultValue: 850,
          placeholder: "e.g. 850",
        },
      ],
      calculate: calculatePercentageOf,
    },
    {
      id: "what-percentage-of",
      name: "X is what % of Y?",
      description: "Find the percentage that one number represents out of another.",
      formulaText: "Percentage = (Part ÷ Total) × 100",
      inputs: [
        {
          id: "value",
          label: "Part / Value (X)",
          type: "number",
          defaultValue: 20,
          placeholder: "e.g. 20",
        },
        {
          id: "total",
          label: "Whole / Total (Y)",
          type: "number",
          defaultValue: 80,
          placeholder: "e.g. 80",
        },
      ],
      calculate: calculateWhatPercentageOf,
    },
    {
      id: "percentage-increase",
      name: "Percentage Increase",
      description: "Compute the relative percentage increase from a starting value to a final value.",
      formulaText: "Increase (%) = ((Final − Initial) ÷ Initial) × 100",
      inputs: [
        {
          id: "initialValue",
          label: "Initial Value (A)",
          type: "number",
          defaultValue: 100,
          placeholder: "e.g. 100",
        },
        {
          id: "finalValue",
          label: "Final Value (B)",
          type: "number",
          defaultValue: 125,
          placeholder: "e.g. 125",
        },
      ],
      calculate: calculatePercentageIncrease,
    },
    {
      id: "percentage-decrease",
      name: "Percentage Decrease",
      description: "Compute the relative percentage reduction from an initial value to a final value.",
      formulaText: "Decrease (%) = ((Initial − Final) ÷ Initial) × 100",
      inputs: [
        {
          id: "initialValue",
          label: "Initial Value (A)",
          type: "number",
          defaultValue: 200,
          placeholder: "e.g. 200",
        },
        {
          id: "finalValue",
          label: "Final Value (B)",
          type: "number",
          defaultValue: 150,
          placeholder: "e.g. 150",
        },
      ],
      calculate: calculatePercentageDecrease,
    },
    {
      id: "percentage-difference",
      name: "Percentage Difference",
      description: "Calculate the relative difference between two positive values compared against their mean.",
      formulaText: "Difference (%) = (|A − B| ÷ ((A + B) ÷ 2)) × 100",
      inputs: [
        {
          id: "valueA",
          label: "Value A",
          type: "number",
          defaultValue: 100,
          placeholder: "e.g. 100",
        },
        {
          id: "valueB",
          label: "Value B",
          type: "number",
          defaultValue: 120,
          placeholder: "e.g. 120",
        },
      ],
      calculate: calculatePercentageDifference,
    },
  ],
  formulas: [
    {
      modeId: "percentage-of",
      title: "1. What is X% of Y?",
      formulaMath: "\\text{Result} = \\frac{X}{100} \\times Y",
      explanation: "To calculate a percentage of any number, convert the percentage rate into a decimal fraction by dividing X by 100, then multiply the resulting decimal by the target number Y.",
      example: "15% of 850: (15 ÷ 100) × 850 = 0.15 × 850 = 127.5",
      whenToUse: "Use when calculating sales discounts, tips, sales tax, commissions, interest amounts, or portion slices.",
    },
    {
      modeId: "what-percentage-of",
      title: "2. X is what percentage of Y?",
      formulaMath: "\\text{Percentage} = \\frac{X}{Y} \\times 100",
      explanation: "To determine what proportion one number represents out of a total, divide the part X by the whole total Y, then multiply by 100 to convert to percentage format.",
      example: "20 is what % of 80: (20 ÷ 80) × 100 = 0.25 × 100 = 25%",
      whenToUse: "Use for exam scores, budget allocation shares, completion progress, and statistical distribution analysis.",
    },
    {
      modeId: "percentage-increase",
      title: "3. Percentage Increase",
      formulaMath: "\\text{Increase (\\%)} = \\frac{B - A}{A} \\times 100",
      explanation: "Subtract the starting baseline value A from the final new value B, divide that difference by the starting value A, and multiply by 100 to find the relative rate of growth.",
      example: "From 100 to 125: ((125 − 100) ÷ 100) × 100 = (25 ÷ 100) × 100 = 25%",
      whenToUse: "Use for salary raises, inflation growth, revenue expansion, population growth, and investment gains.",
    },
    {
      modeId: "percentage-decrease",
      title: "4. Percentage Decrease",
      formulaMath: "\\text{Decrease (\\%)} = \\frac{A - B}{A} \\times 100",
      explanation: "Subtract the new lower value B from the original starting value A, divide that reduction by the starting value A, and multiply by 100 to calculate the drop percentage.",
      example: "From 200 to 150: ((200 − 150) ÷ 200) × 100 = (50 ÷ 200) × 100 = 25%",
      whenToUse: "Use for price markdowns, body weight loss, expense reductions, defect rate drop, and asset depreciation.",
    },
    {
      modeId: "percentage-difference",
      title: "5. Percentage Difference",
      formulaMath: "\\text{Difference (\\%)} = \\frac{|A - B|}{\\frac{A + B}{2}} \\times 100",
      explanation: "Calculate the absolute difference between two positive numbers A and B, divide that by their arithmetic average ((A + B) / 2), and multiply by 100.",
      example: "Between 100 and 120: |100 − 120| ÷ ((100 + 120) ÷ 2) × 100 = 20 ÷ 110 × 100 = 18.1818%",
      whenToUse: "Use when comparing two independent quantities where neither number is considered the baseline or original starting point.",
    },
  ],
  examples: [
    {
      title: "Example 1: 15% of 850 = 127.5",
      description: "Finding 15% discount or tax on an item priced at 850.",
      modeId: "percentage-of",
      inputs: { percentage: 15, number: 850 },
      expectedOutput: "127.5",
    },
    {
      title: "Example 2: 20 is what % of 80 = 25%",
      description: "Determining exam score proportion when answering 20 questions correctly out of 80.",
      modeId: "what-percentage-of",
      inputs: { value: 20, total: 80 },
      expectedOutput: "25%",
    },
    {
      title: "Example 3: Value increases from 100 to 125 = 25% increase",
      description: "Measuring portfolio value growth from an initial 100 to a current value of 125.",
      modeId: "percentage-increase",
      inputs: { initialValue: 100, finalValue: 125 },
      expectedOutput: "25%",
    },
    {
      title: "Example 4: Value decreases from 200 to 150 = 25% decrease",
      description: "Tracking energy bill reduction from a baseline of 200 down to 150.",
      modeId: "percentage-decrease",
      inputs: { initialValue: 200, finalValue: 150 },
      expectedOutput: "25%",
    },
    {
      title: "Example 5: Percentage difference between 100 and 120 = 18.1818%",
      description: "Comparing test readings between two lab devices measuring 100 and 120 units.",
      modeId: "percentage-difference",
      inputs: { valueA: 100, valueB: 120 },
      expectedOutput: "18.1818%",
    },
  ],
  faqs: [
    {
      question: "How do I calculate a percentage?",
      answer: "To calculate a percentage of a number, divide the percentage rate by 100 to convert it into a decimal fraction, then multiply that decimal by the total number. For example, to find 20% of 150: (20 ÷ 100) × 150 = 0.20 × 150 = 30.",
    },
    {
      question: "How do I calculate percentage increase?",
      answer: "To calculate percentage increase: subtract the starting value (A) from the final value (B), divide the resulting increase by the starting value (A), and multiply by 100. Formula: ((B − A) ÷ A) × 100.",
    },
    {
      question: "How do I calculate percentage decrease?",
      answer: "To calculate percentage decrease: subtract the final value (B) from the initial starting value (A), divide the reduction by the starting value (A), and multiply by 100. Formula: ((A − B) ÷ A) × 100.",
    },
    {
      question: "What is percentage difference?",
      answer: "Percentage difference compares the relative difference between two numbers when neither number serves as an initial or reference value. It divides the absolute difference by the average of the two numbers and multiplies by 100. Formula: (|A − B| ÷ ((A + B) ÷ 2)) × 100.",
    },
    {
      question: "What is the difference between percentage change and percentage difference?",
      answer: "Percentage change (increase/decrease) requires a chronological or reference starting point and divides by that original value. In contrast, percentage difference has no starting baseline and divides by the arithmetic mean of both numbers.",
    },
    {
      question: "How do I calculate X percent of a number?",
      answer: "Multiply the number by X, then divide by 100. For instance, to compute 15% of 850: 15 × 850 = 12,750, then 12,750 ÷ 100 = 127.5.",
    },
    {
      question: "Can I calculate percentages with decimal numbers?",
      answer: "Yes. All formulas support standard floating-point and decimal values (e.g., 7.5% of 250.50). The calculation engine processes high-precision decimals deterministically and formats outputs cleanly without rounding errors.",
    },
  ],
  relatedCalculators: [
    {
      id: "percentage-to-cgpa-calculator",
      name: "Percentage to CGPA Calculator",
      category: "Education & Exams",
      slug: "/percentage-to-cgpa-calculator",
      isAvailable: true,
    },
    {
      id: "cgpa-calculator",
      name: "CGPA Calculator",
      category: "Education & Exams",
      slug: "/cgpa-calculator",
      isAvailable: true,
    },
    {
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "Finance",
      slug: "/emi-calculator",
      isAvailable: true,
    },
    {
      id: "sip-calculator",
      name: "SIP Calculator",
      category: "Finance",
      slug: "/sip-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "Percentage Calculator - Calculate Percentages, Increase & Decrease | YourCalculate",
    description: "Free percentage calculator to quickly calculate percent of numbers, proportion, percentage increase, decrease, and difference with step-by-step formulas.",
    canonicalPath: "/percentage-calculator",
    keywords: ["percentage calculator", "calculate percentage", "percentage increase calculator", "percentage decrease calculator", "percentage difference", "what is x percent of y"],
  },
};
