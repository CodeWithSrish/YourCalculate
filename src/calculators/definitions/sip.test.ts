import assert from "node:assert/strict";
import { calculateSIP, sipCalculatorDefinition } from "./sip";

function runTests() {
  console.log("Running SIP Calculator Engine Tests...\n");

  const mode = sipCalculatorDefinition.modes[0];

  // 1. Standard SIP: ₹10,000/month, 12%, 10 years
  {
    const out = mode.calculate({ monthlyInvestment: 10000, annualRate: 12, durationYears: 10 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹23,23,390.76");
    assert.equal(out.secondaryValues?.[0].value, "₹12,00,000.00"); // Total Invested
    assert.equal(out.secondaryValues?.[1].value, "₹11,23,390.76"); // Estimated Returns
    assert.equal(out.secondaryValues?.[2].value, "₹10,000.00"); // Monthly Investment
    console.log("✓ Test 1: Standard SIP (₹10k @ 12% for 10yr) = ₹23,23,390.76 FV");
  }

  // 2. Smaller investment: ₹5,000/month, 10%, 5 years
  {
    const out = calculateSIP({ monthlyInvestment: 5000, annualRate: 10, durationYears: 5 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹3,90,411.91");
    assert.equal(out.secondaryValues?.[0].value, "₹3,00,000.00"); // Total Invested
    assert.equal(out.secondaryValues?.[1].value, "₹90,411.91"); // Estimated Returns
    console.log("✓ Test 2: Smaller investment (₹5k @ 10% for 5yr) = ₹3,90,411.91 FV");
  }

  // 3. Zero return: ₹5,000/month, 0%, 5 years
  {
    const out = calculateSIP({ monthlyInvestment: 5000, annualRate: 0, durationYears: 5 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹3,00,000.00");
    assert.equal(out.secondaryValues?.[0].value, "₹3,00,000.00"); // Total Invested
    assert.equal(out.secondaryValues?.[1].value, "₹0.00"); // Estimated Returns = 0
    console.log("✓ Test 3: Zero return rate (₹5k @ 0% for 5yr) = ₹3,00,000.00 FV");
  }

  // 4. Decimal monthly investment: ₹2,500.50/month, 12%, 5 years
  {
    const out = calculateSIP({ monthlyInvestment: 2500.5, annualRate: 12, durationYears: 5 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹2,06,257.16");
    console.log("✓ Test 4: Decimal monthly investment (₹2,500.50) processed cleanly");
  }

  // 5. Decimal annual return: ₹10,000/month, 7.25%, 5 years
  {
    const out = calculateSIP({ monthlyInvestment: 10000, annualRate: 7.25, durationYears: 5 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹7,24,934.28");
    console.log("✓ Test 5: Decimal annual return (7.25%) processed cleanly");
  }

  // 6. Decimal duration: ₹10,000/month, 12%, 3.5 years
  {
    const out = calculateSIP({ monthlyInvestment: 10000, annualRate: 12, durationYears: 3.5 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "₹5,23,977.79");
    assert.equal(out.sipGrowthSchedule?.length, 4); // 3 full years + 1 final partial year (Year 3.5)
    console.log("✓ Test 6: Decimal duration (3.5 years) processed with partial growth row");
  }

  // 7. Invalid monthly investment = 0
  {
    const out = calculateSIP({ monthlyInvestment: 0, annualRate: 12, durationYears: 10 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Monthly investment must be greater than 0.");
    console.log("✓ Test 7: Zero monthly investment rejected");
  }

  // 8. Negative monthly investment
  {
    const out = calculateSIP({ monthlyInvestment: -1000, annualRate: 12, durationYears: 10 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Monthly investment must be greater than 0.");
    console.log("✓ Test 8: Negative monthly investment rejected");
  }

  // 9. Negative return rate
  {
    const out = calculateSIP({ monthlyInvestment: 10000, annualRate: -5, durationYears: 10 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Expected return rate cannot be negative.");
    console.log("✓ Test 9: Negative return rate rejected");
  }

  // 10. Zero duration
  {
    const out = calculateSIP({ monthlyInvestment: 10000, annualRate: 12, durationYears: 0 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Investment duration must be greater than 0.");
    console.log("✓ Test 10: Zero investment duration rejected");
  }

  // 11. Invalid / missing inputs
  {
    const out = calculateSIP({ monthlyInvestment: 10000, annualRate: 12, durationYears: NaN });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Enter a valid investment duration.");
    console.log("✓ Test 11: Missing/NaN inputs handled cleanly");
  }

  // 12. Growth table consistency with main calculation
  {
    const out = calculateSIP({ monthlyInvestment: 10000, annualRate: 12, durationYears: 10 });
    assert.equal(out.isValid, true);
    assert.ok(out.sipGrowthSchedule);
    assert.equal(out.sipGrowthSchedule.length, 10);

    const finalRow = out.sipGrowthSchedule[9];
    assert.equal(finalRow.year, 10);
    assert.equal(finalRow.formattedTotalValue, out.primaryValue);
    assert.equal(finalRow.formattedAmountInvested, out.secondaryValues?.[0].value);
    assert.equal(finalRow.formattedEstimatedReturns, out.secondaryValues?.[1].value);
    console.log("✓ Test 12: Growth table final row exactly matches main calculation outputs");
  }

  console.log("\nAll SIP Calculator tests passed successfully!");
}

runTests();
