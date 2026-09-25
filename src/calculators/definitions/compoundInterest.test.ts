import assert from "node:assert";
import {
  calculateCompoundInterest,
  calculateCompoundInterestWrapper,
  compoundInterestCalculatorDefinition,
} from "./compoundInterest";

console.log("Running Compound Interest Calculator Engine Tests...\n");

// Test 1: Standard Annual Compounding (₹10,000 @ 10% for 5 yr, n = 1)
const t1 = calculateCompoundInterest(10000, 10, 5, 1);
assert.strictEqual(t1.isValid, true);
assert.strictEqual(t1.formattedFutureValue, "₹16,105.10");
assert.strictEqual(t1.formattedCompoundInterest, "₹6,105.10");
assert.strictEqual(t1.formattedEffectiveGain, "61.05%");
console.log("✓ Test 1: ₹10,000 @ 10% for 5 years annually yields ₹16,105.10 (CI: ₹6,105.10)");

// Test 2: Semi-Annual Compounding (₹10,000 @ 10% for 5 yr, n = 2)
const t2 = calculateCompoundInterest(10000, 10, 5, 2);
assert.strictEqual(t2.isValid, true);
assert.strictEqual(t2.formattedFutureValue, "₹16,288.95");
assert.strictEqual(t2.formattedCompoundInterest, "₹6,288.95");
console.log("✓ Test 2: ₹10,000 @ 10% for 5 years semi-annually yields ₹16,288.95");

// Test 3: Quarterly Compounding (₹10,000 @ 10% for 5 yr, n = 4)
const t3 = calculateCompoundInterest(10000, 10, 5, 4);
assert.strictEqual(t3.isValid, true);
assert.strictEqual(t3.formattedFutureValue, "₹16,386.16");
assert.strictEqual(t3.formattedCompoundInterest, "₹6,386.16");
console.log("✓ Test 3: ₹10,000 @ 10% for 5 years quarterly yields ₹16,386.16");

// Test 4: Monthly Compounding (₹10,000 @ 10% for 5 yr, n = 12)
const t4 = calculateCompoundInterest(10000, 10, 5, 12);
assert.strictEqual(t4.isValid, true);
assert.strictEqual(t4.formattedFutureValue, "₹16,453.09");
assert.strictEqual(t4.formattedCompoundInterest, "₹6,453.09");
console.log("✓ Test 4: ₹10,000 @ 10% for 5 years monthly yields ₹16,453.09");

// Test 5: Daily Compounding (₹1,00,000 @ 8% for 3 yr, n = 365)
const t5 = calculateCompoundInterest(100000, 8, 3, 365);
assert.strictEqual(t5.isValid, true);
assert.strictEqual(t5.formattedFutureValue, "₹1,27,121.57");
assert.strictEqual(t5.formattedCompoundInterest, "₹27,121.57");
console.log("✓ Test 5: ₹1,00,000 @ 8% for 3 years daily compounding yields ₹1,27,121.57");

// Test 6: Zero Interest Rate (Rate = 0%)
const t6 = calculateCompoundInterest(10000, 0, 5, 1);
assert.strictEqual(t6.isValid, true);
assert.strictEqual(t6.futureValue, 10000);
assert.strictEqual(t6.compoundInterest, 0);
assert.strictEqual(t6.formattedFutureValue, "₹10,000.00");
assert.strictEqual(t6.formattedCompoundInterest, "₹0.00");
assert.strictEqual(t6.formattedEffectiveGain, "0%");
console.log("✓ Test 6: 0% interest rate preserves principal with 0 interest");

// Test 7: Decimal Interest Rate (₹50,000 @ 7.5% for 10 yr quarterly, n = 4)
const t7 = calculateCompoundInterest(50000, 7.5, 10, 4);
assert.strictEqual(t7.isValid, true);
assert.strictEqual(t7.formattedFutureValue, "₹1,05,117.46");
assert.strictEqual(t7.formattedCompoundInterest, "₹55,117.46");
console.log("✓ Test 7: Decimal interest rate (7.5% quarterly) yields ₹1,05,117.46");

// Test 8: Decimal Time Period (₹20,000 @ 6% for 2.5 yr monthly)
const t8 = calculateCompoundInterest(20000, 6, 2.5, 12);
assert.strictEqual(t8.isValid, true);
assert.strictEqual(t8.formattedFutureValue, "₹23,228.00");
assert.strictEqual(t8.formattedCompoundInterest, "₹3,228.00");
console.log("✓ Test 8: Decimal time period (2.5 years) calculated with full precision");

// Test 9: High interest rate (> 100%) accepted without arbitrary limit
const t9 = calculateCompoundInterest(1000, 150, 2, 1);
assert.strictEqual(t9.isValid, true);
assert.strictEqual(t9.formattedFutureValue, "₹6,250.00");
assert.strictEqual(t9.formattedCompoundInterest, "₹5,250.00");
console.log("✓ Test 9: Interest rate > 100% (150%) correctly accepted and computed");

// Test 10: Long time horizon (> 100 years) accepted without arbitrary limit
const t10 = calculateCompoundInterest(100, 5, 120, 1);
assert.strictEqual(t10.isValid, true);
assert.ok((t10.futureValue ?? 0) > 30000);
console.log("✓ Test 10: Long time horizon (120 years) correctly accepted and computed");

// Test 11: Negative principal rejected
const t11 = calculateCompoundInterest(-5000, 10, 5, 1);
assert.strictEqual(t11.isValid, false);
assert.strictEqual(t11.error, "Principal amount must be greater than 0.");
console.log("✓ Test 11: Negative principal rejected");

// Test 12: Zero principal rejected
const t12 = calculateCompoundInterest(0, 10, 5, 1);
assert.strictEqual(t12.isValid, false);
assert.strictEqual(t12.error, "Principal amount must be greater than 0.");
console.log("✓ Test 12: Zero principal rejected");

// Test 13: Negative interest rate rejected
const t13 = calculateCompoundInterest(10000, -5, 5, 1);
assert.strictEqual(t13.isValid, false);
assert.strictEqual(t13.error, "Interest rate cannot be negative.");
console.log("✓ Test 13: Negative interest rate rejected");

// Test 14: Negative time period rejected
const t14 = calculateCompoundInterest(10000, 10, -2, 1);
assert.strictEqual(t14.isValid, false);
assert.strictEqual(t14.error, "Time period must be greater than 0.");
console.log("✓ Test 14: Negative time period rejected");

// Test 15: Zero time period rejected
const t15 = calculateCompoundInterest(10000, 10, 0, 1);
assert.strictEqual(t15.isValid, false);
assert.strictEqual(t15.error, "Time period must be greater than 0.");
console.log("✓ Test 15: Zero time period rejected");

// Test 16: Invalid frequency rejected
const t16 = calculateCompoundInterest(10000, 10, 5, 7);
assert.strictEqual(t16.isValid, false);
assert.strictEqual(t16.error, "Please select a valid compounding frequency.");
console.log("✓ Test 16: Invalid compounding frequency rejected");

// Test 17: NaN numeric values rejected
const t17 = calculateCompoundInterest(NaN, 10, 5, 1);
assert.strictEqual(t17.isValid, false);
assert.strictEqual(t17.error, "Please enter valid numeric values.");
console.log("✓ Test 17: NaN inputs rejected");

// Test 18: Large monetary value (₹100,000,000 @ 9% for 5 yr annually)
const t18 = calculateCompoundInterest(100000000, 9, 5, 1);
assert.strictEqual(t18.isValid, true);
assert.strictEqual(t18.formattedPrincipal, "₹10,00,00,000.00");
assert.strictEqual(t18.formattedFutureValue, "₹15,38,62,395.49");
assert.strictEqual(t18.formattedCompoundInterest, "₹5,38,62,395.49");
console.log("✓ Test 18: Large monetary magnitude (₹10 Crore) processed cleanly");

// Test 19: Compounding frequency hierarchy (Daily > Monthly > Quarterly > Semi-Annual > Annual)
const p = 10000;
const r = 10;
const t = 5;
const aAnnual = calculateCompoundInterest(p, r, t, 1).futureValue ?? 0;
const aSemi = calculateCompoundInterest(p, r, t, 2).futureValue ?? 0;
const aQuarter = calculateCompoundInterest(p, r, t, 4).futureValue ?? 0;
const aMonthly = calculateCompoundInterest(p, r, t, 12).futureValue ?? 0;
const aDaily = calculateCompoundInterest(p, r, t, 365).futureValue ?? 0;
assert.ok(aDaily > aMonthly);
assert.ok(aMonthly > aQuarter);
assert.ok(aQuarter > aSemi);
assert.ok(aSemi > aAnnual);
console.log("✓ Test 19: Compounding hierarchy strictly verified (Daily > Monthly > Quarterly > Semi-Annual > Annual)");

// Test 20: Mathematical identity Interest == Future Value - Principal
const diff = (t1.futureValue ?? 0) - (t1.principal ?? 0);
assert.strictEqual(Math.abs(diff - (t1.compoundInterest ?? 0)) < 1e-9, true);
console.log("✓ Test 20: Exact identity CI == Future Value - Principal verified");

// Test 21: Calculation wrapper output structure
const w1 = calculateCompoundInterestWrapper({
  principal: 10000,
  annualRate: 10,
  timeYears: 5,
  frequency: 1,
});
assert.strictEqual(w1.isValid, true);
assert.strictEqual(w1.primaryValue, "₹16,105.10");
assert.strictEqual(w1.primaryLabel, "Total maturity amount after 5 years");
assert.strictEqual(w1.unit, "₹");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Principal Amount")?.value, "₹10,000.00");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Total Compound Interest")?.value, "₹6,105.10");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Total Growth")?.value, "61.05%");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Compounding Frequency")?.value, "Annually (1/yr)");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Time Horizon")?.value, "5 Years");
console.log("✓ Test 21: Calculation wrapper returns complete primary and secondary metrics");

// Test 22: Registry definition structure integrity
assert.strictEqual(compoundInterestCalculatorDefinition.slug, "compound-interest-calculator");
assert.strictEqual(compoundInterestCalculatorDefinition.modes.length, 1);
assert.strictEqual(compoundInterestCalculatorDefinition.formulas.length, 3);
assert.strictEqual(compoundInterestCalculatorDefinition.examples.length, 4);
assert.strictEqual(compoundInterestCalculatorDefinition.faqs.length, 7);
console.log("✓ Test 22: Compound Interest calculator definition structure verified");

// Test 23: Formula formatting syntax validation (no raw LaTeX commands or unrendered tokens)
for (const formula of compoundInterestCalculatorDefinition.formulas) {
  assert.strictEqual(formula.formulaMath.includes("\\left"), false, "Formula should not contain \\left");
  assert.strictEqual(formula.formulaMath.includes("\\right"), false, "Formula should not contain \\right");
  assert.strictEqual(formula.formulaMath.includes("\\%"), false, "Formula should not contain \\%");
  const openBraces = (formula.formulaMath.match(/\{/g) || []).length;
  const closeBraces = (formula.formulaMath.match(/\}/g) || []).length;
  assert.strictEqual(openBraces, closeBraces, "Braces must be balanced in formulaMath");
  const openParens = (formula.formulaMath.match(/\(/g) || []).length;
  const closeParens = (formula.formulaMath.match(/\)/g) || []).length;
  assert.strictEqual(openParens, closeParens, "Parentheses must be balanced in formulaMath");
}
console.log("✓ Test 23: Formula formatting and token syntax verified");

// Test 24: Calculation step explanation contains pure computation
assert.strictEqual(t1.stepExplanation?.includes("10,000 × 1.61051 = ₹16,105.10"), false); // dynamic check
assert.strictEqual(t1.stepExplanation?.includes("₹16,105.10"), true);
assert.strictEqual(t1.stepExplanation?.includes("₹6,105.10"), true);
console.log("✓ Test 24: Step explanation contains clean mathematical steps");

console.log("\nAll 24 Compound Interest Calculator tests passed successfully!");
