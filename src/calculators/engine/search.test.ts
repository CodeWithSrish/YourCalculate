import assert from "node:assert";
import { searchCalculators } from "./search";

console.log("Running Calculator Search Engine Tests...\n");

// Test 1: "cgpa" query returns CGPA Calculator first
const test1 = searchCalculators("cgpa");
assert.ok(test1.length >= 1);
assert.strictEqual(test1[0].calculator.slug, "cgpa-calculator");
console.log("✓ Test 1: 'cgpa' search ranks CGPA Calculator first");

// Test 2: "GPA" case-insensitive search
const test2 = searchCalculators("GPA");
assert.ok(test2.length >= 1);
assert.strictEqual(test2[0].calculator.slug, "gpa-calculator");
console.log("✓ Test 2: 'GPA' case-insensitive search finds GPA Calculator");

// Test 3: "loan" alias finds EMI Calculator
const test3 = searchCalculators("loan");
assert.ok(test3.length >= 1);
assert.strictEqual(test3[0].calculator.slug, "emi-calculator");
console.log("✓ Test 3: 'loan' alias search finds EMI Calculator");

// Test 4: "emi" finds EMI Calculator
const test4 = searchCalculators("emi");
assert.ok(test4.length >= 1);
assert.strictEqual(test4[0].calculator.slug, "emi-calculator");
console.log("✓ Test 4: 'emi' search finds EMI Calculator");

// Test 5: "percentage" finds Percentage Calculator & Percentage to CGPA
const test5 = searchCalculators("percentage");
assert.ok(test5.length >= 2);
assert.strictEqual(test5[0].calculator.slug, "percentage-calculator");
const hasPercentageToCgpa = test5.some((r) => r.calculator.slug === "percentage-to-cgpa-calculator");
assert.ok(hasPercentageToCgpa);
console.log("✓ Test 5: 'percentage' finds Percentage and Percentage-to-CGPA calculators");

// Test 6: "sip" finds SIP Calculator
const test6 = searchCalculators("sip");
assert.ok(test6.length >= 1);
assert.strictEqual(test6[0].calculator.slug, "sip-calculator");
console.log("✓ Test 6: 'sip' search finds SIP Calculator");

// Test 7: "calculate CGPA" finds CGPA Calculator
const test7 = searchCalculators("calculate CGPA");
assert.ok(test7.length >= 1);
assert.strictEqual(test7[0].calculator.slug, "cgpa-calculator");
console.log("✓ Test 7: 'calculate CGPA' phrase match finds CGPA Calculator");

// Test 8: Partial match "percent"
const test8 = searchCalculators("percent");
assert.ok(test8.length >= 1);
assert.strictEqual(test8[0].calculator.slug, "percentage-calculator");
console.log("✓ Test 8: Partial search 'percent' matches Percentage Calculator");

// Test 9: Keyword alias "mutual fund" matches SIP
const test9 = searchCalculators("mutual fund");
assert.ok(test9.length >= 1);
assert.strictEqual(test9[0].calculator.slug, "sip-calculator");
console.log("✓ Test 9: Alias 'mutual fund' matches SIP Calculator");

// Test 10: No results query
const test10 = searchCalculators("xyznonexistentterm12345");
assert.strictEqual(test10.length, 0);
console.log("✓ Test 10: Non-matching query returns empty results");

// Test 11: Empty query returns empty array
const test11 = searchCalculators("   ");
assert.strictEqual(test11.length, 0);
console.log("✓ Test 11: Empty query returns empty array");

console.log("\nAll Calculator Search Engine tests passed successfully!");
