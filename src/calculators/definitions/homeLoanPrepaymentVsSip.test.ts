import { calculateHomeLoanPrepaymentVsSip } from "./homeLoanPrepaymentVsSip";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("Running Home Loan Prepayment vs SIP Calculator Tests...");

// Test 1: Standard Normal Scenario (₹50L @ 8.5% for 20 years, ₹10k extra/month, 12% SIP)
{
  const res = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 5000000,
    interestRate: 8.5,
    remainingTenureYears: 20,
    extraMonthlyPayment: 10000,
    lumpSumPrepayment: 0,
    expectedSipReturn: 12.0,
  });

  assert(res.isValid === true, "Test 1: Result should be valid");
  assert(typeof res.primaryValue === "string", "Test 1: primaryValue must be string");
  assert(String(res.primaryValue).includes("SIP Advantage"), "Test 1: 12% SIP should beat 8.5% loan prepayment");
  assert(res.secondaryValues !== undefined && res.secondaryValues.length >= 5, "Test 1: secondaryValues must be present");
  console.log("✓ Test 1 Passed: Standard normal scenario");
}

// Test 2: High Debt Cost vs Low Return (Loan @ 11%, Expected Return @ 8%)
{
  const res = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 2500000,
    interestRate: 11.0,
    remainingTenureYears: 10,
    extraMonthlyPayment: 15000,
    lumpSumPrepayment: 0,
    expectedSipReturn: 8.0,
  });

  assert(res.isValid === true, "Test 2: Result should be valid");
  assert(String(res.primaryValue).includes("Guaranteed Interest Advantage"), "Test 2: Debt savings should win when loan rate > investment return");
  console.log("✓ Test 2 Passed: Guaranteed interest advantage scenario");
}

// Test 3: Large Lump-Sum Prepayment Paying Off Principal Immediately
{
  const res = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 1000000,
    interestRate: 9.0,
    remainingTenureYears: 5,
    extraMonthlyPayment: 5000,
    lumpSumPrepayment: 1000000,
    expectedSipReturn: 12.0,
  });

  assert(res.isValid === true, "Test 3: Result should be valid for 100% lump sum prepayment");
  console.log("✓ Test 3 Passed: 100% lump sum prepayment boundary case");
}

// Test 3B: Extra monthly is zero but lump sum is provided
{
  const res = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 2000000,
    interestRate: 8.5,
    remainingTenureYears: 10,
    extraMonthlyPayment: 0,
    lumpSumPrepayment: 300000,
    expectedSipReturn: 12.0,
  });

  assert(res.isValid === true, "Test 3B: Lump-sum only without extra monthly should be valid");
  assert(res.secondaryValues !== undefined, "Test 3B: Secondary values must exist");
  console.log("✓ Test 3B Passed: Lump-sum only scenario");
}

// Test 3C: Zero SIP return rate (0% market return boundary)
{
  const res = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 1500000,
    interestRate: 9.0,
    remainingTenureYears: 10,
    extraMonthlyPayment: 10000,
    lumpSumPrepayment: 0,
    expectedSipReturn: 0,
  });

  assert(res.isValid === true, "Test 3C: 0% SIP return should calculate without divide by zero");
  assert(String(res.primaryValue).includes("Guaranteed Interest Advantage"), "Test 3C: Prepayment wins overwhelmingly when market return is 0%");
  console.log("✓ Test 3C Passed: 0% SIP return boundary case");
}

// Test 3D: Equal loan rate and SIP return rate
{
  const res = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 3000000,
    interestRate: 9.0,
    remainingTenureYears: 15,
    extraMonthlyPayment: 10000,
    lumpSumPrepayment: 0,
    expectedSipReturn: 9.0,
  });

  assert(res.isValid === true, "Test 3D: Equal rate calculation should be valid");
  console.log("✓ Test 3D Passed: Equal rate scenario");
}

// Test 4: Invalid Inputs (Negative values and zero tenure)
{
  const resNegPrincipal = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: -500000,
    interestRate: 8.5,
    remainingTenureYears: 15,
    extraMonthlyPayment: 5000,
    expectedSipReturn: 12.0,
  });
  assert(resNegPrincipal.isValid === false, "Test 4.1: Negative principal should be invalid");

  const resZeroPrincipal = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 0,
    interestRate: 8.5,
    remainingTenureYears: 15,
    extraMonthlyPayment: 5000,
    expectedSipReturn: 12.0,
  });
  assert(resZeroPrincipal.isValid === false, "Test 4.1b: Principal 0 must be rejected");

  const resNegExtraMonthly = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 5000000,
    interestRate: 8.5,
    remainingTenureYears: 15,
    extraMonthlyPayment: -5000,
    expectedSipReturn: 12.0,
  });
  assert(resNegExtraMonthly.isValid === false, "Test 4.1c: Negative extraMonthlyPayment (-5000) must be rejected");

  const resZeroTenure = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 5000000,
    interestRate: 8.5,
    remainingTenureYears: 0,
    extraMonthlyPayment: 5000,
    expectedSipReturn: 12.0,
  });
  assert(resZeroTenure.isValid === false, "Test 4.2: Zero tenure should be invalid");

  const resZeroExtraAndLump = calculateHomeLoanPrepaymentVsSip({
    outstandingPrincipal: 5000000,
    interestRate: 8.5,
    remainingTenureYears: 20,
    extraMonthlyPayment: 0,
    lumpSumPrepayment: 0,
    expectedSipReturn: 12.0,
  });
  assert(resZeroExtraAndLump.isValid === false, "Test 4.3: Zero extra and zero lump sum should be invalid");
  console.log("✓ Test 4 Passed: Input validation and error handling");
}

console.log("All Home Loan Prepayment vs SIP tests passed successfully!");
