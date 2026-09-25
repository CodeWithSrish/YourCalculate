import assert from "node:assert/strict";
import { percentageCalculatorDefinition } from "./percentage";

function runTests() {
  console.log("Running Percentage Calculator Engine Tests...\n");

  const [mode1, mode2, mode3, mode4, mode5] = percentageCalculatorDefinition.modes;

  // 1. What is 15% of 850? -> 127.5
  {
    const out = mode1.calculate({ percentage: 15, number: 850 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "127.5");
    console.log("✓ Mode 1: 15% of 850 = 127.5");
  }

  // 1b. Decimal Percentage: 7.5% of 250 -> 18.75
  {
    const out = mode1.calculate({ percentage: 7.5, number: 250 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "18.75");
    console.log("✓ Mode 1 (Decimals): 7.5% of 250 = 18.75");
  }

  // 2. 20 is what percentage of 80? -> 25%
  {
    const out = mode2.calculate({ value: 20, total: 80 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "25%");
    console.log("✓ Mode 2: 20 is what percentage of 80 = 25%");
  }

  // 2b. Division by zero in Mode 2
  {
    const out = mode2.calculate({ value: 20, total: 0 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Total cannot be 0.");
    console.log("✓ Mode 2 (Zero Check): Division by zero handled cleanly");
  }

  // 3. Percentage Increase from 100 to 125 -> 25%
  {
    const out = mode3.calculate({ initialValue: 100, finalValue: 125 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "25%");
    console.log("✓ Mode 3: Increase from 100 to 125 = 25%");
  }

  // 3b. Division by zero in Mode 3
  {
    const out = mode3.calculate({ initialValue: 0, finalValue: 125 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Starting value cannot be 0.");
    console.log("✓ Mode 3 (Zero Check): Initial value 0 handled cleanly");
  }

  // 4. Percentage Decrease from 200 to 150 -> 25%
  {
    const out = mode4.calculate({ initialValue: 200, finalValue: 150 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "25%");
    console.log("✓ Mode 4: Decrease from 200 to 150 = 25%");
  }

  // 4b. Division by zero in Mode 4
  {
    const out = mode4.calculate({ initialValue: 0, finalValue: 150 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Starting value cannot be 0.");
    console.log("✓ Mode 4 (Zero Check): Initial value 0 handled cleanly");
  }

  // 5. Percentage Difference between 100 and 120 -> 18.1818%
  {
    const out = mode5.calculate({ valueA: 100, valueB: 120 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "18.1818%");
    console.log("✓ Mode 5: Difference between 100 and 120 = 18.1818%");
  }

  // 5b. Average zero in Mode 5: valueA = 100, valueB = -100 -> average = 0
  {
    const out = mode5.calculate({ valueA: 100, valueB: -100 });
    assert.equal(out.isValid, false);
    assert.equal(out.error, "Average of both values cannot be 0.");
    console.log("✓ Mode 5 (Zero Check): Average of values 0 handled cleanly");
  }

  // 6. Decimal precision tests
  {
    const out = mode1.calculate({ percentage: 15.5, number: 1000.75 });
    assert.equal(out.isValid, true);
    assert.equal(out.primaryValue, "155.1163");
    console.log("✓ Mode 1 (Decimals): 15.5% of 1000.75 = 155.1163");
  }

  console.log("\nAll Percentage Calculator tests passed successfully!");
}

runTests();
