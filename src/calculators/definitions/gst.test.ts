import assert from "node:assert";
import {
  calculateAddGst,
  calculateRemoveGst,
  calculateAddGstWrapper,
  calculateRemoveGstWrapper,
  gstCalculatorDefinition,
} from "./gst";

console.log("Running GST Calculator Engine Tests...\n");

// Test 1 & 2: 10,000 at 18% intra-state -> GST 1,800, Final 11,800
const r1 = calculateAddGst(10000, 18, "intra");
assert.strictEqual(r1.isValid, true);
assert.strictEqual(r1.gstAmount, 1800);
assert.strictEqual(r1.finalPrice, 11800);
assert.strictEqual(r1.formattedGstAmount, "1,800");
assert.strictEqual(r1.formattedFinalPrice, "11,800");
console.log("✓ Test 1: 10,000 at 18% intra-state calculates GST 1,800 and Final Price 11,800");

// Test 3 & 4: CGST 900, SGST 900
assert.strictEqual(r1.cgstAmount, 900);
assert.strictEqual(r1.sgstAmount, 900);
assert.strictEqual(r1.formattedCgstAmount, "900");
assert.strictEqual(r1.formattedSgstAmount, "900");
console.log("✓ Test 2: Intra-state split correctly yields CGST 900 and SGST 900");

// Test 5: 10,000 at 18% inter-state -> IGST 1,800
const r2 = calculateAddGst(10000, 18, "inter");
assert.strictEqual(r2.isValid, true);
assert.strictEqual(r2.igstAmount, 1800);
assert.strictEqual(r2.formattedIgstAmount, "1,800");
assert.strictEqual(r2.cgstAmount, 0);
assert.strictEqual(r2.sgstAmount, 0);
console.log("✓ Test 3: Inter-state transaction calculates IGST 1,800");

// Test 6 & 7: Remove GST from 11,800 at 18% -> Base 10,000, GST 1,800
const r3 = calculateRemoveGst(11800, 18, "intra");
assert.strictEqual(r3.isValid, true);
assert.strictEqual(r3.basePrice, 10000);
assert.strictEqual(r3.gstAmount, 1800);
assert.strictEqual(r3.formattedBasePrice, "10,000");
assert.strictEqual(r3.formattedGstAmount, "1,800");
assert.strictEqual(r3.formattedCgstAmount, "900");
assert.strictEqual(r3.formattedSgstAmount, "900");
console.log("✓ Test 4: Remove GST from 11,800 at 18% recovers Base 10,000 and GST 1,800");

// Test 8: 5% GST slab
const r4 = calculateAddGst(10000, 5, "intra");
assert.strictEqual(r4.isValid, true);
assert.strictEqual(r4.gstAmount, 500);
assert.strictEqual(r4.finalPrice, 10500);
assert.strictEqual(r4.formattedCgstAmount, "250");
assert.strictEqual(r4.formattedSgstAmount, "250");
console.log("✓ Test 5: 5% GST on 10,000 calculates GST 500 and Final 10,500");

// Test 9: 12% GST slab
const r5 = calculateAddGst(20000, 12, "intra");
assert.strictEqual(r5.isValid, true);
assert.strictEqual(r5.gstAmount, 2400);
assert.strictEqual(r5.finalPrice, 22400);
assert.strictEqual(r5.formattedCgstAmount, "1,200");
assert.strictEqual(r5.formattedSgstAmount, "1,200");
console.log("✓ Test 6: 12% GST on 20,000 calculates GST 2,400 and Final 22,400");

// Test 10: 28% GST slab
const r6 = calculateAddGst(50000, 28, "intra");
assert.strictEqual(r6.isValid, true);
assert.ok(Math.abs((r6.gstAmount ?? 0) - 14000) < 1e-9);
assert.ok(Math.abs((r6.finalPrice ?? 0) - 64000) < 1e-9);
assert.strictEqual(r6.formattedGstAmount, "14,000");
assert.strictEqual(r6.formattedFinalPrice, "64,000");
assert.strictEqual(r6.formattedCgstAmount, "7,000");
assert.strictEqual(r6.formattedSgstAmount, "7,000");
console.log("✓ Test 7: 28% GST on 50,000 calculates GST 14,000 and Final 64,000");

// Test 11: 0% GST slab
const r7 = calculateAddGst(8000, 0, "intra");
assert.strictEqual(r7.isValid, true);
assert.strictEqual(r7.gstAmount, 0);
assert.strictEqual(r7.finalPrice, 8000);
assert.strictEqual(r7.formattedGstAmount, "0");
console.log("✓ Test 8: 0% GST preserves original base price with 0 tax");

// Test 12: Special 0.25% slab (rough diamonds)
const r8 = calculateAddGst(100000, 0.25, "intra");
assert.strictEqual(r8.isValid, true);
assert.strictEqual(r8.gstAmount, 250);
assert.strictEqual(r8.finalPrice, 100250);
assert.strictEqual(r8.formattedCgstAmount, "125");
assert.strictEqual(r8.formattedSgstAmount, "125");
console.log("✓ Test 9: Special 0.25% diamond slab calculates GST 250");

// Test 13: Special 3% slab (gold/silver)
const r9 = calculateAddGst(50000, 3, "intra");
assert.strictEqual(r9.isValid, true);
assert.strictEqual(r9.gstAmount, 1500);
assert.strictEqual(r9.finalPrice, 51500);
assert.strictEqual(r9.formattedCgstAmount, "750");
assert.strictEqual(r9.formattedSgstAmount, "750");
console.log("✓ Test 10: Special 3% precious metals slab calculates GST 1,500");

// Test 14: Decimal GST rate 18.5%
const r10 = calculateAddGst(1000, 18.5, "intra");
assert.strictEqual(r10.isValid, true);
assert.strictEqual(r10.gstAmount, 185);
assert.strictEqual(r10.finalPrice, 1185);
assert.strictEqual(r10.formattedCgstAmount, "92.5");
assert.strictEqual(r10.formattedSgstAmount, "92.5");
console.log("✓ Test 11: Decimal GST rate (18.5%) calculated with full precision");

// Test 15: Decimal base price 1,999.99 at 18%
const r11 = calculateAddGst(1999.99, 18, "intra");
assert.strictEqual(r11.isValid, true);
assert.strictEqual(r11.formattedBasePrice, "1,999.99");
assert.strictEqual(r11.formattedGstAmount, "360");
assert.strictEqual(r11.formattedFinalPrice, "2,359.99");
console.log("✓ Test 12: Decimal base price (1,999.99) handled with high precision");

// Test 16: Negative base price rejected
const r12 = calculateAddGst(-5000, 18, "intra");
assert.strictEqual(r12.isValid, false);
assert.strictEqual(r12.error, "Base price must be greater than 0.");
console.log("✓ Test 13: Negative base price rejected");

// Test 17: Zero base price rejected
const r13 = calculateAddGst(0, 18, "intra");
assert.strictEqual(r13.isValid, false);
assert.strictEqual(r13.error, "Base price must be greater than 0.");
console.log("✓ Test 14: Zero base price rejected");

// Test 18: Negative inclusive price rejected
const r14 = calculateRemoveGst(-11800, 18, "intra");
assert.strictEqual(r14.isValid, false);
assert.strictEqual(r14.error, "GST-inclusive price must be greater than 0.");
console.log("✓ Test 15: Negative inclusive price rejected");

// Test 19: Zero inclusive price rejected
const r15 = calculateRemoveGst(0, 18, "intra");
assert.strictEqual(r15.isValid, false);
assert.strictEqual(r15.error, "GST-inclusive price must be greater than 0.");
console.log("✓ Test 16: Zero inclusive price rejected");

// Test 20: Negative GST rate rejected
const r16 = calculateAddGst(10000, -5, "intra");
assert.strictEqual(r16.isValid, false);
assert.strictEqual(r16.error, "GST rate cannot be negative.");
console.log("✓ Test 17: Negative GST rate rejected");

// Test 21: GST rate > 100% rejected
const r17 = calculateAddGst(10000, 105, "intra");
assert.strictEqual(r17.isValid, false);
assert.strictEqual(r17.error, "GST rate cannot exceed 100%.");
console.log("✓ Test 18: GST rate > 100% rejected");

// Test 22: Large monetary magnitude (100,000,000 at 18%)
const r18 = calculateAddGst(100000000, 18, "intra");
assert.strictEqual(r18.isValid, true);
assert.strictEqual(r18.formattedBasePrice, "100,000,000");
assert.strictEqual(r18.formattedGstAmount, "18,000,000");
assert.strictEqual(r18.formattedFinalPrice, "118,000,000");
assert.strictEqual(r18.formattedCgstAmount, "9,000,000");
assert.strictEqual(r18.formattedSgstAmount, "9,000,000");
console.log("✓ Test 19: Large monetary value (100,000,000) processed cleanly");

// Test 23: Fractional CGST/SGST paise reconciliation (105 at 5% -> GST 5.25 -> CGST 2.63, SGST 2.62)
const r19 = calculateAddGst(105, 5, "intra");
assert.strictEqual(r19.isValid, true);
assert.strictEqual(r19.formattedGstAmount, "5.25");
const cgstNum = Number(r19.formattedCgstAmount?.replace(/,/g, ""));
const sgstNum = Number(r19.formattedSgstAmount?.replace(/,/g, ""));
const totalGstNum = Number(r19.formattedGstAmount?.replace(/,/g, ""));
assert.strictEqual(Math.round((cgstNum + sgstNum) * 100) / 100, totalGstNum);
console.log("✓ Test 20: Fractional CGST & SGST sum strictly reconciles to total GST amount");

// Test 24: No intermediate rounding in reverse calculation
const r20 = calculateRemoveGst(1000, 18, "intra");
assert.strictEqual(r20.isValid, true);
assert.strictEqual(r20.basePrice, 1000 / 1.18);
assert.strictEqual(r20.formattedBasePrice, "847.46");
assert.strictEqual(r20.formattedGstAmount, "152.54");
console.log("✓ Test 21: Full unrounded precision preserved during reverse calculation");

// Test 25: Add GST wrapper result structure (Intra-State)
const w1 = calculateAddGstWrapper({ basePrice: 10000, gstRate: 18, taxType: "intra" });
assert.strictEqual(w1.isValid, true);
assert.strictEqual(w1.primaryValue, "11,800");
assert.strictEqual(w1.primaryLabel, "Total price including 18% GST");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Base Price")?.value, "10,000");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label.startsWith("Total GST"))?.value, "1,800");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label.startsWith("CGST"))?.value, "900");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label.startsWith("SGST"))?.value, "900");
console.log("✓ Test 22: Add GST wrapper returns correct primary and secondary metrics");

// Test 26: Add GST wrapper result structure (Inter-State)
const w2 = calculateAddGstWrapper({ basePrice: 10000, gstRate: 18, taxType: "inter" });
assert.strictEqual(w2.isValid, true);
assert.strictEqual(w2.primaryValue, "11,800");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label.startsWith("IGST"))?.value, "1,800");
assert.strictEqual(w2.secondaryValues?.some((s) => s.label.startsWith("CGST")), false);
console.log("✓ Test 23: Inter-state mode correctly displays IGST and omits CGST/SGST");

// Test 27: Remove GST wrapper result structure (Intra-State)
const w3 = calculateRemoveGstWrapper({ inclusivePrice: 11800, gstRate: 18, taxType: "intra" });
assert.strictEqual(w3.isValid, true);
assert.strictEqual(w3.primaryValue, "10,000");
assert.strictEqual(w3.primaryLabel, "Original base price before 18% GST");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "GST-Inclusive Price")?.value, "11,800");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label.startsWith("Total GST"))?.value, "1,800");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label.startsWith("CGST"))?.value, "900");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label.startsWith("SGST"))?.value, "900");
console.log("✓ Test 24: Remove GST wrapper (Intra-State) returns correct base price and CGST/SGST metrics");

// Test 28: Remove GST wrapper result structure (Inter-State)
const w4 = calculateRemoveGstWrapper({ inclusivePrice: 11800, gstRate: 18, taxType: "inter" });
assert.strictEqual(w4.isValid, true);
assert.strictEqual(w4.primaryValue, "10,000");
assert.strictEqual(w4.secondaryValues?.find((s) => s.label.startsWith("IGST"))?.value, "1,800");
assert.strictEqual(w4.secondaryValues?.some((s) => s.label.startsWith("CGST")), false);
console.log("✓ Test 25: Remove GST wrapper (Inter-State) correctly displays IGST and omits CGST/SGST");

// Test 29: Registry definition structure integrity
assert.strictEqual(gstCalculatorDefinition.slug, "gst-calculator");
assert.strictEqual(gstCalculatorDefinition.modes.length, 2);
assert.strictEqual(gstCalculatorDefinition.defaultModeId, "add-gst");
assert.strictEqual(gstCalculatorDefinition.formulas.length, 3);
assert.strictEqual(gstCalculatorDefinition.examples.length, 4);
assert.strictEqual(gstCalculatorDefinition.faqs.length, 7);
console.log("✓ Test 26: GST calculator definition structure verified");

// Test 30: Formula formatting syntax validation
for (const formula of gstCalculatorDefinition.formulas) {
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
console.log("✓ Test 27: Formula formatting and token syntax verified");

// Test 31: Calculation step explanation contains pure computation
assert.strictEqual(r1.stepExplanation?.includes("10,000 × (18 / 100) = 1,800"), true);
assert.strictEqual(r3.stepExplanation?.includes("11,800 / 1.18 = 10,000"), true);
console.log("✓ Test 28: Calculation explanations contain clean mathematical steps");

console.log("\nAll 28 GST Calculator tests passed successfully!");
