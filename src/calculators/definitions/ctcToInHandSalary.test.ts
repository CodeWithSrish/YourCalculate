import { calculateCtcToInHand } from "./ctcToInHandSalary";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("Running comprehensive CTC to In-Hand Salary Calculator regression test suite...");

// ============================================================================
// PART 1: CURRENT TAX YEAR 2026-27 (INCOME-TAX ACT, 2025 - SECTION 202)
// Slabs: 0-4L (0%), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), 20-24L (25%), >24L (30%)
// Standard Deduction: ₹75,000 | Section 156 Rebate: up to ₹60,000 for taxable income <= ₹12,00,000
// ============================================================================

// Test 1.1: Zero Taxable Income (Income <= Standard Deduction ₹75,000)
{
  const res = calculateCtcToInHand({
    annualCtc: 75000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  assert(res.isValid === true, "Test 1.1: Valid calculation for ₹75k CTC");
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 1.1: Taxable income ₹0 must yield ₹0 tax");
  assert(res.primaryValue === "₹5,875.00", `Test 1.1: Expected monthly in-hand ₹5,875.00, got ${res.primaryValue}`);
  console.log("✓ Test 1.1: FY 2026-27 Zero taxable income verified");
}

// Test 1.2: Slab Boundary 1 — ₹4,00,000 Taxable Income (Gross ₹4,75,000)
{
  const res = calculateCtcToInHand({
    annualCtc: 475000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 1.2: Taxable income ₹4L is in 0% slab (₹0 tax)");
  console.log("✓ Test 1.2: FY 2026-27 Slab Boundary 1 (₹4L taxable = ₹0 tax) verified");
}

// Test 1.3: Slab Boundary 2 — ₹8,00,000 Taxable Income (Gross ₹8,75,000)
// Slab calculation: 4L @ 5% = ₹20,000. Under Sec 156 rebate (taxable <= 12L), tax is ₹0.
{
  const res = calculateCtcToInHand({
    annualCtc: 875000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 1.3: Taxable income ₹8L is zero tax due to Section 156 rebate");
  console.log("✓ Test 1.3: FY 2026-27 Slab Boundary 2 (₹8L taxable = ₹0 tax via Sec 156) verified");
}

// Test 1.3B: Rebate Capped at Eligible Tax Amount (Taxable ₹6,00,000, Gross ₹6,75,000)
// Slab tax: (6L - 4L) @ 5% = ₹10,000.
// Under Section 156, rebate is lesser of 100% of tax (₹10,000) or ₹60,000 ceiling.
// Net Tax = Math.max(0, 10,000 - 10,000) = ₹0 (verifying rebate is capped at eligible tax, never producing negative tax).
{
  const res = calculateCtcToInHand({
    annualCtc: 675000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 1.3B: Rebate capped at eligible tax (₹10k) must yield ₹0 tax");
  console.log("✓ Test 1.3B: FY 2026-27 Section 156 rebate capped at eligible tax verified");
}

// Test 1.4: Section 156 Rebate Threshold — Exactly ₹12,00,000 Taxable Income (Gross ₹12,75,000)
// Slab calculation: 4L @ 5% (20k) + 4L @ 10% (40k) = ₹60,000.
// Under Section 156 of Income-tax Act, 2025, full ₹60,000 is rebated. Net Tax = ₹0.
{
  const res = calculateCtcToInHand({
    annualCtc: 1275000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", `Test 1.4: Taxable income ₹12L must yield ₹0 tax, got ${tax?.value}`);
  console.log("✓ Test 1.4: FY 2026-27 Section 156 full rebate threshold (₹12L taxable = ₹0 tax) verified");
}

// Test 1.5: Section 156 Marginal Relief Boundary 1 — ₹12,10,000 Taxable Income (Gross ₹12,85,000)
// Excess over ₹12,00,000 = ₹10,00,00.
// Normal slab tax: 20k + 40k + 10k @ 15% = ₹61,500.
// Statutory marginal relief (proviso to Section 156) caps base tax to ₹10,000.
// With 4% cess: 10,000 * 1.04 = ₹10,400.
{
  const res = calculateCtcToInHand({
    annualCtc: 1285000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹10,400", `Test 1.5: Marginal relief must cap tax at ₹10,400, got ${tax?.value}`);
  console.log("✓ Test 1.5: FY 2026-27 Section 156 marginal relief at ₹12.1L (₹10,400 tax) verified");
}

// Test 1.6: Section 156 Marginal Relief Boundary 2 — ₹12,50,000 Taxable Income (Gross ₹13,25,000)
// Excess over ₹12,00,000 = ₹50,000.
// Normal slab tax: 60k + 50k @ 15% = ₹67,500.
// Marginal relief (proviso to Section 156) caps base tax to ₹50,000.
// With 4% cess: 50,000 * 1.04 = ₹52,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 1325000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹52,000", `Test 1.6: Marginal relief must cap tax at ₹52,000, got ${tax?.value}`);
  console.log("✓ Test 1.6: FY 2026-27 Section 156 marginal relief at ₹12.5L (₹52,000 tax) verified");
}

// Test 1.7: Section 156 Marginal Relief Crossover — ₹13,00,000 Taxable Income (Gross ₹13,75,000)
// Excess over ₹12,00,000 = ₹1,00,000.
// Normal slab tax: 60k + 1L @ 15% = ₹75,000.
// Since ₹75,000 <= ₹1,00,000, normal slab tax applies!
// With 4% cess: 75,000 * 1.04 = ₹78,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 1375000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹78,000", `Test 1.7: Post-marginal-relief slab tax must yield ₹78,000, got ${tax?.value}`);
  console.log("✓ Test 1.7: FY 2026-27 Marginal relief crossover at ₹13L (₹78,000 tax) verified");
}

// Test 1.8: Slab Boundary 3 — ₹16,00,000 Taxable Income (Gross ₹16,75,000)
// Base tax: 4L @ 5% (20k) + 4L @ 10% (40k) + 4L @ 15% (60k) = ₹1,20,000.
// Cess 4% = ₹4,800. Total = ₹1,24,800.
{
  const res = calculateCtcToInHand({
    annualCtc: 1675000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹1,24,800", `Test 1.8: Taxable ₹16L must yield ₹1,24,800, got ${tax?.value}`);
  console.log("✓ Test 1.8: FY 2026-27 Slab Boundary 3 (₹16L taxable = ₹1,24,800 tax) verified");
}

// Test 1.9: Slab Boundary 4 — ₹20,00,000 Taxable Income (Gross ₹20,75,000)
// Base tax: ₹1,20,000 + 4L @ 20% (80k) = ₹2,00,000.
// Cess 4% = ₹8,000. Total = ₹2,08,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 2075000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹2,08,000", `Test 1.9: Taxable ₹20L must yield ₹2,08,000, got ${tax?.value}`);
  console.log("✓ Test 1.9: FY 2026-27 Slab Boundary 4 (₹20L taxable = ₹2,08,000 tax) verified");
}

// Test 1.10: Slab Boundary 5 — ₹24,00,000 Taxable Income (Gross ₹24,75,000)
// Base tax: ₹2,00,000 + 4L @ 25% (100k) = ₹3,00,000.
// Cess 4% = ₹12,000. Total = ₹3,12,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 2475000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹3,12,000", `Test 1.10: Taxable ₹24L must yield ₹3,12,000, got ${tax?.value}`);
  console.log("✓ Test 1.10: FY 2026-27 Slab Boundary 5 (₹24L taxable = ₹3,12,000 tax) verified");
}

// Test 1.11: Above ₹24L Slab — ₹30,00,000 Taxable Income (Gross ₹30,75,000)
// Base tax: ₹3,00,000 + 6L @ 30% (180k) = ₹4,80,000.
// Cess 4% = ₹19,200. Total = ₹4,99,200.
{
  const res = calculateCtcToInHand({
    annualCtc: 3075000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹4,99,200", `Test 1.11: Taxable ₹30L must yield ₹4,99,200, got ${tax?.value}`);
  console.log("✓ Test 1.11: FY 2026-27 Top Slab (₹30L taxable = ₹4,99,200 tax) verified");
}

// Test 1.12: Surcharge Threshold (> ₹50 Lakhs) — ₹60,00,000 Taxable Income (Gross ₹60,75,000)
// Base tax: 3,00,000 + 36L @ 30% (10,80,000) = ₹13,80,000.
// Surcharge: 10% of ₹13,80,000 = ₹1,38,000. Total before cess = ₹15,18,000.
// Cess 4% = ₹60,720. Total = ₹15,78,720.
{
  const res = calculateCtcToInHand({
    annualCtc: 6075000,
    basicSalaryPercent: 50,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const surcharge = res.secondaryValues?.find((m) => m.label === "Surcharge (Annual)");
  assert(surcharge?.value === "₹1,38,000", `Test 1.12: Surcharge must be ₹1,38,000, got ${surcharge?.value}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹15,78,720", `Test 1.12: Total tax with surcharge must be ₹15,78,720, got ${tax?.value}`);
  console.log("✓ Test 1.12: FY 2026-27 Surcharge threshold at ₹60L (₹1,38,000 surcharge) verified");
}

// Test 1.13: Representative Package 1 — Fresh Graduate / Entry-Level ₹6 Lakh CTC
// Basic 40% = ₹2,40,000. Employer PF = ₹28,800. Gratuity (15/312) = ₹11,538.46.
// Gross Annual = ₹5,59,661.54 (₹46,638.46/mo).
// Employee PF = ₹2,400/mo. PT = ₹200/mo.
// Taxable = 5,59,661.54 - 75,000 = ₹4,84,661.54 <= 12L => TDS = ₹0.
// Net In-Hand = 46,638.46 - 2,400 - 200 = ₹44,038.46 => ₹44,038.00.
{
  const res = calculateCtcToInHand({
    annualCtc: 600000,
    basicSalaryPercent: 40,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.primaryValue === "₹44,038.46", `Test 1.13: Entry package monthly in-hand must be ₹44,038.46, got ${res.primaryValue}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 1.13: Entry package TDS must be ₹0");
  console.log("✓ Test 1.13: FY 2026-27 Representative ₹6L Package verified");
}

// Test 1.14: Representative Package 2 — Mid-Level ₹12 Lakh CTC (Zero Tax under FY 2026-27)
// Basic 40% = ₹4,80,000. Employer PF = ₹57,600. Gratuity (15/312) = ₹23,076.92.
// Gross Annual = ₹11,19,323.08 (₹93,276.92/mo).
// Employee PF = ₹4,800/mo. PT = ₹200/mo.
// Taxable = 11,19,323.08 - 75,000 = ₹10,44,323.08 <= 12L => TDS = ₹0.
// Net In-Hand = 93,276.92 - 4,800 - 200 = ₹88,276.92 => ₹88,276.92.
// NOTE: Under FY 2024-25, this same CTC incurred tax because the rebate was capped at ₹7L!
{
  const res = calculateCtcToInHand({
    annualCtc: 1200000,
    basicSalaryPercent: 40,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.primaryValue === "₹88,276.92", `Test 1.14: ₹12L package monthly in-hand must be ₹88,276.92, got ${res.primaryValue}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 1.14: ₹12L CTC must incur ₹0 tax under FY 2026-27");
  console.log("✓ Test 1.14: FY 2026-27 Representative ₹12L Package (Zero Tax vs historical) verified");
}

// Test 1.15: Representative Package 3 — Senior IC ₹18 Lakh CTC
// Basic 40% = ₹7,20,000. Employer PF = ₹86,400. Gratuity (15/312) = ₹34,615.38.
// Gross Annual = ₹16,78,984.62 (₹1,39,915.38/mo).
// Employee PF = ₹7,200/mo. PT = ₹200/mo.
// Taxable = 16,78,984.62 - 75,000 = ₹16,03,984.62.
// Tax: 4L@5% (20k) + 4L@10% (40k) + 4L@15% (60k) + 3,984.62@20% (796.92) = ₹1,20,796.92.
// Surcharge = 0. Cess 4% = ₹4,831.88. Total Annual TDS = ₹1,25,628.80.
// Monthly TDS = ₹10,469.07.
// Net In-Hand = 1,39,915.38 - 7,200 - 200 - 10,469.07 = ₹1,22,046.31 => ₹1,22,046.31.
{
  const res = calculateCtcToInHand({
    annualCtc: 1800000,
    basicSalaryPercent: 40,
    taxRegime: "new_act_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.primaryValue === "₹1,22,046.32", `Test 1.15: Monthly in-hand must be ₹1,22,046.32, got ${res.primaryValue}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹1,25,629", `Test 1.15: Expected annual TDS ₹1,25,629, got ${tax?.value}`);
  console.log("✓ Test 1.15: FY 2026-27 Representative ₹18L Package verified");
}

// Test 1.16: Representative Package 4 — Executive ₹30 Lakh CTC with ₹3 Lakh Variable Bonus
// Fixed CTC = ₹27,00,000. Basic 40% = ₹10,80,000. Employer PF = ₹1,29,600. Gratuity (15/312) = ₹51,923.08.
// Gross Annual = ₹25,18,476.92 (₹2,09,873.08/mo).
// Employee PF = ₹10,800/mo. PT = ₹200/mo.
// Taxable = 25,18,476.92 - 75,000 = ₹24,43,476.92.
// Base Tax: 4L@5% (20k) + 4L@10% (40k) + 4L@15% (60k) + 4L@20% (80k) + 4L@25% (100k) + 43,476.92@30% (13,043.08) = ₹3,13,043.08.
// Cess 4% = ₹12,521.72. Total Annual TDS = ₹3,25,564.80.
// Monthly TDS = ₹27,130.40.
// Net In-Hand = 2,09,873.08 - 10,800 - 200 - 27,130.40 = ₹1,71,742.68 => ₹1,71,742.68.
{
  const res = calculateCtcToInHand({
    annualCtc: 3000000,
    basicSalaryPercent: 40,
    taxRegime: "new_act_2025",
    variablePayAnnual: 300000,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.primaryValue === "₹1,71,742.68", `Test 1.16: Monthly in-hand must be ₹1,71,742.68, got ${res.primaryValue}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹3,25,565", `Test 1.16: Expected annual TDS ₹3,25,565, got ${tax?.value}`);
  console.log("✓ Test 1.16: FY 2026-27 Executive ₹30L Package with Variable Pay verified");
}

// ============================================================================
// PART 2: HISTORICAL TAX YEAR 2025-26 (FINANCE ACT, 2025 / SECTIONS 115BAC & 87A)
// Slabs: 0-4L (0%), 4-8L (5%), 8-12L (10%), 12-16L (15%), 16-20L (20%), 20-24L (25%), >24L (30%)
// Standard Deduction: ₹75,000 | Section 87A Rebate: up to ₹60,000 for taxable income <= ₹12,00,000
// ============================================================================

// Test 2.1: Zero Taxable Income (Income <= Standard Deduction ₹75,000)
{
  const res = calculateCtcToInHand({
    annualCtc: 75000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  assert(res.isValid === true, "Test 2.1: Valid calculation for ₹75k CTC");
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 2.1: Taxable income ₹0 must yield ₹0 tax");
  assert(res.primaryValue === "₹5,875.00", `Test 2.1: Expected monthly in-hand ₹5,875.00, got ${res.primaryValue}`);
  console.log("✓ Test 2.1: FY 2025-26 Zero taxable income verified");
}

// Test 2.2: Slab Boundary 1 — ₹4,00,000 Taxable Income (Gross ₹4,75,000)
{
  const res = calculateCtcToInHand({
    annualCtc: 475000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 2.2: Taxable income ₹4L is in 0% slab (₹0 tax)");
  console.log("✓ Test 2.2: FY 2025-26 Slab Boundary 1 (₹4L taxable = ₹0 tax) verified");
}

// Test 2.2B: Rebate Capped at Eligible Tax Amount (Taxable ₹6,00,000, Gross ₹6,75,000)
// Slab tax: (6L - 4L) @ 5% = ₹10,000.
// Under Section 87A (Finance Act, 2025), rebate is lesser of 100% of tax (₹10,000) or ₹60,000 ceiling.
// Net Tax = Math.max(0, 10,000 - 10,000) = ₹0.
{
  const res = calculateCtcToInHand({
    annualCtc: 675000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 2.2B: Rebate capped at eligible tax (₹10k) must yield ₹0 tax");
  console.log("✓ Test 2.2B: FY 2025-26 Section 87A rebate capped at eligible tax verified");
}

// Test 2.3: Section 87A Full Rebate Threshold — Exactly ₹12,00,000 Taxable Income (Gross ₹12,75,000)
// Slab calculation: 4L @ 5% (20k) + 4L @ 10% (40k) = ₹60,000.
// Under Section 87A as amended by Finance Act, 2025, full ₹60,000 is rebated. Net Tax = ₹0.
{
  const res = calculateCtcToInHand({
    annualCtc: 1275000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", `Test 2.3: Taxable income ₹12L must yield ₹0 tax under FY 2025-26, got ${tax?.value}`);
  console.log("✓ Test 2.3: FY 2025-26 Section 87A ₹12L full rebate threshold verified");
}

// Test 2.4: Section 87A Marginal Relief Boundary 1 — ₹12,10,000 Taxable Income (Gross ₹12,85,000)
// Excess over ₹12,00,000 = ₹10,000.
// Normal slab tax: 20k + 40k + 10k @ 15% = ₹61,500.
// Proviso to Section 87A caps base tax to ₹10,000. With 4% cess: ₹10,400.
{
  const res = calculateCtcToInHand({
    annualCtc: 1285000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹10,400", `Test 2.4: Marginal relief must cap tax at ₹10,400, got ${tax?.value}`);
  console.log("✓ Test 2.4: FY 2025-26 Section 87A marginal relief at ₹12.1L (₹10,400 tax) verified");
}

// Test 2.5: Section 87A Marginal Relief Boundary 2 — ₹12,50,000 Taxable Income (Gross ₹13,25,000)
// Excess over ₹12,00,000 = ₹50,000.
// Normal slab tax: 60k + 50k @ 15% = ₹67,500.
// Marginal relief caps base tax to ₹50,000. With 4% cess: ₹52,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 1325000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹52,000", `Test 2.5: Marginal relief must cap tax at ₹52,000, got ${tax?.value}`);
  console.log("✓ Test 2.5: FY 2025-26 Section 87A marginal relief at ₹12.5L (₹52,000 tax) verified");
}

// Test 2.6: Section 87A Marginal Relief Crossover — ₹13,00,000 Taxable Income (Gross ₹13,75,000)
// Excess over ₹12,00,000 = ₹1,00,000.
// Normal slab tax: 60k + 1L @ 15% = ₹75,000. Since ₹75,000 <= ₹1,00,000, normal slab tax applies!
// With 4% cess: 75,000 * 1.04 = ₹78,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 1375000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹78,000", `Test 2.6: Post-marginal-relief slab tax must yield ₹78,000, got ${tax?.value}`);
  console.log("✓ Test 2.6: FY 2025-26 Marginal relief crossover at ₹13L (₹78,000 tax) verified");
}

// Test 2.7: Slab Boundary 3 — ₹16,00,000 Taxable Income (Gross ₹16,75,000)
// Base tax: 4L @ 5% (20k) + 4L @ 10% (40k) + 4L @ 15% (60k) = ₹1,20,000. With 4% cess: ₹1,24,800.
{
  const res = calculateCtcToInHand({
    annualCtc: 1675000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹1,24,800", `Test 2.7: Taxable ₹16L must yield ₹1,24,800, got ${tax?.value}`);
  console.log("✓ Test 2.7: FY 2025-26 Slab Boundary 3 (₹16L taxable = ₹1,24,800 tax) verified");
}

// Test 2.8: Slab Boundary 4 — ₹20,00,000 Taxable Income (Gross ₹20,75,000)
// Base tax: ₹1,20,000 + 4L @ 20% (80k) = ₹2,00,000. With 4% cess: ₹2,08,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 2075000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹2,08,000", `Test 2.8: Taxable ₹20L must yield ₹2,08,000, got ${tax?.value}`);
  console.log("✓ Test 2.8: FY 2025-26 Slab Boundary 4 (₹20L taxable = ₹2,08,000 tax) verified");
}

// Test 2.9: Slab Boundary 5 — ₹24,00,000 Taxable Income (Gross ₹24,75,000)
// Base tax: ₹2,00,000 + 4L @ 25% (100k) = ₹3,00,000. With 4% cess: ₹3,12,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 2475000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹3,12,000", `Test 2.9: Taxable ₹24L must yield ₹3,12,000, got ${tax?.value}`);
  console.log("✓ Test 2.9: FY 2025-26 Slab Boundary 5 (₹24L taxable = ₹3,12,000 tax) verified");
}

// Test 2.10: Surcharge Threshold (> ₹50 Lakhs) — ₹60,00,000 Taxable Income (Gross ₹60,75,000)
// Base tax: 3,00,000 + 36L @ 30% (10,80,000) = ₹13,80,000.
// Surcharge: 10% = ₹1,38,000. With 4% cess: ₹15,78,720.
{
  const res = calculateCtcToInHand({
    annualCtc: 6075000,
    basicSalaryPercent: 50,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const surcharge = res.secondaryValues?.find((m) => m.label === "Surcharge (Annual)");
  assert(surcharge?.value === "₹1,38,000", `Test 2.10: Surcharge must be ₹1,38,000, got ${surcharge?.value}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹15,78,720", `Test 2.10: Total tax with surcharge must be ₹15,78,720, got ${tax?.value}`);
  console.log("✓ Test 2.10: FY 2025-26 Surcharge threshold at ₹60L (₹1,38,000 surcharge) verified");
}

// Test 2.11: Representative Package — ₹12 Lakh CTC under FY 2025-26 (Zero Tax via ₹12L Section 87A rebate)
// Basic 40% = ₹4,80,000. Employer PF = ₹57,600. Gratuity (15/312) = ₹23,076.92.
// Gross Annual = ₹11,19,323.08 (₹93,276.92/mo).
// Employee PF = ₹4,800/mo. PT = ₹200/mo.
// Taxable = 11,19,323.08 - 75,000 = ₹10,44,323.08 <= 12L => TDS = ₹0.
// Net In-Hand = 93,276.92 - 4,800 - 200 = ₹88,276.92.
{
  const res = calculateCtcToInHand({
    annualCtc: 1200000,
    basicSalaryPercent: 40,
    taxRegime: "new_fa_2025",
    variablePayAnnual: 0,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.primaryValue === "₹88,276.92", `Test 2.11: ₹12L package monthly in-hand must be ₹88,276.92, got ${res.primaryValue}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 2.11: ₹12L CTC must incur ₹0 tax under FY 2025-26");
  console.log("✓ Test 2.11: FY 2025-26 Representative ₹12L Package (Zero Tax via ₹12L rebate) verified");
}

// ============================================================================
// PART 3: HISTORICAL TAX YEAR 2024-25 (FINANCE (NO. 2) ACT, 2024 / SECTIONS 115BAC & 87A)
// Slabs: 0-3L (0%), 3-7L (5%), 7-10L (10%), 10-12L (15%), 12-15L (20%), >15L (30%)
// Standard Deduction: ₹75,000 | Section 87A Rebate: up to ₹25,000 for taxable income <= ₹7,00,000
// ============================================================================

// Test 3.1: Zero Taxable Income (Income <= Standard Deduction ₹75,000)
{
  const res = calculateCtcToInHand({
    annualCtc: 75000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  assert(res.isValid === true, "Test 3.1: Valid calculation for ₹75k CTC");
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 3.1: Taxable income ₹0 must yield ₹0 tax");
  assert(res.primaryValue === "₹5,875.00", `Test 3.1: Expected monthly in-hand ₹5,875.00, got ${res.primaryValue}`);
  console.log("✓ Test 3.1: FY 2024-25 Zero taxable income verified");
}

// Test 3.2: Slab Boundary 1 — ₹3,00,000 Taxable Income (Gross ₹3,75,000)
{
  const res = calculateCtcToInHand({
    annualCtc: 375000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 3.2: Taxable income ₹3L is in 0% slab (₹0 tax)");
  console.log("✓ Test 3.2: FY 2024-25 Slab Boundary 1 (₹3L taxable = ₹0 tax) verified");
}

// Test 3.2B: Rebate Capped at Eligible Tax Amount (Taxable ₹5,00,000, Gross ₹5,75,000)
// Slab tax: (5L - 3L) @ 5% = ₹10,000.
// Under Section 87A (Finance (No. 2) Act, 2024), rebate is lesser of 100% of tax (₹10,000) or ₹25,000 ceiling.
// Net Tax = Math.max(0, 10,000 - 10,000) = ₹0 (capped at eligible tax).
{
  const res = calculateCtcToInHand({
    annualCtc: 575000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 3.2B: Rebate capped at eligible tax (₹10k) must yield ₹0 tax");
  console.log("✓ Test 3.2B: FY 2024-25 Section 87A rebate capped at eligible tax verified");
}

// Test 3.3: Section 87A Rebate Threshold — Exactly ₹7,00,000 Taxable Income (Gross ₹7,75,000)
// Slab calculation: 4L @ 5% = ₹20,000.
// Under Section 87A of 1961 Act (FY 2024-25), full ₹20,000 is rebated. Net Tax = ₹0.
{
  const res = calculateCtcToInHand({
    annualCtc: 775000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", `Test 3.3: Taxable income ₹7L must yield ₹0 tax under FY 2024-25, got ${tax?.value}`);
  console.log("✓ Test 3.3: FY 2024-25 Section 87A full rebate threshold (₹7L taxable = ₹0 tax) verified");
}

// Test 3.4: Section 87A Marginal Relief — ₹7,10,000 Taxable Income (Gross ₹7,85,000)
// Excess over ₹7,00,000 = ₹10,000.
// Normal slab tax: 20k + 10k @ 10% = ₹21,000.
// Proviso to Section 87A caps base tax to ₹10,000. With 4% cess: ₹10,400.
{
  const res = calculateCtcToInHand({
    annualCtc: 785000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹10,400", `Test 3.4: Marginal relief must cap tax at ₹10,400, got ${tax?.value}`);
  console.log("✓ Test 3.4: FY 2024-25 Section 87A marginal relief at ₹7.1L (₹10,400 tax) verified");
}

// Test 3.5: Section 87A Marginal Relief Crossover — ₹7,25,000 Taxable Income (Gross ₹8,00,000)
// Excess over ₹7,00,000 = ₹25,000.
// Normal slab tax: 20k + 25k @ 10% = ₹22,500. Since ₹22,500 <= ₹25,000, normal slab tax applies!
// With 4% cess: 22,500 * 1.04 = ₹23,400.
{
  const res = calculateCtcToInHand({
    annualCtc: 800000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹23,400", `Test 3.5: Post-marginal-relief tax must yield ₹23,400, got ${tax?.value}`);
  console.log("✓ Test 3.5: FY 2024-25 Marginal relief crossover at ₹7.25L (₹23,400 tax) verified");
}

// Test 3.6: Slab Boundary 2 — ₹10,00,000 Taxable Income (Gross ₹10,75,000)
// Base tax: 4L @ 5% (20k) + 3L @ 10% (30k) = ₹50,000. With 4% cess: ₹52,000.
{
  const res = calculateCtcToInHand({
    annualCtc: 1075000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹52,000", `Test 3.6: Taxable ₹10L must yield ₹52,000, got ${tax?.value}`);
  console.log("✓ Test 3.6: FY 2024-25 Slab Boundary 2 (₹10L taxable = ₹52,000 tax) verified");
}

// Test 3.7: Slab Boundary 3 — ₹12,00,000 Taxable Income (Gross ₹12,75,000)
// Base tax: ₹50,000 + 2L @ 15% (30k) = ₹80,000. With 4% cess: ₹83,200.
{
  const res = calculateCtcToInHand({
    annualCtc: 1275000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹83,200", `Test 3.7: Taxable ₹12L must yield ₹83,200, got ${tax?.value}`);
  console.log("✓ Test 3.7: FY 2024-25 Slab Boundary 3 (₹12L taxable = ₹83,200 tax) verified");
}

// Test 3.8: Slab Boundary 4 — ₹15,00,000 Taxable Income (Gross ₹15,75,000)
// Base tax: ₹80,000 + 3L @ 20% (60k) = ₹1,40,000. With 4% cess: ₹1,45,600.
{
  const res = calculateCtcToInHand({
    annualCtc: 1575000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹1,45,600", `Test 3.8: Taxable ₹15L must yield ₹1,45,600, got ${tax?.value}`);
  console.log("✓ Test 3.8: FY 2024-25 Slab Boundary 4 (₹15L taxable = ₹1,45,600 tax) verified");
}

// Test 3.9: Above ₹15L Slab — ₹20,00,000 Taxable Income (Gross ₹20,75,000)
// Base tax: ₹1,40,000 + 5L @ 30% (1,50,000) = ₹2,90,000. With 4% cess: ₹3,01,600.
{
  const res = calculateCtcToInHand({
    annualCtc: 2075000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹3,01,600", `Test 3.9: Taxable ₹20L must yield ₹3,01,600, got ${tax?.value}`);
  console.log("✓ Test 3.9: FY 2024-25 Above ₹15L Slab (₹20L taxable = ₹3,01,600 tax) verified");
}

// Test 3.10: Surcharge Threshold (> ₹50 Lakhs) — ₹60,00,000 Taxable Income (Gross ₹60,75,000)
// Base tax: 1,40,000 + 45L @ 30% (13,50,000) = ₹14,90,000.
// Surcharge: 10% = ₹1,49,000. Total before cess = ₹16,39,000. Cess 4% = ₹65,560. Total = ₹17,04,560.
{
  const res = calculateCtcToInHand({
    annualCtc: 6075000,
    basicSalaryPercent: 50,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
  });

  const surcharge = res.secondaryValues?.find((m) => m.label === "Surcharge (Annual)");
  assert(surcharge?.value === "₹1,49,000", `Test 3.10: Surcharge must be ₹1,49,000, got ${surcharge?.value}`);
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹17,04,560", `Test 3.10: Total tax with surcharge must be ₹17,04,560, got ${tax?.value}`);
  console.log("✓ Test 3.10: FY 2024-25 Surcharge threshold at ₹60L (₹1,49,000 surcharge) verified");
}

// Test 3.11: Representative Package — Historical ₹12 Lakh CTC under FY 2024-25 (Subject to Tax)
// Basic 40% = ₹4,80,000. Employer PF = ₹57,600. Gratuity (15/312) = ₹23,076.92.
// Gross Annual = ₹11,19,323.08 (₹93,276.92/mo).
// Employee PF = ₹4,800/mo. PT = ₹200/mo.
// Taxable = 11,19,323.08 - 75,000 = ₹10,44,323.08 (exceeds ₹7L threshold).
// Base Tax: 4L@5% (20k) + 3L@10% (30k) + 44,323.08@15% (6,648.46) = ₹56,648.46.
// Cess 4% = ₹2,265.94. Total Annual TDS = ₹58,914.40. Monthly TDS = ₹4,909.53.
// Net In-Hand = 93,276.92 - 4,800 - 200 - 4,909.53 = ₹83,367.39.
// CONTRAST PROOF: Under FY 2024-25, this package pays ₹58,914 tax (In-hand: ₹83,367.39).
// Under FY 2025-26 & FY 2026-27, the same package pays ₹0 tax (In-hand: ₹88,276.92)!
{
  const res = calculateCtcToInHand({
    annualCtc: 1200000,
    basicSalaryPercent: 40,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.isValid === true, "Test 3.11: Valid calculation for historical ₹12L CTC");
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹58,914", `Test 3.11: FY 2024-25 ₹12L CTC must pay ₹58,914 tax, got ${tax?.value}`);
  assert(res.primaryValue === "₹83,367.39", `Test 3.11: FY 2024-25 ₹12L CTC in-hand must be ₹83,367.39, got ${res.primaryValue}`);
  console.log("✓ Test 3.11: FY 2024-25 Representative ₹12L Package (₹58,914 tax vs ₹0 in FY 2025-26 & FY 2026-27) verified");
}

// Test 3.11B: Representative Package 3 — Senior IC ₹18 Lakh CTC under FY 2024-25
// Basic 40% = ₹7,20,000. Employer PF = ₹86,400. Gratuity (15/312) = ₹34,615.38.
// Gross Annual = ₹16,78,984.62 (₹1,39,915.38/mo).
// Employee PF = ₹7,200/mo. PT = ₹200/mo.
// Taxable = 16,78,984.62 - 75,000 = ₹16,03,984.62.
// Base Tax: 0-3L (0) + 3-7L@5% (20k) + 7-10L@10% (30k) + 10-12L@15% (30k) + 12-15L@20% (60k) + 1,03,984.62@30% (31,195.38) = ₹1,71,195.38.
// Surcharge = 0. Cess 4% = ₹6,847.82. Total Annual TDS = ₹1,78,043.20 => ₹1,78,043.
// Monthly TDS = ₹14,836.93.
// Net In-Hand = 1,39,915.38 - 7,200 - 200 - 14,836.93 = ₹1,17,678.45.
{
  const res = calculateCtcToInHand({
    annualCtc: 1800000,
    basicSalaryPercent: 40,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 0,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.isValid === true, "Test 3.11B: Valid calculation for FY 2024-25 ₹18L CTC");
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹1,78,043", `Test 3.11B: Expected annual TDS ₹1,78,043, got ${tax?.value}`);
  assert(res.primaryValue === "₹1,17,678.45", `Test 3.11B: Expected monthly in-hand ₹1,17,678.45, got ${res.primaryValue}`);
  console.log("✓ Test 3.11B: FY 2024-25 Representative ₹18L Package (₹1,78,043 tax, ₹1,17,678.45 in-hand) verified");
}

// Test 3.12: Representative Package 4 — Executive ₹30 Lakh CTC with ₹3 Lakh Variable Bonus under FY 2024-25
// Fixed CTC = ₹27,00,000. Basic 40% = ₹10,80,000. Employer PF = ₹1,29,600. Gratuity (15/312) = ₹51,923.08.
// Gross Annual = ₹25,18,476.92 (₹2,09,873.08/mo).
// Employee PF = ₹10,800/mo. PT = ₹200/mo.
// Taxable = 25,18,476.92 - 75,000 = ₹24,43,476.92.
// Base Tax: 0-3L (0) + 3-7L@5% (20k) + 7-10L@10% (30k) + 10-12L@15% (30k) + 12-15L@20% (60k) + 9,43,476.92@30% (2,83,043.08) = ₹4,23,043.08.
// Surcharge = 0 (taxable <= 50L). Cess 4% = ₹16,921.72. Total Annual TDS = ₹4,39,964.80 => ₹4,39,965.
// Monthly TDS = ₹36,663.73.
// Net In-Hand = 2,09,873.08 - 10,800 - 200 - 36,663.73 = ₹1,62,209.34.
{
  const res = calculateCtcToInHand({
    annualCtc: 3000000,
    basicSalaryPercent: 40,
    taxRegime: "new_budget_2024",
    variablePayAnnual: 300000,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
  });

  assert(res.isValid === true, "Test 3.12: Valid calculation for FY 2024-25 ₹30L CTC with variable pay");
  const tax = res.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹4,39,965", `Test 3.12: Expected annual TDS ₹4,39,965, got ${tax?.value}`);
  assert(res.primaryValue === "₹1,62,209.34", `Test 3.12: Expected monthly in-hand ₹1,62,209.34, got ${res.primaryValue}`);
  console.log("✓ Test 3.12: FY 2024-25 Executive ₹30L Package with Variable Pay verified");
}


// ============================================================================
// PART 4: OLD TAX REGIME (INCOME-TAX ACT, 1961 - SECTION 87A UP TO ₹5L, 80C/80D)
// ============================================================================

// Test 4.1: Old Regime 87A Threshold (₹5,00,000 Taxable = ₹0 Tax)
{
  const resOld5L = calculateCtcToInHand({
    annualCtc: 550000,
    basicSalaryPercent: 50,
    taxRegime: "old_regime",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
    taxDeductionsOldRegime: 0,
  });
  const tax = resOld5L.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹0", "Test 4.1: Old regime taxable ₹5L must incur ₹0 tax");
  console.log("✓ Test 4.1: Old Tax Regime ₹5L threshold verified");
}

// Test 4.2: Old Regime Slab Boundary — ₹10,00,000 Taxable Income (Gross ₹10,50,000)
// Base tax: 2.5L @ 5% (12.5k) + 5L @ 20% (100k) = ₹1,12,500. Cess 4% = ₹4,500. Total = ₹1,17,000.
{
  const resOld10L = calculateCtcToInHand({
    annualCtc: 1050000,
    basicSalaryPercent: 50,
    taxRegime: "old_regime",
    variablePayAnnual: 0,
    includeEmployerPf: 0,
    includeGratuity: 0,
    professionalTaxMonthly: 0,
    taxDeductionsOldRegime: 0,
  });
  const tax = resOld10L.secondaryValues?.find((m) => m.label === "Annual Tax Payable");
  assert(tax?.value === "₹1,17,000", `Test 4.2: Old regime taxable ₹10L must incur ₹1,17,000 tax, got ${tax?.value}`);
  console.log("✓ Test 4.2: Old Tax Regime ₹10L slab boundary verified");
}

// Test 4.3: Old Regime with ₹2,00,000 Deductions (80C + 80D)
{
  const res = calculateCtcToInHand({
    annualCtc: 1500000,
    basicSalaryPercent: 50,
    taxRegime: "old_regime",
    variablePayAnnual: 0,
    includeEmployerPf: 1,
    includeGratuity: 1,
    professionalTaxMonthly: 200,
    taxDeductionsOldRegime: 200000,
  });
  assert(res.isValid === true, "Test 4.3: Old regime with deductions valid");
  console.log("✓ Test 4.3: Old Tax Regime with deductions verified");
}

// ============================================================================
// PART 5: BOUNDARY CONDITIONS & ERROR HANDLING
// ============================================================================

// Test 5.1: Zero CTC
{
  const res = calculateCtcToInHand({ annualCtc: 0 });
  assert(res.isValid === false, "Test 5.1: Zero CTC must be rejected");
}

// Test 5.2: Negative CTC
{
  const res = calculateCtcToInHand({ annualCtc: -500000 });
  assert(res.isValid === false, "Test 5.2: Negative CTC must be rejected");
}

// Test 5.3: Variable Pay >= CTC
{
  const res = calculateCtcToInHand({
    annualCtc: 1000000,
    variablePayAnnual: 1000000,
  });
  assert(res.isValid === false, "Test 5.3: Variable pay >= CTC must be rejected");
}

// Test 5.4: Invalid Basic Salary Percentage
{
  const resHigh = calculateCtcToInHand({
    annualCtc: 1000000,
    basicSalaryPercent: 120,
  });
  assert(resHigh.isValid === false, "Test 5.4: Basic > 100% must be rejected");

  const resZero = calculateCtcToInHand({
    annualCtc: 1000000,
    basicSalaryPercent: 0,
  });
  assert(resZero.isValid === false, "Test 5.4: Basic 0% must be rejected");
}

// Test 5.5: Negative Professional Tax
{
  const resNegPt = calculateCtcToInHand({
    annualCtc: 1000000,
    professionalTaxMonthly: -100,
  });
  assert(resNegPt.isValid === false, "Test 5.5: Negative PT must be rejected");
}

console.log("✓ Part 5: All boundary conditions and validation errors verified");
console.log("\n=======================================================");
console.log("ALL CTC TO IN-HAND SALARY REGRESSION TESTS PASSED!");
console.log("=======================================================\n");
