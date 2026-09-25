import assert from "node:assert/strict";
import { calculateEMI, emiCalculatorDefinition } from "./emi";

function runTests() {
  console.log("Running EMI Calculator Engine Tests...\n");

  const mode = emiCalculatorDefinition.modes[0];

  // 1 & 2: ₹50 lakh / 8.5% / 20 years
  {
    const out = mode.calculate({ principal: 5000000, annualRate: 8.5, tenureYears: 20 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹43,391.16");
    assert.equal(out.secondaryValues?.[0].value, "₹50,00,000"); // Principal
    assert.equal(out.secondaryValues?.[1].value, "₹54,13,878.80"); // Total Interest
    assert.equal(out.secondaryValues?.[2].value, "₹1,04,13,878.80"); // Total Payment
    assert.equal(out.secondaryValues?.[3].value, "240 Months (20 Years)"); // Total Payments
    console.log("✓ Test 1 & 2: ₹50 lakh @ 8.5% for 20 years = ₹43,391.16 / mo");
  }

  // 3: ₹10 lakh / 10% / 5 years
  {
    const out = calculateEMI({ principal: 1000000, annualRate: 10, tenureYears: 5 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹21,247.04");
    assert.equal(out.secondaryValues?.[1].value, "₹2,74,822.68"); // Total Interest
    assert.equal(out.secondaryValues?.[2].value, "₹12,74,822.68"); // Total Repayment
    console.log("✓ Test 3: ₹10 lakh @ 10% for 5 years = ₹21,247.04 / mo");
  }

  // 4, 5, 6: Zero-interest calculation: ₹5 lakh / 0% / 5 years
  {
    const out = calculateEMI({ principal: 500000, annualRate: 0, tenureYears: 5 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹8,333.33");
    assert.equal(out.secondaryValues?.[1].value, "₹0.00"); // Total Interest is 0.00
    assert.equal(out.secondaryValues?.[2].value, "₹5,00,000.00"); // Total Repayment equals Principal
    console.log("✓ Test 4-6: Zero interest calculation (₹5L / 0% / 5yr) = ₹8,333.33 / mo, ₹0.00 interest");
  }

  // 7, 8, 9, 10: Amortization Schedule Verification
  {
    const out = calculateEMI({ principal: 5000000, annualRate: 8.5, tenureYears: 20 });
    assert.equal(out.isValid, true);
    assert.ok(out.amortizationSchedule);
    assert.equal(out.amortizationSchedule.length, 240);

    const month1 = out.amortizationSchedule[0];
    assert.equal(month1.paymentNumber, 1);
    // Month 1 interest: 5000000 * (8.5 / 1200) = 35416.6666...
    assert.ok(Math.abs(month1.interest - 35416.67) < 0.1);
    assert.equal(month1.formattedInterest, "₹35,416.67");
    // Month 1 principal: 43391.1378 - 35416.6666 = 7974.47
    assert.ok(Math.abs(month1.principal - 7974.49) < 0.1);
    assert.equal(month1.formattedPrincipal, "₹7,974.50");

    const lastMonth = out.amortizationSchedule[239];
    assert.equal(lastMonth.paymentNumber, 240);
    assert.equal(lastMonth.balance, 0);
    assert.equal(lastMonth.formattedBalance, "₹0.00");
    console.log("✓ Test 7-10: Amortization schedule math (first month components and 0 final balance)");
  }

  // 11: Invalid principal
  {
    const out = calculateEMI({ principal: 0, annualRate: 8.5, tenureYears: 20 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Loan amount must be greater than 0.");
    console.log("✓ Test 11: Invalid principal (0) handled with clear error");
  }

  // 12 & 13: Invalid / Negative interest rate
  {
    const out = calculateEMI({ principal: 5000000, annualRate: -5, tenureYears: 20 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Interest rate cannot be negative.");
    console.log("✓ Test 12 & 13: Negative interest rate rejected");
  }

  // 14 & 15: Invalid / Zero tenure
  {
    const out = calculateEMI({ principal: 5000000, annualRate: 8.5, tenureYears: 0 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Loan tenure must be greater than 0.");
    console.log("✓ Test 14 & 15: Zero tenure rejected");
  }

  // 16: Decimal inputs: ₹12.5 lakh / 7.25% / 3.5 years
  {
    const out = calculateEMI({ principal: 1250000, annualRate: 7.25, tenureYears: 3.5 });
    assert.equal(out.isValid, true);
    assert.ok(out.primaryValue?.toString().startsWith("₹"));
    assert.equal(out.amortizationSchedule?.length, 42); // 3.5 * 12 = 42 months
    console.log("✓ Test 16: Decimal inputs (3.5 years, 7.25% interest) processed cleanly");
  }

  console.log("\nAll EMI Calculator tests passed successfully!");
}

runTests();
