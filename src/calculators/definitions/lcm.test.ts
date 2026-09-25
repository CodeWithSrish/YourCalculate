import assert from "node:assert";
import {
  calculateGCD,
  calculateLCM,
  calculateCombinedTwo,
  calculateMultipleGCD,
  calculateMultipleLCM,
  calculateMultipleCombined,
  formatLCMOutput,
  formatGCDOutput,
  formatCombinedTwoOutput,
  formatMultiNumberOutput,
  lcmCalculatorDefinition,
} from "./lcm";
import { searchCalculators } from "../engine/search";

console.log("Running LCM & GCD Calculator Engine Tests...\n");

// ==========================================
// 1. GCD UNIT TESTS
// ==========================================

// Test 1: GCD of composite numbers (12, 18 -> 6)
assert.strictEqual(calculateGCD(12, 18), 6);
console.log("✓ Test 1: GCD of composite numbers (12, 18 -> 6)");

// Test 2: GCD of coprime numbers (8, 15 -> 1)
assert.strictEqual(calculateGCD(8, 15), 1);
console.log("✓ Test 2: GCD of coprime numbers (8, 15 -> 1)");

// Test 3: GCD of equal numbers (14, 14 -> 14)
assert.strictEqual(calculateGCD(14, 14), 14);
console.log("✓ Test 3: GCD of equal numbers (14, 14 -> 14)");

// Test 4: GCD when one divides another (6, 24 -> 6)
assert.strictEqual(calculateGCD(6, 24), 6);
console.log("✓ Test 4: GCD when one number divides another (6, 24 -> 6)");

// Test 5: GCD with zero (0, 12 -> 12 and 12, 0 -> 12)
assert.strictEqual(calculateGCD(0, 12), 12);
assert.strictEqual(calculateGCD(12, 0), 12);
console.log("✓ Test 5: GCD with zero (0, 12 -> 12)");

// Test 6: GCD with both zeros (0, 0 -> 0)
assert.strictEqual(calculateGCD(0, 0), 0);
console.log("✓ Test 6: GCD with both zeros (0, 0 -> 0)");

// Test 7: GCD with negative values (-12, 18 -> 6 and -12, -18 -> 6)
assert.strictEqual(calculateGCD(-12, 18), 6);
assert.strictEqual(calculateGCD(-12, -18), 6);
console.log("✓ Test 7: GCD with negative values normalizes to positive magnitude");

// Test 8: Multiple GCD (3 numbers: 12, 18, 24 -> 6)
assert.strictEqual(calculateMultipleGCD([12, 18, 24]), 6);
console.log("✓ Test 8: Multiple GCD (12, 18, 24 -> 6)");

// Test 9: Multiple GCD (4 numbers: 15, 20, 30, 45 -> 5)
assert.strictEqual(calculateMultipleGCD([15, 20, 30, 45]), 5);
console.log("✓ Test 9: Multiple GCD (15, 20, 30, 45 -> 5)");

// Test 10: Multiple GCD (10 numbers)
assert.strictEqual(calculateMultipleGCD([20, 40, 60, 80, 100, 120, 140, 160, 180, 200]), 20);
console.log("✓ Test 10: Multiple GCD across 10 numbers");

// ==========================================
// 2. LCM UNIT TESTS
// ==========================================

// Test 11: LCM of composite numbers (12, 18 -> 36)
assert.strictEqual(calculateLCM(12, 18), 36);
console.log("✓ Test 11: LCM of composite numbers (12, 18 -> 36)");

// Test 12: LCM of coprime numbers (8, 15 -> 120)
assert.strictEqual(calculateLCM(8, 15), 120);
console.log("✓ Test 12: LCM of coprime numbers (8, 15 -> 120)");

// Test 13: LCM of equal numbers (14, 14 -> 14)
assert.strictEqual(calculateLCM(14, 14), 14);
console.log("✓ Test 13: LCM of equal numbers (14, 14 -> 14)");

// Test 14: LCM when one divides another (6, 24 -> 24)
assert.strictEqual(calculateLCM(6, 24), 24);
console.log("✓ Test 14: LCM when one number divides another (6, 24 -> 24)");

// Test 15: LCM with zero (0, 12 -> 0 and 12, 0 -> 0)
assert.strictEqual(calculateLCM(0, 12), 0);
assert.strictEqual(calculateLCM(12, 0), 0);
console.log("✓ Test 15: LCM with zero evaluates strictly to 0");

// Test 16: LCM with both zeros (0, 0 -> 0)
assert.strictEqual(calculateLCM(0, 0), 0);
console.log("✓ Test 16: LCM with both zeros evaluates strictly to 0");

// Test 17: LCM with negative values (-12, 18 -> 36 and -12, -18 -> 36)
assert.strictEqual(calculateLCM(-12, 18), 36);
assert.strictEqual(calculateLCM(-12, -18), 36);
console.log("✓ Test 17: LCM with negative values normalizes to positive magnitude");

// Test 18: Multiple LCM (3 numbers: 12, 18, 24 -> 72)
assert.strictEqual(calculateMultipleLCM([12, 18, 24]), 72);
console.log("✓ Test 18: Multiple LCM (12, 18, 24 -> 72)");

// Test 19: Multiple LCM (4 numbers: 15, 20, 30, 45 -> 180)
assert.strictEqual(calculateMultipleLCM([15, 20, 30, 45]), 180);
console.log("✓ Test 19: Multiple LCM (15, 20, 30, 45 -> 180)");

// Test 20: Multiple LCM (10 numbers)
assert.strictEqual(calculateMultipleLCM([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 2520);
console.log("✓ Test 20: Multiple LCM across 10 numbers (1..10 -> 2520)");

// ==========================================
// 3. COMBINED TWO & PRODUCT IDENTITY TESTS
// ==========================================

// Test 21: Combined Two and Product Identity (12, 18 -> GCD 6, LCM 36, Product 216)
const comb1 = calculateCombinedTwo(12, 18);
assert.strictEqual(comb1.isValid, true);
assert.strictEqual(comb1.gcd, 6);
assert.strictEqual(comb1.lcm, 36);
assert.strictEqual(comb1.product, 216);
assert.strictEqual(comb1.productMatchesIdentity, true);
console.log("✓ Test 21: Product identity verified for two numbers (12 × 18 = 6 × 36 = 216)");

// Test 22: Unsafe product does not produce inaccurate values
// (Very large numbers where product exceeds MAX_SAFE_INTEGER)
const largeA = 9000000000;
const largeB = 9000000000;
const combLarge = calculateCombinedTwo(largeA, largeB);
assert.strictEqual(combLarge.isValid, true);
assert.strictEqual(combLarge.gcd, 9000000000);
assert.strictEqual(combLarge.lcm, 9000000000);
// Product exceeds 2^53 - 1, so product should safely be undefined
assert.strictEqual(combLarge.product, undefined);
console.log("✓ Test 22: Unsafe product handles safely without exceeding integer limits");

// ==========================================
// 4. VALIDATION TESTS
// ==========================================

// Test 23: Decimal inputs rejected with clear message
const errDecimal = calculateCombinedTwo(12.5, 18);
assert.strictEqual(errDecimal.isValid, false);
assert.ok(errDecimal.error?.includes("whole integers only"));
console.log("✓ Test 23: Decimal inputs rejected with whole integer requirement error");

// Test 24: Empty / missing input rejected
const errEmpty = calculateCombinedTwo("" as unknown as number, 18);
assert.strictEqual(errEmpty.isValid, false);
console.log("✓ Test 24: Empty and missing inputs rejected");

// Test 25: NaN and Infinity rejected
const errNaN = calculateCombinedTwo(NaN, 18);
assert.strictEqual(errNaN.isValid, false);
const errInf = calculateCombinedTwo(Infinity, 18);
assert.strictEqual(errInf.isValid, false);
console.log("✓ Test 25: NaN and Infinity rejected safely");

// Test 26: Unsafe integer rejected
const errUnsafe = calculateCombinedTwo(Number.MAX_SAFE_INTEGER + 10, 18);
assert.strictEqual(errUnsafe.isValid, false);
assert.ok(errUnsafe.error?.includes("safe integer limit"));
console.log("✓ Test 26: Out-of-bounds unsafe integers rejected");

// Test 27: Multi-number array bounds (fewer than 2, more than 10)
const errFew = calculateMultipleCombined([12]);
assert.strictEqual(errFew.isValid, false);
assert.ok(errFew.error?.includes("at least 2 numbers"));

const errMany = calculateMultipleCombined([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
assert.strictEqual(errMany.isValid, false);
assert.ok(errMany.error?.includes("maximum of 10 numbers"));
console.log("✓ Test 27: Multi-number array bounds (2-10) enforced");

// ==========================================
// 5. OUTPUT FORMATTERS & DEFINITION TESTS
// ==========================================

// Test 28: Formatter structures
const outLcm = formatLCMOutput(comb1);
assert.strictEqual(outLcm.isValid, true);
assert.strictEqual(outLcm.primaryValue, "36");
assert.strictEqual(outLcm.primaryLabel, "Least Common Multiple (LCM)");

const outGcd = formatGCDOutput(comb1);
assert.strictEqual(outGcd.isValid, true);
assert.strictEqual(outGcd.primaryValue, "6");
assert.strictEqual(outGcd.primaryLabel, "Greatest Common Divisor (GCD / HCF)");

const outCombined = formatCombinedTwoOutput(comb1);
assert.strictEqual(outCombined.isValid, true);
assert.ok(String(outCombined.primaryValue).includes("GCD: 6"));
assert.ok(String(outCombined.primaryValue).includes("LCM: 36"));

const multiComb = calculateMultipleCombined([12, 18, 24]);
const outMulti = formatMultiNumberOutput(multiComb);
assert.strictEqual(outMulti.isValid, true);
assert.strictEqual(multiComb.gcd, 6);
assert.strictEqual(multiComb.lcm, 72);
console.log("✓ Test 28: Output formatters produce structured calculation outputs");

// Test 29: MathFormula Parser Safety
assert.strictEqual(lcmCalculatorDefinition.slug, "lcm-calculator");
assert.strictEqual(lcmCalculatorDefinition.modes.length, 4);
assert.strictEqual(lcmCalculatorDefinition.formulas.length, 4);
assert.strictEqual(lcmCalculatorDefinition.examples.length, 6);
assert.strictEqual(lcmCalculatorDefinition.faqs.length, 8);

for (const formula of lcmCalculatorDefinition.formulas) {
  assert.strictEqual(formula.formulaMath.includes("\\left"), false, "Formula must not contain \\left");
  assert.strictEqual(formula.formulaMath.includes("\\right"), false, "Formula must not contain \\right");
  assert.strictEqual(formula.formulaMath.includes("\\cdots"), false, "Formula must not contain \\cdots");
  assert.strictEqual(formula.formulaMath.includes("\\sum"), false, "Formula must not contain \\sum");
  assert.strictEqual(formula.formulaMath.includes("\\frac{\\frac"), false, "Formula must not contain nested \\frac");

  const openBraces = (formula.formulaMath.match(/\{/g) || []).length;
  const closeBraces = (formula.formulaMath.match(/\}/g) || []).length;
  assert.strictEqual(openBraces, closeBraces, "Braces must be balanced in formulaMath");
}
console.log("✓ Test 29: All formulas strictly conform to MathFormula parser constraints");

// Test 30: All 6 worked examples match engine outputs
const ex1 = calculateCombinedTwo(12, 18);
assert.strictEqual(formatCombinedTwoOutput(ex1).primaryValue, lcmCalculatorDefinition.examples[0].expectedOutput);

const ex2 = calculateCombinedTwo(8, 15);
assert.strictEqual(formatCombinedTwoOutput(ex2).primaryValue, lcmCalculatorDefinition.examples[1].expectedOutput);

const ex3 = calculateCombinedTwo(6, 24);
assert.strictEqual(formatCombinedTwoOutput(ex3).primaryValue, lcmCalculatorDefinition.examples[2].expectedOutput);

const ex4 = calculateMultipleCombined([12, 18, 24]);
assert.strictEqual(formatMultiNumberOutput(ex4).primaryValue, lcmCalculatorDefinition.examples[3].expectedOutput);

const ex5 = calculateMultipleCombined([15, 20, 30, 45]);
assert.strictEqual(formatMultiNumberOutput(ex5).primaryValue, lcmCalculatorDefinition.examples[4].expectedOutput);

const ex6 = calculateCombinedTwo(0, 12);
assert.strictEqual(formatCombinedTwoOutput(ex6).primaryValue, lcmCalculatorDefinition.examples[5].expectedOutput);
console.log("✓ Test 30: All 6 worked examples match engine outputs");

// Test 31: High-intent search discovery keywords
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("lcm"));
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("lcm calculator"));
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("gcd"));
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("gcd calculator"));
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("hcf"));
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("hcf calculator"));
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("least common multiple"));
assert.ok(lcmCalculatorDefinition.searchKeywords?.includes("greatest common divisor"));
console.log("✓ Test 31: High-intent search keywords present in definition");

// Test 32: Search engine discovery ranking
const searchResultsLcm = searchCalculators("lcm");
assert.ok(searchResultsLcm.length > 0);
assert.strictEqual(searchResultsLcm[0].calculator.slug, "lcm-calculator");

const searchResultsGcd = searchCalculators("gcd calculator");
assert.ok(searchResultsGcd.length > 0);
assert.strictEqual(searchResultsGcd[0].calculator.slug, "lcm-calculator");

const searchResultsHcf = searchCalculators("hcf");
assert.ok(searchResultsHcf.length > 0);
assert.strictEqual(searchResultsHcf[0].calculator.slug, "lcm-calculator");
console.log("✓ Test 32: Search engine discovers LCM & GCD Calculator for 'lcm', 'gcd', and 'hcf'");

console.log("\nAll 32 LCM & GCD Calculator QA tests passed successfully!");
