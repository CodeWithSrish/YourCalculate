import assert from "node:assert";
import {
  calculateSimpleInterest,
  calculateSimpleInterestWrapper,
  simpleInterestCalculatorDefinition,
} from "./simpleInterest";

console.log("Running Simple Interest Calculator Engine Tests...\n");

// Test 1: Standard Simple Interest (₹10,000 @ 10% for 5 yr)
const t1 = calculateSimpleInterest(10000, 10, 5);
assert.strictEqual(t1.isValid, true);
assert.strictEqual(t1.simpleInterest, 5000);
assert.strictEqual(t1.totalAmount, 15000);
assert.strictEqual(t1.growthPercentage, 50);
assert.strictEqual(t1.formattedPrincipal, "₹10,000.00");
assert.strictEqual(t1.formattedSimpleInterest, "₹5,000.00");
assert.strictEqual(t1.formattedTotalAmount, "₹15,000.00");
assert.strictEqual(t1.formattedGrowthPercentage, "50%");
console.log("✓ Test 1: ₹10,000 @ 10% for 5 yr yields SI ₹5,000.00 and Total ₹15,000.00");

// Test 2: Decimal Interest Rate (₹50,000 @ 7.5% for 3 yr)
const t2 = calculateSimpleInterest(50000, 7.5, 3);
assert.strictEqual(t2.isValid, true);
assert.strictEqual(t2.simpleInterest, 11250);
assert.strictEqual(t2.totalAmount, 61250);
assert.strictEqual(t2.formattedSimpleInterest, "₹11,250.00");
assert.strictEqual(t2.formattedTotalAmount, "₹61,250.00");
assert.strictEqual(t2.formattedGrowthPercentage, "22.5%");
console.log("✓ Test 2: ₹50,00,000 @ 7.5% for 3 yr yields SI ₹11,250.00 and Total ₹61,250.00");

// Test 3: Decimal Time Period (₹1,00,000 @ 8% for 2.5 yr)
const t3 = calculateSimpleInterest(100000, 8, 2.5);
assert.strictEqual(t3.isValid, true);
assert.strictEqual(t3.simpleInterest, 20000);
assert.strictEqual(t3.totalAmount, 120000);
assert.strictEqual(t3.formattedSimpleInterest, "₹20,000.00");
assert.strictEqual(t3.formattedTotalAmount, "₹1,20,000.00");
assert.strictEqual(t3.formattedGrowthPercentage, "20%");
console.log("✓ Test 3: ₹1,00,000 @ 8% for 2.5 yr yields SI ₹20,000.00 and Total ₹1,20,000.00");

// Test 4: Zero Interest Rate (₹25,000 @ 0% for 5 yr)
const t4 = calculateSimpleInterest(25000, 0, 5);
assert.strictEqual(t4.isValid, true);
assert.strictEqual(t4.simpleInterest, 0);
assert.strictEqual(t4.totalAmount, 25000);
assert.strictEqual(t4.formattedSimpleInterest, "₹0.00");
assert.strictEqual(t4.formattedTotalAmount, "₹25,000.00");
assert.strictEqual(t4.formattedGrowthPercentage, "0%");
console.log("✓ Test 4: 0% interest rate preserves principal with ₹0.00 interest");

// Test 5: Rate Greater Than 100% (₹1,000 @ 150% for 2 yr)
const t5 = calculateSimpleInterest(1000, 150, 2);
assert.strictEqual(t5.isValid, true);
assert.strictEqual(t5.simpleInterest, 3000);
assert.strictEqual(t5.totalAmount, 4000);
assert.strictEqual(t5.formattedSimpleInterest, "₹3,000.00");
assert.strictEqual(t5.formattedTotalAmount, "₹4,000.00");
assert.strictEqual(t5.formattedGrowthPercentage, "300%");
console.log("✓ Test 5: Rate > 100% (150%) correctly accepted and computed");

// Test 6: Decimal Principal Amount (₹1,999.50 @ 6.5% for 3 yr)
const t6 = calculateSimpleInterest(1999.5, 6.5, 3);
assert.strictEqual(t6.isValid, true);
assert.strictEqual(t6.simpleInterest, 389.9025);
assert.strictEqual(t6.formattedSimpleInterest, "₹389.90");
assert.strictEqual(t6.formattedTotalAmount, "₹2,389.40");
console.log("✓ Test 6: Decimal principal (₹1,999.50) computed with full precision");

// Test 7: Large Monetary Magnitude (₹10 Crore @ 9% for 5 yr)
const t7 = calculateSimpleInterest(100000000, 9, 5);
assert.strictEqual(t7.isValid, true);
assert.strictEqual(t7.simpleInterest, 45000000);
assert.strictEqual(t7.formattedSimpleInterest, "₹4,50,00,000.00");
assert.strictEqual(t7.formattedTotalAmount, "₹14,50,00,000.00");
console.log("✓ Test 7: Large monetary magnitude (₹10 Crore) processed cleanly");

// Test 8: Long Time Horizon (₹10,000 @ 5% for 50 yr)
const t8 = calculateSimpleInterest(10000, 5, 50);
assert.strictEqual(t8.isValid, true);
assert.strictEqual(t8.simpleInterest, 25000);
assert.strictEqual(t8.totalAmount, 35000);
assert.strictEqual(t8.formattedSimpleInterest, "₹25,000.00");
assert.strictEqual(t8.formattedTotalAmount, "₹35,000.00");
console.log("✓ Test 8: Long time horizon (50 yr) calculated accurately");

// Test 9: Mathematical Identity Total Amount == Principal + Simple Interest
assert.strictEqual((t1.totalAmount ?? 0) - (t1.principal ?? 0), t1.simpleInterest);
assert.strictEqual((t2.totalAmount ?? 0) - (t2.principal ?? 0), t2.simpleInterest);
assert.strictEqual((t3.totalAmount ?? 0) - (t3.principal ?? 0), t3.simpleInterest);
console.log("✓ Test 9: Identity Total Amount == Principal + Simple Interest verified across calculations");

// Test 10: Negative Principal Rejected
const t10 = calculateSimpleInterest(-5000, 10, 5);
assert.strictEqual(t10.isValid, false);
assert.strictEqual(t10.error, "Principal amount must be greater than 0.");
console.log("✓ Test 10: Negative principal rejected");

// Test 11: Zero Principal Rejected
const t11 = calculateSimpleInterest(0, 10, 5);
assert.strictEqual(t11.isValid, false);
assert.strictEqual(t11.error, "Principal amount must be greater than 0.");
console.log("✓ Test 11: Zero principal rejected");

// Test 12: Negative Interest Rate Rejected
const t12 = calculateSimpleInterest(10000, -5, 5);
assert.strictEqual(t12.isValid, false);
assert.strictEqual(t12.error, "Interest rate cannot be negative.");
console.log("✓ Test 12: Negative interest rate rejected");

// Test 13: Negative Time Period Rejected
const t13 = calculateSimpleInterest(10000, 10, -2);
assert.strictEqual(t13.isValid, false);
assert.strictEqual(t13.error, "Time period must be greater than 0.");
console.log("✓ Test 13: Negative time period rejected");

// Test 14: Zero Time Period Rejected
const t14 = calculateSimpleInterest(10000, 10, 0);
assert.strictEqual(t14.isValid, false);
assert.strictEqual(t14.error, "Time period must be greater than 0.");
console.log("✓ Test 14: Zero time period rejected");

// Test 15: NaN Numeric Inputs Rejected
const t15a = calculateSimpleInterest(NaN, 10, 5);
assert.strictEqual(t15a.isValid, false);
assert.strictEqual(t15a.error, "Please enter valid numeric values.");

const t15b = calculateSimpleInterest(10000, NaN, 5);
assert.strictEqual(t15b.isValid, false);

const t15c = calculateSimpleInterest(10000, 10, NaN);
assert.strictEqual(t15c.isValid, false);
console.log("✓ Test 15: NaN inputs rejected safely");

// Test 16: Infinity Inputs Rejected
const t16 = calculateSimpleInterest(Infinity, 10, 5);
assert.strictEqual(t16.isValid, false);
assert.strictEqual(t16.error, "Please enter valid numeric values.");
console.log("✓ Test 16: Infinity input rejected safely");

// Test 17: UI Wrapper Output Structure
const w1 = calculateSimpleInterestWrapper({
  principal: 10000,
  annualRate: 10,
  timeYears: 5,
});
assert.strictEqual(w1.isValid, true);
assert.strictEqual(w1.primaryValue, "₹5,000.00");
assert.strictEqual(w1.primaryLabel, "Simple Interest");
assert.strictEqual(w1.unit, "₹");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Principal Amount")?.value, "₹10,000.00");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Total Maturity Amount")?.value, "₹15,000.00");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Total Growth")?.value, "50%");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Annual Interest Rate")?.value, "10%");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Time Period")?.value, "5 Years");
console.log("✓ Test 17: Calculation wrapper returns complete primary and secondary metrics");

// Test 18: Definition Structure Integrity
assert.strictEqual(simpleInterestCalculatorDefinition.slug, "simple-interest-calculator");
assert.strictEqual(simpleInterestCalculatorDefinition.defaultModeId, "simple-interest");
assert.strictEqual(simpleInterestCalculatorDefinition.modes.length, 1);
assert.strictEqual(simpleInterestCalculatorDefinition.formulas.length, 3);
assert.strictEqual(simpleInterestCalculatorDefinition.examples.length, 4);
assert.strictEqual(simpleInterestCalculatorDefinition.faqs.length, 7);
console.log("✓ Test 18: Simple Interest calculator definition structure verified");

// Test 19: Parser-Safe LaTeX Syntax Verification (No \left, \right, or nested \frac)
for (const formula of simpleInterestCalculatorDefinition.formulas) {
  assert.strictEqual(formula.formulaMath.includes("\\left"), false, "Formula must not contain \\left");
  assert.strictEqual(formula.formulaMath.includes("\\right"), false, "Formula must not contain \\right");
  assert.strictEqual(formula.formulaMath.includes("\\frac{\\frac"), false, "Formula must not contain nested \\frac");

  // Balanced braces check
  const openBraces = (formula.formulaMath.match(/\{/g) || []).length;
  const closeBraces = (formula.formulaMath.match(/\}/g) || []).length;
  assert.strictEqual(openBraces, closeBraces, "Braces must be balanced in formulaMath");

  // Balanced parentheses check
  const openParens = (formula.formulaMath.match(/\(/g) || []).length;
  const closeParens = (formula.formulaMath.match(/\)/g) || []).length;
  assert.strictEqual(openParens, closeParens, "Parentheses must be balanced in formulaMath");
}
console.log("✓ Test 19: All formulas strictly conform to MathFormula parser constraints");

// Test 20: Step Explanation Content
assert.strictEqual(t1.stepExplanation?.includes("₹5,000.00"), true);
assert.strictEqual(t1.stepExplanation?.includes("₹15,000.00"), true);
assert.strictEqual(t4.stepExplanation?.includes("₹0.00"), true);
console.log("✓ Test 20: Step explanations contain clean mathematical steps");

// Test 21: Search Keywords Coverage
assert.ok(simpleInterestCalculatorDefinition.searchKeywords?.includes("simple interest"));
assert.ok(simpleInterestCalculatorDefinition.searchKeywords?.includes("simple interest calculator"));
assert.ok(simpleInterestCalculatorDefinition.searchKeywords?.includes("si calculator"));
assert.ok(simpleInterestCalculatorDefinition.searchKeywords?.includes("interest calculator"));
console.log("✓ Test 21: High-intent search keywords included");

// Test 22: Worked Examples Output Match
const ex1 = calculateSimpleInterest(10000, 10, 5);
assert.strictEqual(ex1.formattedSimpleInterest, simpleInterestCalculatorDefinition.examples[0].expectedOutput);
const ex2 = calculateSimpleInterest(50000, 7.5, 3);
assert.strictEqual(ex2.formattedSimpleInterest, simpleInterestCalculatorDefinition.examples[1].expectedOutput);
const ex3 = calculateSimpleInterest(100000, 8, 2.5);
assert.strictEqual(ex3.formattedSimpleInterest, simpleInterestCalculatorDefinition.examples[2].expectedOutput);
const ex4 = calculateSimpleInterest(25000, 0, 5);
assert.strictEqual(ex4.formattedSimpleInterest, simpleInterestCalculatorDefinition.examples[3].expectedOutput);
console.log("✓ Test 22: All 4 worked examples strictly match engine outputs");

console.log("\nAll 22 Simple Interest Calculator tests passed successfully!");
