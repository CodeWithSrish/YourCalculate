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

// Test 3: "loan" search finds Loan Calculator first and includes EMI Calculator
const test3 = searchCalculators("loan");
assert.ok(test3.length >= 2);
assert.strictEqual(test3[0].calculator.slug, "loan-calculator");
assert.ok(test3.some((r) => r.calculator.slug === "emi-calculator"));
console.log("✓ Test 3: 'loan' search finds Loan Calculator first and includes EMI Calculator");

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

// Test 12: Alias "cum gpa" finds GPA Calculator
const test12 = searchCalculators("cum gpa");
assert.ok(test12.length >= 1);
assert.strictEqual(test12[0].calculator.slug, "gpa-calculator");
console.log("✓ Test 12: Alias 'cum gpa' matches GPA Calculator");

// Test 13: "cgpa to percentage" finds Percentage to CGPA Calculator
const test13 = searchCalculators("cgpa to percentage");
assert.ok(test13.length >= 1);
assert.strictEqual(test13[0].calculator.slug, "percentage-to-cgpa-calculator");
console.log("✓ Test 13: 'cgpa to percentage' finds Percentage to CGPA Calculator");

// Test 14: "percentage to cgpa" finds Percentage to CGPA Calculator
const test14 = searchCalculators("percentage to cgpa");
assert.ok(test14.length >= 1);
assert.strictEqual(test14[0].calculator.slug, "percentage-to-cgpa-calculator");
console.log("✓ Test 14: 'percentage to cgpa' finds Percentage to CGPA Calculator");

// Test 15: "home loan" finds Home Loan and EMI calculators
const test15 = searchCalculators("home loan");
assert.ok(test15.length >= 2);
assert.ok(test15.some((r) => r.calculator.slug === "emi-calculator"));
assert.ok(test15.some((r) => r.calculator.slug === "home-loan-prepayment-vs-sip-calculator"));
console.log("✓ Test 15: 'home loan' finds EMI and Prepayment calculators");

// Test 16: "discount" finds Discount Calculator first and includes Percentage Calculator
const test16 = searchCalculators("discount");
assert.ok(test16.length >= 2);
assert.strictEqual(test16[0].calculator.slug, "discount-calculator");
assert.ok(test16.some((r) => r.calculator.slug === "percentage-calculator"));
console.log("✓ Test 16: 'discount' ranks Discount Calculator first and includes Percentage Calculator");

// Test 17: "increase" finds Percentage Calculator
const test17 = searchCalculators("increase");
assert.ok(test17.length >= 1);
assert.strictEqual(test17[0].calculator.slug, "percentage-calculator");
console.log("✓ Test 17: 'increase' finds Percentage Calculator");

// Test 18: "age" finds Age Calculator
const test18 = searchCalculators("age");
assert.ok(test18.length >= 1);
assert.strictEqual(test18[0].calculator.slug, "age-calculator");
console.log("✓ Test 18: 'age' finds Age Calculator");

// Test 19: "date of birth" finds Age Calculator
const test19 = searchCalculators("date of birth");
assert.ok(test19.length >= 1);
assert.strictEqual(test19[0].calculator.slug, "age-calculator");
console.log("✓ Test 19: 'date of birth' finds Age Calculator");

// Test 20: "bmi" finds BMI Calculator
const test20 = searchCalculators("bmi");
assert.ok(test20.length >= 1);
assert.strictEqual(test20[0].calculator.slug, "bmi-calculator");
console.log("✓ Test 20: 'bmi' finds BMI Calculator");

// Test 21: "body mass index" finds BMI Calculator
const test21 = searchCalculators("body mass index");
assert.ok(test21.length >= 1);
assert.strictEqual(test21[0].calculator.slug, "bmi-calculator");
console.log("✓ Test 21: 'body mass index' finds BMI Calculator");

// Test 22: "sale price" finds Discount Calculator
const test22 = searchCalculators("sale price");
assert.ok(test22.length >= 1);
assert.strictEqual(test22[0].calculator.slug, "discount-calculator");
console.log("✓ Test 22: 'sale price' finds Discount Calculator");

// Test 23: "20 percent off" finds Discount Calculator
const test23 = searchCalculators("20 percent off");
assert.ok(test23.length >= 1);
assert.strictEqual(test23[0].calculator.slug, "discount-calculator");
console.log("✓ Test 23: '20 percent off' finds Discount Calculator");

// Test 24: "price markdown" finds Discount Calculator
const test24 = searchCalculators("price markdown");
assert.ok(test24.length >= 1);
assert.strictEqual(test24[0].calculator.slug, "discount-calculator");
console.log("✓ Test 24: 'price markdown' finds Discount Calculator");

// Test 25: "gst" finds GST Calculator
const test25 = searchCalculators("gst");
assert.ok(test25.length >= 1);
assert.strictEqual(test25[0].calculator.slug, "gst-calculator");
console.log("✓ Test 25: 'gst' ranks GST Calculator first");

// Test 26: "cgst sgst" finds GST Calculator
const test26 = searchCalculators("cgst sgst");
assert.ok(test26.length >= 1);
assert.strictEqual(test26[0].calculator.slug, "gst-calculator");
console.log("✓ Test 26: 'cgst sgst' finds GST Calculator");

// Test 27: "igst" finds GST Calculator
const test27 = searchCalculators("igst");
assert.ok(test27.length >= 1);
assert.strictEqual(test27[0].calculator.slug, "gst-calculator");
console.log("✓ Test 27: 'igst' finds GST Calculator");

// Test 28: "add gst" finds GST Calculator
const test28 = searchCalculators("add gst");
assert.ok(test28.length >= 1);
assert.strictEqual(test28[0].calculator.slug, "gst-calculator");
console.log("✓ Test 28: 'add gst' finds GST Calculator");

// Test 29: "compound interest" finds Compound Interest Calculator first
const test29 = searchCalculators("compound interest");
assert.ok(test29.length >= 1);
assert.strictEqual(test29[0].calculator.slug, "compound-interest-calculator");
console.log("✓ Test 29: 'compound interest' ranks Compound Interest Calculator first");

// Test 30: "ci calculator" finds Compound Interest Calculator
const test30 = searchCalculators("ci calculator");
assert.ok(test30.length >= 1);
assert.strictEqual(test30[0].calculator.slug, "compound-interest-calculator");
console.log("✓ Test 30: 'ci calculator' finds Compound Interest Calculator");

// Test 31: "compound growth" finds Compound Interest Calculator
const test31 = searchCalculators("compound growth");
assert.ok(test31.length >= 1);
assert.strictEqual(test31[0].calculator.slug, "compound-interest-calculator");
console.log("✓ Test 31: 'compound growth' finds Compound Interest Calculator");

// Test 32: "loan calculator" finds Loan Calculator
const test32 = searchCalculators("loan calculator");
assert.ok(test32.length >= 1);
assert.strictEqual(test32[0].calculator.slug, "loan-calculator");
console.log("✓ Test 32: 'loan calculator' ranks Loan Calculator first");

// Test 33: "how much can i borrow" finds Loan Calculator
const test33 = searchCalculators("how much can i borrow");
assert.ok(test33.length >= 1);
assert.strictEqual(test33[0].calculator.slug, "loan-calculator");
console.log("✓ Test 33: 'how much can i borrow' finds Loan Calculator");

// Test 34: "borrowing capacity" finds Loan Calculator
const test34 = searchCalculators("borrowing capacity");
assert.ok(test34.length >= 1);
assert.strictEqual(test34[0].calculator.slug, "loan-calculator");
console.log("✓ Test 34: 'borrowing capacity' finds Loan Calculator");

// Test 35: "simple interest" finds Simple Interest Calculator first
const test35 = searchCalculators("simple interest");
assert.ok(test35.length >= 1);
assert.strictEqual(test35[0].calculator.slug, "simple-interest-calculator");
console.log("✓ Test 35: 'simple interest' ranks Simple Interest Calculator first");

// Test 36: "simple interest calculator" finds Simple Interest Calculator
const test36 = searchCalculators("simple interest calculator");
assert.ok(test36.length >= 1);
assert.strictEqual(test36[0].calculator.slug, "simple-interest-calculator");
console.log("✓ Test 36: 'simple interest calculator' finds Simple Interest Calculator");

// Test 37: "si calculator" finds Simple Interest Calculator
const test37 = searchCalculators("si calculator");
assert.ok(test37.length >= 1);
assert.strictEqual(test37[0].calculator.slug, "simple-interest-calculator");
console.log("✓ Test 37: 'si calculator' finds Simple Interest Calculator");

// Test 38: "average" finds Average Calculator first
const test38 = searchCalculators("average");
assert.ok(test38.length >= 1);
assert.strictEqual(test38[0].calculator.slug, "average-calculator");
console.log("✓ Test 38: 'average' ranks Average Calculator first");

// Test 39: "average calculator" finds Average Calculator
const test39 = searchCalculators("average calculator");
assert.ok(test39.length >= 1);
assert.strictEqual(test39[0].calculator.slug, "average-calculator");
console.log("✓ Test 39: 'average calculator' finds Average Calculator");

// Test 40: "mean calculator" finds Average Calculator
const test40 = searchCalculators("mean calculator");
assert.ok(test40.length >= 1);
assert.strictEqual(test40[0].calculator.slug, "average-calculator");
console.log("✓ Test 40: 'mean calculator' finds Average Calculator");

// Test 41: "weighted average" finds Average Calculator
const test41 = searchCalculators("weighted average");
assert.ok(test41.length >= 1);
assert.strictEqual(test41[0].calculator.slug, "average-calculator");
console.log("✓ Test 41: 'weighted average' finds Average Calculator");

// Test 42: "ratio" finds Ratio Calculator first
const test42 = searchCalculators("ratio");
assert.ok(test42.length >= 1);
assert.strictEqual(test42[0].calculator.slug, "ratio-calculator");
console.log("✓ Test 42: 'ratio' ranks Ratio Calculator first");

// Test 43: "ratio calculator" finds Ratio Calculator
const test43 = searchCalculators("ratio calculator");
assert.ok(test43.length >= 1);
assert.strictEqual(test43[0].calculator.slug, "ratio-calculator");
console.log("✓ Test 43: 'ratio calculator' finds Ratio Calculator");

// Test 44: "simplify ratio" finds Ratio Calculator
const test44 = searchCalculators("simplify ratio");
assert.ok(test44.length >= 1);
assert.strictEqual(test44[0].calculator.slug, "ratio-calculator");
console.log("✓ Test 44: 'simplify ratio' finds Ratio Calculator");

// Test 45: "solve proportion" finds Ratio Calculator
const test45 = searchCalculators("solve proportion");
assert.ok(test45.length >= 1);
assert.strictEqual(test45[0].calculator.slug, "ratio-calculator");
console.log("✓ Test 45: 'solve proportion' finds Ratio Calculator");

// Test 46: "early retirement" finds Early Retirement Calculator
const test46 = searchCalculators("early retirement");
assert.ok(test46.length >= 1);
assert.strictEqual(test46[0].calculator.slug, "early-retirement-calculator");
console.log("✓ Test 46: 'early retirement' finds Early Retirement Calculator");

// Test 47: "fire calculator" finds Early Retirement Calculator
const test47 = searchCalculators("fire calculator");
assert.ok(test47.length >= 1);
assert.strictEqual(test47[0].calculator.slug, "early-retirement-calculator");
console.log("✓ Test 47: 'fire calculator' finds Early Retirement Calculator");

console.log("\nAll Calculator Search Engine tests passed successfully!");
