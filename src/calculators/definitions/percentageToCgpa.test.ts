import assert from "node:assert";
import {
  calculatePercentageToCgpa,
  calculateCgpaToPercentage,
  calculateCustomConversion,
} from "./percentageToCgpa";

console.log("Running Percentage to CGPA Calculator Engine Tests...\n");

// 1. 85% → 8.95 CGPA (CBSE / 9.5 method)
const test1 = calculatePercentageToCgpa({ percentage: 85, method: 9.5 });
assert.strictEqual(test1.isValid, true);
assert.strictEqual(test1.primaryValue, "8.95 CGPA");
assert.ok(test1.stepExplanation?.includes("85% ÷ 9.5 = 8.9474 (Rounded: 8.95 CGPA)"));
assert.ok(test1.secondaryValues?.some((s) => s.label === "Conversion Method" && s.value === "CBSE / 9.5 method"));
console.log("✓ Test 1: 85% with CBSE / 9.5 method = 8.95 CGPA");

// 2. 90% → 9.47 CGPA (CBSE / 9.5 method)
const test2 = calculatePercentageToCgpa({ percentage: 90, method: 9.5 });
assert.strictEqual(test2.isValid, true);
assert.strictEqual(test2.primaryValue, "9.47 CGPA");
console.log("✓ Test 2: 90% with CBSE / 9.5 method = 9.47 CGPA");

// 3. 80% → 8.42 CGPA (CBSE / 9.5 method)
const test3 = calculatePercentageToCgpa({ percentage: 80, method: 9.5 });
assert.strictEqual(test3.isValid, true);
assert.strictEqual(test3.primaryValue, "8.42 CGPA");
console.log("✓ Test 3: 80% with CBSE / 9.5 method = 8.42 CGPA");

// 4. 85% → 8.50 CGPA (Direct 10× method)
const test4 = calculatePercentageToCgpa({ percentage: 85, method: 10 });
assert.strictEqual(test4.isValid, true);
assert.strictEqual(test4.primaryValue, "8.5 CGPA");
assert.ok(test4.secondaryValues?.some((s) => s.label === "Conversion Method" && s.value === "Direct 10× method"));
console.log("✓ Test 4: 85% with Direct 10× method = 8.5 CGPA");

// 5. 85% → 9.19 CGPA (Custom multiplier M = 9.25)
const test5 = calculatePercentageToCgpa({ percentage: 85, method: 0, customMultiplier: 9.25 });
assert.strictEqual(test5.isValid, true);
assert.strictEqual(test5.primaryValue, "9.19 CGPA");
console.log("✓ Test 5: 85% with Custom multiplier M=9.25 = 9.19 CGPA");

// 6. 8.7 CGPA → 82.65% (CBSE / 9.5 method)
const test6 = calculateCgpaToPercentage({ cgpa: 8.7, method: 9.5 });
assert.strictEqual(test6.isValid, true);
assert.strictEqual(test6.primaryValue, "82.65%");
assert.strictEqual(test6.stepExplanation, "8.7 × 9.5 = 82.65%");
assert.ok(test6.secondaryValues?.some((s) => s.label === "Conversion Method" && s.value === "CBSE / 9.5 method"));
console.log("✓ Test 6: 8.7 CGPA with CBSE / 9.5 method = 82.65%");

// 7. 8.5 CGPA → 80.75% (CBSE / 9.5 method)
const test7 = calculateCgpaToPercentage({ cgpa: 8.5, method: 9.5 });
assert.strictEqual(test7.isValid, true);
assert.strictEqual(test7.primaryValue, "80.75%");
console.log("✓ Test 7: 8.5 CGPA with CBSE / 9.5 method = 80.75%");

// 8. 8.5 CGPA → 85.00% (Direct 10× method)
const test8 = calculateCgpaToPercentage({ cgpa: 8.5, method: 10 });
assert.strictEqual(test8.isValid, true);
assert.strictEqual(test8.primaryValue, "85%");
assert.ok(test8.secondaryValues?.some((s) => s.label === "Conversion Method" && s.value === "Direct 10× method"));
console.log("✓ Test 8: 8.5 CGPA with Direct 10× method = 85%");

// 9. 8.5 CGPA → 78.63% (Custom multiplier M = 9.25)
const test9 = calculateCgpaToPercentage({ cgpa: 8.5, method: 0, customMultiplier: 9.25 });
assert.strictEqual(test9.isValid, true);
assert.strictEqual(test9.primaryValue, "78.63%");
console.log("✓ Test 9: 8.5 CGPA with Custom multiplier M=9.25 = 78.63%");

// 10. Boundary value: 0% → 0 CGPA
const test10 = calculatePercentageToCgpa({ percentage: 0 });
assert.strictEqual(test10.isValid, true);
assert.strictEqual(test10.primaryValue, "0 CGPA");
console.log("✓ Test 10: 0% = 0 CGPA boundary handled");

// 11. Boundary value: 100% → 10.53 CGPA under 9.5 multiplier (notice included)
const test11 = calculatePercentageToCgpa({ percentage: 100, method: 9.5 });
assert.strictEqual(test11.isValid, true);
assert.strictEqual(test11.primaryValue, "10.53 CGPA");
assert.ok(test11.stepExplanation?.includes("exceeds 10.0 scale ceiling"));
assert.ok(test11.secondaryValues?.some((s) => s.label === "Scale Notice"));
console.log("✓ Test 11: 100% = 10.53 CGPA with scale ceiling notice");

// 12. Boundary value: 100% → 10.0 CGPA under Direct 10× method
const test12 = calculatePercentageToCgpa({ percentage: 100, method: 10 });
assert.strictEqual(test12.isValid, true);
assert.strictEqual(test12.primaryValue, "10 CGPA");
console.log("✓ Test 12: 100% with Direct 10× method = 10 CGPA");

// 13. Boundary value: 0 CGPA → 0%
const test13 = calculateCgpaToPercentage({ cgpa: 0 });
assert.strictEqual(test13.isValid, true);
assert.strictEqual(test13.primaryValue, "0%");
console.log("✓ Test 13: 0 CGPA = 0% boundary handled");

// 14. Boundary value: 10 CGPA → 95.00% under 9.5 multiplier
const test14 = calculateCgpaToPercentage({ cgpa: 10, method: 9.5 });
assert.strictEqual(test14.isValid, true);
assert.strictEqual(test14.primaryValue, "95%");
console.log("✓ Test 14: 10 CGPA with 9.5 multiplier = 95%");

// 15. Boundary value: 10 CGPA → 100.00% under Direct 10× method
const test15 = calculateCgpaToPercentage({ cgpa: 10, method: 10 });
assert.strictEqual(test15.isValid, true);
assert.strictEqual(test15.primaryValue, "100%");
console.log("✓ Test 15: 10 CGPA with Direct 10× method = 100%");

// 16. Invalid percentage (missing/NaN)
const test16 = calculatePercentageToCgpa({ percentage: NaN });
assert.strictEqual(test16.isValid, false);
assert.strictEqual(test16.error, "Percentage must be between 0 and 100.");
console.log("✓ Test 16: NaN percentage rejected");

// 17. Percentage > 100
const test17 = calculatePercentageToCgpa({ percentage: 105 });
assert.strictEqual(test17.isValid, false);
assert.strictEqual(test17.error, "Percentage must be between 0 and 100.");
console.log("✓ Test 17: Percentage > 100 rejected");

// 18. Negative percentage
const test18 = calculatePercentageToCgpa({ percentage: -5 });
assert.strictEqual(test18.isValid, false);
assert.strictEqual(test18.error, "Percentage must be between 0 and 100.");
console.log("✓ Test 18: Negative percentage rejected");

// 19. Invalid CGPA (missing/NaN)
const test19 = calculateCgpaToPercentage({ cgpa: NaN });
assert.strictEqual(test19.isValid, false);
assert.strictEqual(test19.error, "CGPA must be between 0 and 10.");
console.log("✓ Test 19: NaN CGPA rejected");

// 20. CGPA > 10
const test20 = calculateCgpaToPercentage({ cgpa: 11 });
assert.strictEqual(test20.isValid, false);
assert.strictEqual(test20.error, "CGPA must be between 0 and 10.");
console.log("✓ Test 20: CGPA > 10 rejected");

// 21. Negative CGPA
const test21 = calculateCgpaToPercentage({ cgpa: -1 });
assert.strictEqual(test21.isValid, false);
assert.strictEqual(test21.error, "CGPA must be between 0 and 10.");
console.log("✓ Test 21: Negative CGPA rejected");

// 22. Invalid custom multiplier in Mode 1 & 2
const test22a = calculatePercentageToCgpa({ percentage: 85, method: 0, customMultiplier: 0 });
assert.strictEqual(test22a.isValid, false);
assert.strictEqual(test22a.error, "Conversion multiplier must be greater than 0.");

const test22b = calculateCgpaToPercentage({ cgpa: 8.5, method: 0, customMultiplier: -2 });
assert.strictEqual(test22b.isValid, false);
assert.strictEqual(test22b.error, "Conversion multiplier must be greater than 0.");
console.log("✓ Test 22: Invalid custom multipliers in Mode 1 & 2 rejected");

// 23. Mode 3: Custom conversion % to CGPA
const test23 = calculateCustomConversion({ direction: 1, value: 85, multiplier: 10 });
assert.strictEqual(test23.isValid, true);
assert.strictEqual(test23.primaryValue, "8.5 CGPA");
console.log("✓ Test 23: Mode 3 Custom multiplier 10 (% to CGPA) = 8.5 CGPA");

// 24. Mode 3: Custom conversion CGPA to %
const test24 = calculateCustomConversion({ direction: 2, value: 8.5, multiplier: 9.25 });
assert.strictEqual(test24.isValid, true);
assert.strictEqual(test24.primaryValue, "78.63%");
console.log("✓ Test 24: Mode 3 Custom multiplier 9.25 (CGPA to %) = 78.63%");

// 25. Mode 3: Invalid multiplier
const test25 = calculateCustomConversion({ direction: 1, value: 85, multiplier: 0 });
assert.strictEqual(test25.isValid, false);
assert.strictEqual(test25.error, "Conversion multiplier must be greater than 0.");
console.log("✓ Test 25: Mode 3 Zero multiplier rejected");

// 26. Decimal precision and deterministic rounding
const test26a = calculatePercentageToCgpa({ percentage: 85.5, method: 9.5 });
assert.strictEqual(test26a.isValid, true);
assert.strictEqual(test26a.primaryValue, "9 CGPA");

const test26b = calculateCgpaToPercentage({ cgpa: 8.75, method: 9.5 });
assert.strictEqual(test26b.isValid, true);
assert.strictEqual(test26b.primaryValue, "83.13%");
console.log("✓ Test 26: Decimal inputs (85.5% and 8.75 CGPA) handled cleanly");

console.log("\nAll Percentage to CGPA Calculator tests passed successfully!");
