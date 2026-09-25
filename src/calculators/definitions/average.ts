import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatResultNumber } from "../engine/validation";

export interface SimpleAverageResult {
  isValid: boolean;
  error?: string;
  count?: number;
  sum?: number;
  average?: number;
  formattedSum?: string;
  formattedAverage?: string;
  stepExplanation?: string;
}

export function calculateSimpleAverage(values: number[]): SimpleAverageResult {
  if (!Array.isArray(values) || values.length < 2) {
    return {
      isValid: false,
      error: "Please enter at least 2 numbers to calculate an average.",
    };
  }

  for (const v of values) {
    if (!Number.isFinite(v)) {
      return {
        isValid: false,
        error: "All entered values must be valid numbers.",
      };
    }
  }

  const count = values.length;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const average = sum / count;

  const formattedSum = formatResultNumber(sum, 4);
  const formattedAverage = formatResultNumber(average, 4);

  const stepExplanation = `Calculated arithmetic mean of ${count} numbers: (${values
    .map((v) => formatResultNumber(v, 4))
    .join(" + ")}) / ${count} = ${formattedSum} / ${count} = ${formattedAverage}.`;

  return {
    isValid: true,
    count,
    sum,
    average,
    formattedSum,
    formattedAverage,
    stepExplanation,
  };
}

export interface WeightedAverageEntry {
  value: number;
  weight: number;
}

export interface WeightedAverageResult {
  isValid: boolean;
  error?: string;
  count?: number;
  weightedSum?: number;
  totalWeight?: number;
  weightedAverage?: number;
  formattedWeightedSum?: string;
  formattedTotalWeight?: string;
  formattedWeightedAverage?: string;
  stepExplanation?: string;
}

export function calculateWeightedAverage(
  entries: WeightedAverageEntry[]
): WeightedAverageResult {
  if (!Array.isArray(entries) || entries.length < 2) {
    return {
      isValid: false,
      error: "Please enter at least 2 value and weight pairs.",
    };
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const entry of entries) {
    if (!Number.isFinite(entry.value) || !Number.isFinite(entry.weight)) {
      return {
        isValid: false,
        error: "All values and weights must be valid numbers.",
      };
    }
    if (entry.weight < 0) {
      return {
        isValid: false,
        error: "Weights cannot be negative.",
      };
    }
    weightedSum += entry.value * entry.weight;
    totalWeight += entry.weight;
  }

  if (totalWeight <= 0) {
    return {
      isValid: false,
      error: "Total weight must be greater than 0.",
    };
  }

  const weightedAverage = weightedSum / totalWeight;
  const formattedWeightedSum = formatResultNumber(weightedSum, 4);
  const formattedTotalWeight = formatResultNumber(totalWeight, 4);
  const formattedWeightedAverage = formatResultNumber(weightedAverage, 4);

  const stepExplanation = `Sum of weighted products = ${formattedWeightedSum}. Sum of weights = ${formattedTotalWeight}. Weighted Average = ${formattedWeightedSum} / ${formattedTotalWeight} = ${formattedWeightedAverage}.`;

  return {
    isValid: true,
    count: entries.length,
    weightedSum,
    totalWeight,
    weightedAverage,
    formattedWeightedSum,
    formattedTotalWeight,
    formattedWeightedAverage,
    stepExplanation,
  };
}

export function formatSimpleAverageOutput(
  result: SimpleAverageResult
): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Number of Values",
      value: String(result.count ?? 0),
    },
    {
      label: "Sum of Values",
      value: result.formattedSum || "0",
    },
    {
      label: "Calculation Type",
      value: "Arithmetic Mean",
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedAverage,
    primaryLabel: "Average (Arithmetic Mean)",
    stepExplanation: result.stepExplanation,
    disclaimer:
      "The arithmetic mean represents the central mathematical average where each value has equal weight.",
    disclaimerLabel: "Statistical Note",
    secondaryValues,
  };
}

export function formatWeightedAverageOutput(
  result: WeightedAverageResult
): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Number of Values",
      value: String(result.count ?? 0),
    },
    {
      label: "Sum of Weighted Products",
      value: result.formattedWeightedSum || "0",
    },
    {
      label: "Total Weight",
      value: result.formattedTotalWeight || "0",
    },
    {
      label: "Calculation Type",
      value: "Weighted Mean",
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedWeightedAverage,
    primaryLabel: "Weighted Average",
    stepExplanation: result.stepExplanation,
    disclaimer:
      "Calculated using non-negative weights normalized by the total sum of weights. Compatible with both percentages and raw weights.",
    disclaimerLabel: "Statistical Note",
    secondaryValues,
  };
}

export const averageCalculatorDefinition: CalculatorDefinition = {
  id: "average-calculator",
  slug: "average-calculator",
  name: "Average Calculator",
  category: "Math",
  categorySlug: "math",
  shortDescription:
    "Calculate the arithmetic mean, sum, count, and weighted average for any custom dataset or list of numbers.",
  longDescription:
    "A fast, deterministic average calculator that computes simple arithmetic means and customizable weighted averages with step-by-step mathematical breakdowns.",
  icon: "📊",
  searchKeywords: [
    "average",
    "average calculator",
    "mean",
    "mean calculator",
    "arithmetic mean",
    "calculate average",
    "average of numbers",
    "average of values",
    "weighted average",
    "weighted average calculator",
    "weighted mean",
    "calculate mean",
    "average finder",
    "find average",
  ],
  defaultModeId: "simple-average",
  modes: [
    {
      id: "simple-average",
      name: "Simple Average",
      description: "Calculate the arithmetic mean and sum for a list of numbers.",
      formulaText: "Average = Sum of values / Number of values",
      inputs: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const values: number[] = Array.isArray(inputs?.values) ? inputs.values : [];
        const result = calculateSimpleAverage(values);
        return formatSimpleAverageOutput(result);
      },
    },
    {
      id: "weighted-average",
      name: "Weighted Average",
      description: "Calculate the weighted mean using values and corresponding weights or percentages.",
      formulaText: "Weighted Average = Sum(value × weight) / Sum(weights)",
      inputs: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const entries: WeightedAverageEntry[] = Array.isArray(inputs?.entries) ? inputs.entries : [];
        const result = calculateWeightedAverage(entries);
        return formatWeightedAverageOutput(result);
      },
    },
  ],
  formulas: [
    {
      modeId: "simple-average",
      title: "1. Arithmetic Mean Formula",
      formulaMath: "\\text{Average} = \\frac{\\text{Sum of values}}{n}",
      explanation:
        "The standard arithmetic mean is calculated by summing all individual numerical values and dividing that sum by the total count of values (n).",
      example:
        "For values 10, 20, and 30: Sum = 60, Count = 3. Average = 60 / 3 = 20.00.",
      whenToUse:
        "Use when all numbers in your dataset contribute equally to the final summary metric.",
    },
    {
      modeId: "weighted-average",
      title: "2. Weighted Average Formula",
      formulaMath: "\\text{Weighted Average} = \\frac{\\text{Weighted sum}}{\\text{Total weight}}",
      explanation:
        "The weighted mean accounts for the varying relative importance of each value by multiplying each item by its weight, summing the weighted products, and dividing by the total weight sum.",
      example:
        "For values 80 (weight 40) and 90 (weight 60): Weighted Sum = (80 × 40) + (90 × 60) = 8,600. Total Weight = 100. Weighted Average = 8,600 / 100 = 86.00.",
      whenToUse:
        "Use for semester course grades with credit hours, portfolio asset allocation returns, or surveys with unequal sample sizes.",
    },
  ],
  examples: [
    {
      title: "Example 1: Basic Integer Average",
      description: "Calculate the simple arithmetic mean of 10, 20, and 30.",
      modeId: "simple-average",
      inputs: { values: [10, 20, 30] as unknown as string },
      expectedOutput: "20",
    },
    {
      title: "Example 2: Decimal Values Average",
      description: "Calculate the mean of 5, 7.5, and 10.",
      modeId: "simple-average",
      inputs: { values: [5, 7.5, 10] as unknown as string },
      expectedOutput: "7.5",
    },
    {
      title: "Example 3: Negative & Zero Numbers",
      description: "Arithmetic average of -10, 0, and 10.",
      modeId: "simple-average",
      inputs: { values: [-10, 0, 10] as unknown as string },
      expectedOutput: "0",
    },
    {
      title: "Example 4: Weighted Exam & Assignment Grades",
      description: "Score 80 with 40% weight and score 90 with 60% weight.",
      modeId: "weighted-average",
      inputs: {
        entries: [
          { value: 80, weight: 40 },
          { value: 90, weight: 60 },
        ] as unknown as string,
      },
      expectedOutput: "86",
    },
  ],
  faqs: [
    {
      question: "What is an average (arithmetic mean)?",
      answer:
        "An average, specifically the arithmetic mean, is a central statistical value calculated by adding together a group of numbers and dividing the sum by the total number of values in that group.",
    },
    {
      question: "How do you calculate a simple average?",
      answer:
        "To calculate a simple average, add all the numbers in your dataset to find the total sum, then divide that sum by the count of numbers. Formula: Average = (Sum of all values) / n.",
    },
    {
      question: "What is the difference between simple average and weighted average?",
      answer:
        "In a simple average, every number has equal importance (equal weight). In a weighted average, certain values carry more influence or importance than others (such as an exam worth 60% versus a quiz worth 40%).",
    },
    {
      question: "Do weights in a weighted average have to add up to 100%?",
      answer:
        "No. While percentage weights often add up to 100%, this calculator supports any non-negative weights (such as course credits 4, 3, 2 or test point totals). The calculation automatically normalizes by dividing by the sum of all weights.",
    },
    {
      question: "Can an average include negative numbers and zeros?",
      answer:
        "Yes. Negative numbers and zeros are fully valid in average calculations. For instance, the average of -10, 0, and 10 is exactly 0.",
    },
    {
      question: "Can I enter decimal numbers?",
      answer:
        "Yes. You can enter fractional or decimal numbers for both values and weights (such as 7.5, 3.14, or 0.25) with full floating-point precision.",
    },
    {
      question: "What is the difference between mean, median, and mode?",
      answer:
        "The mean is the mathematical average (sum divided by count). The median is the middle value when numbers are sorted in order. The mode is the value that appears most frequently in a dataset.",
    },
    {
      question: "How many numbers can I calculate at once?",
      answer:
        "You can dynamically add up to 50 rows in both Simple Average and Weighted Average modes.",
    },
  ],
  relatedCalculators: [
    {
      id: "percentage-calculator",
      name: "Percentage Calculator",
      category: "Math",
      slug: "/percentage-calculator",
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
      id: "cgpa-calculator",
      name: "CGPA Calculator",
      category: "Education & Exams",
      slug: "/cgpa-calculator",
      isAvailable: true,
    },
    {
      id: "discount-calculator",
      name: "Discount Calculator",
      category: "Finance",
      slug: "/discount-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "Average Calculator – Calculate Mean & Weighted Average | YourCalculate",
    description:
      "Free online average calculator to quickly calculate arithmetic mean, sum, and weighted averages for any list of numbers with step-by-step formulas.",
    canonicalPath: "/average-calculator",
    keywords: [
      "average calculator",
      "average",
      "mean calculator",
      "arithmetic mean",
      "calculate average",
      "weighted average calculator",
      "weighted mean",
      "find average",
    ],
  },
};
