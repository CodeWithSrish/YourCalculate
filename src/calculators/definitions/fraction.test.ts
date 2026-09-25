import assert from "node:assert";
import {
  calculateGCD,
  calculateLCM,
  normalizeFraction,
  formatFraction,
  formatMixedNumber,
  formatDecimalApprox,
  calculateFractionAddition,
  calculateFractionSubtraction,
  calculateFractionMultiplication,
  calculateFractionDivision,
  calculateFractionSimplification,
  convertMixedToImproper,
  convertImproperToMixed,
  formatArithmeticOutput,
  formatSimplifyOutput,
  formatMixedNumberOutput,
  fractionCalculatorDefinition,
} from "./fraction";

console.log("Running Fraction Calculator Engine Tests...\n");

// ==========================================
// 1. MATHEMATICAL HELPER TESTS
// ==========================================

// Test 1: calculateGCD
assert.strictEqual(calculateGCD(18, 24), 6);
assert.strictEqual(calculateGCD(7, 13), 1);
assert.strictEqual(calculateGCD(-12, 18), 6);
assert.strictEqual(calculateGCD(0, 5), 5);
console.log("✓ Test 1: calculateGCD computes exact greatest common divisor");

// Test 2: calculateLCM
assert.strictEqual(calculateLCM(4, 6), 12);
assert.strictEqual(calculateLCM(2, 3), 6);
assert.strictEqual(calculateLCM(5, 5), 5);
console.log("✓ Test 2: calculateLCM computes exact least common multiple");

// Test 3: normalizeFraction sign and reduction
const norm1 = normalizeFraction(18, 24);
assert.strictEqual(norm1.n, 3);
assert.strictEqual(norm1.d, 4);

const norm2 = normalizeFraction(1, -2);
assert.strictEqual(norm2.n, -1);
assert.strictEqual(norm2.d, 2);

const norm3 = normalizeFraction(-2, -3);
assert.strictEqual(norm3.n, 2);
assert.strictEqual(norm3.d, 3);

const normZero = normalizeFraction(0, 5);
assert.strictEqual(normZero.n, 0);
assert.strictEqual(normZero.d, 1);
console.log("✓ Test 3: normalizeFraction canonicalizes signs and reduces terms");

// Helper formatters tests
assert.strictEqual(formatFraction(5, 1), "5");
assert.strictEqual(formatFraction(5, 6), "5/6");
assert.strictEqual(formatDecimalApprox(1, 3), "0.333333");
assert.strictEqual(formatDecimalApprox(4, 2), "2");

const impToMix = convertImproperToMixed({ num: 7, den: 3 });
assert.strictEqual(impToMix.isValid, true);
assert.strictEqual(impToMix.formattedMixedNumber, "2 1/3");

// ==========================================
// 2. ADDITION TESTS
// ==========================================

// Test 4: Addition with same denominator (1/5 + 2/5 = 3/5)
const addSame = calculateFractionAddition({ num: 1, den: 5 }, { num: 2, den: 5 });
assert.strictEqual(addSame.isValid, true);
assert.strictEqual(addSame.simplifiedNumerator, 3);
assert.strictEqual(addSame.simplifiedDenominator, 5);
assert.strictEqual(addSame.formattedSimplifiedFraction, "3/5");
console.log("✓ Test 4: Addition with same denominator (1/5 + 2/5 = 3/5)");

// Test 5: Addition with different denominators and reduction (1/2 + 1/6 = 2/3)
const addDiff = calculateFractionAddition({ num: 1, den: 2 }, { num: 1, den: 6 });
assert.strictEqual(addDiff.isValid, true);
assert.strictEqual(addDiff.formattedRawFraction, "4/6");
assert.strictEqual(addDiff.formattedSimplifiedFraction, "2/3");
assert.strictEqual(addDiff.lcm, 6);
console.log("✓ Test 5: Addition with different denominators (1/2 + 1/6 = 2/3)");

// Test 6: Addition with standard worked example (1/2 + 1/3 = 5/6)
const addEx1 = calculateFractionAddition({ num: 1, den: 2 }, { num: 1, den: 3 });
assert.strictEqual(addEx1.isValid, true);
assert.strictEqual(addEx1.formattedSimplifiedFraction, "5/6");
assert.strictEqual(addEx1.formattedDecimal, "0.833333");
console.log("✓ Test 6: Standard addition worked example (1/2 + 1/3 = 5/6)");

// Test 7: Addition with negative fraction (-1/4 + 3/4 = 1/2)
const addNeg = calculateFractionAddition({ num: -1, den: 4 }, { num: 3, den: 4 });
assert.strictEqual(addNeg.isValid, true);
assert.strictEqual(addNeg.formattedSimplifiedFraction, "1/2");
console.log("✓ Test 7: Addition with negative fraction (-1/4 + 3/4 = 1/2)");

// Test 8: Addition with zero numerator (0/5 + 2/3 = 2/3)
const addZero = calculateFractionAddition({ num: 0, den: 5 }, { num: 2, den: 3 });
assert.strictEqual(addZero.isValid, true);
assert.strictEqual(addZero.formattedSimplifiedFraction, "2/3");
console.log("✓ Test 8: Addition with zero numerator (0/5 + 2/3 = 2/3)");

// ==========================================
// 3. SUBTRACTION TESTS
// ==========================================

// Test 9: Subtraction with same denominator (4/7 - 2/7 = 2/7)
const subSame = calculateFractionSubtraction({ num: 4, den: 7 }, { num: 2, den: 7 });
assert.strictEqual(subSame.isValid, true);
assert.strictEqual(subSame.formattedSimplifiedFraction, "2/7");
console.log("✓ Test 9: Subtraction with same denominator (4/7 - 2/7 = 2/7)");

// Test 10: Subtraction with different denominators (3/4 - 1/6 = 7/12)
const subDiff = calculateFractionSubtraction({ num: 3, den: 4 }, { num: 1, den: 6 });
assert.strictEqual(subDiff.isValid, true);
assert.strictEqual(subDiff.formattedSimplifiedFraction, "7/12");
assert.strictEqual(subDiff.lcm, 12);
console.log("✓ Test 10: Subtraction with different denominators (3/4 - 1/6 = 7/12)");

// Test 11: Subtraction yielding negative result (1/3 - 1/2 = -1/6)
const subNeg = calculateFractionSubtraction({ num: 1, den: 3 }, { num: 1, den: 2 });
assert.strictEqual(subNeg.isValid, true);
assert.strictEqual(subNeg.formattedSimplifiedFraction, "-1/6");
console.log("✓ Test 11: Subtraction yielding negative result (1/3 - 1/2 = -1/6)");

// Test 12: Subtraction yielding zero result (3/5 - 3/5 = 0)
const subZero = calculateFractionSubtraction({ num: 3, den: 5 }, { num: 3, den: 5 });
assert.strictEqual(subZero.isValid, true);
assert.strictEqual(subZero.formattedSimplifiedFraction, "0");
console.log("✓ Test 12: Subtraction yielding zero result (3/5 - 3/5 = 0)");

// ==========================================
// 4. MULTIPLICATION TESTS
// ==========================================

// Test 13: Multiplication with reduction (2/3 × 3/5 = 2/5)
const mulEx = calculateFractionMultiplication({ num: 2, den: 3 }, { num: 3, den: 5 });
assert.strictEqual(mulEx.isValid, true);
assert.strictEqual(mulEx.formattedRawFraction, "6/15");
assert.strictEqual(mulEx.formattedSimplifiedFraction, "2/5");
console.log("✓ Test 13: Multiplication with cross-reduction (2/3 × 3/5 = 2/5)");

// Test 14: Multiplication yielding whole number (3/4 × 4/1 = 3)
const mulWhole = calculateFractionMultiplication({ num: 3, den: 4 }, { num: 4, den: 1 });
assert.strictEqual(mulWhole.isValid, true);
assert.strictEqual(mulWhole.formattedSimplifiedFraction, "3");
assert.strictEqual(mulWhole.isWholeNumber, true);
console.log("✓ Test 14: Multiplication yielding whole number (3/4 × 4/1 = 3)");

// Test 15: Multiplication with zero (0/4 × 5/6 = 0)
const mulZero = calculateFractionMultiplication({ num: 0, den: 4 }, { num: 5, den: 6 });
assert.strictEqual(mulZero.isValid, true);
assert.strictEqual(mulZero.formattedSimplifiedFraction, "0");
console.log("✓ Test 15: Multiplication with zero (0/4 × 5/6 = 0)");

// Test 16: Multiplication with negative terms (-2/3 × 3/5 = -2/5 and -2/3 × -3/5 = 2/5)
const mulNeg1 = calculateFractionMultiplication({ num: -2, den: 3 }, { num: 3, den: 5 });
assert.strictEqual(mulNeg1.formattedSimplifiedFraction, "-2/5");

const mulNeg2 = calculateFractionMultiplication({ num: -2, den: 3 }, { num: -3, den: 5 });
assert.strictEqual(mulNeg2.formattedSimplifiedFraction, "2/5");
console.log("✓ Test 16: Multiplication with negative terms");

// ==========================================
// 5. DIVISION TESTS
// ==========================================

// Test 17: Division using reciprocal (2/3 ÷ 4/5 = 5/6)
const divEx = calculateFractionDivision({ num: 2, den: 3 }, { num: 4, den: 5 });
assert.strictEqual(divEx.isValid, true);
assert.strictEqual(divEx.formattedRawFraction, "10/12");
assert.strictEqual(divEx.formattedSimplifiedFraction, "5/6");
console.log("✓ Test 17: Division using reciprocal (2/3 ÷ 4/5 = 5/6)");

// Test 18: Division by whole fraction (3/4 ÷ 2/1 = 3/8)
const divWhole = calculateFractionDivision({ num: 3, den: 4 }, { num: 2, den: 1 });
assert.strictEqual(divWhole.isValid, true);
assert.strictEqual(divWhole.formattedSimplifiedFraction, "3/8");
console.log("✓ Test 18: Division by whole fraction (3/4 ÷ 2/1 = 3/8)");

// Test 19: Division with zero dividend (0/5 ÷ 2/3 = 0)
const divZeroDividend = calculateFractionDivision({ num: 0, den: 5 }, { num: 2, den: 3 });
assert.strictEqual(divZeroDividend.isValid, true);
assert.strictEqual(divZeroDividend.formattedSimplifiedFraction, "0");
console.log("✓ Test 19: Division with zero dividend (0/5 ÷ 2/3 = 0)");

// Test 20: Division by zero fraction strictly rejected (2/3 ÷ 0/4)
const divByZero = calculateFractionDivision({ num: 2, den: 3 }, { num: 0, den: 4 });
assert.strictEqual(divByZero.isValid, false);
assert.ok(divByZero.error?.includes("Division by zero"));
console.log("✓ Test 20: Division by zero fraction strictly rejected");

// ==========================================
// 6. SIMPLIFICATION TESTS
// ==========================================

// Test 21: Simplify reducible fraction (18/24 = 3/4, GCD 6)
const sim1 = calculateFractionSimplification({ num: 18, den: 24 });
assert.strictEqual(sim1.isValid, true);
assert.strictEqual(sim1.formattedSimplifiedFraction, "3/4");
assert.strictEqual(sim1.gcd, 6);
console.log("✓ Test 21: Simplify reducible fraction (18/24 = 3/4)");

// Test 22: Already simplified fraction (7/11 = 7/11, GCD 1)
const sim2 = calculateFractionSimplification({ num: 7, den: 11 });
assert.strictEqual(sim2.isValid, true);
assert.strictEqual(sim2.formattedSimplifiedFraction, "7/11");
assert.strictEqual(sim2.gcd, 1);
console.log("✓ Test 22: Already simplified fraction preserved (7/11)");

// Test 23: Simplification to whole integer (24/6 = 4)
const simWhole = calculateFractionSimplification({ num: 24, den: 6 });
assert.strictEqual(simWhole.isValid, true);
assert.strictEqual(simWhole.formattedSimplifiedFraction, "4");
assert.strictEqual(simWhole.isWholeNumber, true);
console.log("✓ Test 23: Simplification to whole integer (24/6 = 4)");

// Test 24: Simplification with negative denominator (4/-8 = -1/2, -4/-8 = 1/2)
const simNeg1 = calculateFractionSimplification({ num: 4, den: -8 });
assert.strictEqual(simNeg1.formattedSimplifiedFraction, "-1/2");

const simNeg2 = calculateFractionSimplification({ num: -4, den: -8 });
assert.strictEqual(simNeg2.formattedSimplifiedFraction, "1/2");
console.log("✓ Test 24: Simplification normalizes negative signs");

// Test 25: Zero numerator simplification (0/12 = 0)
const simZero = calculateFractionSimplification({ num: 0, den: 12 });
assert.strictEqual(simZero.isValid, true);
assert.strictEqual(simZero.formattedSimplifiedFraction, "0");
console.log("✓ Test 25: Zero numerator simplifies to 0");

// ==========================================
// 7. MIXED NUMBER TESTS
// ==========================================

// Test 26: Mixed to improper (2 1/3 = 7/3)
const mix1 = convertMixedToImproper({ whole: 2, num: 1, den: 3 });
assert.strictEqual(mix1.isValid, true);
assert.strictEqual(mix1.formattedSimplifiedFraction, "7/3");
assert.strictEqual(mix1.formattedMixedNumber, "2 1/3");
console.log("✓ Test 26: Mixed number to improper fraction (2 1/3 = 7/3)");

// Test 27: Mixed with zero whole part (0 3/4 = 3/4)
const mixZero = convertMixedToImproper({ whole: 0, num: 3, den: 4 });
assert.strictEqual(mixZero.isValid, true);
assert.strictEqual(mixZero.formattedSimplifiedFraction, "3/4");
console.log("✓ Test 27: Mixed number with zero whole part (0 3/4 = 3/4)");

// Test 28: Negative mixed number (-2 1/3 = -7/3)
const mixNeg = convertMixedToImproper({ whole: -2, num: 1, den: 3 });
assert.strictEqual(mixNeg.isValid, true);
assert.strictEqual(mixNeg.formattedSimplifiedFraction, "-7/3");
console.log("✓ Test 28: Negative mixed number (-2 1/3 = -7/3)");

// Test 29: Improper to mixed formatting (7/3 -> 2 1/3, 12/4 -> 3, 3/5 -> 3/5)
assert.strictEqual(formatMixedNumber(7, 3), "2 1/3");
assert.strictEqual(formatMixedNumber(12, 4), "3");
assert.strictEqual(formatMixedNumber(3, 5), "3/5");
assert.strictEqual(formatMixedNumber(-7, 3), "-2 1/3");
console.log("✓ Test 29: Improper fraction formats accurately to mixed number");

// ==========================================
// 8. VALIDATION & ERROR HANDLING
// ==========================================

// Test 30: Zero denominator rejected across operations
const errDenZero = calculateFractionAddition({ num: 1, den: 0 }, { num: 1, den: 2 });
assert.strictEqual(errDenZero.isValid, false);
assert.strictEqual(errDenZero.error, "Denominator cannot be zero.");

const errSimZero = calculateFractionSimplification({ num: 5, den: 0 });
assert.strictEqual(errSimZero.isValid, false);
assert.strictEqual(errSimZero.error, "Denominator cannot be zero.");
console.log("✓ Test 30: Zero denominator safely rejected");

// Test 31: Decimal terms rejected with clear educational message
const errDecimal = calculateFractionAddition({ num: 1.5, den: 2 }, { num: 1, den: 3 });
assert.strictEqual(errDecimal.isValid, false);
assert.ok(errDecimal.error?.includes("must be a whole integer"));
console.log("✓ Test 31: Decimal inputs rejected with integer requirement message");

// Test 32: NaN and non-numeric inputs rejected
const errNaN = calculateFractionAddition({ num: NaN, den: 2 }, { num: 1, den: 3 });
assert.strictEqual(errNaN.isValid, false);
console.log("✓ Test 32: NaN inputs rejected safely");

// Test 33: Ambiguous negative mixed numerator rejected
const errMixNegNum = convertMixedToImproper({ whole: 2, num: -1, den: 3 });
assert.strictEqual(errMixNegNum.isValid, false);
assert.ok(errMixNegNum.error?.includes("must be non-negative"));
console.log("✓ Test 33: Negative numerator in mixed number rejected");

// ==========================================
// 9. OUTPUT FORMATTERS & DEFINITION TESTS
// ==========================================

// Test 34: Output Formatters produce structured outputs
const outAdd = formatArithmeticOutput(addEx1, "+", "Addition");
assert.strictEqual(outAdd.isValid, true);
assert.strictEqual(outAdd.primaryValue, "5/6");
assert.strictEqual(outAdd.primaryLabel, "Addition Result");

const outSim = formatSimplifyOutput(sim1);
assert.strictEqual(outSim.isValid, true);
assert.strictEqual(outSim.primaryValue, "3/4");
assert.strictEqual(outSim.primaryLabel, "Simplified Fraction");

const outMix = formatMixedNumberOutput(mix1);
assert.strictEqual(outMix.isValid, true);
assert.strictEqual(outMix.primaryValue, "7/3");
assert.strictEqual(outMix.primaryLabel, "Improper Fraction");
console.log("✓ Test 34: Formatters produce structured calculation outputs");

// Test 35: MathFormula LaTeX Parser Safety
assert.strictEqual(fractionCalculatorDefinition.slug, "fraction-calculator");
assert.strictEqual(fractionCalculatorDefinition.modes.length, 6);
assert.strictEqual(fractionCalculatorDefinition.formulas.length, 6);
assert.strictEqual(fractionCalculatorDefinition.examples.length, 6);
assert.strictEqual(fractionCalculatorDefinition.faqs.length, 8);

for (const formula of fractionCalculatorDefinition.formulas) {
  assert.strictEqual(formula.formulaMath.includes("\\left"), false, "Formula must not contain \\left");
  assert.strictEqual(formula.formulaMath.includes("\\right"), false, "Formula must not contain \\right");
  assert.strictEqual(formula.formulaMath.includes("\\cdots"), false, "Formula must not contain \\cdots");
  assert.strictEqual(formula.formulaMath.includes("\\sum"), false, "Formula must not contain \\sum");
  assert.strictEqual(formula.formulaMath.includes("\\frac{\\frac"), false, "Formula must not contain nested \\frac");

  const openBraces = (formula.formulaMath.match(/\{/g) || []).length;
  const closeBraces = (formula.formulaMath.match(/\}/g) || []).length;
  assert.strictEqual(openBraces, closeBraces, "Braces must be balanced in formulaMath");
}
console.log("✓ Test 35: All 6 formulas strictly conform to MathFormula parser constraints");

// Test 36: All 6 worked examples strictly match engine outputs
assert.strictEqual(addEx1.formattedSimplifiedFraction, fractionCalculatorDefinition.examples[0].expectedOutput);
assert.strictEqual(subDiff.formattedSimplifiedFraction, fractionCalculatorDefinition.examples[1].expectedOutput);
assert.strictEqual(mulEx.formattedSimplifiedFraction, fractionCalculatorDefinition.examples[2].expectedOutput);
assert.strictEqual(divEx.formattedSimplifiedFraction, fractionCalculatorDefinition.examples[3].expectedOutput);
assert.strictEqual(sim1.formattedSimplifiedFraction, fractionCalculatorDefinition.examples[4].expectedOutput);
assert.strictEqual(mix1.formattedSimplifiedFraction, fractionCalculatorDefinition.examples[5].expectedOutput);
console.log("✓ Test 36: All 6 worked examples match engine outputs");

// Test 37: High-intent search keywords present
assert.ok(fractionCalculatorDefinition.searchKeywords?.includes("fraction"));
assert.ok(fractionCalculatorDefinition.searchKeywords?.includes("fraction calculator"));
assert.ok(fractionCalculatorDefinition.searchKeywords?.includes("fraction simplifier"));
assert.ok(fractionCalculatorDefinition.searchKeywords?.includes("add fractions"));
assert.ok(fractionCalculatorDefinition.searchKeywords?.includes("simplify fractions"));
assert.ok(fractionCalculatorDefinition.searchKeywords?.includes("mixed number calculator"));
console.log("✓ Test 37: High-intent search keywords present in definition");

console.log("\nAll 37 Fraction Calculator QA tests passed successfully!");
