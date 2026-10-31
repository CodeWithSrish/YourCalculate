import { calculateEarlyRetirement, earlyRetirementCalculatorDefinition } from "./earlyRetirement";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("Running Early Retirement Calculator Tests...");

// Test 0: Definition & Metadata integrity
{
  assert(earlyRetirementCalculatorDefinition.id === "early-retirement-calculator", "Definition ID must match");
  assert(earlyRetirementCalculatorDefinition.slug === "early-retirement-calculator", "Definition slug must match");
  assert(earlyRetirementCalculatorDefinition.name === "Early Retirement Calculator", "Display name must be Early Retirement Calculator");
  assert(
    earlyRetirementCalculatorDefinition.seo.title === "Early Retirement Calculator – When Can You Retire?",
    "SEO title must match specification"
  );
  assert(
    earlyRetirementCalculatorDefinition.seo.canonicalPath === "/early-retirement-calculator",
    "Canonical path must match specification"
  );
  assert(
    earlyRetirementCalculatorDefinition.faqs.some((f) => f.question.includes("FIRE")),
    "FAQ must explain FIRE naturally"
  );
  console.log("✓ Test 0 Passed: Definition and SEO metadata integrity");
}

// Test 1: Standard Indian Early Retirement (Age 30 to 45, Life Expectancy 85)
{
  const res = calculateEarlyRetirement({
    currentAge: 30,
    retirementAge: 45,
    lifeExpectancy: 85,
    currentMonthlyExpenses: 50000,
    inflationRate: 6.0,
    existingInvestments: 1500000,
    monthlySavings: 30000,
    preRetirementReturn: 11.0,
    postRetirementReturn: 8.0,
  });

  assert(res.isValid === true, "Test 1: Result should be valid");
  assert(typeof res.primaryValue === "string", "Test 1: primaryValue must be string");
  assert(String(res.primaryValue).includes("₹"), "Test 1: primaryValue must be formatted INR");
  assert(res.secondaryValues !== undefined && res.secondaryValues.length >= 6, "Test 1: secondaryValues must be present");

  const corpusMultiplier = res.secondaryValues?.find((m) => m.label.includes("Multiplier"));
  assert(corpusMultiplier !== undefined, "Test 1: Corpus multiplier must exist");
  console.log("✓ Test 1 Passed: Standard early retirement projection");
}

// Test 2: High Net-Worth Surplus Scenario
{
  const res = calculateEarlyRetirement({
    currentAge: 35,
    retirementAge: 50,
    lifeExpectancy: 85,
    currentMonthlyExpenses: 40000,
    inflationRate: 6.0,
    existingInvestments: 20000000, // ₹2 Crores already saved
    monthlySavings: 100000,
    preRetirementReturn: 12.0,
    postRetirementReturn: 8.5,
  });

  assert(res.isValid === true, "Test 2: Result should be valid");
  const surplusMetric = res.secondaryValues?.find((m) => m.label.includes("Surplus"));
  assert(surplusMetric !== undefined, "Test 2: Must have a surplus metric");
  console.log("✓ Test 2 Passed: High net worth surplus scenario");
}

// Test 3: Shortfall Scenario Requiring Additional SIP
{
  const res = calculateEarlyRetirement({
    currentAge: 28,
    retirementAge: 42,
    lifeExpectancy: 85,
    currentMonthlyExpenses: 60000,
    inflationRate: 6.5,
    existingInvestments: 200000,
    monthlySavings: 15000,
    preRetirementReturn: 10.5,
    postRetirementReturn: 7.5,
  });

  assert(res.isValid === true, "Test 3: Shortfall scenario should be valid");
  const reqSipMetric = res.secondaryValues?.find((m) => m.label === "Required Total Monthly SIP");
  assert(reqSipMetric !== undefined, "Test 3: Required Total Monthly SIP should be provided for shortfall");
  console.log("✓ Test 3 Passed: Shortfall scenario with required monthly SIP");
}

// Test 4: Age Validation & Error Cases
{
  const resInvalidRetire = calculateEarlyRetirement({
    currentAge: 45,
    retirementAge: 40, // retirement age before current age
    lifeExpectancy: 85,
    currentMonthlyExpenses: 50000,
  });
  assert(resInvalidRetire.isValid === false, "Test 4.1: Retirement age <= current age must fail");

  const resInvalidLife = calculateEarlyRetirement({
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 55, // life expectancy before retirement age
    currentMonthlyExpenses: 50000,
  });
  assert(resInvalidLife.isValid === false, "Test 4.2: Life expectancy <= retirement age must fail");

  const resZeroExpenses = calculateEarlyRetirement({
    currentAge: 30,
    retirementAge: 50,
    lifeExpectancy: 85,
    currentMonthlyExpenses: 0,
  });
  assert(resZeroExpenses.isValid === false, "Test 4.3: Zero expenses must fail");
  console.log("✓ Test 4 Passed: Boundary and validation error handling");
}

// Test 5: Immediate Retirement Boundary (retirementAge === currentAge)
{
  const resImmediate = calculateEarlyRetirement({
    currentAge: 45,
    retirementAge: 45,
    lifeExpectancy: 85,
    currentMonthlyExpenses: 50000,
    inflationRate: 6.0,
    existingInvestments: 20000000,
    monthlySavings: 0,
    preRetirementReturn: 11.0,
    postRetirementReturn: 8.0,
  });

  assert(resImmediate.isValid === true, "Test 5: Immediate retirement calculation must be valid");
  assert(typeof resImmediate.primaryValue === "string", "Test 5: primaryValue must be formatted string");
  console.log("✓ Test 5 Passed: Immediate retirement at current age boundary case");
}

// Test 6: Zero Inflation Boundary (inflationRate === 0)
{
  const resZeroInflation = calculateEarlyRetirement({
    currentAge: 30,
    retirementAge: 50,
    lifeExpectancy: 80,
    currentMonthlyExpenses: 40000,
    inflationRate: 0,
    existingInvestments: 1000000,
    monthlySavings: 20000,
    preRetirementReturn: 10.0,
    postRetirementReturn: 6.0,
  });

  assert(resZeroInflation.isValid === true, "Test 6: 0% inflation should calculate smoothly");
  console.log("✓ Test 6 Passed: Zero inflation boundary case");
}

// Test 7: Negative Real Return (post-retirement return < inflation rate)
{
  const resNegativeReal = calculateEarlyRetirement({
    currentAge: 30,
    retirementAge: 50,
    lifeExpectancy: 80,
    currentMonthlyExpenses: 40000,
    inflationRate: 8.0,
    existingInvestments: 1000000,
    monthlySavings: 20000,
    preRetirementReturn: 10.0,
    postRetirementReturn: 5.0, // real return is negative
  });

  assert(resNegativeReal.isValid === true, "Test 7: Negative real return should calculate safely");
  console.log("✓ Test 7 Passed: Negative real return scenario");
}

// Test 8: Zero savings and zero portfolio
{
  const resZeroSavings = calculateEarlyRetirement({
    currentAge: 30,
    retirementAge: 50,
    lifeExpectancy: 80,
    currentMonthlyExpenses: 40000,
    inflationRate: 6.0,
    existingInvestments: 0,
    monthlySavings: 0,
    preRetirementReturn: 10.0,
    postRetirementReturn: 7.0,
  });

  assert(resZeroSavings.isValid === true, "Test 8: Zero savings and zero portfolio should be valid");
  const reqSipMetric = resZeroSavings.secondaryValues?.find((m) => m.label === "Required Total Monthly SIP");
  assert(reqSipMetric !== undefined, "Test 8: Must show required SIP when zero savings exist");
  console.log("✓ Test 8 Passed: Zero savings / zero portfolio starting boundary");
}

// Test 9: Numerical Stability for Long Planning Horizon (Age 25 to Life Expectancy 95)
{
  const resStability = calculateEarlyRetirement({
    currentAge: 25,
    retirementAge: 50,
    lifeExpectancy: 95,
    currentMonthlyExpenses: 50000,
    inflationRate: 6.0,
    existingInvestments: 500000,
    monthlySavings: 25000,
    preRetirementReturn: 11.0,
    postRetirementReturn: 8.0,
  });

  assert(resStability.isValid === true, "Test 9: Long horizon calculation must be valid");
  assert(typeof resStability.primaryValue === "string", "Test 9: primaryValue must be a string");
  assert(String(resStability.primaryValue).includes("₹"), "Test 9: primaryValue must be formatted INR");
  assert(
    !String(resStability.primaryValue).includes("NaN") && !String(resStability.primaryValue).includes("Infinity"),
    "Test 9: primaryValue must remain finite without NaN or Infinity"
  );
  assert(
    resStability.secondaryValues !== undefined && resStability.secondaryValues.length >= 6,
    "Test 9: Secondary metrics must be populated"
  );
  assert(
    resStability.secondaryValues!.every(
      (m) =>
        !String(m.value).includes("NaN") &&
        !String(m.value).includes("Infinity") &&
        !String(m.value).includes("undefined")
    ),
    "Test 9: All secondary metrics must be numerically finite and stable"
  );
  const corpusMultiplier = resStability.secondaryValues?.find((m) => m.label.includes("Multiplier"));
  assert(corpusMultiplier !== undefined, "Test 9: Corpus multiplier must be defined");
  console.log("✓ Test 9 Passed: Numerical stability for current age 25 and life expectancy 95");
}

console.log("All Early Retirement Calculator tests passed successfully!");
