import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";

// ==========================================
// 1. DATA STRUCTURES & INTERFACES
// ==========================================

export interface FractionInput {
  num: number;
  den: number;
}

export interface MixedNumberInput {
  whole: number;
  num: number;
  den: number;
}

export interface FractionOperationResult {
  isValid: boolean;
  error?: string;
  rawNumerator?: number;
  rawDenominator?: number;
  simplifiedNumerator?: number;
  simplifiedDenominator?: number;
  formattedRawFraction?: string;
  formattedSimplifiedFraction?: string;
  formattedMixedNumber?: string;
  formattedDecimal?: string;
  gcd?: number;
  lcm?: number;
  isWholeNumber?: boolean;
  stepExplanation?: string;
}

// ==========================================
// 2. DETERMINISTIC MATHEMATICAL HELPERS
// ==========================================

/**
 * Calculates Greatest Common Divisor (GCD) using the Euclidean algorithm.
 * Strictly guarantees safe integer results.
 */
export function calculateGCD(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a));
  let y = Math.abs(Math.trunc(b));
  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x === 0 ? 1 : x;
}

/**
 * Calculates Least Common Multiple (LCM) safely using GCD.
 */
export function calculateLCM(a: number, b: number): number {
  const absA = Math.abs(Math.trunc(a));
  const absB = Math.abs(Math.trunc(b));
  if (absA === 0 || absB === 0) return 0;
  const gcd = calculateGCD(absA, absB);
  const quotient = absA / gcd;
  const lcm = quotient * absB;
  if (!Number.isSafeInteger(lcm)) {
    throw new Error("Calculation exceeds JavaScript safe integer limits.");
  }
  return lcm;
}

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
    return { isValid: false, error: `${fieldName} must be a whole integer (decimals are not supported in fraction terms).` };
  }
  if (!Number.isSafeInteger(num)) {
    return { isValid: false, error: `${fieldName} exceeds maximum safe integer limits.` };
  }
  return { isValid: true, value: num };
}

/**
 * Formats a fraction to a clean string.
 * e.g. 5/1 -> "5", 5/6 -> "5/6", 0/1 -> "0"
 */
export function formatFraction(n: number, d: number): string {
  if (d === 1) return String(n);
  return `${n}/${d}`;
}

/**
 * Formats a fraction into a mixed number string.
 * e.g. 7/3 -> "2 1/3", -7/3 -> "-2 1/3", 6/3 -> "2", 2/5 -> "2/5", 0/1 -> "0"
 */
export function formatMixedNumber(n: number, d: number): string {
  if (d === 1 || n === 0) return String(n);
  const absN = Math.abs(n);
  const whole = Math.trunc(absN / d);
  const remainder = absN % d;
  const sign = n < 0 ? "-" : "";

  if (whole === 0) {
    return `${sign}${remainder}/${d}`;
  }
  if (remainder === 0) {
    return `${sign}${whole}`;
  }
  return `${sign}${whole} ${remainder}/${d}`;
}

/**
 * Formats a decimal approximation of a fraction to 4-6 decimal places.
 */
export function formatDecimalApprox(n: number, d: number): string {
  if (d === 0) return "Undefined";
  if (n === 0) return "0";
  const dec = n / d;
  if (Number.isInteger(dec)) return String(dec);
  const fixed = dec.toFixed(6);
  return fixed.replace(/\.?0+$/, "");
}

/**
 * Normalizes sign and reduces fraction to lowest terms.
 */
export function normalizeFraction(n: number, d: number): { n: number; d: number; gcd: number } {
  if (d === 0) {
    throw new Error("Denominator cannot be zero.");
  }
  let num = n;
  let den = d;

  // Canonicalize sign to numerator
  if (den < 0) {
    num = -num;
    den = -den;
  }

  if (num === 0) {
    return { n: 0, d: 1, gcd: den };
  }

  const gcd = calculateGCD(num, den);
  const simplifiedN = num / gcd;
  const simplifiedD = den / gcd;

  if (!Number.isSafeInteger(simplifiedN) || !Number.isSafeInteger(simplifiedD)) {
    throw new Error("Resulting fraction exceeds JavaScript safe integer limits.");
  }

  return { n: simplifiedN, d: simplifiedD, gcd };
}

// ==========================================
// 3. PURE DETERMINISTIC CALCULATION ENGINES
// ==========================================

/**
 * Mode 1: Add Fractions (a/b + c/d)
 */
export function calculateFractionAddition(f1: FractionInput, f2: FractionInput): FractionOperationResult {
  const vA = validateInteger(f1.num, "Numerator 1");
  if (!vA.isValid) return { isValid: false, error: vA.error };
  const vB = validateInteger(f1.den, "Denominator 1");
  if (!vB.isValid) return { isValid: false, error: vB.error };
  const vC = validateInteger(f2.num, "Numerator 2");
  if (!vC.isValid) return { isValid: false, error: vC.error };
  const vD = validateInteger(f2.den, "Denominator 2");
  if (!vD.isValid) return { isValid: false, error: vD.error };

  let a = vA.value!;
  let b = vB.value!;
  let c = vC.value!;
  let d = vD.value!;

  if (b === 0 || d === 0) {
    return { isValid: false, error: "Denominator cannot be zero." };
  }

  // Normalize inputs to positive denominators
  if (b < 0) { a = -a; b = -b; }
  if (d < 0) { c = -c; d = -d; }

  try {
    const gcdDenom = calculateGCD(b, d);
    const bReduced = b / gcdDenom;
    const dReduced = d / gcdDenom;

    const term1 = a * dReduced;
    const term2 = c * bReduced;
    if (!Number.isSafeInteger(term1) || !Number.isSafeInteger(term2)) {
      return { isValid: false, error: "Intermediate numerator exceeds safe integer range." };
    }

    const rawNumerator = term1 + term2;
    const rawDenominator = bReduced * d; // lcm(b, d)
    if (!Number.isSafeInteger(rawNumerator) || !Number.isSafeInteger(rawDenominator)) {
      return { isValid: false, error: "Common denominator calculation exceeds safe integer range." };
    }

    const { n: simN, d: simD, gcd } = normalizeFraction(rawNumerator, rawDenominator);

    const formattedRawFraction = formatFraction(rawNumerator, rawDenominator);
    const formattedSimplifiedFraction = formatFraction(simN, simD);
    const formattedMixedNumber = formatMixedNumber(simN, simD);
    const formattedDecimal = formatDecimalApprox(simN, simD);

    const stepExplanation =
      b === d
        ? `Common denominator is ${b}: (${a} + ${c}) / ${b} = ${rawNumerator}/${rawDenominator}` +
          (gcd > 1 ? ` = ${formattedSimplifiedFraction} (reduced by GCD ${gcd}).` : `.`)
        : `Least Common Denominator (LCD) of ${b} and ${d} is ${rawDenominator}. Convert: ${a}/${b} = ${term1}/${rawDenominator} and ${c}/${d} = ${term2}/${rawDenominator}. Sum: (${term1} + ${term2}) / ${rawDenominator} = ${formattedRawFraction}` +
          (gcd > 1 ? ` = ${formattedSimplifiedFraction} (reduced by GCD ${gcd}).` : `.`);

    return {
      isValid: true,
      rawNumerator,
      rawDenominator,
      simplifiedNumerator: simN,
      simplifiedDenominator: simD,
      formattedRawFraction,
      formattedSimplifiedFraction,
      formattedMixedNumber,
      formattedDecimal,
      gcd,
      lcm: rawDenominator,
      isWholeNumber: simD === 1,
      stepExplanation,
    };
  } catch (err) {
    return { isValid: false, error: (err as Error).message || "Calculation failed." };
  }
}

/**
 * Mode 2: Subtract Fractions (a/b - c/d)
 */
export function calculateFractionSubtraction(f1: FractionInput, f2: FractionInput): FractionOperationResult {
  const vA = validateInteger(f1.num, "Numerator 1");
  if (!vA.isValid) return { isValid: false, error: vA.error };
  const vB = validateInteger(f1.den, "Denominator 1");
  if (!vB.isValid) return { isValid: false, error: vB.error };
  const vC = validateInteger(f2.num, "Numerator 2");
  if (!vC.isValid) return { isValid: false, error: vC.error };
  const vD = validateInteger(f2.den, "Denominator 2");
  if (!vD.isValid) return { isValid: false, error: vD.error };

  let a = vA.value!;
  let b = vB.value!;
  let c = vC.value!;
  let d = vD.value!;

  if (b === 0 || d === 0) {
    return { isValid: false, error: "Denominator cannot be zero." };
  }

  if (b < 0) { a = -a; b = -b; }
  if (d < 0) { c = -c; d = -d; }

  try {
    const gcdDenom = calculateGCD(b, d);
    const bReduced = b / gcdDenom;
    const dReduced = d / gcdDenom;

    const term1 = a * dReduced;
    const term2 = c * bReduced;
    if (!Number.isSafeInteger(term1) || !Number.isSafeInteger(term2)) {
      return { isValid: false, error: "Intermediate numerator exceeds safe integer range." };
    }

    const rawNumerator = term1 - term2;
    const rawDenominator = bReduced * d;
    if (!Number.isSafeInteger(rawNumerator) || !Number.isSafeInteger(rawDenominator)) {
      return { isValid: false, error: "Common denominator calculation exceeds safe integer range." };
    }

    const { n: simN, d: simD, gcd } = normalizeFraction(rawNumerator, rawDenominator);

    const formattedRawFraction = formatFraction(rawNumerator, rawDenominator);
    const formattedSimplifiedFraction = formatFraction(simN, simD);
    const formattedMixedNumber = formatMixedNumber(simN, simD);
    const formattedDecimal = formatDecimalApprox(simN, simD);

    const stepExplanation =
      b === d
        ? `Common denominator is ${b}: (${a} - ${c}) / ${b} = ${rawNumerator}/${rawDenominator}` +
          (gcd > 1 && rawNumerator !== 0 ? ` = ${formattedSimplifiedFraction} (reduced by GCD ${gcd}).` : `.`)
        : `Least Common Denominator (LCD) of ${b} and ${d} is ${rawDenominator}. Convert: ${a}/${b} = ${term1}/${rawDenominator} and ${c}/${d} = ${term2}/${rawDenominator}. Difference: (${term1} - ${term2}) / ${rawDenominator} = ${formattedRawFraction}` +
          (gcd > 1 && rawNumerator !== 0 ? ` = ${formattedSimplifiedFraction} (reduced by GCD ${gcd}).` : `.`);

    return {
      isValid: true,
      rawNumerator,
      rawDenominator,
      simplifiedNumerator: simN,
      simplifiedDenominator: simD,
      formattedRawFraction,
      formattedSimplifiedFraction,
      formattedMixedNumber,
      formattedDecimal,
      gcd,
      lcm: rawDenominator,
      isWholeNumber: simD === 1,
      stepExplanation,
    };
  } catch (err) {
    return { isValid: false, error: (err as Error).message || "Calculation failed." };
  }
}

/**
 * Mode 3: Multiply Fractions (a/b × c/d)
 */
export function calculateFractionMultiplication(f1: FractionInput, f2: FractionInput): FractionOperationResult {
  const vA = validateInteger(f1.num, "Numerator 1");
  if (!vA.isValid) return { isValid: false, error: vA.error };
  const vB = validateInteger(f1.den, "Denominator 1");
  if (!vB.isValid) return { isValid: false, error: vB.error };
  const vC = validateInteger(f2.num, "Numerator 2");
  if (!vC.isValid) return { isValid: false, error: vC.error };
  const vD = validateInteger(f2.den, "Denominator 2");
  if (!vD.isValid) return { isValid: false, error: vD.error };

  let a = vA.value!;
  let b = vB.value!;
  let c = vC.value!;
  let d = vD.value!;

  if (b === 0 || d === 0) {
    return { isValid: false, error: "Denominator cannot be zero." };
  }

  if (b < 0) { a = -a; b = -b; }
  if (d < 0) { c = -c; d = -d; }

  try {
    // Cross-cancellation for safe multiplication
    const g1 = calculateGCD(a, d);
    const g2 = calculateGCD(c, b);

    const aCross = a / g1;
    const dCross = d / g1;
    const cCross = c / g2;
    const bCross = b / g2;

    const rawNumerator = a * c;
    const rawDenominator = b * d;
    const reducedNumerator = aCross * cCross;
    const reducedDenominator = bCross * dCross;

    if (!Number.isSafeInteger(reducedNumerator) || !Number.isSafeInteger(reducedDenominator)) {
      return { isValid: false, error: "Multiplication product exceeds safe integer range." };
    }

    const { n: simN, d: simD, gcd } = normalizeFraction(reducedNumerator, reducedDenominator);

    const formattedRawFraction = formatFraction(rawNumerator, rawDenominator);
    const formattedSimplifiedFraction = formatFraction(simN, simD);
    const formattedMixedNumber = formatMixedNumber(simN, simD);
    const formattedDecimal = formatDecimalApprox(simN, simD);

    const hasCrossCancellation = g1 > 1 || g2 > 1;
    const stepExplanation =
      `Multiply numerators and denominators: (${a} × ${c}) / (${b} × ${d}) = ${formattedRawFraction}` +
      (hasCrossCancellation ? ` (cross-cancelling common factors gives ${reducedNumerator}/${reducedDenominator})` : ``) +
      (formattedRawFraction !== formattedSimplifiedFraction ? ` = ${formattedSimplifiedFraction} (reduced to lowest terms).` : `.`);

    return {
      isValid: true,
      rawNumerator,
      rawDenominator,
      simplifiedNumerator: simN,
      simplifiedDenominator: simD,
      formattedRawFraction,
      formattedSimplifiedFraction,
      formattedMixedNumber,
      formattedDecimal,
      gcd,
      isWholeNumber: simD === 1,
      stepExplanation,
    };
  } catch (err) {
    return { isValid: false, error: (err as Error).message || "Calculation failed." };
  }
}

/**
 * Mode 4: Divide Fractions (a/b ÷ c/d)
 */
export function calculateFractionDivision(f1: FractionInput, f2: FractionInput): FractionOperationResult {
  const vA = validateInteger(f1.num, "Numerator 1");
  if (!vA.isValid) return { isValid: false, error: vA.error };
  const vB = validateInteger(f1.den, "Denominator 1");
  if (!vB.isValid) return { isValid: false, error: vB.error };
  const vC = validateInteger(f2.num, "Numerator 2");
  if (!vC.isValid) return { isValid: false, error: vC.error };
  const vD = validateInteger(f2.den, "Denominator 2");
  if (!vD.isValid) return { isValid: false, error: vD.error };

  let a = vA.value!;
  let b = vB.value!;
  let c = vC.value!;
  let d = vD.value!;

  if (b === 0 || d === 0) {
    return { isValid: false, error: "Denominator cannot be zero." };
  }

  // Divisor fraction cannot evaluate to zero (c === 0)
  if (c === 0) {
    return { isValid: false, error: "Division by zero: cannot divide by a fraction equal to zero (Numerator 2 is 0)." };
  }

  if (b < 0) { a = -a; b = -b; }
  if (d < 0) { c = -c; d = -d; }

  // Reciprocal fraction is d / c
  try {
    const rawNumerator = a * d;
    const rawDenominator = b * c;

    if (!Number.isSafeInteger(rawNumerator) || !Number.isSafeInteger(rawDenominator)) {
      return { isValid: false, error: "Reciprocal multiplication exceeds safe integer range." };
    }

    const { n: simN, d: simD, gcd } = normalizeFraction(rawNumerator, rawDenominator);

    const formattedRawFraction = formatFraction(rawNumerator, rawDenominator);
    const formattedSimplifiedFraction = formatFraction(simN, simD);
    const formattedMixedNumber = formatMixedNumber(simN, simD);
    const formattedDecimal = formatDecimalApprox(simN, simD);

    const stepExplanation =
      `Multiply by the reciprocal of ${c}/${d} (${d}/${c}): (${a} × ${d}) / (${b} × ${c}) = ${formattedRawFraction}` +
      (formattedRawFraction !== formattedSimplifiedFraction ? ` = ${formattedSimplifiedFraction} (reduced by GCD ${gcd}).` : `.`);

    return {
      isValid: true,
      rawNumerator,
      rawDenominator,
      simplifiedNumerator: simN,
      simplifiedDenominator: simD,
      formattedRawFraction,
      formattedSimplifiedFraction,
      formattedMixedNumber,
      formattedDecimal,
      gcd,
      isWholeNumber: simD === 1,
      stepExplanation,
    };
  } catch (err) {
    return { isValid: false, error: (err as Error).message || "Calculation failed." };
  }
}

/**
 * Mode 5: Simplify Fraction (a/b)
 */
export function calculateFractionSimplification(f: FractionInput): FractionOperationResult {
  const vA = validateInteger(f.num, "Numerator");
  if (!vA.isValid) return { isValid: false, error: vA.error };
  const vB = validateInteger(f.den, "Denominator");
  if (!vB.isValid) return { isValid: false, error: vB.error };

  const a = vA.value!;
  const b = vB.value!;

  if (b === 0) {
    return { isValid: false, error: "Denominator cannot be zero." };
  }

  try {
    const { n: simN, d: simD, gcd } = normalizeFraction(a, b);

    const formattedRawFraction = formatFraction(a, b);
    const formattedSimplifiedFraction = formatFraction(simN, simD);
    const formattedMixedNumber = formatMixedNumber(simN, simD);
    const formattedDecimal = formatDecimalApprox(simN, simD);

    const stepExplanation =
      a === 0
        ? `0 / ${b} simplifies directly to 0.`
        : gcd > 1
        ? `Greatest Common Divisor (GCD) of ${Math.abs(a)} and ${Math.abs(b)} is ${gcd}. Divide both numerator and denominator by ${gcd}: (${a} ÷ ${gcd}) / (${b} ÷ ${gcd}) = ${formattedSimplifiedFraction}.`
        : `${formattedRawFraction} is already in its simplest irreducible form (GCD = 1).`;

    return {
      isValid: true,
      rawNumerator: a,
      rawDenominator: b,
      simplifiedNumerator: simN,
      simplifiedDenominator: simD,
      formattedRawFraction,
      formattedSimplifiedFraction,
      formattedMixedNumber,
      formattedDecimal,
      gcd,
      isWholeNumber: simD === 1,
      stepExplanation,
    };
  } catch (err) {
    return { isValid: false, error: (err as Error).message || "Calculation failed." };
  }
}

/**
 * Mode 6A: Mixed Number to Improper Fraction (w n/d -> improper)
 */
export function convertMixedToImproper(m: MixedNumberInput): FractionOperationResult {
  const vW = validateInteger(m.whole, "Whole Number");
  if (!vW.isValid) return { isValid: false, error: vW.error };
  const vN = validateInteger(m.num, "Numerator");
  if (!vN.isValid) return { isValid: false, error: vN.error };
  const vD = validateInteger(m.den, "Denominator");
  if (!vD.isValid) return { isValid: false, error: vD.error };

  const w = vW.value!;
  const n = vN.value!;
  const d = vD.value!;

  if (d <= 0) {
    return { isValid: false, error: "Denominator in a mixed number must be a positive integer (> 0)." };
  }
  if (n < 0) {
    return { isValid: false, error: "Numerator in a mixed number must be non-negative (sign is carried by the whole number)." };
  }

  try {
    const sign = w < 0 ? -1 : 1;
    const absW = Math.abs(w);
    const improperNumerator = sign * (absW * d + n);
    const improperDenominator = d;

    if (!Number.isSafeInteger(improperNumerator)) {
      return { isValid: false, error: "Converted improper fraction numerator exceeds safe integer limits." };
    }

    const { n: simN, d: simD, gcd } = normalizeFraction(improperNumerator, improperDenominator);

    const mixedString = `${w !== 0 ? `${w} ` : ""}${n}/${d}`.trim();
    const formattedSimplifiedFraction = formatFraction(simN, simD);
    const formattedDecimal = formatDecimalApprox(simN, simD);

    const stepExplanation =
      absW === 0
        ? `Whole number is 0: fraction is already ${n}/${d}.`
        : `Multiply the whole number by denominator and add numerator: (${absW} × ${d} + ${n}) / ${d} = ${Math.abs(improperNumerator)}/${d}` +
          (w < 0 ? ` (applying negative sign gives ${improperNumerator}/${d})` : ``) +
          (gcd > 1 ? ` = ${formattedSimplifiedFraction} (reduced by GCD ${gcd}).` : `.`);

    return {
      isValid: true,
      rawNumerator: improperNumerator,
      rawDenominator: improperDenominator,
      simplifiedNumerator: simN,
      simplifiedDenominator: simD,
      formattedRawFraction: formatFraction(improperNumerator, improperDenominator),
      formattedSimplifiedFraction,
      formattedMixedNumber: mixedString,
      formattedDecimal,
      gcd,
      isWholeNumber: simD === 1,
      stepExplanation,
    };
  } catch (err) {
    return { isValid: false, error: (err as Error).message || "Calculation failed." };
  }
}

/**
 * Mode 6B: Improper Fraction to Mixed Number (n/d -> w r/d)
 */
export function convertImproperToMixed(f: FractionInput): FractionOperationResult {
  return calculateFractionSimplification(f);
}

// ==========================================
// 4. OUTPUT WRAPPERS FOR CALCULATOR RESULT
// ==========================================

export function formatArithmeticOutput(
  result: FractionOperationResult,
  operatorSymbol: string,
  operationName: string
): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid integers.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [];

  if (result.formattedRawFraction && result.formattedRawFraction !== result.formattedSimplifiedFraction) {
    secondaryValues.push({
      label: "Unreduced Fraction",
      value: result.formattedRawFraction,
    });
  }

  if (
    result.formattedMixedNumber &&
    result.formattedMixedNumber !== result.formattedSimplifiedFraction &&
    !result.isWholeNumber
  ) {
    secondaryValues.push({
      label: "Mixed Number",
      value: result.formattedMixedNumber,
    });
  }

  if (result.formattedDecimal !== undefined) {
    secondaryValues.push({
      label: "Decimal Approximation",
      value: result.formattedDecimal,
    });
  }

  if (result.gcd && result.gcd > 1) {
    secondaryValues.push({
      label: "Greatest Common Divisor (GCD)",
      value: String(result.gcd),
    });
  }

  if (result.lcm) {
    secondaryValues.push({
      label: "Least Common Denominator (LCD)",
      value: String(result.lcm),
    });
  }

  return {
    isValid: true,
    primaryValue: result.formattedSimplifiedFraction,
    primaryLabel: `${operationName} Result`,
    stepExplanation: result.stepExplanation,
    disclaimer: "All calculations are performed using exact integer arithmetic and reduced to lowest terms.",
    disclaimerLabel: "Exact Rational Arithmetic",
    secondaryValues,
  };
}

export function formatSimplifyOutput(result: FractionOperationResult): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid integers.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Original Fraction",
      value: result.formattedRawFraction || "0",
    },
    {
      label: "Greatest Common Divisor (GCD)",
      value: String(result.gcd ?? 1),
    },
    {
      label: "Decimal Approximation",
      value: result.formattedDecimal || "0",
    },
  ];

  if (
    result.formattedMixedNumber &&
    result.formattedMixedNumber !== result.formattedSimplifiedFraction &&
    !result.isWholeNumber
  ) {
    secondaryValues.push({
      label: "Mixed Number Form",
      value: result.formattedMixedNumber,
    });
  }

  return {
    isValid: true,
    primaryValue: result.formattedSimplifiedFraction,
    primaryLabel: "Simplified Fraction",
    stepExplanation: result.stepExplanation,
    disclaimer: "Fractions are simplified by dividing both numerator and denominator by their Euclidean Greatest Common Divisor.",
    disclaimerLabel: "Simplification Rule",
    secondaryValues,
  };
}

export function formatMixedNumberOutput(result: FractionOperationResult): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid integers.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Mixed Number Form",
      value: result.formattedMixedNumber || "0",
    },
    {
      label: "Improper Fraction",
      value: result.formattedSimplifiedFraction || "0",
    },
    {
      label: "Decimal Approximation",
      value: result.formattedDecimal || "0",
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedSimplifiedFraction,
    primaryLabel: "Improper Fraction",
    stepExplanation: result.stepExplanation,
    disclaimer: "Mixed numbers represent the sum of a whole number and a proper fraction.",
    disclaimerLabel: "Conversion Principle",
    secondaryValues,
  };
}

// ==========================================
// 5. CALCULATOR DEFINITION SCHEMA
// ==========================================

export const fractionCalculatorDefinition: CalculatorDefinition = {
  id: "fraction-calculator",
  slug: "fraction-calculator",
  name: "Fraction Calculator",
  category: "Math",
  categorySlug: "math",
  shortDescription:
    "Add, subtract, multiply, divide, and simplify fractions, or convert mixed numbers with exact integer arithmetic.",
  longDescription:
    "A comprehensive, deterministic fraction calculator for performing exact arithmetic on proper, improper, and mixed fractions with step-by-step reduction and LCD calculation.",
  icon: "➗",
  searchKeywords: [
    "fraction",
    "fraction calculator",
    "fraction simplifier",
    "add fractions",
    "subtract fractions",
    "multiply fractions",
    "divide fractions",
    "simplify fractions",
    "mixed number calculator",
    "improper fraction calculator",
    "reducing fractions",
    "equivalent fractions",
    "fraction solver",
    "fraction arithmetic",
  ],
  defaultModeId: "add-fractions",
  modes: [
    {
      id: "add-fractions",
      name: "Add Fractions",
      description: "Calculate the exact sum of two fractions (a/b + c/d) using common denominators and reduction.",
      formulaText: "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}",
      inputs: [
        {
          id: "num1",
          label: "Numerator 1 (a)",
          type: "number",
          defaultValue: 1,
          step: 1,
          placeholder: "e.g. 1",
          helperText: "Numerator of the first fraction",
        },
        {
          id: "den1",
          label: "Denominator 1 (b)",
          type: "number",
          defaultValue: 2,
          step: 1,
          placeholder: "e.g. 2",
          helperText: "Denominator of the first fraction (cannot be 0)",
        },
        {
          id: "num2",
          label: "Numerator 2 (c)",
          type: "number",
          defaultValue: 1,
          step: 1,
          placeholder: "e.g. 1",
          helperText: "Numerator of the second fraction",
        },
        {
          id: "den2",
          label: "Denominator 2 (d)",
          type: "number",
          defaultValue: 3,
          step: 1,
          placeholder: "e.g. 3",
          helperText: "Denominator of the second fraction (cannot be 0)",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateFractionAddition(
          { num: inputs?.num1, den: inputs?.den1 },
          { num: inputs?.num2, den: inputs?.den2 }
        );
        return formatArithmeticOutput(result, "+", "Addition");
      },
    },
    {
      id: "subtract-fractions",
      name: "Subtract Fractions",
      description: "Calculate the exact difference of two fractions (a/b - c/d).",
      formulaText: "\\frac{a}{b} - \\frac{c}{d} = \\frac{ad - bc}{bd}",
      inputs: [
        {
          id: "num1",
          label: "Numerator 1 (a)",
          type: "number",
          defaultValue: 3,
          step: 1,
          placeholder: "e.g. 3",
          helperText: "Numerator of the first fraction",
        },
        {
          id: "den1",
          label: "Denominator 1 (b)",
          type: "number",
          defaultValue: 4,
          step: 1,
          placeholder: "e.g. 4",
          helperText: "Denominator of the first fraction (cannot be 0)",
        },
        {
          id: "num2",
          label: "Numerator 2 (c)",
          type: "number",
          defaultValue: 1,
          step: 1,
          placeholder: "e.g. 1",
          helperText: "Numerator of the second fraction",
        },
        {
          id: "den2",
          label: "Denominator 2 (d)",
          type: "number",
          defaultValue: 6,
          step: 1,
          placeholder: "e.g. 6",
          helperText: "Denominator of the second fraction (cannot be 0)",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateFractionSubtraction(
          { num: inputs?.num1, den: inputs?.den1 },
          { num: inputs?.num2, den: inputs?.den2 }
        );
        return formatArithmeticOutput(result, "-", "Subtraction");
      },
    },
    {
      id: "multiply-fractions",
      name: "Multiply Fractions",
      description: "Calculate the exact product of two fractions (a/b × c/d) with cross-cancellation.",
      formulaText: "\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}",
      inputs: [
        {
          id: "num1",
          label: "Numerator 1 (a)",
          type: "number",
          defaultValue: 2,
          step: 1,
          placeholder: "e.g. 2",
          helperText: "Numerator of the first fraction",
        },
        {
          id: "den1",
          label: "Denominator 1 (b)",
          type: "number",
          defaultValue: 3,
          step: 1,
          placeholder: "e.g. 3",
          helperText: "Denominator of the first fraction (cannot be 0)",
        },
        {
          id: "num2",
          label: "Numerator 2 (c)",
          type: "number",
          defaultValue: 3,
          step: 1,
          placeholder: "e.g. 3",
          helperText: "Numerator of the second fraction",
        },
        {
          id: "den2",
          label: "Denominator 2 (d)",
          type: "number",
          defaultValue: 5,
          step: 1,
          placeholder: "e.g. 5",
          helperText: "Denominator of the second fraction (cannot be 0)",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateFractionMultiplication(
          { num: inputs?.num1, den: inputs?.den1 },
          { num: inputs?.num2, den: inputs?.den2 }
        );
        return formatArithmeticOutput(result, "×", "Multiplication");
      },
    },
    {
      id: "divide-fractions",
      name: "Divide Fractions",
      description: "Calculate the exact quotient of two fractions (a/b ÷ c/d) by multiplying by the reciprocal.",
      formulaText: "\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a \\times d}{b \\times c}",
      inputs: [
        {
          id: "num1",
          label: "Numerator 1 (a)",
          type: "number",
          defaultValue: 2,
          step: 1,
          placeholder: "e.g. 2",
          helperText: "Numerator of the first fraction",
        },
        {
          id: "den1",
          label: "Denominator 1 (b)",
          type: "number",
          defaultValue: 3,
          step: 1,
          placeholder: "e.g. 3",
          helperText: "Denominator of the first fraction (cannot be 0)",
        },
        {
          id: "num2",
          label: "Numerator 2 (c)",
          type: "number",
          defaultValue: 4,
          step: 1,
          placeholder: "e.g. 4",
          helperText: "Numerator of the second fraction (cannot be 0)",
        },
        {
          id: "den2",
          label: "Denominator 2 (d)",
          type: "number",
          defaultValue: 5,
          step: 1,
          placeholder: "e.g. 5",
          helperText: "Denominator of the second fraction (cannot be 0)",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateFractionDivision(
          { num: inputs?.num1, den: inputs?.den1 },
          { num: inputs?.num2, den: inputs?.den2 }
        );
        return formatArithmeticOutput(result, "÷", "Division");
      },
    },
    {
      id: "simplify-fraction",
      name: "Simplify Fraction",
      description: "Reduce any fraction to its simplest irreducible form using the Greatest Common Divisor (GCD).",
      formulaText: "\\frac{a}{b} = \\frac{a \\div \\text{GCD}}{b \\div \\text{GCD}}",
      inputs: [
        {
          id: "num",
          label: "Numerator (a)",
          type: "number",
          defaultValue: 18,
          step: 1,
          placeholder: "e.g. 18",
          helperText: "Numerator integer",
        },
        {
          id: "den",
          label: "Denominator (b)",
          type: "number",
          defaultValue: 24,
          step: 1,
          placeholder: "e.g. 24",
          helperText: "Denominator integer (cannot be 0)",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = calculateFractionSimplification({
          num: inputs?.num,
          den: inputs?.den,
        });
        return formatSimplifyOutput(result);
      },
    },
    {
      id: "mixed-number",
      name: "Mixed Number ↔ Improper",
      description: "Convert between mixed numbers (Whole + Numerator/Denominator) and improper fractions.",
      formulaText: "w \\frac{n}{d} = \\frac{(w \\times d) + n}{d}",
      inputs: [
        {
          id: "whole",
          label: "Whole Number (w)",
          type: "number",
          defaultValue: 2,
          step: 1,
          placeholder: "e.g. 2 (or 0 if none)",
          helperText: "Integer whole number part (can be positive, zero, or negative)",
        },
        {
          id: "num",
          label: "Numerator (n)",
          type: "number",
          defaultValue: 1,
          step: 1,
          placeholder: "e.g. 1",
          helperText: "Non-negative numerator integer",
        },
        {
          id: "den",
          label: "Denominator (d)",
          type: "number",
          defaultValue: 3,
          step: 1,
          placeholder: "e.g. 3",
          helperText: "Positive denominator integer (> 0)",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const result = convertMixedToImproper({
          whole: inputs?.whole,
          num: inputs?.num,
          den: inputs?.den,
        });
        return formatMixedNumberOutput(result);
      },
    },
  ],
  formulas: [
    {
      modeId: "add-fractions",
      title: "1. Fraction Addition Formula",
      formulaMath: "\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}",
      explanation:
        "To add two fractions, find a common denominator (ideally the Least Common Multiple of b and d), scale both numerators accordingly, add them together, and simplify by their GCD.",
      example: "For 1/2 + 1/3: Common denominator is 6. (1 × 3 + 1 × 2) / 6 = (3 + 2) / 6 = 5/6.",
      whenToUse: "Use when combining fractional quantities, ingredients, or parts of a whole.",
    },
    {
      modeId: "subtract-fractions",
      title: "2. Fraction Subtraction Formula",
      formulaMath: "\\frac{a}{b} - \\frac{c}{d} = \\frac{ad - bc}{bd}",
      explanation:
        "To subtract fractions, find a common denominator, scale both numerators, subtract the second numerator from the first, and reduce the result to lowest terms.",
      example: "For 3/4 - 1/6: LCD is 12. (3 × 3 - 1 × 2) / 12 = (9 - 2) / 12 = 7/12.",
      whenToUse: "Use when finding the difference between two fractional amounts.",
    },
    {
      modeId: "multiply-fractions",
      title: "3. Fraction Multiplication Formula",
      formulaMath: "\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}",
      explanation:
        "To multiply fractions, multiply the numerators together and the denominators together. You can cross-cancel common factors before multiplying to keep numbers small.",
      example: "For 2/3 × 3/5: Multiply numerators (2 × 3 = 6) and denominators (3 × 5 = 15). 6/15 simplifies by 3 to 2/5.",
      whenToUse: "Use when finding a fraction of another fraction or scaling measurements.",
    },
    {
      modeId: "divide-fractions",
      title: "4. Fraction Division Formula (Reciprocal)",
      formulaMath: "\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a \\times d}{b \\times c}",
      explanation:
        "Dividing by a fraction is equivalent to multiplying by its reciprocal (flipping the numerator and denominator of the divisor).",
      example: "For 2/3 ÷ 4/5: Multiply 2/3 by reciprocal 5/4 = (2 × 5) / (3 × 4) = 10/12 = 5/6.",
      whenToUse: "Use when dividing quantities into fractional portions or determining ratios.",
    },
    {
      modeId: "simplify-fraction",
      title: "5. Fraction Simplification (GCD Reduction)",
      formulaMath: "\\frac{a}{b} = \\frac{a \\div \\text{GCD}}{b \\div \\text{GCD}}",
      explanation:
        "A fraction is in simplest form when its numerator and denominator share no common positive divisor other than 1. Dividing both by their Greatest Common Divisor reduces the fraction.",
      example: "For 18/24: GCD(18, 24) = 6. (18 ÷ 6) / (24 ÷ 6) = 3/4.",
      whenToUse: "Use to express any fraction in standard, lowest irreducible terms.",
    },
    {
      modeId: "mixed-number",
      title: "6. Mixed Number Conversion Formula",
      formulaMath: "w \\frac{n}{d} = \\frac{(w \\times d) + n}{d}",
      explanation:
        "To convert a mixed number to an improper fraction, multiply the whole number by the denominator, add the numerator, and place the result over the original denominator.",
      example: "For 2 1/3: (2 × 3 + 1) / 3 = 7/3.",
      whenToUse: "Use when preparing mixed numbers for mathematical operations or converting improper fractions back to readable quantities.",
    },
  ],
  examples: [
    {
      title: "Example 1: Add Fractions 1/2 + 1/3",
      description: "Find the exact sum of 1/2 and 1/3.",
      modeId: "add-fractions",
      inputs: { num1: 1, den1: 2, num2: 1, den2: 3 },
      expectedOutput: "5/6",
    },
    {
      title: "Example 2: Subtract Fractions 3/4 - 1/6",
      description: "Find the exact difference between 3/4 and 1/6.",
      modeId: "subtract-fractions",
      inputs: { num1: 3, den1: 4, num2: 1, den2: 6 },
      expectedOutput: "7/12",
    },
    {
      title: "Example 3: Multiply Fractions 2/3 × 3/5",
      description: "Multiply 2/3 by 3/5 and simplify.",
      modeId: "multiply-fractions",
      inputs: { num1: 2, den1: 3, num2: 3, den2: 5 },
      expectedOutput: "2/5",
    },
    {
      title: "Example 4: Divide Fractions 2/3 ÷ 4/5",
      description: "Divide 2/3 by 4/5 using reciprocal multiplication.",
      modeId: "divide-fractions",
      inputs: { num1: 2, den1: 3, num2: 4, den2: 5 },
      expectedOutput: "5/6",
    },
    {
      title: "Example 5: Simplify Fraction 18/24",
      description: "Reduce 18/24 to lowest terms using GCD.",
      modeId: "simplify-fraction",
      inputs: { num: 18, den: 24 },
      expectedOutput: "3/4",
    },
    {
      title: "Example 6: Convert Mixed Number 2 1/3 to Improper",
      description: "Convert mixed number 2 1/3 to improper fraction 7/3.",
      modeId: "mixed-number",
      inputs: { whole: 2, num: 1, den: 3 },
      expectedOutput: "7/3",
    },
  ],
  faqs: [
    {
      question: "How do I use a fraction in a calculator?",
      answer:
        "To use a fraction in this calculator, select your desired operation (Add, Subtract, Multiply, Divide, Simplify, or Mixed Number), enter the integer numerators and denominators into their dedicated fields, and the calculator will instantaneously generate the exact reduced fraction, step-by-step work, and decimal approximation.",
    },
    {
      question: "How do I solve fractions on a calculator?",
      answer:
        "Choose the operation mode matching your problem, enter the numerators and non-zero denominators, and the solver executes exact integer arithmetic. It automatically identifies common denominators, performs reciprocal multiplication for division, and reduces the answer to lowest terms using GCD.",
    },
    {
      question: "How do I simplify a fraction?",
      answer:
        "Use the 'Simplify Fraction' mode to enter your numerator and denominator. The calculator determines the Greatest Common Divisor (GCD) of both numbers using the Euclidean algorithm and divides both by it to produce the irreducible lowest form (e.g., 18/24 simplifies to 3/4).",
    },
    {
      question: "How do I convert a fraction to a decimal?",
      answer:
        "To convert a fraction to a decimal, divide the top numerator by the bottom denominator (e.g., 3 ÷ 4 = 0.75). In YourCalculate, every fraction calculation automatically provides a precise decimal approximation in the secondary result metrics.",
    },
    {
      question: "How do you add fractions with different denominators?",
      answer:
        "To add fractions with different denominators, first find the Least Common Denominator (LCD). Multiply the numerator and denominator of each fraction so they share this common denominator, then add the numerators together while keeping the denominator the same, reducing by GCD.",
    },
    {
      question: "How do you divide fractions using the reciprocal?",
      answer:
        "To divide by a fraction, invert the divisor (flip the second fraction to obtain its reciprocal) and multiply: a/b ÷ c/d = a/b × d/c = ad/bc. Dividing by a fraction equal to zero is mathematically undefined.",
    },
    {
      question: "How do you convert a mixed number to an improper fraction?",
      answer:
        "Multiply the whole number by the denominator, add the numerator, and place the result over the original denominator. For example, for 2 1/3: (2 × 3 + 1) / 3 = 7/3.",
    },
    {
      question: "What is the difference between a proper and improper fraction?",
      answer:
        "A proper fraction has a numerator that is smaller than its denominator (e.g., 3/4), representing a value less than 1. An improper fraction has a numerator equal to or greater than its denominator (e.g., 7/3 or 5/5), representing a value of 1 or greater.",
    },
  ],
  relatedCalculators: [
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
    {
      id: "discount-calculator",
      name: "Discount Calculator",
      category: "Finance",
      slug: "/discount-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "Fraction Calculator — Add, Subtract, Multiply & Divide Fractions | YourCalculate",
    description:
      "Free online fraction calculator. Add, subtract, multiply, divide, and simplify fractions, or convert mixed numbers with step-by-step exact solutions.",
    canonicalPath: "/fraction-calculator",
    keywords: [
      "fraction calculator",
      "fraction simplifier",
      "add fractions",
      "subtract fractions",
      "multiply fractions",
      "divide fractions",
      "simplify fractions",
      "mixed number calculator",
      "improper fraction calculator",
      "reducing fractions",
      "equivalent fractions",
    ],
  },
};
