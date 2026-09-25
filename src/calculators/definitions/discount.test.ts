import assert from "node:assert";
import {
  calculateSalePrice,
  calculateDiscountPercentage,
  calculateOriginalPrice,
  calculateSalePriceWrapper,
  calculateDiscountPercentageWrapper,
  calculateOriginalPriceWrapper,
  discountCalculatorDefinition,
} from "./discount";

console.log("Running Discount Calculator Engine Tests...\n");

// Test 1: 25% off 2000 -> Final 1500, Savings 500
const t1 = calculateSalePrice(2000, 25);
assert.strictEqual(t1.isValid, true);
assert.strictEqual(t1.salePrice, 1500);
assert.strictEqual(t1.savings, 500);
assert.strictEqual(t1.formattedSalePrice, "1,500");
assert.strictEqual(t1.formattedSavings, "500");
console.log("✓ Test 1: 25% off 2000 calculates Final 1500, Savings 500");

// Test 2: 40% off 5000 -> Final 3000, Savings 2000
const t2 = calculateSalePrice(5000, 40);
assert.strictEqual(t2.isValid, true);
assert.strictEqual(t2.salePrice, 3000);
assert.strictEqual(t2.savings, 2000);
assert.strictEqual(t2.formattedSalePrice, "3,000");
console.log("✓ Test 2: 40% off 5000 calculates Final 3000, Savings 2000");

// Test 3: 19.99 at 15% -> 16.9915 (display 16.99)
const t3 = calculateSalePrice(19.99, 15);
assert.strictEqual(t3.isValid, true);
assert.strictEqual(Math.abs((t3.salePrice ?? 0) - 16.9915) < 1e-9, true);
assert.strictEqual(t3.formattedSalePrice, "16.99");
console.log("✓ Test 3: Decimal price 19.99 at 15% computed with full precision");

// Test 4: 12.5% off 1000 -> Final 875, Savings 125
const t4 = calculateSalePrice(1000, 12.5);
assert.strictEqual(t4.isValid, true);
assert.strictEqual(t4.salePrice, 875);
assert.strictEqual(t4.savings, 125);
assert.strictEqual(t4.formattedSalePrice, "875");
console.log("✓ Test 4: Fractional discount 12.5% off 1000 calculates Final 875");

// Test 5: 0% discount -> Final = Original, Savings = 0
const t5 = calculateSalePrice(2000, 0);
assert.strictEqual(t5.isValid, true);
assert.strictEqual(t5.salePrice, 2000);
assert.strictEqual(t5.savings, 0);
console.log("✓ Test 5: 0% discount preserves original price with 0 savings");

// Test 6: 100% discount in Mode 1 -> Final = 0, Savings = Original
const t6 = calculateSalePrice(2000, 100);
assert.strictEqual(t6.isValid, true);
assert.strictEqual(t6.salePrice, 0);
assert.strictEqual(t6.savings, 2000);
console.log("✓ Test 6: 100% discount in Mode 1 yields 0 final price and full savings");

// Test 7: Original 2500 / Sale 2000 -> 20% discount (Mode 2)
const t7 = calculateDiscountPercentage(2500, 2000);
assert.strictEqual(t7.isValid, true);
assert.strictEqual(t7.discountPercent, 20);
assert.strictEqual(t7.savings, 500);
assert.strictEqual(t7.formattedDiscountPercent, "20");
console.log("✓ Test 7: Original 2500 / Sale 2000 calculates 20% discount");

// Test 8: Original 80 / Sale 65 -> 18.75% discount (Mode 2)
const t8 = calculateDiscountPercentage(80, 65);
assert.strictEqual(t8.isValid, true);
assert.strictEqual(t8.discountPercent, 18.75);
assert.strictEqual(t8.savings, 15);
assert.strictEqual(t8.formattedDiscountPercent, "18.75");
console.log("✓ Test 8: Original 80 / Sale 65 calculates 18.75% discount");

// Test 9: Original = Sale (2000 / 2000) -> 0% discount (Mode 2)
const t9 = calculateDiscountPercentage(2000, 2000);
assert.strictEqual(t9.isValid, true);
assert.strictEqual(t9.discountPercent, 0);
assert.strictEqual(t9.savings, 0);
console.log("✓ Test 9: Original = Sale price calculates 0% discount");

// Test 10: Sale = 0 (2000 / 0) -> 100% discount (Mode 2)
const t10 = calculateDiscountPercentage(2000, 0);
assert.strictEqual(t10.isValid, true);
assert.strictEqual(t10.discountPercent, 100);
assert.strictEqual(t10.savings, 2000);
console.log("✓ Test 10: Sale price = 0 calculates 100% discount");

// Test 11: Sale 1500 / 25% -> Original 2000 (Mode 3)
const t11 = calculateOriginalPrice(1500, 25);
assert.strictEqual(t11.isValid, true);
assert.strictEqual(t11.originalPrice, 2000);
assert.strictEqual(t11.savings, 500);
assert.strictEqual(t11.formattedOriginalPrice, "2,000");
console.log("✓ Test 11: Sale 1500 at 25% discount calculates Original 2000");

// Test 12: Sale 75 / 50% -> Original 150 (Mode 3)
const t12 = calculateOriginalPrice(75, 50);
assert.strictEqual(t12.isValid, true);
assert.strictEqual(t12.originalPrice, 150);
assert.strictEqual(t12.savings, 75);
assert.strictEqual(t12.formattedOriginalPrice, "150");
console.log("✓ Test 12: Sale 75 at 50% discount calculates Original 150");

// Test 13: Decimal reverse calculation: Sale 16.9915 / 15% -> 19.99 (Mode 3)
const t13 = calculateOriginalPrice(16.9915, 15);
assert.strictEqual(t13.isValid, true);
assert.strictEqual(Math.abs((t13.originalPrice ?? 0) - 19.99) < 1e-9, true);
assert.strictEqual(t13.formattedOriginalPrice, "19.99");
console.log("✓ Test 13: Decimal reverse calculation accurately recovers 19.99");

// Validation Tests
// Test 14: Negative original price rejected
assert.strictEqual(calculateSalePrice(-100, 20).isValid, false);
assert.strictEqual(calculateDiscountPercentage(-100, 80).isValid, false);
console.log("✓ Test 14: Negative original price rejected across modes");

// Test 15: Zero original price rejected
assert.strictEqual(calculateSalePrice(0, 20).isValid, false);
assert.strictEqual(calculateDiscountPercentage(0, 0).isValid, false);
console.log("✓ Test 15: Zero original price rejected across modes");

// Test 16: Negative sale price rejected
assert.strictEqual(calculateDiscountPercentage(100, -10).isValid, false);
assert.strictEqual(calculateOriginalPrice(-50, 25).isValid, false);
console.log("✓ Test 16: Negative sale price rejected");

// Test 17: Sale > Original rejected (Mode 2)
const t17 = calculateDiscountPercentage(100, 150);
assert.strictEqual(t17.isValid, false);
assert.strictEqual(t17.error, "Sale price cannot exceed the original price for a discount calculation.");
console.log("✓ Test 17: Sale price > Original price rejected in Mode 2");

// Test 18: Negative discount rejected
assert.strictEqual(calculateSalePrice(100, -5).isValid, false);
assert.strictEqual(calculateOriginalPrice(100, -5).isValid, false);
console.log("✓ Test 18: Negative discount percentage rejected");

// Test 19: Discount > 100 rejected in Mode 1
const t19 = calculateSalePrice(100, 105);
assert.strictEqual(t19.isValid, false);
assert.strictEqual(t19.error, "Discount percentage cannot exceed 100%.");
console.log("✓ Test 19: Discount > 100% rejected in Mode 1");

// Test 20: Discount >= 100 rejected in Mode 3 (division by zero guard)
const t20a = calculateOriginalPrice(100, 100);
assert.strictEqual(t20a.isValid, false);
assert.strictEqual(t20a.error, "Discount percentage must be less than 100% to calculate original price.");
const t20b = calculateOriginalPrice(100, 105);
assert.strictEqual(t20b.isValid, false);
console.log("✓ Test 20: Discount >= 100% rejected in Mode 3 with explicit error");

// Test 21: Large monetary values
const t21 = calculateSalePrice(100000000, 30);
assert.strictEqual(t21.isValid, true);
assert.strictEqual(t21.salePrice, 70000000);
assert.strictEqual(t21.savings, 30000000);
console.log("✓ Test 21: Large monetary value (100,000,000) processed cleanly");

// Test 22: Full precision & no intermediate rounding
const t22 = calculateSalePrice(33.333333, 33.333333);
assert.strictEqual(t22.isValid, true);
const exactExpected = 33.333333 * (1 - 33.333333 / 100);
assert.strictEqual(Math.abs((t22.salePrice ?? 0) - exactExpected) < 1e-12, true);
console.log("✓ Test 22: Full floating-point precision preserved with zero intermediate rounding");

// Test 23: Wrapper structure validation for Mode 1
const w1 = calculateSalePriceWrapper({ originalPrice: 2000, discountPercent: 25 });
assert.strictEqual(w1.isValid, true);
assert.strictEqual(w1.primaryValue, "1,500");
assert.strictEqual(w1.primaryLabel, "Final price after 25% discount");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "You Save")?.value, "500 (25%)");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Original Price")?.value, "2,000");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Final Price")?.value, "1,500");
console.log("✓ Test 23: Mode 1 wrapper returns exact primary value and secondary metrics");

// Test 24: Wrapper structure validation for Mode 2
const w2 = calculateDiscountPercentageWrapper({ originalPrice: 2500, salePrice: 2000 });
assert.strictEqual(w2.isValid, true);
assert.strictEqual(w2.primaryValue, "20%");
assert.strictEqual(w2.primaryLabel, "Total discount percentage applied");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label === "Total Savings")?.value, "500");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label === "Original Price")?.value, "2,500");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label === "Sale Price")?.value, "2,000");
console.log("✓ Test 24: Mode 2 wrapper returns exact primary percentage and secondary metrics");

// Test 25: Wrapper structure validation for Mode 3
const w3 = calculateOriginalPriceWrapper({ salePrice: 1500, discountPercent: 25 });
assert.strictEqual(w3.isValid, true);
assert.strictEqual(w3.primaryValue, "2,000");
assert.strictEqual(w3.primaryLabel, "Original price before 25% discount");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "Total Savings")?.value, "500 (25%)");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "Sale Price")?.value, "1,500");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "Original Price")?.value, "2,000");
console.log("✓ Test 25: Mode 3 wrapper returns exact primary value and secondary metrics");

// Test 26: Registry definition structure integrity
assert.strictEqual(discountCalculatorDefinition.slug, "discount-calculator");
assert.strictEqual(discountCalculatorDefinition.modes.length, 3);
assert.strictEqual(discountCalculatorDefinition.defaultModeId, "sale-price");
assert.strictEqual(discountCalculatorDefinition.formulas.length, 3);
assert.strictEqual(discountCalculatorDefinition.examples.length, 4);
assert.strictEqual(discountCalculatorDefinition.faqs.length, 6);
console.log("✓ Test 26: Discount calculator definition structure verified");

// Test 27: Formula formatting contains no broken markup or unescaped LaTeX symbols
for (const formula of discountCalculatorDefinition.formulas) {
  assert.strictEqual(formula.formulaMath.includes("\\left"), false, "Formula should not contain \\left");
  assert.strictEqual(formula.formulaMath.includes("\\right"), false, "Formula should not contain \\right");
  assert.strictEqual(formula.formulaMath.includes("\\%"), false, "Formula should not contain \\%");
  // Verify brackets and braces balance
  const openBraces = (formula.formulaMath.match(/\{/g) || []).length;
  const closeBraces = (formula.formulaMath.match(/\}/g) || []).length;
  assert.strictEqual(openBraces, closeBraces, "Braces must be balanced in formulaMath");
  const openParens = (formula.formulaMath.match(/\(/g) || []).length;
  const closeParens = (formula.formulaMath.match(/\)/g) || []).length;
  assert.strictEqual(openParens, closeParens, "Parentheses must be balanced in formulaMath");
}
console.log("✓ Test 27: Formula formatting and token syntax verified");

console.log("\nAll 27 Discount Calculator tests passed successfully!");

