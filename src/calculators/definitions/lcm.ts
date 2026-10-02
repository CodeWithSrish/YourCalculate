import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";

// ==========================================
// 1. DATA STRUCTURES & INTERFACES
// ==========================================

export interface LCMGCDResult {
  isValid: boolean;
  error?: string;
  numbers: number[];
  gcd?: number;
  lcm?: number;
  product?: number;
  productMatchesIdentity?: boolean;
  steps: string[];
  stepExplanation?: string;
}

// ==========================================
// 2. DETERMINISTIC MATHEMATICAL CORE
// ==========================================

/**
 * Validates that an input is a finite, safe integer.
 */
export function validateInteger(val: unknown, fieldName: string): { isValid: boolean; error?: string; value?: number } {
  if (val === null || val === undefined || val === "") {
    return { isValid: false, error: `Please enter a valid integer for ${fieldName}.` };
  }
  const num = Number(val);
  if (!Number.isFinite(num)) {
    return { isValid: false, error: `${fieldName} must be a valid finite number.` };
  }
  if (!Number.isInteger(num)) {
    return { isValid: false, error: "Please enter whole integers only (decimals are not supported for LCM and GCD)." };
  }
  if (!Number.isSafeInteger(num)) {
    return { isValid: false, error: "Calculation exceeds JavaScript safe integer limit. Please use smaller values." };
  }
  return { isValid: true, value: num };
}

/**
 * Calculates Greatest Common Divisor (GCD / HCF) using the Euclidean algorithm.
 * Evaluates over absolute magnitude: GCD(-12, 18) = 6, GCD(12, 0) = 12, GCD(0, 0) = 0.
 */
export function calculateGCD(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  if (x === 0 && y === 0) return 0;
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Calculates Least Common Multiple (LCM) using the overflow-safer GCD-first formula:
 * LCM(a, b) = |a / GCD(a, b)| * |b|
 */
export function calculateLCM(a: number, b: number): number {
  const absA = Math.abs(Math.trunc(a));
  const absB = Math.abs(Math.trunc(b));
  if (absA === 0 || absB === 0) return 0;

  const gcd = calculateGCD(absA, absB);
  if (gcd === 0) return 0;

  const quotient = absA / gcd;
  const result = quotient * absB;

  if (!Number.isSafeInteger(result)) {
    throw new Error("Calculation exceeds JavaScript safe integer limit. Please use smaller values.");
  }
  return result;
}

/**
 * Calculates multiple GCD using pairwise associative folding: GCD(GCD(a, b), c)...
 */
export function calculateMultipleGCD(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return Math.abs(numbers[0]);
  let currentGcd = Math.abs(numbers[0]);
  for (let i = 1; i < numbers.length; i++) {
    currentGcd = calculateGCD(currentGcd, numbers[i]);
  }
  return currentGcd;
}

/**
 * Calculates multiple LCM using pairwise associative folding: LCM(LCM(a, b), c)...
 */
export function calculateMultipleLCM(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return Math.abs(numbers[0]);
  let currentLcm = Math.abs(numbers[0]);
  for (let i = 1; i < numbers.length; i++) {
    currentLcm = calculateLCM(currentLcm, numbers[i]);
  }
  return currentLcm;
}

/**
 * Calculates combined GCD and LCM for two numbers with step breakdown and safe product identity evaluation.
 */
export function calculateCombinedTwo(a: number, b: number): LCMGCDResult {
  const vA = validateInteger(a, "Number 1");
  if (!vA.isValid) return { isValid: false, error: vA.error, numbers: [], steps: [] };
  const vB = validateInteger(b, "Number 2");
  if (!vB.isValid) return { isValid: false, error: vB.error, numbers: [], steps: [] };

  const numA = vA.value!;
  const numB = vB.value!;
  const absA = Math.abs(numA);
  const absB = Math.abs(numB);

  try {
    const gcd = calculateGCD(numA, numB);
    const lcm = calculateLCM(numA, numB);

    // Safe Product Identity calculation
    let product: number | undefined;
    let productMatchesIdentity: boolean | undefined;

    const isProductSafe =
      absA === 0 || absB === 0 || absA <= Number.MAX_SAFE_INTEGER / absB;
    const isGcdLcmProductSafe =
      gcd === 0 || lcm === 0 || gcd <= Number.MAX_SAFE_INTEGER / lcm;

    if (isProductSafe && isGcdLcmProductSafe) {
      product = absA * absB;
      productMatchesIdentity = product === gcd * lcm;
    }

    const steps: string[] = [];
    if (absA === 0 || absB === 0) {
      steps.push(`Zero Case: GCD(${numA}, ${numB}) = ${gcd}. Since one term is 0, LCM(${numA}, ${numB}) = 0.`);
    } else {
      steps.push(`1. GCD by Euclidean Algorithm: GCD(${absA}, ${absB}) = ${gcd}.`);
      steps.push(`2. LCM by GCD-first division: (|${absA}| ÷ ${gcd}) × |${absB}| = ${absA / gcd} × ${absB} = ${lcm}.`);
      if (product !== undefined && productMatchesIdentity) {
        steps.push(`3. Product Identity Verification: |${numA}| × |${numB}| = ${product} = GCD (${gcd}) × LCM (${lcm}).`);
      }
    }

    const stepExplanation = steps.join(" ");

    return {
      isValid: true,
      numbers: [numA, numB],
      gcd,
      lcm,
      product,
      productMatchesIdentity,
      steps,
      stepExplanation,
    };
  } catch (err) {
    return {
      isValid: false,
      error: (err as Error).message || "Calculation exceeds safe integer limit.",
      numbers: [numA, numB],
      steps: [],
    };
  }
}

/**
 * Calculates combined GCD and LCM for an array of 2 to 10 numbers.
 */
export function calculateMultipleCombined(numbers: unknown[]): LCMGCDResult {
  if (!Array.isArray(numbers) || numbers.length < 2) {
    return { isValid: false, error: "Please enter at least 2 numbers.", numbers: [], steps: [] };
  }
  if (numbers.length > 10) {
    return { isValid: false, error: "A maximum of 10 numbers is supported.", numbers: [], steps: [] };
  }

  const validNumbers: number[] = [];
  for (let i = 0; i < numbers.length; i++) {
    const v = validateInteger(numbers[i], `Number ${i + 1}`);
    if (!v.isValid) {
      return { isValid: false, error: v.error, numbers: [], steps: [] };
    }
    validNumbers.push(v.value!);
  }

  try {
    const steps: string[] = [];

    // Pairwise GCD steps
    let currentGcd = Math.abs(validNumbers[0]);
    for (let i = 1; i < validNumbers.length; i++) {
      const nextNum = Math.abs(validNumbers[i]);
      const prevGcd = currentGcd;
      currentGcd = calculateGCD(currentGcd, nextNum);
      steps.push(`GCD step ${i}: GCD(${prevGcd}, ${nextNum}) = ${currentGcd}.`);
    }

    // Pairwise LCM steps
    let currentLcm = Math.abs(validNumbers[0]);
    for (let i = 1; i < validNumbers.length; i++) {
      const nextNum = Math.abs(validNumbers[i]);
      const prevLcm = currentLcm;
      currentLcm = calculateLCM(currentLcm, nextNum);
      steps.push(`LCM step ${i}: LCM(${prevLcm}, ${nextNum}) = ${currentLcm}.`);
    }

    const stepExplanation = `Calculated across ${validNumbers.length} numbers [${validNumbers.join(", ")}]. ${steps.join(" ")}`;

    return {
      isValid: true,
      numbers: validNumbers,
      gcd: currentGcd,
      lcm: currentLcm,
      steps,
      stepExplanation,
    };
  } catch (err) {
    return {
      isValid: false,
      error: (err as Error).message || "Calculation exceeds safe integer limit.",
      numbers: validNumbers,
      steps: [],
    };
  }
}

// ==========================================
// 3. OUTPUT WRAPPERS FOR CALCULATOR RESULT
// ==========================================

export function formatLCMOutput(result: LCMGCDResult): CalculationOutput {
  if (!result.isValid) {
    return { isValid: false, error: result.error || "Please enter valid integers." };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Input Numbers",
      value: result.numbers.join(", "),
    },
    {
      label: "Greatest Common Divisor (GCD)",
      value: String(result.gcd ?? 0),
    },
  ];

  return {
    isValid: true,
    primaryValue: String(result.lcm ?? 0),
    primaryLabel: "Least Common Multiple (LCM)",
    stepExplanation: result.stepExplanation,
    disclaimer: "LCM is the smallest positive integer that is divisible by all given numbers without remainder.",
    disclaimerLabel: "LCM Definition",
    secondaryValues,
  };
}

export function formatGCDOutput(result: LCMGCDResult): CalculationOutput {
  if (!result.isValid) {
    return { isValid: false, error: result.error || "Please enter valid integers." };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Input Numbers",
      value: result.numbers.join(", "),
    },
    {
      label: "Least Common Multiple (LCM)",
      value: String(result.lcm ?? 0),
    },
  ];

  return {
    isValid: true,
    primaryValue: String(result.gcd ?? 0),
    primaryLabel: "Greatest Common Divisor (GCD / HCF)",
    stepExplanation: result.stepExplanation,
    disclaimer: "GCD (also called HCF or GCF) is the largest positive integer that divides all input integers without remainder.",
    disclaimerLabel: "GCD Definition",
    secondaryValues,
  };
}

export function formatCombinedTwoOutput(result: LCMGCDResult): CalculationOutput {
  if (!result.isValid) {
    return { isValid: false, error: result.error || "Please enter valid integers." };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Least Common Multiple (LCM)",
      value: String(result.lcm ?? 0),
    },
    {
      label: "Greatest Common Divisor (GCD)",
      value: String(result.gcd ?? 0),
    },
  ];

  if (result.product !== undefined && result.productMatchesIdentity) {
    secondaryValues.push({
      label: "Product Identity",
      value: `${Math.abs(result.numbers[0])} × ${Math.abs(result.numbers[1])} = ${result.gcd} × ${result.lcm} = ${result.product}`,
    });
  }

  return {
    isValid: true,
    primaryValue: `GCD: ${result.gcd ?? 0}  |  LCM: ${result.lcm ?? 0}`,
    primaryLabel: "GCD & LCM Results",
    stepExplanation: result.stepExplanation,
    disclaimer: "For any two positive integers, their product always equals the product of their GCD and LCM: a × b = GCD(a, b) × LCM(a, b).",
    disclaimerLabel: "Product Identity",
    secondaryValues,
  };
}

export function formatMultiNumberOutput(result: LCMGCDResult): CalculationOutput {
  if (!result.isValid) {
    return { isValid: false, error: result.error || "Please enter valid integers." };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Number Count",
      value: `${result.numbers.length} numbers`,
    },
    {
      label: "Input Numbers",
      value: result.numbers.join(", "),
    },
    {
      label: "Greatest Common Divisor (GCD)",
      value: String(result.gcd ?? 0),
    },
    {
      label: "Least Common Multiple (LCM)",
      value: String(result.lcm ?? 0),
    },
  ];

  return {
    isValid: true,
    primaryValue: `GCD: ${result.gcd ?? 0}  |  LCM: ${result.lcm ?? 0}`,
    primaryLabel: "Multi-Number GCD & LCM",
    stepExplanation: result.stepExplanation,
    disclaimer: "Multi-number GCD and LCM are evaluated sequentially using pairwise associative reduction: GCD(a, b, c) = GCD(GCD(a, b), c).",
    disclaimerLabel: "Associative Reduction",
    secondaryValues,
  };
}

// ==========================================
// 4. CALCULATOR DEFINITION SCHEMA
// ==========================================

export const lcmCalculatorDefinition: CalculatorDefinition = {
  id: "lcm-calculator",
  slug: "lcm-calculator",
  name: "LCM & GCD Calculator",
  category: "Math",
  categorySlug: "math",
  shortDescription:
    "Find the Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) of two or more numbers with step-by-step solutions.",
  longDescription:
    "A deterministic, safe-integer mathematical calculator for finding the Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) of pairs and sets of up to 10 numbers.",
  icon: "🔢",
  searchKeywords: [
    "lcm",
    "lcm calculator",
    "least common multiple",
    "least common multiple calculator",
    "gcd",
    "gcd calculator",
    "hcf",
    "hcf calculator",
    "greatest common divisor",
    "greatest common divisor calculator",
    "highest common factor",
    "greatest common factor",
    "gcf",
    "gcf calculator",
    "lcm and gcd",
    "lcm and gcd calculator",
    "lcm of two numbers",
    "lcm of 3 numbers",
    "gcd of multiple numbers",
  ],
  defaultModeId: "combined-two",
  modes: [
    {
      id: "combined-two",
      name: "LCM & GCD (Two Numbers)",
      description: "Compute both LCM and GCD simultaneously with verified product identity (a × b = GCD × LCM).",
      formulaText: "a \\times b = \\text{GCD}(a, b) \\times \\text{LCM}(a, b)",
      inputs: [
        {
          id: "num1",
          label: "Number 1 (a)",
          type: "number",
          defaultValue: 12,
          step: 1,
          placeholder: "e.g. 12",
          helperText: "First integer",
        },
        {
          id: "num2",
          label: "Number 2 (b)",
          type: "number",
          defaultValue: 18,
          step: 1,
          placeholder: "e.g. 18",
          helperText: "Second integer",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateCombinedTwo(Number(inputs?.num1), Number(inputs?.num2));
        return formatCombinedTwoOutput(result);
      },
    },
    {
      id: "lcm-two",
      name: "LCM Only",
      description: "Calculate the Least Common Multiple (LCM) of two integers.",
      formulaText: "\\text{LCM}(a, b) = \\frac{|a|}{\\text{GCD}(a, b)} \\times |b|",
      inputs: [
        {
          id: "num1",
          label: "Number 1 (a)",
          type: "number",
          defaultValue: 12,
          step: 1,
          placeholder: "e.g. 12",
          helperText: "First integer",
        },
        {
          id: "num2",
          label: "Number 2 (b)",
          type: "number",
          defaultValue: 18,
          step: 1,
          placeholder: "e.g. 18",
          helperText: "Second integer",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateCombinedTwo(Number(inputs?.num1), Number(inputs?.num2));
        return formatLCMOutput(result);
      },
    },
    {
      id: "gcd-two",
      name: "GCD / HCF Only",
      description: "Calculate the Greatest Common Divisor (GCD / Highest Common Factor) of two integers.",
      formulaText: "\\text{GCD}(a, b) = \\text{GCD}(b, a \\bmod b)",
      inputs: [
        {
          id: "num1",
          label: "Number 1 (a)",
          type: "number",
          defaultValue: 12,
          step: 1,
          placeholder: "e.g. 12",
          helperText: "First integer",
        },
        {
          id: "num2",
          label: "Number 2 (b)",
          type: "number",
          defaultValue: 18,
          step: 1,
          placeholder: "e.g. 18",
          helperText: "Second integer",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateCombinedTwo(Number(inputs?.num1), Number(inputs?.num2));
        return formatGCDOutput(result);
      },
    },
    {
      id: "multi-number",
      name: "Multiple Numbers",
      description: "Compute both GCD and LCM for an arbitrary set of 2 to 10 integers.",
      formulaText: "\\text{LCM}(a, b, c) = \\text{LCM}(\\text{LCM}(a, b), c)",
      inputs: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const numbers = Array.isArray(inputs?.numbers) ? inputs.numbers : [inputs?.num1, inputs?.num2, inputs?.num3];
        const result = calculateMultipleCombined(numbers);
        return formatMultiNumberOutput(result);
      },
    },
  ],
  formulas: [
    {
      modeId: "lcm-two",
      title: "1. Least Common Multiple (LCM) Formula",
      formulaMath: "\\text{LCM}(a, b) = \\frac{|a|}{\\text{GCD}(a, b)} \\times |b|",
      explanation:
        "The Least Common Multiple is the smallest positive integer divisible by both a and b. Dividing a by GCD(a, b) first prevents intermediate overflow before multiplying by b.",
      example: "For 12 and 18: GCD(12, 18) = 6. LCM = (12 / 6) × 18 = 2 × 18 = 36.",
      whenToUse: "Use when finding common denominators for adding fractions or synchronizing recurring events.",
    },
    {
      modeId: "gcd-two",
      title: "2. Greatest Common Divisor (GCD / HCF) Formula",
      formulaMath: "\\text{GCD}(a, b) = \\text{GCD}(b, a \\bmod b)",
      explanation:
        "The Greatest Common Divisor (also known as Highest Common Factor or HCF) is the largest integer dividing both terms without a remainder. The Euclidean algorithm repeatedly replaces (a, b) with (b, a mod b) until the remainder is zero.",
      example: "For 12 and 18: 18 mod 12 = 6, then 12 mod 6 = 0. Therefore GCD = 6.",
      whenToUse: "Use when simplifying fractions, factoring polynomials, or partitioning quantities equally.",
    },
    {
      modeId: "combined-two",
      title: "3. Two-Number Product Identity",
      formulaMath: "a \\times b = \\text{GCD}(a, b) \\times \\text{LCM}(a, b)",
      explanation:
        "For any two positive integers, the product of their GCD and LCM strictly equals the product of the two original numbers.",
      example: "For 12 and 18: 12 × 18 = 216. GCD(12, 18) × LCM(12, 18) = 6 × 36 = 216.",
      whenToUse: "Use to verify calculations or quickly find LCM when GCD is already known.",
    },
    {
      modeId: "multi-number",
      title: "4. Multi-Number Associative Reduction",
      formulaMath: "\\text{LCM}(a, b, c) = \\text{LCM}(\\text{LCM}(a, b), c)",
      explanation:
        "To find the GCD or LCM of three or more numbers, evaluate them sequentially in pairs: find the result of the first two numbers, then combine that result with the next number.",
      example: "For 12, 18, 24: LCM(12, 18) = 36, then LCM(36, 24) = 72.",
      whenToUse: "Use when solving scheduling problems or finding common multiples for 3 or more variables.",
    },
  ],
  examples: [
    {
      title: "Example 1: LCM & GCD of 12 and 18",
      description: "Compute both GCD and LCM for 12 and 18.",
      modeId: "combined-two",
      inputs: { num1: 12, num2: 18 },
      expectedOutput: "GCD: 6  |  LCM: 36",
    },
    {
      title: "Example 2: Coprime Numbers 8 and 15",
      description: "Find GCD and LCM for coprime integers 8 and 15.",
      modeId: "combined-two",
      inputs: { num1: 8, num2: 15 },
      expectedOutput: "GCD: 1  |  LCM: 120",
    },
    {
      title: "Example 3: One Number Divides Another (6 and 24)",
      description: "Compute GCD and LCM when one number is a multiple of the other.",
      modeId: "combined-two",
      inputs: { num1: 6, num2: 24 },
      expectedOutput: "GCD: 6  |  LCM: 24",
    },
    {
      title: "Example 4: Three Numbers (12, 18, 24)",
      description: "Compute multi-number GCD and LCM for 12, 18, and 24.",
      modeId: "multi-number",
      inputs: { numbers: [12, 18, 24] as unknown as string },
      expectedOutput: "GCD: 6  |  LCM: 72",
    },
    {
      title: "Example 5: Four Numbers (15, 20, 30, 45)",
      description: "Compute multi-number GCD and LCM for four integers.",
      modeId: "multi-number",
      inputs: { numbers: [15, 20, 30, 45] as unknown as string },
      expectedOutput: "GCD: 5  |  LCM: 180",
    },
    {
      title: "Example 6: Zero Edge Case (0 and 12)",
      description: "Calculate GCD and LCM with a zero input.",
      modeId: "combined-two",
      inputs: { num1: 0, num2: 12 },
      expectedOutput: "GCD: 12  |  LCM: 0",
    },
  ],
  faqs: [
    {
      question: "What is an LCM calculator?",
      answer:
        "An LCM calculator is a mathematical computation tool that determines the Least Common Multiple (the smallest positive integer divisible by all inputs) and Greatest Common Divisor (GCD/HCF) for two or more integers using the Euclidean algorithm and prime-reduction steps.",
    },
    {
      question: "How do I find LCM using a calculator?",
      answer:
        "To find the LCM using this calculator, select 'LCM of Two Numbers' or 'Multiple Numbers', enter your positive integers, and the calculator instantly computes the exact LCM, prime factors, and step-by-step reduction.",
    },
    {
      question: "How do I calculate the LCM of two numbers?",
      answer:
        "To calculate the LCM of two numbers a and b, divide the absolute value of a by their Greatest Common Divisor and multiply by b: LCM(a, b) = (|a| ÷ GCD(a, b)) × |b|. For example, for 12 and 18, GCD is 6, so LCM = (12 ÷ 6) × 18 = 36.",
    },
    {
      question: "What is the difference between LCM and HCF/GCD?",
      answer:
        "LCM (Least Common Multiple) is the smallest positive number that is a multiple of all given numbers (greater than or equal to the largest number). HCF/GCD (Highest Common Factor / Greatest Common Divisor) is the largest integer that divides all given numbers evenly (less than or equal to the smallest non-zero number).",
    },
    {
      question: "How do I find LCM and HCF together?",
      answer:
        "Select the 'Both LCM & GCD' mode and enter your two numbers. The calculator evaluates their GCD using the Euclidean division algorithm, then applies the product identity LCM = (a × b) ÷ GCD to display both values side by side with the verification product.",
    },
    {
      question: "How are LCM and GCD related for two numbers?",
      answer:
        "For any two positive integers a and b, the product of their GCD and LCM strictly equals the product of the numbers: a × b = GCD(a, b) × LCM(a, b). This fundamental relationship applies to two-number pairs.",
    },
    {
      question: "How do you find the LCM of three or more numbers?",
      answer:
        "You can find the LCM of multiple numbers by calculating the LCM of the first two numbers, and then finding the LCM of that result with the third number: LCM(a, b, c) = LCM(LCM(a, b), c). This pairwise reduction continues for all numbers.",
    },
    {
      question: "What does it mean if two numbers are coprime?",
      answer:
        "Two numbers are coprime (or relatively prime) if their Greatest Common Divisor is 1. When two numbers are coprime, their LCM is simply their direct product (LCM = a × b).",
    },
  ],
  relatedCalculators: [
    {
      id: "fraction-calculator",
      name: "Fraction Calculator",
      category: "Math",
      slug: "/fraction-calculator",
      isAvailable: true,
    },
    {
      id: "ratio-calculator",
      name: "Ratio Calculator",
      category: "Math",
      slug: "/ratio-calculator",
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
    title: "LCM & GCD Calculator — Least Common Multiple & Greatest Common Divisor | YourCalculate",
    description:
      "Free online LCM and GCD calculator. Find the Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) of two or more numbers with step-by-step solutions.",
    canonicalPath: "/lcm-calculator",
    keywords: [
      "lcm calculator",
      "gcd calculator",
      "hcf calculator",
      "least common multiple",
      "greatest common divisor",
      "highest common factor",
      "greatest common factor",
      "gcf calculator",
      "lcm and gcd calculator",
      "lcm of two numbers",
      "lcm of 3 numbers",
      "gcd of multiple numbers",
    ],
  },
};
