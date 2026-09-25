import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatResultNumber, formatINR } from "../engine/validation";

// Helper for Euclidean greatest common divisor
export function calculateGCD(a: number, b: number): number {
  let x = Math.round(Math.abs(a));
  let y = Math.round(Math.abs(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x || 1;
}

// Helper to normalize decimal numbers into integer pair for exact GCD calculation
export function normalizeDecimalPair(a: number, b: number): { intA: number; intB: number; multiplier: number } {
  const getDecimalPlaces = (num: number): number => {
    const s = num.toString();
    if (s.includes("e-")) {
      const parts = s.split("e-");
      return parseInt(parts[1], 10);
    }
    const idx = s.indexOf(".");
    return idx === -1 ? 0 : s.length - idx - 1;
  };

  const decA = getDecimalPlaces(a);
  const decB = getDecimalPlaces(b);
  const maxDecimals = Math.min(Math.max(decA, decB), 6); // capped at 6 to avoid float precision noise
  const multiplier = Math.pow(10, maxDecimals);

  const intA = Math.round(a * multiplier);
  const intB = Math.round(b * multiplier);

  return { intA, intB, multiplier };
}

// ==========================================
// 1. SIMPLIFY RATIO
// ==========================================

export interface SimplifiedRatioResult {
  isValid: boolean;
  error?: string;
  originalA?: number;
  originalB?: number;
  simplifiedA?: number;
  simplifiedB?: number;
  simplifiedRatio?: string;
  gcd?: number;
  decimalValue?: number;
  formattedDecimal?: string;
  stepExplanation?: string;
}

export function calculateSimplifiedRatio(a: number, b: number): SimplifiedRatioResult {
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return { isValid: false, error: "Please enter valid numeric values for both ratio terms." };
  }

  if (a <= 0 || b <= 0) {
    return { isValid: false, error: "Ratio terms must be positive numbers greater than 0." };
  }

  const { intA, intB } = normalizeDecimalPair(a, b);
  const gcd = calculateGCD(intA, intB);

  const simplifiedA = intA / gcd;
  const simplifiedB = intB / gcd;
  const simplifiedRatio = `${simplifiedA} : ${simplifiedB}`;
  const decimalValue = a / b;
  const formattedDecimal = formatResultNumber(decimalValue, 4);

  const isAlreadySimplified = a === simplifiedA && b === simplifiedB;
  const stepExplanation = isAlreadySimplified
    ? `The ratio ${a} : ${b} is already in its simplest form (GCD = 1). Decimal equivalent = ${formattedDecimal}.`
    : `Normalized to integers (${intA} : ${intB}). Greatest Common Divisor (GCD) is ${gcd}. Simplified: (${intA} ÷ ${gcd}) : (${intB} ÷ ${gcd}) = ${simplifiedRatio}. Decimal equivalent = ${formattedDecimal}.`;

  return {
    isValid: true,
    originalA: a,
    originalB: b,
    simplifiedA,
    simplifiedB,
    simplifiedRatio,
    gcd,
    decimalValue,
    formattedDecimal,
    stepExplanation,
  };
}

// ==========================================
// 2. SOLVE PROPORTION (A : B = C : D)
// ==========================================

export type ProportionPosition = "A" | "B" | "C" | "D";

export interface ProportionInputs {
  a: number | null;
  b: number | null;
  c: number | null;
  d: number | null;
}

export interface SolveProportionResult {
  isValid: boolean;
  error?: string;
  unknownPosition?: ProportionPosition;
  solvedValue?: number;
  formattedSolvedValue?: string;
  fullProportionString?: string;
  stepExplanation?: string;
}

export function solveProportion(values: ProportionInputs): SolveProportionResult {
  const entries: { pos: ProportionPosition; val: number | null }[] = [
    { pos: "A", val: values.a },
    { pos: "B", val: values.b },
    { pos: "C", val: values.c },
    { pos: "D", val: values.d },
  ];

  const nullEntries = entries.filter((e) => e.val === null || e.val === undefined || !Number.isFinite(e.val));

  if (nullEntries.length !== 1) {
    return {
      isValid: false,
      error: "Exactly one value must be unknown/blank to solve the proportion (A : B = C : D).",
    };
  }

  const unknownPos = nullEntries[0].pos;
  const a = values.a;
  const b = values.b;
  const c = values.c;
  const d = values.d;

  let solved: number;
  let formulaUsed: string;

  switch (unknownPos) {
    case "A": {
      if (d === 0) {
        return { isValid: false, error: "Cannot solve proportion: Division by zero (D = 0) is undefined." };
      }
      solved = (b! * c!) / d!;
      formulaUsed = `A = (B × C) / D = (${b} × ${c}) / ${d}`;
      break;
    }
    case "B": {
      if (c === 0) {
        return { isValid: false, error: "Cannot solve proportion: Division by zero (C = 0) is undefined." };
      }
      solved = (a! * d!) / c!;
      formulaUsed = `B = (A × D) / C = (${a} × ${d}) / ${c}`;
      break;
    }
    case "C": {
      if (b === 0) {
        return { isValid: false, error: "Cannot solve proportion: Division by zero (B = 0) is undefined." };
      }
      solved = (a! * d!) / b!;
      formulaUsed = `C = (A × D) / B = (${a} × ${d}) / ${b}`;
      break;
    }
    case "D": {
      if (a === 0) {
        return { isValid: false, error: "Cannot solve proportion: Division by zero (A = 0) is undefined." };
      }
      solved = (b! * c!) / a!;
      formulaUsed = `D = (B × C) / A = (${b} × ${c}) / ${a}`;
      break;
    }
  }

  if (!Number.isFinite(solved)) {
    return { isValid: false, error: "Result is undefined or cannot be computed." };
  }

  const formattedSolvedValue = formatResultNumber(solved, 4);

  const finalA = unknownPos === "A" ? formattedSolvedValue : String(a);
  const finalB = unknownPos === "B" ? formattedSolvedValue : String(b);
  const finalC = unknownPos === "C" ? formattedSolvedValue : String(c);
  const finalD = unknownPos === "D" ? formattedSolvedValue : String(d);

  const fullProportionString = `${finalA} : ${finalB} = ${finalC} : ${finalD}`;
  const stepExplanation = `Cross-multiplication principle: A × D = B × C. Solving for unknown ${unknownPos}: ${formulaUsed} = ${formattedSolvedValue}. Full Proportion: ${fullProportionString}.`;

  return {
    isValid: true,
    unknownPosition: unknownPos,
    solvedValue: solved,
    formattedSolvedValue,
    fullProportionString,
    stepExplanation,
  };
}

// ==========================================
// 3. SPLIT AMOUNT BY RATIO
// ==========================================

export interface RatioSplitPart {
  index: number;
  partName: string;
  ratio: number;
  amount: number;
  percentage: number;
  formattedAmount: string;
  formattedPercentage: string;
}

export interface SplitAmountResult {
  isValid: boolean;
  error?: string;
  totalAmount?: number;
  totalRatioParts?: number;
  formattedTotalAmount?: string;
  parts?: RatioSplitPart[];
  stepExplanation?: string;
}

export function splitAmountByRatio(totalAmount: number, ratios: number[]): SplitAmountResult {
  if (!Number.isFinite(totalAmount)) {
    return { isValid: false, error: "Please enter a valid total amount." };
  }

  if (totalAmount < 0) {
    return { isValid: false, error: "Total amount cannot be negative." };
  }

  if (!Array.isArray(ratios) || ratios.length < 2) {
    return { isValid: false, error: "Please enter at least 2 ratio parts." };
  }

  let totalRatioParts = 0;
  for (let i = 0; i < ratios.length; i++) {
    const r = ratios[i];
    if (!Number.isFinite(r)) {
      return { isValid: false, error: `Ratio part #${i + 1} must be a valid number.` };
    }
    if (r < 0) {
      return { isValid: false, error: `Ratio part #${i + 1} cannot be negative.` };
    }
    totalRatioParts += r;
  }

  if (totalRatioParts <= 0) {
    return { isValid: false, error: "Sum of ratio parts must be greater than 0." };
  }

  // Exact monetary currency allocation using the Largest Remainder Method (Hamilton method)
  const totalCents = Math.round(totalAmount * 100);
  const exactSharesInCents = ratios.map((r) => (totalCents * r) / totalRatioParts);
  const flooredCents = exactSharesInCents.map((s) => Math.floor(s));
  const remainders = exactSharesInCents.map((s, i) => ({ index: i, rem: s - flooredCents[i] }));

  // Sort descending by fractional remainder, maintaining initial index order for ties
  remainders.sort((a, b) => b.rem - a.rem || a.index - b.index);

  const allocatedSum = flooredCents.reduce((acc, c) => acc + c, 0);
  const unallocatedCents = totalCents - allocatedSum;

  const finalCents = [...flooredCents];
  for (let i = 0; i < unallocatedCents && i < remainders.length; i++) {
    finalCents[remainders[i].index] += 1;
  }

  const parts: RatioSplitPart[] = ratios.map((r, i) => {
    const amount = finalCents[i] / 100;
    const percentage = (r / totalRatioParts) * 100;
    return {
      index: i + 1,
      partName: `Part ${i + 1}`,
      ratio: r,
      amount,
      percentage,
      formattedAmount: formatINR(amount, true),
      formattedPercentage: `${formatResultNumber(percentage, 2)}%`,
    };
  });

  const formattedTotalAmount = formatINR(totalAmount, true);
  const ratioExpression = ratios.join(" : ");
  const stepExplanation = `Dividing ${formattedTotalAmount} in ratio ${ratioExpression} (Total Parts = ${formatResultNumber(totalRatioParts, 4)}). Formula: Part Amount = (Total × Part Ratio) / Total Ratio Parts. Results: ${parts
    .map((p) => `${p.partName} (${p.ratio} parts) = ${p.formattedAmount} (${p.formattedPercentage})`)
    .join(", ")}.`;

  return {
    isValid: true,
    totalAmount,
    totalRatioParts,
    formattedTotalAmount,
    parts,
    stepExplanation,
  };
}

// ==========================================
// OUTPUT WRAPPERS FOR CALCULATOR RESULT
// ==========================================

export function formatSimplifyOutput(result: SimplifiedRatioResult): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Original Ratio",
      value: `${result.originalA} : ${result.originalB}`,
    },
    {
      label: "Greatest Common Divisor (GCD)",
      value: String(result.gcd ?? 1),
    },
    {
      label: "Decimal Value (A ÷ B)",
      value: result.formattedDecimal || "0",
    },
  ];

  return {
    isValid: true,
    primaryValue: result.simplifiedRatio,
    primaryLabel: "Simplified Ratio",
    stepExplanation: result.stepExplanation,
    disclaimer: "Ratios are reduced to their lowest integer terms using the Euclidean Greatest Common Divisor algorithm.",
    disclaimerLabel: "Simplification Rule",
    secondaryValues,
  };
}

export function formatProportionOutput(result: SolveProportionResult): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Unknown Variable",
      value: result.unknownPosition || "X",
    },
    {
      label: "Full Equivalent Proportion",
      value: result.fullProportionString || "",
    },
    {
      label: "Proportion Law",
      value: "A × D = B × C",
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedSolvedValue,
    primaryLabel: `Solved Value (${result.unknownPosition})`,
    stepExplanation: result.stepExplanation,
    disclaimer: "Proportions are solved by algebraically balancing cross-multiplication products (A × D = B × C).",
    disclaimerLabel: "Cross-Multiplication Principle",
    secondaryValues,
  };
}

export function formatSplitOutput(result: SplitAmountResult): CalculationOutput {
  if (!result.isValid || !result.parts || result.parts.length === 0) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Total Amount",
      value: result.formattedTotalAmount || "₹0.00",
    },
    {
      label: "Total Ratio Parts",
      value: formatResultNumber(result.totalRatioParts ?? 0, 4),
    },
    ...result.parts.map((p) => ({
      label: `${p.partName} — Ratio ${p.ratio} — ${p.formattedPercentage}`,
      value: p.formattedAmount,
    })),
  ];

  return {
    isValid: true,
    primaryValue: result.parts.map((p) => p.formattedAmount).join(" + "),
    primaryLabel: "Split Ratio Shares",
    stepExplanation: result.stepExplanation,
    disclaimer: "Total amount is proportionally partitioned across all ratio shares. The sum of all parts reconciles exactly with the starting total.",
    disclaimerLabel: "Proportional Partition",
    secondaryValues,
  };
}

// ==========================================
// CALCULATOR DEFINITION
// ==========================================

export const ratioCalculatorDefinition: CalculatorDefinition = {
  id: "ratio-calculator",
  slug: "ratio-calculator",
  name: "Ratio Calculator",
  category: "Math",
  categorySlug: "math",
  shortDescription:
    "Simplify ratios to lowest terms, solve missing proportion values (A : B = C : D), and split monetary amounts by ratio shares.",
  longDescription:
    "A comprehensive, deterministic mathematical tool for reducing integer and decimal ratios, solving proportions via cross-multiplication, and dividing amounts proportionally.",
  icon: "⚖️",
  searchKeywords: [
    "ratio",
    "ratio calculator",
    "ratio simplifier",
    "simplify ratio",
    "ratio solver",
    "proportion",
    "proportion calculator",
    "solve proportion",
    "equivalent ratio",
    "ratio split",
    "divide amount by ratio",
    "ratio sharing",
    "cross multiplication calculator",
  ],
  defaultModeId: "simplify-ratio",
  modes: [
    {
      id: "simplify-ratio",
      name: "Simplify Ratio",
      description: "Reduce integer or decimal ratio terms A : B to their simplest integer form.",
      formulaText: "Simplified Ratio = (A / GCD) : (B / GCD)",
      inputs: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const a = Number(inputs?.a);
        const b = Number(inputs?.b);
        const result = calculateSimplifiedRatio(a, b);
        return formatSimplifyOutput(result);
      },
    },
    {
      id: "solve-proportion",
      name: "Solve Proportion",
      description: "Find the missing unknown value in a proportion equality A : B = C : D.",
      formulaText: "A × D = B × C",
      inputs: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = solveProportion({
          a: inputs?.a === null || inputs?.a === undefined || inputs?.a === "" ? null : Number(inputs.a),
          b: inputs?.b === null || inputs?.b === undefined || inputs?.b === "" ? null : Number(inputs.b),
          c: inputs?.c === null || inputs?.c === undefined || inputs?.c === "" ? null : Number(inputs.c),
          d: inputs?.d === null || inputs?.d === undefined || inputs?.d === "" ? null : Number(inputs.d),
        });
        return formatProportionOutput(result);
      },
    },
    {
      id: "split-amount",
      name: "Split Amount by Ratio",
      description: "Divide a total amount or sum of money among 2 or more ratio parts.",
      formulaText: "Part Amount = (Total × Part Ratio) / Total Ratio Parts",
      inputs: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const totalAmount = Number(inputs?.totalAmount);
        const ratios: number[] = Array.isArray(inputs?.ratios) ? inputs.ratios : [];
        const result = splitAmountByRatio(totalAmount, ratios);
        return formatSplitOutput(result);
      },
    },
  ],
  formulas: [
    {
      modeId: "simplify-ratio",
      title: "1. Ratio Simplification Formula",
      formulaMath: "\\text{Simplified Ratio} = \\frac{A}{\\text{GCD}} : \\frac{B}{\\text{GCD}}",
      explanation:
        "To simplify a ratio A : B, divide both numbers by their Greatest Common Divisor (GCD). If inputs contain decimals, multiply by powers of 10 first to convert them to whole numbers.",
      example: "For 12 : 18, the GCD is 6. Simplified ratio: (12 ÷ 6) : (18 ÷ 6) = 2 : 3.",
      whenToUse: "Use to express proportions, recipes, aspect ratios, or scale models in their most concise integer form.",
    },
    {
      modeId: "solve-proportion",
      title: "2. Proportion Cross-Multiplication Formula",
      formulaMath: "A \\times D = B \\times C",
      explanation:
        "In any proportion where two ratios are equal (A : B = C : D), the product of the extremes (A and D) is equal to the product of the means (B and C).",
      example: "For 2 : 3 = 4 : D: 2 × D = 3 × 4 = 12. Solving gives D = 12 / 2 = 6.",
      whenToUse: "Use when scaling dimensions, converting currency/units, or calculating missing quantities in proportional systems.",
    },
    {
      modeId: "split-amount",
      title: "3. Proportional Split Formula",
      formulaMath: "\\text{Part Amount} = \\frac{\\text{Total} \\times \\text{Part Ratio}}{\\text{Total Ratio Parts}}",
      explanation:
        "To split a total sum across ratio parts (R1 : R2 : ... : Rn), first sum all parts to find the total parts. Then multiply the total amount by each part's fraction of the sum.",
      example: "Split ₹1,000 in ratio 2 : 3 (Total Parts = 5): Part 1 = (1,000 × 2) / 5 = ₹400.00; Part 2 = (1,000 × 3) / 5 = ₹600.00.",
      whenToUse: "Use for sharing business profits, dividing inheritance, splitting bills, or mixing ingredients proportionally.",
    },
  ],
  examples: [
    {
      title: "Example 1: Simplify Integer Ratio 12 : 18",
      description: "Simplify 12 : 18 to lowest terms using GCD.",
      modeId: "simplify-ratio",
      inputs: { a: 12, b: 18 },
      expectedOutput: "2 : 3",
    },
    {
      title: "Example 2: Simplify Decimal Ratio 1.5 : 2.5",
      description: "Normalize decimals and simplify 1.5 : 2.5.",
      modeId: "simplify-ratio",
      inputs: { a: 1.5, b: 2.5 },
      expectedOutput: "3 : 5",
    },
    {
      title: "Example 3: Solve Proportion 2 : 3 = 4 : ?",
      description: "Find unknown D in proportion 2 : 3 = 4 : D.",
      modeId: "solve-proportion",
      inputs: { a: 2, b: 3, c: 4, d: null as unknown as number },
      expectedOutput: "6",
    },
    {
      title: "Example 4: Solve Reverse Proportion 4 : 8 = ? : 24",
      description: "Find unknown C in proportion 4 : 8 = C : 24.",
      modeId: "solve-proportion",
      inputs: { a: 4, b: 8, c: null as unknown as number, d: 24 },
      expectedOutput: "12",
    },
    {
      title: "Example 5: Split ₹1,000 in Ratio 2 : 3",
      description: "Partition ₹1,000 proportionally into 2 parts.",
      modeId: "split-amount",
      inputs: { totalAmount: 1000, ratios: [2, 3] as unknown as string },
      expectedOutput: "₹400.00 + ₹600.00",
    },
    {
      title: "Example 6: Split ₹1,000 in 3-Part Ratio 2 : 3 : 5",
      description: "Partition ₹1,000 proportionally into 3 parts.",
      modeId: "split-amount",
      inputs: { totalAmount: 1000, ratios: [2, 3, 5] as unknown as string },
      expectedOutput: "₹200.00 + ₹300.00 + ₹500.00",
    },
  ],
  faqs: [
    {
      question: "What is a ratio?",
      answer:
        "A ratio is a mathematical comparison of two or more quantities that indicates how many times one number contains or relates to another (e.g., 2 : 3).",
    },
    {
      question: "How do you simplify a ratio?",
      answer:
        "To simplify a ratio, find the Greatest Common Divisor (GCD) of both terms and divide both sides by that number. For example, for 12 : 18, dividing both by 6 gives 2 : 3.",
    },
    {
      question: "How do you simplify ratios with decimal numbers?",
      answer:
        "Multiply all terms by 10, 100, or 1,000 until they are converted into whole numbers, then divide by their GCD. For example, 1.5 : 2.5 multiplied by 10 becomes 15 : 25, which simplifies by 5 to 3 : 5.",
    },
    {
      question: "What is a proportion?",
      answer:
        "A proportion is an equation stating that two ratios are equivalent, written as A : B = C : D. It satisfies the fundamental cross-multiplication identity A × D = B × C.",
    },
    {
      question: "How do you solve for a missing value in a proportion?",
      answer:
        "Use cross-multiplication: multiply the diagonally opposite known values together, and divide by the remaining known value. For example, in 2 : 3 = 4 : D, D = (3 × 4) ÷ 2 = 6.",
    },
    {
      question: "How do you divide an amount in a given ratio?",
      answer:
        "1) Sum the ratio parts to get the total parts. 2) Divide the total amount by total parts to find the value of one part. 3) Multiply the single-part value by each individual ratio number.",
    },
    {
      question: "Can I split an amount into more than two parts?",
      answer:
        "Yes. You can add up to 10 ratio parts (such as 2 : 3 : 5). Each share is computed proportionally using Part = (Total × Part Ratio) / Total Ratio Sum.",
    },
    {
      question: "Can a ratio contain negative numbers or zeros?",
      answer:
        "Standard practical ratios represent positive quantities, measurements, or shares. In proportion calculations, zeros are supported as long as they do not cause a division by zero.",
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
      id: "average-calculator",
      name: "Average Calculator",
      category: "Math",
      slug: "/average-calculator",
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
    title: "Ratio Calculator – Simplify Ratios & Solve Proportions | YourCalculate",
    description:
      "Free online ratio calculator to simplify ratios, solve missing proportion values (A : B = C : D), and split monetary amounts proportionally with step-by-step math.",
    canonicalPath: "/ratio-calculator",
    keywords: [
      "ratio calculator",
      "ratio simplifier",
      "simplify ratio",
      "solve proportion",
      "proportion calculator",
      "equivalent ratio",
      "ratio split",
      "divide amount by ratio",
      "cross multiplication calculator",
    ],
  },
};
