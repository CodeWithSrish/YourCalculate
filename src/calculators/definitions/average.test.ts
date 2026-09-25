import assert from "node:assert";
import {
  calculateSimpleAverage,
  calculateWeightedAverage,
  formatSimpleAverageOutput,
  formatWeightedAverageOutput,
  averageCalculatorDefinition,
} from "./average";

console.log("Running Average Calculator Engine Tests...\n");

// Test 1: Basic Integer Arithmetic Mean (10, 20, 30)
const t1 = calculateSimpleAverage([10, 20, 30]);
assert.strictEqual(t1.isValid, true);
assert.strictEqual(t1.count, 3);
assert.strictEqual(t1.sum, 60);
assert.strictEqual(t1.average, 20);
assert.strictEqual(t1.formattedSum, "60");
assert.strictEqual(t1.formattedAverage, "20");
console.log("✓ Test 1: [10, 20, 30] yields average 20 and sum 60");

// Test 2: Two Values Boundary (10, 20)
const t2 = calculateSimpleAverage([10, 20]);
assert.strictEqual(t2.isValid, true);
assert.strictEqual(t2.count, 2);
assert.strictEqual(t2.sum, 30);
assert.strictEqual(t2.average, 15);
assert.strictEqual(t2.formattedAverage, "15");
console.log("✓ Test 2: Two values [10, 20] yields average 15");

// Test 3: Decimal Values Average (5, 7.5, 10)
const t3 = calculateSimpleAverage([5, 7.5, 10]);
assert.strictEqual(t3.isValid, true);
assert.strictEqual(t3.count, 3);
assert.strictEqual(t3.sum, 22.5);
assert.strictEqual(t3.average, 7.5);
assert.strictEqual(t3.formattedAverage, "7.5");
console.log("✓ Test 3: Decimal values [5, 7.5, 10] yields average 7.5");

// Test 4: Negative & Zero Numbers (-10, 0, 10)
const t4 = calculateSimpleAverage([-10, 0, 10]);
assert.strictEqual(t4.isValid, true);
assert.strictEqual(t4.count, 3);
assert.strictEqual(t4.sum, 0);
assert.strictEqual(t4.average, 0);
assert.strictEqual(t4.formattedAverage, "0");
console.log("✓ Test 4: Mixed signs [-10, 0, 10] yields average 0");

// Test 5: All Zeros ([0, 0, 0, 0])
const t5 = calculateSimpleAverage([0, 0, 0, 0]);
assert.strictEqual(t5.isValid, true);
assert.strictEqual(t5.count, 4);
assert.strictEqual(t5.sum, 0);
assert.strictEqual(t5.average, 0);
console.log("✓ Test 5: All zeros [0, 0, 0, 0] yields average 0");

// Test 6: High Magnitude Numbers
const t6 = calculateSimpleAverage([1000000, 2000000, 3000000]);
assert.strictEqual(t6.isValid, true);
assert.strictEqual(t6.sum, 6000000);
assert.strictEqual(t6.average, 2000000);
assert.strictEqual(t6.formattedAverage, "2,000,000");
console.log("✓ Test 6: Large values [1M, 2M, 3M] processed cleanly");

// Test 7: Precision with Repeating Decimals (10, 20, 20) -> 50/3 = 16.66666...
const t7 = calculateSimpleAverage([10, 20, 20]);
assert.strictEqual(t7.isValid, true);
assert.strictEqual(t7.formattedAverage, "16.6667");
console.log("✓ Test 7: Repeating decimal 50/3 correctly formatted to 16.6667");

// Test 8: Single Item Rejected (Minimum 2 required)
const t8 = calculateSimpleAverage([10]);
assert.strictEqual(t8.isValid, false);
assert.strictEqual(t8.error, "Please enter at least 2 numbers to calculate an average.");
console.log("✓ Test 8: Single item array rejected with clear error");

// Test 9: Empty Array Rejected
const t9 = calculateSimpleAverage([]);
assert.strictEqual(t9.isValid, false);
console.log("✓ Test 9: Empty array rejected");

// Test 10: NaN and Infinity in Values Rejected
const t10a = calculateSimpleAverage([10, NaN]);
assert.strictEqual(t10a.isValid, false);
assert.strictEqual(t10a.error, "All entered values must be valid numbers.");

const t10b = calculateSimpleAverage([10, Infinity]);
assert.strictEqual(t10b.isValid, false);
console.log("✓ Test 10: NaN and Infinity in simple average rejected");

// Test 11: Weighted Average Percentage Weights (80 @ 40%, 90 @ 60%)
const w1 = calculateWeightedAverage([
  { value: 80, weight: 40 },
  { value: 90, weight: 60 },
]);
assert.strictEqual(w1.isValid, true);
assert.strictEqual(w1.count, 2);
assert.strictEqual(w1.weightedSum, 8600);
assert.strictEqual(w1.totalWeight, 100);
assert.strictEqual(w1.weightedAverage, 86);
assert.strictEqual(w1.formattedWeightedAverage, "86");
console.log("✓ Test 11: Weighted average 80 (40%) and 90 (60%) yields 86.00");

// Test 12: Weighted Average Course Credits (A=4 with 3 credits, B=3 with 4 credits)
const w2 = calculateWeightedAverage([
  { value: 4, weight: 3 },
  { value: 3, weight: 4 },
]);
assert.strictEqual(w2.isValid, true);
assert.strictEqual(w2.weightedSum, 24);
assert.strictEqual(w2.totalWeight, 7);
assert.strictEqual(w2.formattedWeightedAverage, "3.4286");
console.log("✓ Test 12: Arbitrary credit weights (4@3cr, 3@4cr) yields 3.4286");

// Test 13: Weighted Average Decimal Weights (10 @ 0.5, 20 @ 1.5) -> (5 + 30) / 2.0 = 17.5
const w3 = calculateWeightedAverage([
  { value: 10, weight: 0.5 },
  { value: 20, weight: 1.5 },
]);
assert.strictEqual(w3.isValid, true);
assert.strictEqual(w3.weightedAverage, 17.5);
assert.strictEqual(w3.formattedWeightedAverage, "17.5");
console.log("✓ Test 13: Decimal weights [10@0.5, 20@1.5] yields 17.5");

// Test 14: Negative Weight Rejected
const w4 = calculateWeightedAverage([
  { value: 80, weight: 50 },
  { value: 90, weight: -10 },
]);
assert.strictEqual(w4.isValid, false);
assert.strictEqual(w4.error, "Weights cannot be negative.");
console.log("✓ Test 14: Negative weight rejected");

// Test 15: Zero Total Weight Rejected
const w5 = calculateWeightedAverage([
  { value: 80, weight: 0 },
  { value: 90, weight: 0 },
]);
assert.strictEqual(w5.isValid, false);
assert.strictEqual(w5.error, "Total weight must be greater than 0.");
console.log("✓ Test 15: Zero total weight rejected");

// Test 16: Negative Values with Positive Weights (-10 @ 2, 20 @ 1) -> (-20 + 20) / 3 = 0
const w6 = calculateWeightedAverage([
  { value: -10, weight: 2 },
  { value: 20, weight: 1 },
]);
assert.strictEqual(w6.isValid, true);
assert.strictEqual(w6.weightedAverage, 0);
assert.strictEqual(w6.formattedWeightedAverage, "0");
console.log("✓ Test 16: Negative values with positive weights handled cleanly");

// Test 17: Fewer than 2 Weighted Pairs Rejected
const w7 = calculateWeightedAverage([{ value: 80, weight: 50 }]);
assert.strictEqual(w7.isValid, false);
console.log("✓ Test 17: Fewer than 2 weighted pairs rejected");

// Test 18: NaN / Infinity in Weighted Average Rejected
const w8a = calculateWeightedAverage([
  { value: NaN, weight: 50 },
  { value: 90, weight: 50 },
]);
assert.strictEqual(w8a.isValid, false);

const w8b = calculateWeightedAverage([
  { value: 80, weight: Infinity },
  { value: 90, weight: 50 },
]);
assert.strictEqual(w8b.isValid, false);
console.log("✓ Test 18: NaN / Infinity in weighted average rejected");

// Test 19: Mathematical Identity: Equal Weights equals Simple Average
const seq = [12, 18, 24, 30];
const simpleRes = calculateSimpleAverage(seq);
const weightedRes = calculateWeightedAverage(seq.map((v) => ({ value: v, weight: 1 })));
assert.strictEqual(simpleRes.average, weightedRes.weightedAverage);
console.log("✓ Test 19: Equal weights weighted average mathematically equals simple average");

// Test 20: Simple Output Formatter Structure
const out1 = formatSimpleAverageOutput(t1);
assert.strictEqual(out1.isValid, true);
assert.strictEqual(out1.primaryValue, "20");
assert.strictEqual(out1.primaryLabel, "Average (Arithmetic Mean)");
assert.strictEqual(out1.secondaryValues?.find((s) => s.label === "Number of Values")?.value, "3");
assert.strictEqual(out1.secondaryValues?.find((s) => s.label === "Sum of Values")?.value, "60");
console.log("✓ Test 20: Simple average output formatter structure verified");

// Test 21: Weighted Output Formatter Structure
const out2 = formatWeightedAverageOutput(w1);
assert.strictEqual(out2.isValid, true);
assert.strictEqual(out2.primaryValue, "86");
assert.strictEqual(out2.primaryLabel, "Weighted Average");
assert.strictEqual(out2.secondaryValues?.find((s) => s.label === "Total Weight")?.value, "100");
assert.strictEqual(out2.secondaryValues?.find((s) => s.label === "Sum of Weighted Products")?.value, "8,600");
console.log("✓ Test 21: Weighted average output formatter structure verified");

// Test 22: Definition Structure Integrity
assert.strictEqual(averageCalculatorDefinition.slug, "average-calculator");
assert.strictEqual(averageCalculatorDefinition.defaultModeId, "simple-average");
assert.strictEqual(averageCalculatorDefinition.modes.length, 2);
assert.strictEqual(averageCalculatorDefinition.formulas.length, 2);
assert.strictEqual(averageCalculatorDefinition.examples.length, 4);
assert.strictEqual(averageCalculatorDefinition.faqs.length, 8);
console.log("✓ Test 22: Average Calculator definition structure verified");

// Test 23: Strict MathFormula Parser-Safety Checks (No \left, \right, nested \frac, \cdots)
for (const formula of averageCalculatorDefinition.formulas) {
  assert.strictEqual(formula.formulaMath.includes("\\left"), false, "Formula must not contain \\left");
  assert.strictEqual(formula.formulaMath.includes("\\right"), false, "Formula must not contain \\right");
  assert.strictEqual(formula.formulaMath.includes("\\cdots"), false, "Formula must not contain \\cdots");
  assert.strictEqual(formula.formulaMath.includes("\\frac{\\frac"), false, "Formula must not contain nested \\frac");

  const openBraces = (formula.formulaMath.match(/\{/g) || []).length;
  const closeBraces = (formula.formulaMath.match(/\}/g) || []).length;
  assert.strictEqual(openBraces, closeBraces, "Braces must be balanced in formulaMath");
}
console.log("✓ Test 23: All formulas strictly conform to MathFormula parser constraints");

// Test 24: Search Keywords Coverage
assert.ok(averageCalculatorDefinition.searchKeywords?.includes("average"));
assert.ok(averageCalculatorDefinition.searchKeywords?.includes("average calculator"));
assert.ok(averageCalculatorDefinition.searchKeywords?.includes("mean calculator"));
assert.ok(averageCalculatorDefinition.searchKeywords?.includes("weighted average"));
console.log("✓ Test 24: High-intent search keywords present in definition");

// Test 25: Worked Examples Output Assertions
const ex1 = calculateSimpleAverage([10, 20, 30]);
assert.strictEqual(ex1.formattedAverage, averageCalculatorDefinition.examples[0].expectedOutput);
const ex2 = calculateSimpleAverage([5, 7.5, 10]);
assert.strictEqual(ex2.formattedAverage, averageCalculatorDefinition.examples[1].expectedOutput);
const ex3 = calculateSimpleAverage([-10, 0, 10]);
assert.strictEqual(ex3.formattedAverage, averageCalculatorDefinition.examples[2].expectedOutput);
const ex4 = calculateWeightedAverage([
  { value: 80, weight: 40 },
  { value: 90, weight: 60 },
]);
assert.strictEqual(ex4.formattedWeightedAverage, averageCalculatorDefinition.examples[3].expectedOutput);
console.log("✓ Test 25: All 4 worked examples strictly match engine outputs");

console.log("\nAll 25 Average Calculator tests passed successfully!");
