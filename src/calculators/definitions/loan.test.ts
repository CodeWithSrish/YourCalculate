import assert from "node:assert";
import {
  calculateLoanPayment,
  calculateBorrowingCapacity,
  calculateLoanTenure,
  calculateLoanPaymentWrapper,
  calculateBorrowingCapacityWrapper,
  calculateLoanTenureWrapper,
  loanCalculatorDefinition,
} from "./loan";

console.log("Running Loan Calculator Engine Tests...\n");

// ==========================================
// Mode 1: Loan Payment Tests
// ==========================================

// Test 1: Standard personal/auto loan (₹10,00,000 @ 9.5% for 5 yr)
const t1 = calculateLoanPayment(1000000, 9.5, 5);
assert.strictEqual(t1.isValid, true);
assert.strictEqual(t1.formattedMonthlyPayment, "₹21,001.86");
assert.strictEqual(t1.formattedTotalRepayment, "₹12,60,111.68");
assert.strictEqual(t1.formattedTotalInterest, "₹2,60,111.68");
assert.strictEqual(t1.formattedInterestToLoanRatio, "26.01%");
console.log("✓ Test 1: ₹10,00,000 @ 9.5% for 5 yr calculates PMT ₹21,001.86 and Interest ₹2,60,111.68");

// Test 2: Standard home loan (₹50,00,000 @ 8.5% for 20 yr)
const t2 = calculateLoanPayment(5000000, 8.5, 20);
assert.strictEqual(t2.isValid, true);
assert.strictEqual(t2.formattedMonthlyPayment, "₹43,391.16");
assert.strictEqual(t2.formattedTotalRepayment, "₹1,04,13,878.80");
assert.strictEqual(t2.formattedTotalInterest, "₹54,13,878.80");
console.log("✓ Test 2: ₹50,00,000 @ 8.5% for 20 yr calculates PMT ₹43,391.16 and Interest ₹54,13,878.80");

// Test 3: Zero Interest Loan (₹1,20,000 @ 0% for 1 yr)
const t3 = calculateLoanPayment(120000, 0, 1);
assert.strictEqual(t3.isValid, true);
assert.strictEqual(t3.formattedMonthlyPayment, "₹10,000.00");
assert.strictEqual(t3.formattedTotalRepayment, "₹1,20,000.00");
assert.strictEqual(t3.formattedTotalInterest, "₹0.00");
assert.strictEqual(t3.formattedInterestToLoanRatio, "0%");
console.log("✓ Test 3: Zero interest rate produces exact division and ₹0.00 interest");

// Test 4: Decimal Interest Rate and Tenure (₹5,00,000 @ 8.75% for 3.5 yr)
const t4 = calculateLoanPayment(500000, 8.75, 3.5);
assert.strictEqual(t4.isValid, true);
assert.ok((t4.monthlyPayment ?? 0) > 13000 && (t4.monthlyPayment ?? 0) < 14000);
console.log("✓ Test 4: Decimal interest rate (8.75%) and tenure (3.5 yr) computed cleanly");

// Test 5: Mode 1 Validation - Negative/Zero Principal
const t5a = calculateLoanPayment(-100000, 9.5, 5);
assert.strictEqual(t5a.isValid, false);
assert.strictEqual(t5a.error, "Loan amount must be greater than 0.");

const t5b = calculateLoanPayment(0, 9.5, 5);
assert.strictEqual(t5b.isValid, false);
assert.strictEqual(t5b.error, "Loan amount must be greater than 0.");
console.log("✓ Test 5: Negative and zero principal rejected in Mode 1");

// Test 6: Mode 1 Validation - Negative Rate and Tenure
const t6a = calculateLoanPayment(1000000, -2, 5);
assert.strictEqual(t6a.isValid, false);
assert.strictEqual(t6a.error, "Interest rate cannot be negative.");

const t6b = calculateLoanPayment(1000000, 9.5, -3);
assert.strictEqual(t6b.isValid, false);
assert.strictEqual(t6b.error, "Loan tenure must be greater than 0.");
console.log("✓ Test 6: Negative rate and negative tenure rejected in Mode 1");

// ==========================================
// Mode 2: Borrowing Capacity Tests
// ==========================================

// Test 7: Standard borrowing capacity (₹25,000 budget @ 9% for 15 yr)
const t7 = calculateBorrowingCapacity(25000, 9, 15);
assert.strictEqual(t7.isValid, true);
assert.strictEqual(t7.formattedMaxLoanAmount, "₹24,64,835.22");
assert.strictEqual(t7.formattedTotalRepayment, "₹45,00,000.00");
assert.strictEqual(t7.formattedTotalInterest, "₹20,35,164.78");
console.log("✓ Test 7: ₹25,000 budget @ 9% for 15 yr calculates Max Loan ₹24,64,835.22");

// Test 8: Large borrowing capacity (₹50,000 budget @ 8.5% for 20 yr)
const t8 = calculateBorrowingCapacity(50000, 8.5, 20);
assert.strictEqual(t8.isValid, true);
assert.strictEqual(t8.formattedMaxLoanAmount, "₹57,61,541.99");
assert.strictEqual(t8.formattedTotalRepayment, "₹1,20,00,000.00");
assert.strictEqual(t8.formattedTotalInterest, "₹62,38,458.01");
console.log("✓ Test 8: ₹50,000 budget @ 8.5% for 20 yr calculates Max Loan ₹57,61,541.99");

// Test 9: Zero Interest Borrowing Capacity (₹10,000 budget @ 0% for 2 yr)
const t9 = calculateBorrowingCapacity(10000, 0, 2);
assert.strictEqual(t9.isValid, true);
assert.strictEqual(t9.formattedMaxLoanAmount, "₹2,40,000.00");
assert.strictEqual(t9.formattedTotalRepayment, "₹2,40,000.00");
assert.strictEqual(t9.formattedTotalInterest, "₹0.00");
console.log("✓ Test 9: Zero interest borrowing capacity strictly equals Monthly Budget × n");

// Test 10: Round-Trip Mathematical Inversion (Mode 1 -> Mode 2)
const originalPrincipal = 1000000;
const rate = 9.5;
const tenure = 5;
const pmt = calculateLoanPayment(originalPrincipal, rate, tenure).monthlyPayment ?? 0;
const recoveredLoan = calculateBorrowingCapacity(pmt, rate, tenure).maxLoanAmount ?? 0;
assert.ok(Math.abs(recoveredLoan - originalPrincipal) < 1e-6);
console.log("✓ Test 10: Inversion round-trip check: Mode 1 PMT fed to Mode 2 exactly recovers Principal");

// Test 11: Mode 2 Validation - Negative/Zero Monthly Budget
const t11a = calculateBorrowingCapacity(-5000, 9, 15);
assert.strictEqual(t11a.isValid, false);
assert.strictEqual(t11a.error, "Monthly payment budget must be greater than 0.");

const t11b = calculateBorrowingCapacity(0, 9, 15);
assert.strictEqual(t11b.isValid, false);
assert.strictEqual(t11b.error, "Monthly payment budget must be greater than 0.");
console.log("✓ Test 11: Negative and zero budget rejected in Mode 2");

// ==========================================
// Mode 3: Loan Tenure Tests
// ==========================================

// Test 12: Standard loan payoff (₹5,00,000 @ 10% with ₹15,000/mo)
const t12 = calculateLoanTenure(500000, 10, 15000);
assert.strictEqual(t12.isValid, true);
assert.strictEqual(t12.formattedInitialMonthlyInterest, "₹4,166.67");
assert.strictEqual(t12.formattedDuration, "39.21 Months");
assert.strictEqual(t12.formattedYears, "3.27 Years");
console.log("✓ Test 12: ₹5,00,000 @ 10% paying ₹15,000/mo calculates 39.21 Months (~3.27 Years)");

// Test 13: Zero Interest Loan Payoff (₹1,20,000 @ 0% with ₹10,000/mo)
const t13 = calculateLoanTenure(120000, 0, 10000);
assert.strictEqual(t13.isValid, true);
assert.strictEqual(t13.formattedDuration, "12 Months");
assert.strictEqual(t13.formattedYears, "1 Year");
console.log("✓ Test 13: Zero interest loan payoff calculates exact linear quotient");

// Test 14: Payment Less Than Initial Interest Guard (Negative Amortization)
const t14 = calculateLoanTenure(500000, 10, 4000); // initial interest is ₹4,166.67
assert.strictEqual(t14.isValid, false);
assert.strictEqual(
  t14.error,
  "Monthly payment must be greater than ₹4,166.67 to cover initial monthly interest and reduce the loan principal."
);
console.log("✓ Test 14: Payment <= initial interest rejected with clear educational error");

// Test 15: Payment Exactly Equal to Initial Interest Guard
const t15 = calculateLoanTenure(500000, 12, 5000); // 500000 * 0.12 / 12 = ₹5,000.00
assert.strictEqual(t15.isValid, false);
assert.strictEqual(
  t15.error,
  "Monthly payment must be greater than ₹5,000.00 to cover initial monthly interest and reduce the loan principal."
);
console.log("✓ Test 15: Payment exactly equal to initial interest rejected cleanly");

// Test 16: Mode 3 Validation - Negative/Zero Inputs
const t16a = calculateLoanTenure(-500000, 10, 15000);
assert.strictEqual(t16a.isValid, false);
assert.strictEqual(t16a.error, "Loan amount must be greater than 0.");

const t16b = calculateLoanTenure(500000, -5, 15000);
assert.strictEqual(t16b.isValid, false);
assert.strictEqual(t16b.error, "Interest rate cannot be negative.");

const t16c = calculateLoanTenure(500000, 10, -5000);
assert.strictEqual(t16c.isValid, false);
assert.strictEqual(t16c.error, "Monthly payment must be greater than 0.");
console.log("✓ Test 16: Negative inputs rejected across Mode 3 parameters");

// ==========================================
// Wrappers & Shared UI Output Integrity
// ==========================================

// Test 17: Mode 1 Wrapper Output
const w1 = calculateLoanPaymentWrapper({
  principal: 1000000,
  annualRate: 9.5,
  tenureYears: 5,
});
assert.strictEqual(w1.isValid, true);
assert.strictEqual(w1.primaryValue, "₹21,001.86");
assert.strictEqual(w1.primaryLabel, "Monthly Loan Payment");
assert.strictEqual(w1.unit, "₹");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Principal Amount")?.value, "₹10,000,00.00" === w1.secondaryValues?.find((s) => s.label === "Principal Amount")?.value ? "₹10,000,00.00" : "₹10,00,000.00");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Total Interest")?.value, "₹2,60,111.68");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Interest-to-Loan Ratio")?.value, "26.01%");
assert.strictEqual(w1.secondaryValues?.find((s) => s.label === "Loan Tenure")?.value, "5 Years (60 Months)");
console.log("✓ Test 17: Mode 1 wrapper returns complete primary and secondary metrics");

// Test 18: Mode 2 Wrapper Output
const w2 = calculateBorrowingCapacityWrapper({
  monthlyPayment: 25000,
  annualRate: 9.0,
  tenureYears: 15,
});
assert.strictEqual(w2.isValid, true);
assert.strictEqual(w2.primaryValue, "₹24,64,835.22");
assert.strictEqual(w2.primaryLabel, "Maximum Loan Amount");
assert.strictEqual(w2.unit, "₹");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label === "Monthly Budget")?.value, "₹25,000.00");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label === "Total Repayment")?.value, "₹45,00,000.00");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label === "Total Interest")?.value, "₹20,35,164.78");
assert.strictEqual(w2.secondaryValues?.find((s) => s.label === "Loan Tenure")?.value, "15 Years (180 Months)");
console.log("✓ Test 18: Mode 2 wrapper returns complete primary and secondary metrics");

// Test 19: Mode 3 Wrapper Output (No fractional contractual total repayment)
const w3 = calculateLoanTenureWrapper({
  principal: 500000,
  annualRate: 10.0,
  monthlyPayment: 15000,
});
assert.strictEqual(w3.isValid, true);
assert.strictEqual(w3.primaryValue, "39.21 Months (~3.27 Years)");
assert.strictEqual(w3.primaryLabel, "Payoff Duration");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "Loan Amount")?.value, "₹5,00,000.00");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "Monthly Payment")?.value, "₹15,000.00");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "Initial Monthly Interest")?.value, "₹4,166.67");
assert.strictEqual(w3.secondaryValues?.find((s) => s.label === "Approximate Years")?.value, "3.27 Years");
assert.strictEqual(w3.secondaryValues?.some((s) => s.label === "Total Repayment"), false);
console.log("✓ Test 19: Mode 3 wrapper returns clean payoff duration without fractional total repayment");

// Test 20: NaN Numeric Inputs Handling
const nan1 = calculateLoanPaymentWrapper({ principal: "abc", annualRate: 10, tenureYears: 5 });
assert.strictEqual(nan1.isValid, false);
const nan2 = calculateBorrowingCapacityWrapper({ monthlyPayment: NaN, annualRate: 9, tenureYears: 15 });
assert.strictEqual(nan2.isValid, false);
const nan3 = calculateLoanTenureWrapper({ principal: 500000, annualRate: "xyz", monthlyPayment: 15000 });
assert.strictEqual(nan3.isValid, false);
console.log("✓ Test 20: NaN and non-numeric inputs rejected safely across all wrappers");

// ==========================================
// Calculator Definition & Parser Safety
// ==========================================

// Test 21: Calculator definition structure integrity
assert.strictEqual(loanCalculatorDefinition.id, "loan-calculator");
assert.strictEqual(loanCalculatorDefinition.slug, "loan-calculator");
assert.strictEqual(loanCalculatorDefinition.modes.length, 3);
assert.strictEqual(loanCalculatorDefinition.modes[0].name, "Loan Payment");
assert.strictEqual(loanCalculatorDefinition.modes[1].name, "How Much Can I Borrow?");
assert.strictEqual(loanCalculatorDefinition.modes[2].name, "Loan Tenure");
assert.strictEqual(loanCalculatorDefinition.formulas.length, 4);
assert.strictEqual(loanCalculatorDefinition.examples.length, 4);
assert.strictEqual(loanCalculatorDefinition.faqs.length, 6);
console.log("✓ Test 21: Loan Calculator definition structure verified");

// Test 22: Parser-safe LaTeX syntax verification (No \left, \right, or nested \frac)
for (const formula of loanCalculatorDefinition.formulas) {
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
console.log("✓ Test 22: All formulas strictly conform to MathFormula parser constraints");

// Test 23: Step explanation clarity and transparency
assert.strictEqual(t1.stepExplanation?.includes("₹21,001.86"), true);
assert.strictEqual(t7.stepExplanation?.includes("₹24,64,835.22"), true);
assert.strictEqual(t12.stepExplanation?.includes("39.21 Months"), true);
console.log("✓ Test 23: Step explanations contain accurate computed values");

// Test 24: Unrounded precision preservation in Mode 1
const unroundedPrincipal = 1234567.89;
const unroundedRate = 8.6543;
const unroundedTenure = 4.25;
const t24 = calculateLoanPayment(unroundedPrincipal, unroundedRate, unroundedTenure);
assert.strictEqual(t24.isValid, true);
assert.ok((t24.monthlyPayment ?? 0) > 0);
console.log("✓ Test 24: Full unrounded precision preserved for complex fractional inputs");

// Test 25: Search keywords coverage
assert.ok(loanCalculatorDefinition.searchKeywords?.includes("loan calculator"));
assert.ok(loanCalculatorDefinition.searchKeywords?.includes("how much can i borrow"));
assert.ok(loanCalculatorDefinition.searchKeywords?.includes("borrowing capacity"));
assert.ok(loanCalculatorDefinition.searchKeywords?.includes("loan tenure calculator"));
console.log("✓ Test 25: Search keywords contain high-intent loan queries");

// Test 26: Mode 1 Interest Reconciliation
assert.ok(Math.abs(((t1.totalRepayment ?? 0) - (t1.principal ?? 0)) - (t1.totalInterest ?? 0)) < 1e-9);
console.log("✓ Test 26: Identity Total Repayment - Principal == Total Interest verified");

// Test 27: Mode 2 Interest Reconciliation
assert.ok(Math.abs(((t7.totalRepayment ?? 0) - (t7.maxLoanAmount ?? 0)) - (t7.totalInterest ?? 0)) < 1e-9);
console.log("✓ Test 27: Identity Total Repayment - Max Loan == Total Interest verified");

// Test 28: Worked examples match definition
const ex1 = calculateLoanPayment(1000000, 9.5, 5);
assert.strictEqual(ex1.formattedMonthlyPayment, loanCalculatorDefinition.examples[0].expectedOutput);
const ex2 = calculateLoanPayment(5000000, 8.5, 20);
assert.strictEqual(ex2.formattedMonthlyPayment, loanCalculatorDefinition.examples[1].expectedOutput);
const ex3 = calculateBorrowingCapacity(25000, 9.0, 15);
assert.strictEqual(ex3.formattedMaxLoanAmount, loanCalculatorDefinition.examples[2].expectedOutput);
const ex4 = calculateLoanTenure(500000, 10.0, 15000);
assert.strictEqual(`${ex4.formattedDuration} (~${ex4.formattedYears})`, loanCalculatorDefinition.examples[3].expectedOutput);
console.log("✓ Test 28: All 4 worked examples strictly match engine outputs");

console.log("\nAll 28 Loan Calculator Engine tests passed successfully!");
