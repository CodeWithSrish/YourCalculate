import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatINR } from "../engine/validation";

export interface CtcBreakdownResult {
  isValid: boolean;
  error?: string;
  monthlyInHand: number;
  annualInHand: number;
  grossSalaryMonthly: number;
  grossSalaryAnnual: number;
  basicSalaryMonthly: number;
  basicSalaryAnnual: number;
  employeePfMonthly: number;
  employeePfAnnual: number;
  employerPfMonthly: number;
  employerPfAnnual: number;
  gratuityMonthly: number;
  gratuityAnnual: number;
  professionalTaxMonthly: number;
  professionalTaxAnnual: number;
  monthlyTds: number;
  annualTds: number;
  taxableIncome: number;
  stepExplanation?: string;
  secondaryValues: SecondaryMetric[];
}

export function calculateCtcToInHand(
  inputs: Record<string, number | string>
): CalculationOutput {
  const annualCtc = Number(inputs.annualCtc);
  const basicSalaryPercent = Number(inputs.basicSalaryPercent ?? 40);
  const variablePayAnnual = Number(inputs.variablePayAnnual ?? 0);
  const taxRegime = String(inputs.taxRegime ?? "new_act_2025");
  const includeEmployerPf = Number(inputs.includeEmployerPf ?? 1);
  const includeGratuity = Number(inputs.includeGratuity ?? 1);
  const professionalTaxMonthly = Number(inputs.professionalTaxMonthly ?? 200);
  const taxDeductionsOldRegime = Number(inputs.taxDeductionsOldRegime ?? 150000);

  // Validation
  if (!Number.isFinite(annualCtc) || annualCtc <= 0) {
    return { isValid: false, error: "Please enter a valid Annual CTC greater than ₹0." };
  }
  if (!Number.isFinite(basicSalaryPercent) || basicSalaryPercent <= 0 || basicSalaryPercent > 100) {
    return { isValid: false, error: "Basic salary percentage must be between 1% and 100%." };
  }
  if (!Number.isFinite(variablePayAnnual) || variablePayAnnual < 0) {
    return { isValid: false, error: "Variable bonus cannot be negative." };
  }
  if (variablePayAnnual >= annualCtc) {
    return { isValid: false, error: "Variable pay cannot be equal to or exceed total CTC." };
  }
  if (!Number.isFinite(professionalTaxMonthly) || professionalTaxMonthly < 0) {
    return { isValid: false, error: "Professional tax cannot be negative." };
  }
  if (!Number.isFinite(taxDeductionsOldRegime) || taxDeductionsOldRegime < 0) {
    return { isValid: false, error: "Tax deductions cannot be negative." };
  }

  // 1. Fixed CTC and Basic Salary
  const fixedCtc = annualCtc - variablePayAnnual;
  const basicSalaryAnnual = fixedCtc * (basicSalaryPercent / 100);

  // 2. Employer-side Statutory Deductions (if bundled into CTC)
  const employerPfAnnual = includeEmployerPf === 1 ? basicSalaryAnnual * 0.12 : 0;

  // Gratuity calculation: 15 days wages for each year of service = (15 / 26) * (Basic / 12) * 1 = (15 / 312) * Basic (~4.8077%)
  const gratuityAnnual = includeGratuity === 1 ? basicSalaryAnnual * (15 / 312) : 0;

  // 3. Employee Gross Salary (Base for Monthly Paycheck)
  const grossSalaryAnnual = fixedCtc - employerPfAnnual - gratuityAnnual;
  const grossSalaryMonthly = grossSalaryAnnual / 12;

  // 4. Employee Payroll Deductions
  const employeePfAnnual = basicSalaryAnnual * 0.12;
  const employeePfMonthly = employeePfAnnual / 12;
  const professionalTaxAnnual = professionalTaxMonthly * 12;

  // 5. Income Tax Calculation (TDS)
  let standardDeduction = 75000;
  let taxableIncome = 0;
  let baseIncomeTax = 0;

  if (taxRegime === "new_act_2025") {
    // Current Tax Year: FY 2026-27 (AY 2027-28) under Section 202 of Income-tax Act, 2025 (Act No. 30 of 2025)
    standardDeduction = 75000;
    taxableIncome = Math.max(0, grossSalaryAnnual - standardDeduction);
    baseIncomeTax = calculateNewAct2025BaseTax(taxableIncome);
  } else if (taxRegime === "new_fa_2025") {
    // Historical Tax Year: FY 2025-26 under Finance Act, 2025 (Section 115BAC & Section 87A of 1961 Act / ₹12L Rebate)
    standardDeduction = 75000;
    taxableIncome = Math.max(0, grossSalaryAnnual - standardDeduction);
    baseIncomeTax = calculateFy2025BaseTax(taxableIncome);
  } else if (taxRegime === "new_budget_2024") {
    // Historical Tax Year: FY 2024-25 under Finance (No. 2) Act, 2024 (Section 115BAC & Section 87A of 1961 Act / ₹7L Rebate)
    standardDeduction = 75000;
    taxableIncome = Math.max(0, grossSalaryAnnual - standardDeduction);
    baseIncomeTax = calculateFy2024BaseTax(taxableIncome);
  } else {
    // Old Tax Regime (Optional under Section 202 opt-out / historical)
    standardDeduction = 50000;
    const oldDeductions = taxDeductionsOldRegime + professionalTaxAnnual;
    taxableIncome = Math.max(0, grossSalaryAnnual - standardDeduction - oldDeductions);
    baseIncomeTax = calculateOldRegimeBaseTax(taxableIncome);
  }

  // Surcharge (for high taxable income > ₹50 Lakhs)
  let surcharge = 0;
  if (taxRegime === "new_act_2025" || taxRegime === "new_fa_2025") {
    const calcBase = taxRegime === "new_act_2025" ? calculateNewAct2025BaseTax : calculateFy2025BaseTax;
    if (taxableIncome > 20000000) {
      surcharge = baseIncomeTax * 0.25;
      const taxAt2Cr = calcBase(20000000);
      const surchargeAt2Cr = taxAt2Cr * 0.15;
      const maxTaxWithSurcharge = taxAt2Cr + surchargeAt2Cr + (taxableIncome - 20000000);
      if (baseIncomeTax + surcharge > maxTaxWithSurcharge) {
        surcharge = Math.max(0, maxTaxWithSurcharge - baseIncomeTax);
      }
    } else if (taxableIncome > 10000000) {
      surcharge = baseIncomeTax * 0.15;
      const taxAt1Cr = calcBase(10000000);
      const surchargeAt1Cr = taxAt1Cr * 0.10;
      const maxTaxWithSurcharge = taxAt1Cr + surchargeAt1Cr + (taxableIncome - 10000000);
      if (baseIncomeTax + surcharge > maxTaxWithSurcharge) {
        surcharge = Math.max(0, maxTaxWithSurcharge - baseIncomeTax);
      }
    } else if (taxableIncome > 5000000) {
      surcharge = baseIncomeTax * 0.10;
      const taxAt50L = calcBase(5000000);
      const maxTaxWithSurcharge = taxAt50L + (taxableIncome - 5000000);
      if (baseIncomeTax + surcharge > maxTaxWithSurcharge) {
        surcharge = Math.max(0, maxTaxWithSurcharge - baseIncomeTax);
      }
    }
  } else if (taxRegime === "new_budget_2024") {
    if (taxableIncome > 20000000) {
      surcharge = baseIncomeTax * 0.25;
      const taxAt2Cr = calculateFy2024BaseTax(20000000);
      const surchargeAt2Cr = taxAt2Cr * 0.15;
      const maxTaxWithSurcharge = taxAt2Cr + surchargeAt2Cr + (taxableIncome - 20000000);
      if (baseIncomeTax + surcharge > maxTaxWithSurcharge) {
        surcharge = Math.max(0, maxTaxWithSurcharge - baseIncomeTax);
      }
    } else if (taxableIncome > 10000000) {
      surcharge = baseIncomeTax * 0.15;
      const taxAt1Cr = calculateFy2024BaseTax(10000000);
      const surchargeAt1Cr = taxAt1Cr * 0.10;
      const maxTaxWithSurcharge = taxAt1Cr + surchargeAt1Cr + (taxableIncome - 10000000);
      if (baseIncomeTax + surcharge > maxTaxWithSurcharge) {
        surcharge = Math.max(0, maxTaxWithSurcharge - baseIncomeTax);
      }
    } else if (taxableIncome > 5000000) {
      surcharge = baseIncomeTax * 0.10;
      const taxAt50L = calculateFy2024BaseTax(5000000);
      const maxTaxWithSurcharge = taxAt50L + (taxableIncome - 5000000);
      if (baseIncomeTax + surcharge > maxTaxWithSurcharge) {
        surcharge = Math.max(0, maxTaxWithSurcharge - baseIncomeTax);
      }
    }
  } else {
    if (taxableIncome > 50000000) {
      surcharge = baseIncomeTax * 0.37;
    } else if (taxableIncome > 20000000) {
      surcharge = baseIncomeTax * 0.25;
    } else if (taxableIncome > 10000000) {
      surcharge = baseIncomeTax * 0.15;
    } else if (taxableIncome > 5000000) {
      surcharge = baseIncomeTax * 0.10;
    }
  }

  // 4% Health & Education Cess on (Income Tax + Surcharge)
  const annualTds = (baseIncomeTax + surcharge) * 1.04;
  const monthlyTds = annualTds / 12;

  // 6. Net Monthly Take-Home Pay (In-Hand)
  const monthlyInHand = Math.max(
    0,
    grossSalaryMonthly - employeePfMonthly - professionalTaxMonthly - monthlyTds
  );
  const annualInHand = monthlyInHand * 12;

  const totalMonthlyDeductions =
    employeePfMonthly + professionalTaxMonthly + monthlyTds;

  let regimeName = "New Tax Regime — FY 2026-27 (Income-tax Act, 2025)";
  if (taxRegime === "new_fa_2025") {
    regimeName = "New Tax Regime — FY 2025-26 (Finance Act, 2025 / Section 115BAC & Section 87A)";
  } else if (taxRegime === "new_budget_2024") {
    regimeName = "New Tax Regime — FY 2024-25 (Finance (No. 2) Act, 2024 / Section 115BAC & Section 87A)";
  } else if (taxRegime === "old_regime") {
    regimeName = "Old Tax Regime (With Deductions)";
  }

  const stepExplanation = `Annual CTC of ${formatINR(annualCtc)} (with ${basicSalaryPercent}% Basic = ${formatINR(basicSalaryAnnual)}) breaks down into: Monthly Gross Salary of ${formatINR(grossSalaryMonthly)}. Deductions per month: Employee PF ${formatINR(employeePfMonthly)}, Professional Tax ${formatINR(professionalTaxMonthly)}, and Income Tax TDS ${formatINR(monthlyTds)} (under ${regimeName} with ${formatINR(standardDeduction)} standard deduction on taxable income of ${formatINR(taxableIncome)}). Total monthly take-home credited to your bank account is ${formatINR(monthlyInHand, true)}.`;

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Annual In-Hand Salary",
      value: formatINR(annualInHand),
    },
    {
      label: "Monthly Gross Pay",
      value: formatINR(grossSalaryMonthly, true),
    },
    {
      label: "Employee PF (Monthly)",
      value: formatINR(employeePfMonthly, true),
    },
    {
      label: "Income Tax TDS (Monthly)",
      value: formatINR(monthlyTds, true),
    },
    {
      label: "Professional Tax (Monthly)",
      value: formatINR(professionalTaxMonthly, true),
    },
    {
      label: "Total Monthly Deductions",
      value: formatINR(totalMonthlyDeductions, true),
    },
    {
      label: "Annual Tax Payable",
      value: formatINR(annualTds),
    },
  ];

  if (surcharge > 0) {
    secondaryValues.push({
      label: "Surcharge (Annual)",
      value: formatINR(surcharge),
    });
  }

  if (employerPfAnnual > 0 || gratuityAnnual > 0) {
    const retirementBenefitAnnual = employerPfAnnual + gratuityAnnual;
    secondaryValues.push({
      label: "Employer Retentions (Annual)",
      value: formatINR(retirementBenefitAnnual),
    });
  }

  return {
    isValid: true,
    primaryValue: formatINR(monthlyInHand, true),
    primaryLabel: "Estimated Monthly In-Hand (Take-Home) Pay",
    unit: "₹",
    stepExplanation,
    disclaimer:
      "Salary calculation reflects Indian statutory payroll norms for resident individual taxpayers earning regular salary income under verified direct tax legislation: (1) Current Tax Year 2026–27 under Section 202 of the Income-tax Act, 2025 (Act No. 30 of 2025) with revised slabs and ₹12,00,000 Section 156 rebate threshold (capped at eligible tax up to ₹60,000); (2) Historical FY 2025–26 under Finance Act, 2025 (Section 115BAC / Section 87A with ₹12,00,000 rebate threshold capped at ₹60,000); (3) Historical FY 2024–25 under Finance (No. 2) Act, 2024 (Section 115BAC / Section 87A with ₹7,00,000 rebate threshold capped at ₹25,000); and (4) Old Tax Regime under Income-tax Act, 1961 (Section 87A rebate capped at ₹12,500). Scope & Eligibility Limitations: Applies strictly to resident individuals with ordinary salary income. Non-resident individuals (NRIs), corporate entities, and special-rate incomes (e.g., capital gains under Sections 111A, 112, 112A or speculative/gaming income under Sections 115BB, 115BBJ) are outside the calculator's scope. Payroll modeling assumptions: Employer PF is modeled as 12% of Basic, Gratuity as statutory 15/26 days per year (4.81% of Basic), Employee PF as 12% of Basic, and Professional Tax as ₹200/month (state-specific). Payroll structures vary across employers; customize inputs above to match your specific appointment letter.",
    disclaimerLabel: "Payroll & Statutory Notice",
    secondaryValues,
  };
}

/**
 * Tax Year 2026-27 (AY 2027-28) Base Tax under Section 202 of Income-tax Act, 2025:
 * - Up to ₹4,00,000: Nil
 * - ₹4,00,001 to ₹8,00,000: 5% (₹20,000)
 * - ₹8,00,001 to ₹12,00,000: 10% (₹40,000)
 * - ₹12,00,001 to ₹16,00,000: 15% (₹60,000)
 * - ₹16,00,001 to ₹20,00,000: 20% (₹80,000)
 * - ₹20,00,001 to ₹24,00,000: 25% (₹1,00,000)
 * - Above ₹24,00,000: 30%
 * - Section 156 Rebate: 100% of tax (up to ₹60,000) for resident individuals if taxable income <= ₹12,00,000.
 * - Marginal Relief (proviso to Section 156): Tax payable cannot exceed (taxableIncome - 12,00,000).
 */
function calculateNewAct2025BaseTax(taxableIncome: number): number {
  let slabTax = 0;
  if (taxableIncome > 400000) {
    slabTax += Math.min(taxableIncome - 400000, 400000) * 0.05;
  }
  if (taxableIncome > 800000) {
    slabTax += Math.min(taxableIncome - 800000, 400000) * 0.10;
  }
  if (taxableIncome > 1200000) {
    slabTax += Math.min(taxableIncome - 1200000, 400000) * 0.15;
  }
  if (taxableIncome > 1600000) {
    slabTax += Math.min(taxableIncome - 1600000, 400000) * 0.20;
  }
  if (taxableIncome > 2000000) {
    slabTax += Math.min(taxableIncome - 2000000, 400000) * 0.25;
  }
  if (taxableIncome > 2400000) {
    slabTax += (taxableIncome - 2400000) * 0.30;
  }

  // Section 156 Rebate: 100% of income-tax or ₹60,000, whichever is less, if taxable income <= ₹12,00,000
  if (taxableIncome <= 1200000) {
    const rebate = Math.min(slabTax, 60000);
    return Math.max(0, slabTax - rebate);
  }

  // Section 156 Marginal Relief (proviso to Section 156):
  // Tax payable cannot exceed excess income over ₹12,00,000
  const excessIncome = taxableIncome - 1200000;
  if (slabTax > excessIncome) {
    return excessIncome;
  }
  return slabTax;
}

/**
 * Historical Tax Year 2025-26 (AY 2026-27) Base Tax under Section 115BAC & Section 87A of Income-tax Act, 1961 (as amended by Finance Act, 2025):
 * - Up to ₹4,00,000: Nil
 * - ₹4,00,001 to ₹8,00,000: 5% (₹20,000)
 * - ₹8,00,001 to ₹12,00,000: 10% (₹40,000)
 * - ₹12,00,001 to ₹16,00,000: 15% (₹60,000)
 * - ₹16,00,001 to ₹20,00,000: 20% (₹80,000)
 * - ₹20,00,001 to ₹24,00,000: 25% (₹1,00,000)
 * - Above ₹24,00,000: 30%
 * - Section 87A Rebate: 100% of tax (up to ₹60,000) for resident individuals if taxable income <= ₹12,00,000.
 * - Marginal Relief (First Proviso to Section 87A): Tax payable cannot exceed (taxableIncome - 12,00,000).
 */
function calculateFy2025BaseTax(taxableIncome: number): number {
  let slabTax = 0;
  if (taxableIncome > 400000) {
    slabTax += Math.min(taxableIncome - 400000, 400000) * 0.05;
  }
  if (taxableIncome > 800000) {
    slabTax += Math.min(taxableIncome - 800000, 400000) * 0.10;
  }
  if (taxableIncome > 1200000) {
    slabTax += Math.min(taxableIncome - 1200000, 400000) * 0.15;
  }
  if (taxableIncome > 1600000) {
    slabTax += Math.min(taxableIncome - 1600000, 400000) * 0.20;
  }
  if (taxableIncome > 2000000) {
    slabTax += Math.min(taxableIncome - 2000000, 400000) * 0.25;
  }
  if (taxableIncome > 2400000) {
    slabTax += (taxableIncome - 2400000) * 0.30;
  }

  // Section 87A Rebate: 100% of income-tax or ₹60,000, whichever is less, if taxable income <= ₹12,00,000
  if (taxableIncome <= 1200000) {
    const rebate = Math.min(slabTax, 60000);
    return Math.max(0, slabTax - rebate);
  }

  // Section 87A Marginal Relief (First Proviso to Section 87A):
  // Tax payable cannot exceed excess income over ₹12,00,000
  const excessIncome = taxableIncome - 1200000;
  if (slabTax > excessIncome) {
    return excessIncome;
  }
  return slabTax;
}

/**
 * Historical Tax Year 2024-25 (AY 2025-26) Base Tax under Section 115BAC & Section 87A of Income-tax Act, 1961 (as amended by Finance (No. 2) Act, 2024):
 * - Up to ₹3,00,000: Nil
 * - ₹3,00,001 to ₹7,00,000: 5% (₹20,000)
 * - ₹7,00,001 to ₹10,00,000: 10% (₹30,000)
 * - ₹10,00,001 to ₹12,00,000: 15% (₹30,000)
 * - ₹12,00,001 to ₹15,00,000: 20% (₹60,000)
 * - Above ₹15,00,000: 30%
 * - Section 87A Rebate: 100% of tax (up to ₹25,000) if taxable income <= ₹7,00,000.
 * - Marginal Relief (First Proviso to Section 87A): Tax payable cannot exceed (taxableIncome - 7,00,000).
 */
function calculateFy2024BaseTax(taxableIncome: number): number {
  let slabTax = 0;
  if (taxableIncome > 300000) {
    slabTax += Math.min(taxableIncome - 300000, 400000) * 0.05;
  }
  if (taxableIncome > 700000) {
    slabTax += Math.min(taxableIncome - 700000, 300000) * 0.10;
  }
  if (taxableIncome > 1000000) {
    slabTax += Math.min(taxableIncome - 1000000, 200000) * 0.15;
  }
  if (taxableIncome > 1200000) {
    slabTax += Math.min(taxableIncome - 1200000, 300000) * 0.20;
  }
  if (taxableIncome > 1500000) {
    slabTax += (taxableIncome - 1500000) * 0.30;
  }

  // Section 87A Rebate: 100% of income-tax or ₹25,000, whichever is less, if taxable income <= ₹7,00,000
  if (taxableIncome <= 700000) {
    const rebate = Math.min(slabTax, 25000);
    return Math.max(0, slabTax - rebate);
  }

  // Section 87A Marginal Relief (First Proviso to Section 87A):
  // Tax payable cannot exceed excess income over ₹7,00,000
  const excessIncome = taxableIncome - 700000;
  if (slabTax > excessIncome) {
    return excessIncome;
  }
  return slabTax;
}

function calculateOldRegimeBaseTax(taxableIncome: number): number {
  let slabTax = 0;
  if (taxableIncome > 250000) {
    slabTax += Math.min(taxableIncome - 250000, 250000) * 0.05;
  }
  if (taxableIncome > 500000) {
    slabTax += Math.min(taxableIncome - 500000, 500000) * 0.20;
  }
  if (taxableIncome > 1000000) {
    slabTax += (taxableIncome - 1000000) * 0.30;
  }

  // Section 87A Rebate: 100% of income-tax or ₹12,500, whichever is less, if taxable income <= ₹5,00,000
  if (taxableIncome <= 500000) {
    const rebate = Math.min(slabTax, 12500);
    return Math.max(0, slabTax - rebate);
  }
  return slabTax;
}

export const ctcToInHandSalaryCalculatorDefinition: CalculatorDefinition = {
  id: "ctc-to-in-hand-salary-calculator",
  slug: "ctc-to-in-hand-salary-calculator",
  name: "CTC to In-Hand Salary Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription:
    "Calculate exact monthly take-home salary from your CTC after PF, Gratuity, Professional Tax, and verified Income-tax Act, 2025 New Tax Regime slabs (FY 2026-27).",
  longDescription:
    "A transparent, deterministic salary calculator for Indian employees and job seekers. Convert your annual Cost to Company (CTC) into exact monthly take-home pay with detailed breakdowns of Employer PF, Employee PF, Gratuity, Professional Tax, and verified direct tax rules under the Income-tax Act, 2025 (FY 2026-27), Finance Act, 2025 (FY 2025-26), and Finance (No. 2) Act, 2024 (FY 2024-25).",
  icon: "💵",
  searchKeywords: [
    "ctc to in hand salary calculator",
    "in hand salary calculator",
    "salary calculator india",
    "take home salary calculator",
    "ctc to take home",
    "income tax act 2025 salary calculator",
    "new tax regime salary calculator 2026-27",
    "fy 2026-27 salary calculator",
    "pf deduction calculator",
    "gratuity deduction ctc",
  ],
  defaultModeId: "ctc-to-in-hand",
  modes: [
    {
      id: "ctc-to-in-hand",
      name: "CTC to Take-Home Pay",
      description:
        "Determine your monthly bank credit from annual CTC with verified statutory PF, Gratuity, and current Income-tax Act, 2025 tax slabs.",
      formulaText:
        "In-Hand = Monthly Gross − Employee PF (12%) − Professional Tax − Monthly TDS",
      inputs: [
        {
          id: "annualCtc",
          label: "Annual CTC (Cost to Company)",
          type: "currency",
          defaultValue: 1200000,
          prefix: "₹",
          placeholder: "e.g. 12,00,000",
          min: 100000,
          step: 25000,
          helperText: "Total annual package as stated in your appointment or offer letter.",
        },
        {
          id: "basicSalaryPercent",
          label: "Basic Salary (% of CTC)",
          type: "percentage",
          defaultValue: 40,
          suffix: "%",
          placeholder: "e.g. 40",
          min: 25,
          max: 70,
          step: 5,
          helperText: "Percentage of CTC allocated to Basic Pay (typically 40% to 50% in India; varies by employer policy).",
        },
        {
          id: "taxRegime",
          label: "Income Tax Regime & Financial Year",
          type: "select",
          defaultValue: "new_act_2025",
          options: [
            {
              label: "New Tax Regime — FY 2026-27 (Income-tax Act, 2025 / Sections 202 & 156 / ₹12L Zero-Tax Slabs)",
              value: "new_act_2025",
            },
            {
              label: "New Tax Regime — FY 2025-26 (Finance Act, 2025 / Sections 115BAC & 87A / ₹12L Zero-Tax Slabs)",
              value: "new_fa_2025",
            },
            {
              label: "New Tax Regime — FY 2024-25 (Finance (No. 2) Act, 2024 / Sections 115BAC & 87A / ₹7L Zero-Tax Slabs)",
              value: "new_budget_2024",
            },
            {
              label: "Old Tax Regime (With Section 80C, 80D, HRA deductions)",
              value: "old_regime",
            },
          ],
          helperText: "Choose the applicable financial year. The default is current Tax Year 2026-27 under the Income-tax Act, 2025.",
        },
        {
          id: "variablePayAnnual",
          label: "Annual Variable / Bonus (in CTC)",
          type: "currency",
          defaultValue: 0,
          prefix: "₹",
          placeholder: "e.g. 1,00,000",
          min: 0,
          step: 10000,
          helperText: "Annual performance bonus included in your CTC letter; excluded from regular monthly payroll base.",
        },
        {
          id: "includeEmployerPf",
          label: "Employer PF in CTC",
          type: "select",
          defaultValue: 1,
          options: [
            { label: "Yes (12% of Basic included in CTC)", value: 1 },
            { label: "No (Paid over and above CTC)", value: 0 },
          ],
          helperText: "Select whether your employer bundles their 12% statutory PF contribution into your stated CTC.",
        },
        {
          id: "includeGratuity",
          label: "Gratuity in CTC",
          type: "select",
          defaultValue: 1,
          options: [
            { label: "Yes (4.81% of Basic included in CTC)", value: 1 },
            { label: "No (Excluded from CTC)", value: 0 },
          ],
          helperText: "Select whether your employer deducts a statutory 4.81% gratuity provision inside your stated CTC.",
        },
        {
          id: "professionalTaxMonthly",
          label: "Monthly Professional Tax (PT)",
          type: "number",
          defaultValue: 200,
          prefix: "₹",
          placeholder: "e.g. 200",
          min: 0,
          max: 500,
          step: 50,
          helperText: "State-specific statutory tax (typically ₹200/month in Karnataka/Maharashtra, ₹0 in Delhi/Haryana).",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateCtcToInHand(inputs),
    },
  ],
  formulas: [
    {
      modeId: "ctc-to-in-hand",
      title: "1. Gross Monthly Salary & Employer Retentions Formula",
      formulaMath: "\\text{Gross Monthly} = \\frac{\\text{Fixed CTC} - \\text{Employer PF (12\\%)} - \\text{Gratuity (4.81\\%)}}{12}",
      explanation:
        "Your monthly paycheck starts from Fixed CTC minus employer-side benefits. Employer PF (12% of Basic) and Gratuity (~4.81% of Basic) are bundled into annual CTC but retained by the employer. Employers in India structure these components differently depending on corporate policy.",
      example:
        "For ₹12 Lakh CTC with 40% Basic (₹4.8L): Employer PF = ₹57,600, Gratuity = ₹23,077. Gross Annual = ₹11,19,323 (₹93,277/month).",
      whenToUse: "Use to understand why your monthly payroll base is lower than CTC ÷ 12.",
    },
    {
      modeId: "ctc-to-in-hand",
      title: "2. New Tax Regime Slabs (Income-tax Act, 2025 — FY 2026-27)",
      formulaMath: "\\text{Taxable Income} = \\max(0, \\text{Gross Salary} - ₹75,000)",
      explanation:
        "Under Section 202 of the Income-tax Act, 2025: Standard deduction is ₹75,000. Slabs: ₹0–4L (0%), ₹4L–8L (5%), ₹8L–12L (10%), ₹12L–16L (15%), ₹16L–20L (20%), ₹20L–24L (25%), >₹24L (30%). With the Section 156 rebate (corresponding to Section 87A of the 1961 Act), resident individual taxable income up to ₹12,00,000 pays zero tax (meaning gross salary up to ₹12,75,000 pays zero tax).",
      example:
        "₹12 Lakh CTC has taxable income of ₹10,44,323, incurring ₹0 tax due to the ₹12L Section 156 rebate.",
      whenToUse: "Default regime applicable to all salaried taxpayers for Tax Year 2026-27.",
    },
    {
      modeId: "ctc-to-in-hand",
      title: "3. Net In-Hand Take-Home Formula",
      formulaMath: "\\text{In-Hand} = \\text{Gross Monthly} - \\text{Employee PF} - \\text{PT} - \\text{Monthly TDS}",
      explanation:
        "Calculates the exact monetary amount transferred into your bank account on payday after employee PF, state professional tax, and income tax withholdings.",
      example:
        "₹93,277 Gross − ₹4,800 (Employee PF) − ₹200 (PT) − ₹0 (TDS) = ₹88,277/month in-hand.",
      whenToUse: "Use to evaluate job offers, increments, and monthly household budget planning.",
    },
  ],
  examples: [
    {
      title: "Example 1: ₹12 Lakh CTC (Tax Year 2026-27 New Regime — ₹0 Tax)",
      description: "Mid-career software engineer package under Income-tax Act, 2025 rules paying zero income tax.",
      modeId: "ctc-to-in-hand",
      inputs: {
        annualCtc: 1200000,
        basicSalaryPercent: 40,
        taxRegime: "new_act_2025",
        variablePayAnnual: 0,
        includeEmployerPf: 1,
        includeGratuity: 1,
        professionalTaxMonthly: 200,
      },
      expectedOutput: "₹88,276.92",
    },
    {
      title: "Example 2: ₹18 Lakh Mid-Career CTC (FY 2026-27 New Regime)",
      description: "Senior individual contributor package with modest 15%–20% tax bracket exposure.",
      modeId: "ctc-to-in-hand",
      inputs: {
        annualCtc: 1800000,
        basicSalaryPercent: 40,
        taxRegime: "new_act_2025",
        variablePayAnnual: 0,
        includeEmployerPf: 1,
        includeGratuity: 1,
        professionalTaxMonthly: 200,
      },
      expectedOutput: "₹1,22,046.32",
    },
    {
      title: "Example 3: ₹30 Lakh Senior CTC with ₹3 Lakh Variable Bonus (FY 2026-27)",
      description: "Leadership package factoring variable bonus exclusion and progressive 25%–30% slabs.",
      modeId: "ctc-to-in-hand",
      inputs: {
        annualCtc: 3000000,
        basicSalaryPercent: 40,
        taxRegime: "new_act_2025",
        variablePayAnnual: 300000,
        includeEmployerPf: 1,
        includeGratuity: 1,
        professionalTaxMonthly: 200,
      },
      expectedOutput: "₹1,71,742.68",
    },
  ],
  faqs: [
    {
      question: "What are the tax slab and rebate differences between FY 2024-25, FY 2025-26, and FY 2026-27?",
      answer:
        "The New Tax Regime rules differ across these three years: (1) FY 2024–25 (Finance (No. 2) Act, 2024): Slabs started at ₹3 Lakhs, with Section 87A rebate capping zero tax at ₹7,00,000 taxable income (₹7,75,000 gross with ₹75,000 standard deduction); (2) FY 2025–26 (Finance Act, 2025): Slabs expanded to ₹4 Lakh increments (0% up to 4L, 5% 4–8L, 10% 8–12L, etc.) and Section 87A rebate increased to ₹60,000, capping zero tax at ₹12,00,000 taxable income (₹12,75,000 gross with ₹75,000 standard deduction); (3) Tax Year 2026–27 (Income-tax Act, 2025): The new standalone direct tax code replaced the 1961 Act, with identical concessional slabs under Section 202 and the ₹12 Lakh resident individual rebate under Section 156.",
    },
    {
      question: "Why do different employers give different take-home pay for the exact same CTC?",
      answer:
        "CTC (Cost to Company) is an internal accounting figure, not a standardized statutory formula. Employers vary widely in how they structure pay: some include Employer PF (12%) in CTC while others treat it as a company overhead; some withhold a 4.81% gratuity accrual while others do not; and Basic salary percentages can range from 30% to 50%. Furthermore, states like Karnataka and Maharashtra levy ₹200/month in Professional Tax, whereas Delhi and Haryana levy none.",
    },
    {
      question: "How does Section 156 marginal relief work under the Income-tax Act, 2025 when income slightly exceeds ₹12 Lakhs?",
      answer:
        "Under the Income-tax Act, 2025, if taxable income exceeds ₹12,00,000, the Section 156 rebate is ordinarily phased out. To prevent a cliff where a ₹10,000 pay hike results in a ₹61,500 tax bill, the proviso to Section 156 provides statutory marginal relief capping your total tax payable to the exact amount by which your income exceeds ₹12,00,000 (e.g., at ₹12,10,000 taxable income, tax before cess is capped at ₹10,000). An identical marginal relief mechanism operated under Section 87A for FY 2025-26 under the Finance Act, 2025.",
    },
    {
      question: "Is Gratuity deducted from my monthly salary?",
      answer:
        "Gratuity is typically included as an employer cost provision in your annual CTC letter (approx. 4.81% of Basic salary), which lowers your nominal monthly gross salary. It is not deducted from your monthly paycheck; rather, it is retained by the employer and paid as a lump sum upon completing 5 years of continuous service under the Payment of Gratuity Act, 1972.",
    },
    {
      question: "What is the difference between Employer PF and Employee PF?",
      answer:
        "Provident Fund (EPF) requires a 24% total contribution on Basic pay. 12% is paid by the employer (often bundled into your CTC), and 12% is deducted directly from your monthly gross salary. Both contributions accumulate in your government EPFO account earning statutory compound interest.",
    },
    {
      question: "Does this calculator apply to NRIs or income from capital gains and lottery/crypto?",
      answer:
        "No. The calculator is designed strictly for resident individuals earning regular salary income under the head 'Salaries'. Non-Resident Indians (NRIs) are statutorily ineligible for Section 87A (Income-tax Act, 1961) and Section 156 (Income-tax Act, 2025) tax rebates. In addition, special-rate incomes—such as Equity Capital Gains (Sections 111A, 112, 112A), Virtual Digital Assets (Section 115BBH), and lottery/online gaming winnings (Sections 115BB, 115BBJ)—are taxed at separate statutory rates outside ordinary slab brackets and are therefore explicitly outside this calculator's scope.",
    },
    {
      question: "What are the official statutory sources and legal citations for this calculator?",
      answer:
        "Calculations strictly implement verified Indian statutory enactments: (1) Income-tax Act, 2025 (Act No. 30 of 2025), Section 202 (Concessional Tax Regime) and Section 156 (Rebate of income-tax in case of certain individuals) for FY 2026–27 (AY 2027–28); (2) Finance Act, 2025 amending Section 115BAC and Section 87A of the Income-tax Act, 1961 for historical FY 2025–26 (AY 2026–27 / ₹12L rebate threshold); (3) Finance (No. 2) Act, 2024 amending Section 115BAC and Section 87A of the Income-tax Act, 1961 for historical FY 2024–25 (AY 2025–26 / ₹7L rebate threshold); (4) Employees' Provident Funds and Miscellaneous Provisions Act, 1952 (12% employee and employer PF contributions); (5) Payment of Gratuity Act, 1972, Section 4(2) (15 days' wages per year based on 26-day working month = 4.81% of Basic); and (6) State-specific Professional Tax schedules under Article 276 of the Constitution of India. Official portals: Income Tax Department (incometax.gov.in), Press Information Bureau (pib.gov.in), and Gazette of India (egazette.gov.in).",
    },
  ],
  relatedCalculators: [
    {
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "Finance",
      slug: "/emi-calculator",
      isAvailable: true,
    },
    {
      id: "sip-calculator",
      name: "SIP Calculator",
      category: "Finance",
      slug: "/sip-calculator",
      isAvailable: true,
    },
    {
      id: "home-loan-prepayment-vs-sip-calculator",
      name: "Prepayment vs SIP",
      category: "Finance",
      slug: "/home-loan-prepayment-vs-sip-calculator",
      isAvailable: true,
    },
    {
      id: "gst-calculator",
      name: "GST Calculator",
      category: "Finance",
      slug: "/gst-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "CTC to In-Hand Salary Calculator — Monthly Take-Home Pay (Tax Year 2026-27) | YourCalculate",
    description:
      "Free CTC to In-Hand Salary Calculator. Calculate monthly take-home pay from your CTC with PF, Gratuity, Professional Tax, and verified Income-tax Act, 2025 New Tax Regime slabs (FY 2026-27).",
    canonicalPath: "/ctc-to-in-hand-salary-calculator",
    keywords: [
      "ctc to in hand salary calculator",
      "in hand salary calculator",
      "salary calculator india",
      "take home salary calculator",
      "income tax act 2025 salary calculator",
      "new tax regime take home 2026-27",
      "fy 2026-27 salary calculator",
    ],
  },
};
