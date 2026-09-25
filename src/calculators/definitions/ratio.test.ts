import assert from "node:assert";
import {
  calculateGCD,
  normalizeDecimalPair,
  calculateSimplifiedRatio,
  solveProportion,
  splitAmountByRatio,
  formatSimplifyOutput,
  formatProportionOutput,
  formatSplitOutput,
  ratioCalculatorDefinition,
} from "./ratio";

console.log("Running Ratio Calculator Engine Tests...\n");

// ==========================================
// 1. GCD & NORMALIZATION TESTS
// ==========================================

// Test 1: GCD basic integers
assert.strictEqual(calculateGCD(12, 18), 6);
assert.strictEqual(calculateGCD(100, 250), 50);
assert.strictEqual(calculateGCD(7, 13), 1);
console.log("✓ Test 1: calculateGCD computes exact greatest common divisor");

// Test 2: Decimal pair normalization
const norm1 = normalizeDecimalPair(1.5, 2.5);
assert.strictEqual(norm1.intA, 15);
assert.strictEqual(norm1.intB, 25);
assert.strictEqual(norm1.multiplier, 10);

const norm2 = normalizeDecimalPair(0.25, 0.75);
assert.strictEqual(norm2.intA, 25);
assert.strictEqual(norm2.intB, 75);
assert.strictEqual(norm2.multiplier, 100);
console.log("✓ Test 2: normalizeDecimalPair scales decimals accurately to whole integers");

// ==========================================
// 2. SIMPLIFY RATIO TESTS
// ==========================================

// Test 3: Standard Integer Ratio (12 : 18 -> 2 : 3)
const s1 = calculateSimplifiedRatio(12, 18);
assert.strictEqual(s1.isValid, true);
assert.strictEqual(s1.simplifiedA, 2);
assert.strictEqual(s1.simplifiedB, 3);
assert.strictEqual(s1.simplifiedRatio, "2 : 3");
assert.strictEqual(s1.gcd, 6);
assert.strictEqual(s1.formattedDecimal, "0.6667");
console.log("✓ Test 3: 12 : 18 simplifies to 2 : 3 with GCD 6");

// Test 4: Already Simplified Ratio (2 : 3 -> 2 : 3)
const s2 = calculateSimplifiedRatio(2, 3);
assert.strictEqual(s2.isValid, true);
assert.strictEqual(s2.simplifiedRatio, "2 : 3");
assert.strictEqual(s2.gcd, 1);
console.log("✓ Test 4: Already simplified ratio 2 : 3 preserved with GCD 1");

// Test 5: Decimal Ratio (1.5 : 2.5 -> 3 : 5)
const s3 = calculateSimplifiedRatio(1.5, 2.5);
assert.strictEqual(s3.isValid, true);
assert.strictEqual(s3.simplifiedRatio, "3 : 5");
assert.strictEqual(s3.gcd, 5);
assert.strictEqual(s3.formattedDecimal, "0.6");
console.log("✓ Test 5: Decimal ratio 1.5 : 2.5 simplifies to 3 : 5");

// Test 6: Additional Decimal Ratios (0.5 : 1.5 -> 1 : 3 and 0.25 : 0.75 -> 1 : 3)
const s3b = calculateSimplifiedRatio(0.5, 1.5);
assert.strictEqual(s3b.isValid, true);
assert.strictEqual(s3b.simplifiedRatio, "1 : 3");

const s3c = calculateSimplifiedRatio(0.25, 0.75);
assert.strictEqual(s3c.isValid, true);
assert.strictEqual(s3c.simplifiedRatio, "1 : 3");
console.log("✓ Test 6: Decimal ratios 0.5:1.5 and 0.25:0.75 simplify to 1:3");

// Test 7: Large Integer Ratio (1000000 : 2500000 -> 2 : 5)
const s4 = calculateSimplifiedRatio(1000000, 2500000);
assert.strictEqual(s4.isValid, true);
assert.strictEqual(s4.simplifiedRatio, "2 : 5");
console.log("✓ Test 7: Large magnitude ratio simplifies accurately");

// Test 8: Zero and Negative Ratios Rejected
const s5a = calculateSimplifiedRatio(0, 10);
assert.strictEqual(s5a.isValid, false);
assert.strictEqual(s5a.error, "Ratio terms must be positive numbers greater than 0.");

const s5b = calculateSimplifiedRatio(-5, 10);
assert.strictEqual(s5b.isValid, false);
console.log("✓ Test 8: Zero and negative ratio terms rejected safely");

// Test 9: NaN and Infinity Rejected in Simplification
const s6a = calculateSimplifiedRatio(NaN, 10);
assert.strictEqual(s6a.isValid, false);

const s6b = calculateSimplifiedRatio(10, Infinity);
assert.strictEqual(s6b.isValid, false);
console.log("✓ Test 9: NaN and Infinity rejected in simplification");

// ==========================================
// 3. SOLVE PROPORTION TESTS (A : B = C : D)
// ==========================================

// Test 10: Unknown D (2 : 3 = 4 : D -> D = 6)
const p1 = solveProportion({ a: 2, b: 3, c: 4, d: null });
assert.strictEqual(p1.isValid, true);
assert.strictEqual(p1.unknownPosition, "D");
assert.strictEqual(p1.solvedValue, 6);
assert.strictEqual(p1.formattedSolvedValue, "6");
assert.strictEqual(p1.fullProportionString, "2 : 3 = 4 : 6");
console.log("✓ Test 10: Solve unknown D (2 : 3 = 4 : ?) = 6");

// Test 11: Unknown C (4 : 8 = C : 24 -> C = 12)
const p2 = solveProportion({ a: 4, b: 8, c: null, d: 24 });
assert.strictEqual(p2.isValid, true);
assert.strictEqual(p2.unknownPosition, "C");
assert.strictEqual(p2.solvedValue, 12);
assert.strictEqual(p2.fullProportionString, "4 : 8 = 12 : 24");
console.log("✓ Test 11: Solve unknown C (4 : 8 = ? : 24) = 12");

// Test 12: Unknown B (5 : B = 10 : 20 -> B = 10)
const p3 = solveProportion({ a: 5, b: null, c: 10, d: 20 });
assert.strictEqual(p3.isValid, true);
assert.strictEqual(p3.unknownPosition, "B");
assert.strictEqual(p3.solvedValue, 10);
assert.strictEqual(p3.fullProportionString, "5 : 10 = 10 : 20");
console.log("✓ Test 12: Solve unknown B (5 : ? = 10 : 20) = 10");

// Test 13: Unknown A (A : 7 = 15 : 35 -> A = 3)
const p4 = solveProportion({ a: null, b: 7, c: 15, d: 35 });
assert.strictEqual(p4.isValid, true);
assert.strictEqual(p4.unknownPosition, "A");
assert.strictEqual(p4.solvedValue, 3);
assert.strictEqual(p4.fullProportionString, "3 : 7 = 15 : 35");
console.log("✓ Test 13: Solve unknown A (? : 7 = 15 : 35) = 3");

// Test 14: Decimal Proportion (1.2 : 2.4 = 3.6 : D -> D = 7.2)
const p5 = solveProportion({ a: 1.2, b: 2.4, c: 3.6, d: null });
assert.strictEqual(p5.isValid, true);
assert.ok(Math.abs((p5.solvedValue ?? 0) - 7.2) < 1e-10);
assert.strictEqual(p5.formattedSolvedValue, "7.2");
console.log("✓ Test 14: Decimal proportion (1.2 : 2.4 = 3.6 : ?) solves to 7.2");

// Test 15: Valid Zero-Valued Known Terms
const pZeroA = solveProportion({ a: null, b: 3, c: 0, d: 6 }); // A = (3*0)/6 = 0
assert.strictEqual(pZeroA.isValid, true);
assert.strictEqual(pZeroA.solvedValue, 0);
assert.strictEqual(pZeroA.formattedSolvedValue, "0");

const pZeroD = solveProportion({ a: 2, b: 0, c: 4, d: null }); // D = (0*4)/2 = 0
assert.strictEqual(pZeroD.isValid, true);
assert.strictEqual(pZeroD.solvedValue, 0);
assert.strictEqual(pZeroD.formattedSolvedValue, "0");
console.log("✓ Test 15: Valid zero terms in proportion solve deterministically to 0");

// Test 16: Division by Zero / Underdetermined Proportions Rejected
const p6a = solveProportion({ a: 0, b: 3, c: 4, d: null }); // D = (3*4)/0 -> div by zero
assert.strictEqual(p6a.isValid, false);
assert.strictEqual(p6a.error, "Cannot solve proportion: Division by zero (A = 0) is undefined.");

const p6b = solveProportion({ a: 2, b: 0, c: null, d: 6 }); // C = (2*6)/0 -> div by zero
assert.strictEqual(p6b.isValid, false);
assert.strictEqual(p6b.error, "Cannot solve proportion: Division by zero (B = 0) is undefined.");

const pUnderdetermined = solveProportion({ a: null, b: 0, c: 0, d: 0 }); // A = (0*0)/0 -> underdetermined
assert.strictEqual(pUnderdetermined.isValid, false);
assert.strictEqual(pUnderdetermined.error, "Cannot solve proportion: Division by zero (D = 0) is undefined.");
console.log("✓ Test 16: Division by zero and underdetermined proportions rejected cleanly");

// Test 17: Multiple Unknowns and No Unknowns Rejected
const p7 = solveProportion({ a: 2, b: null, c: null, d: 6 });
assert.strictEqual(p7.isValid, false);

const p8 = solveProportion({ a: 2, b: 3, c: 4, d: 6 });
assert.strictEqual(p8.isValid, false);
console.log("✓ Test 17: Multiple unknowns and zero unknowns rejected");

// Test 18: NaN / Infinity in Proportion Rejected
const p9 = solveProportion({ a: NaN, b: 3, c: 4, d: null });
assert.strictEqual(p9.isValid, false);
console.log("✓ Test 18: NaN in proportion inputs rejected");

// ==========================================
// 4. SPLIT AMOUNT BY RATIO TESTS & MONETARY RECONCILIATION
// ==========================================

// Test 19: 2-Part Ratio Split (₹1,000 in 2 : 3)
const sp1 = splitAmountByRatio(1000, [2, 3]);
assert.strictEqual(sp1.isValid, true);
assert.strictEqual(sp1.parts?.length, 2);
assert.strictEqual(sp1.parts?.[0].amount, 400);
assert.strictEqual(sp1.parts?.[1].amount, 600);
assert.strictEqual(sp1.parts?.[0].formattedAmount, "₹400.00");
assert.strictEqual(sp1.parts?.[1].formattedAmount, "₹600.00");
assert.strictEqual(sp1.parts?.[0].formattedPercentage, "40%");
assert.strictEqual(sp1.parts?.[1].formattedPercentage, "60%");
console.log("✓ Test 19: ₹1,000 in 2:3 splits to ₹400.00 and ₹600.00");

// Test 20: 3-Part Ratio Split (₹1,000 in 2 : 3 : 5)
const sp2 = splitAmountByRatio(1000, [2, 3, 5]);
assert.strictEqual(sp2.isValid, true);
assert.strictEqual(sp2.parts?.length, 3);
assert.strictEqual(sp2.parts?.[0].amount, 200);
assert.strictEqual(sp2.parts?.[1].amount, 300);
assert.strictEqual(sp2.parts?.[2].amount, 500);
assert.strictEqual(sp2.parts?.[0].formattedAmount, "₹200.00");
assert.strictEqual(sp2.parts?.[1].formattedAmount, "₹300.00");
assert.strictEqual(sp2.parts?.[2].formattedAmount, "₹500.00");
console.log("✓ Test 20: ₹1,000 in 2:3:5 splits to ₹200.00, ₹300.00, and ₹500.00");

// Test 21: Exact Currency Reconciliation for Non-Even Divisions (₹100 in 1 : 1 : 1 -> ₹33.34, ₹33.33, ₹33.33)
const spUneven = splitAmountByRatio(100, [1, 1, 1]);
assert.strictEqual(spUneven.isValid, true);
assert.strictEqual(spUneven.parts?.[0].amount, 33.34);
assert.strictEqual(spUneven.parts?.[1].amount, 33.33);
assert.strictEqual(spUneven.parts?.[2].amount, 33.33);
assert.strictEqual(spUneven.parts?.[0].formattedAmount, "₹33.34");
assert.strictEqual(spUneven.parts?.[1].formattedAmount, "₹33.33");
assert.strictEqual(spUneven.parts?.[2].formattedAmount, "₹33.33");
const unevenSum = (spUneven.parts?.[0].amount ?? 0) + (spUneven.parts?.[1].amount ?? 0) + (spUneven.parts?.[2].amount ?? 0);
assert.strictEqual(unevenSum, 100);
console.log("✓ Test 21: ₹100 in 1:1:1 reconciles exactly to ₹33.34 + ₹33.33 + ₹33.33 = ₹100.00");

// Test 22: Exact Currency Reconciliation for 7-Way Split (₹10 in 7 parts of 1)
const sp7 = splitAmountByRatio(10, [1, 1, 1, 1, 1, 1, 1]);
assert.strictEqual(sp7.isValid, true);
const sum7 = sp7.parts?.reduce((acc, p) => acc + p.amount, 0);
assert.strictEqual(Math.round((sum7 ?? 0) * 100) / 100, 10);
console.log("✓ Test 22: 7-way split of ₹10 reconciles exactly to ₹10.00");

// Test 23: 10-Part Ratio Split (₹1,000 in 1..10)
const sp10 = splitAmountByRatio(1000, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
assert.strictEqual(sp10.isValid, true);
assert.strictEqual(sp10.parts?.length, 10);
const sum10 = sp10.parts?.reduce((acc, p) => acc + p.amount, 0);
assert.strictEqual(Math.round((sum10 ?? 0) * 100) / 100, 1000);
console.log("✓ Test 23: 10-part ratio split reconciles strictly to starting ₹1,000 total");

// Test 24: Decimal Total & Fractional Ratio Split (₹2,500.50 in 1.5 : 3.5)
const sp3 = splitAmountByRatio(2500.5, [1.5, 3.5]);
assert.strictEqual(sp3.isValid, true);
assert.strictEqual(sp3.totalRatioParts, 5);
assert.strictEqual(sp3.parts?.[0].amount, 750.15);
assert.strictEqual(sp3.parts?.[1].amount, 1750.35);
assert.strictEqual(sp3.parts?.[0].formattedAmount, "₹750.15");
assert.strictEqual(sp3.parts?.[1].formattedAmount, "₹1,750.35");
console.log("✓ Test 24: Decimal total ₹2,500.50 in 1.5:3.5 splits cleanly");

// Test 25: Zero Total Amount Allowed (₹0 split)
const spZero = splitAmountByRatio(0, [2, 3]);
assert.strictEqual(spZero.isValid, true);
assert.strictEqual(spZero.parts?.[0].amount, 0);
assert.strictEqual(spZero.parts?.[1].amount, 0);
console.log("✓ Test 25: Zero total amount correctly yields ₹0.00 shares");

// Test 26: Negative Total or Part Rejected
const sp5a = splitAmountByRatio(-500, [2, 3]);
assert.strictEqual(sp5a.isValid, false);

const sp5b = splitAmountByRatio(500, [2, -3]);
assert.strictEqual(sp5b.isValid, false);
console.log("✓ Test 26: Negative total and negative ratio parts rejected");

// Test 27: Zero Ratio Sum Rejected
const sp6 = splitAmountByRatio(500, [0, 0]);
assert.strictEqual(sp6.isValid, false);
assert.strictEqual(sp6.error, "Sum of ratio parts must be greater than 0.");
console.log("✓ Test 27: Zero ratio sum rejected");

// ==========================================
// 5. OUTPUT FORMATTERS & DEFINITION TESTS
// ==========================================

// Test 28: Formatter Output Structures
const out1 = formatSimplifyOutput(s1);
assert.strictEqual(out1.isValid, true);
assert.strictEqual(out1.primaryValue, "2 : 3");
assert.strictEqual(out1.primaryLabel, "Simplified Ratio");

const out2 = formatProportionOutput(p1);
assert.strictEqual(out2.isValid, true);
assert.strictEqual(out2.primaryValue, "6");
assert.strictEqual(out2.primaryLabel, "Solved Value (D)");

const out3 = formatSplitOutput(sp1);
assert.strictEqual(out3.isValid, true);
assert.strictEqual(out3.primaryValue, "₹400.00 + ₹600.00");
assert.strictEqual(out3.secondaryValues?.[2].label, "Part 1 — Ratio 2 — 40%");
assert.strictEqual(out3.secondaryValues?.[3].label, "Part 2 — Ratio 3 — 60%");
console.log("✓ Test 28: Formatters produce structured calculation outputs");

// Test 29: Definition Structure & MathFormula Parser Safety
assert.strictEqual(ratioCalculatorDefinition.slug, "ratio-calculator");
assert.strictEqual(ratioCalculatorDefinition.modes.length, 3);
assert.strictEqual(ratioCalculatorDefinition.formulas.length, 3);
assert.strictEqual(ratioCalculatorDefinition.examples.length, 6);
assert.strictEqual(ratioCalculatorDefinition.faqs.length, 8);

for (const formula of ratioCalculatorDefinition.formulas) {
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

// Test 30: Worked Examples Output Assertions
assert.strictEqual(s1.simplifiedRatio, ratioCalculatorDefinition.examples[0].expectedOutput);
assert.strictEqual(s3.simplifiedRatio, ratioCalculatorDefinition.examples[1].expectedOutput);
assert.strictEqual(p1.formattedSolvedValue, ratioCalculatorDefinition.examples[2].expectedOutput);
assert.strictEqual(p2.formattedSolvedValue, ratioCalculatorDefinition.examples[3].expectedOutput);
assert.strictEqual(out3.primaryValue, ratioCalculatorDefinition.examples[4].expectedOutput);
assert.strictEqual(formatSplitOutput(sp2).primaryValue, ratioCalculatorDefinition.examples[5].expectedOutput);
console.log("✓ Test 30: All 6 worked examples match engine outputs");

// Test 31: Search Keywords Verification
assert.ok(ratioCalculatorDefinition.searchKeywords?.includes("ratio"));
assert.ok(ratioCalculatorDefinition.searchKeywords?.includes("ratio calculator"));
assert.ok(ratioCalculatorDefinition.searchKeywords?.includes("simplify ratio"));
assert.ok(ratioCalculatorDefinition.searchKeywords?.includes("solve proportion"));
assert.ok(ratioCalculatorDefinition.searchKeywords?.includes("proportion calculator"));
console.log("✓ Test 31: Search keywords present in definition");

console.log("\nAll 31 Ratio Calculator QA tests passed successfully!");
