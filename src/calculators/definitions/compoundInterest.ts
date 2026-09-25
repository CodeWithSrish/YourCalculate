import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatINR, formatResultNumber } from "../engine/validation";

export type CompoundingFrequency = 1 | 2 | 4 | 12 | 365;

export interface CompoundInterestResult {
  isValid: boolean;
  error?: string;
  principal?: number;
  annualRate?: number;
  timeYears?: number;
  frequency?: number;
  frequencyLabel?: string;
  futureValue?: number;
  compoundInterest?: number;
  effectiveGain?: number;
  formattedPrincipal?: string;
  formattedFutureValue?: string;
  formattedCompoundInterest?: string;
  formattedEffectiveGain?: string;
  stepExplanation?: string;
}

export function getFrequencyLabel(freq: number): string {
  switch (freq) {
    case 1:
      return "Annually (1/yr)";
    case 2:
      return "Semi-Annually (2/yr)";
    case 4:
      return "Quarterly (4/yr)";
    case 12:
      return "Monthly (12/yr)";
    case 365:
      return "Daily (365/yr)";
    default:
      return `Custom (${freq}/yr)`;
  }
}

// Pure Compound Interest Calculation Engine
export function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  timeYears: number,
  frequency: number = 1
): CompoundInterestResult {
  if (
    isNaN(principal) ||
    isNaN(annualRate) ||
    isNaN(timeYears) ||
    isNaN(frequency)
  ) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }

  if (!Number.isFinite(principal) || principal <= 0) {
    return { isValid: false, error: "Principal amount must be greater than 0." };
  }

  if (!Number.isFinite(annualRate) || annualRate < 0) {
    return { isValid: false, error: "Interest rate cannot be negative." };
  }

  if (!Number.isFinite(timeYears) || timeYears <= 0) {
    return { isValid: false, error: "Time period must be greater than 0." };
  }

  const validFrequencies = [1, 2, 4, 12, 365];
  if (!validFrequencies.includes(frequency)) {
    return { isValid: false, error: "Please select a valid compounding frequency." };
  }

  const frequencyLabel = getFrequencyLabel(frequency);
  const formattedPrincipal = formatINR(principal, true);

  if (annualRate === 0) {
    const futureValue = principal;
    const compoundInterest = 0;
    const effectiveGain = 0;
    const formattedFutureValue = formatINR(futureValue, true);
    const formattedCompoundInterest = formatINR(compoundInterest, true);
    const formattedEffectiveGain = "0%";

    const stepExplanation = `Principal: ${formattedPrincipal}, Annual Rate: 0%, Time: ${timeYears} Years. Formula: A = P × (1 + r / n)^(n × t). Since interest rate is 0%, Final Amount (A) = ${formattedPrincipal}, Compound Interest = ₹0.00.`;

    return {
      isValid: true,
      principal,
      annualRate,
      timeYears,
      frequency,
      frequencyLabel,
      futureValue,
      compoundInterest,
      effectiveGain,
      formattedPrincipal,
      formattedFutureValue,
      formattedCompoundInterest,
      formattedEffectiveGain,
      stepExplanation,
    };
  }

  const r = annualRate / 100;
  const n = frequency;
  const t = timeYears;
  const totalPeriods = n * t;
  const ratePerPeriod = r / n;

  // Unrounded floating-point calculation: A = P * (1 + r/n)^(nt)
  const futureValue = principal * Math.pow(1 + ratePerPeriod, totalPeriods);
  const compoundInterest = futureValue - principal;
  const effectiveGain = (compoundInterest / principal) * 100;

  const formattedFutureValue = formatINR(futureValue, true);
  const formattedCompoundInterest = formatINR(compoundInterest, true);
  const formattedEffectiveGain = `${formatResultNumber(effectiveGain, 2)}%`;

  const stepExplanation = `Principal: ${formattedPrincipal}, Annual Rate: ${annualRate}%, Time: ${timeYears} Years, Compounding: ${frequencyLabel} (n = ${n}). Formula: A = P × (1 + r / n)^(n × t). Rate per period (r / n) = ${annualRate}% / ${n} = ${formatResultNumber(ratePerPeriod, 6)}. Total periods (n × t) = ${n} × ${timeYears} = ${formatResultNumber(totalPeriods, 4)}. Final Amount (A) = ${formattedPrincipal} × (1 + ${formatResultNumber(ratePerPeriod, 6)})^${formatResultNumber(totalPeriods, 4)} = ${formattedFutureValue}. Compound Interest = ${formattedFutureValue} − ${formattedPrincipal} = ${formattedCompoundInterest}.`;

  return {
    isValid: true,
    principal,
    annualRate,
    timeYears,
    frequency,
    frequencyLabel,
    futureValue,
    compoundInterest,
    effectiveGain,
    formattedPrincipal,
    formattedFutureValue,
    formattedCompoundInterest,
    formattedEffectiveGain,
    stepExplanation,
  };
}

export function calculateCompoundInterestWrapper(
  inputs: Record<string, number | string>
): CalculationOutput {
  const principal = Number(inputs.principal);
  const annualRate = Number(inputs.annualRate);
  const timeYears = Number(inputs.timeYears);
  const frequency = Number(inputs.frequency || 1);

  const result = calculateCompoundInterest(
    principal,
    annualRate,
    timeYears,
    frequency
  );

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Principal Amount",
      value: result.formattedPrincipal || "",
    },
    {
      label: "Total Compound Interest",
      value: result.formattedCompoundInterest || "",
    },
    {
      label: "Total Growth",
      value: result.formattedEffectiveGain || "",
    },
    {
      label: "Compounding Frequency",
      value: result.frequencyLabel || "",
    },
    {
      label: "Time Horizon",
      value: `${result.timeYears} ${result.timeYears === 1 ? "Year" : "Years"}`,
    },
  ];

  const disclaimer =
    "This calculator provides mathematical estimates based on the values you enter. Actual savings, deposits, or investment returns may differ because of fees, taxes, changing rates, account rules, and other factors.";

  return {
    isValid: true,
    primaryValue: result.formattedFutureValue,
    primaryLabel: `Total maturity amount after ${result.timeYears} ${result.timeYears === 1 ? "year" : "years"}`,
    unit: "₹",
    stepExplanation: result.stepExplanation,
    disclaimer,
    disclaimerLabel: "Informational Notice",
    secondaryValues,
  };
}

export const compoundInterestCalculatorDefinition: CalculatorDefinition = {
  id: "compound-interest-calculator",
  slug: "compound-interest-calculator",
  name: "Compound Interest Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription:
    "Calculate future investment value, accrued compound interest, and growth with annual, quarterly, monthly, or daily compounding.",
  longDescription:
    "A pure, deterministic financial compounding calculator that computes future maturity values, total accrued interest, and effective growth percentages on lump-sum principal sums across various compounding intervals.",
  icon: "📈",
  searchKeywords: [
    "compound interest",
    "compound interest calculator",
    "compound interest calculator india",
    "ci calculator",
    "compound interest formula",
    "calculate compound interest",
    "compound growth",
    "compound interest monthly",
    "compound interest quarterly",
    "daily compound interest",
    "fixed deposit compound interest",
    "interest on interest calculator",
  ],
  defaultModeId: "compound-interest",
  modes: [
    {
      id: "compound-interest",
      name: "Compound Interest",
      description:
        "Compute future maturity amount and total compound interest earned on an initial principal deposit.",
      formulaText: "A = P(1 + r/n)^(n × t)",
      inputs: [
        {
          id: "principal",
          label: "Principal Amount",
          type: "number",
          placeholder: "e.g. 10000",
          defaultValue: 10000,
          min: 1,
          step: 100,
          prefix: "₹",
          helperText: "Initial investment or deposit amount.",
        },
        {
          id: "annualRate",
          label: "Annual Interest Rate",
          type: "number",
          placeholder: "e.g. 10",
          defaultValue: 10,
          min: 0,
          step: 0.1,
          suffix: "%",
          helperText: "Annual nominal interest rate (e.g. 7.5% or 10%).",
        },
        {
          id: "timeYears",
          label: "Time Period (Years)",
          type: "number",
          placeholder: "e.g. 5",
          defaultValue: 5,
          min: 0.1,
          step: 0.5,
          suffix: "Yrs",
          helperText: "Duration in years (supports decimal values such as 2.5 or 5.5).",
        },
        {
          id: "frequency",
          label: "Compounding Frequency",
          type: "select",
          defaultValue: 1,
          options: [
            { label: "Annually (1/yr)", value: 1 },
            { label: "Semi-Annually (2/yr)", value: 2 },
            { label: "Quarterly (4/yr)", value: 4 },
            { label: "Monthly (12/yr)", value: 12 },
            { label: "Daily (365/yr)", value: 365 },
          ],
          helperText: "Frequency at which accrued interest is added to the principal.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateCompoundInterestWrapper(inputs),
    },
  ],
  formulas: [
    {
      modeId: "compound-interest",
      title: "1. Compound Amount Formula",
      formulaMath: "A = P(1 + \\frac{r}{n})^{n \\times t}",
      explanation:
        "Calculates the total accumulated amount by multiplying the principal by 1 plus the periodic interest rate, raised to the power of the total number of compounding periods.",
      example:
        "Principal ₹10,000 at 10% for 5 years annually: A = 10,000 × (1 + 0.10 / 1)^(1 × 5) = ₹16,105.10.",
      whenToUse:
        "Use when calculating future returns on fixed deposits, bonds, savings, or other lump-sum investments that earn compound interest.",
    },
    {
      modeId: "compound-interest-ci",
      title: "2. Total Compound Interest Formula",
      formulaMath: "\\text{CI} = A - P",
      explanation:
        "Determines the net interest earned by subtracting the original initial principal from the total final maturity amount.",
      example:
        "Final Amount ₹16,105.10 − Principal ₹10,000.00 = Total Compound Interest of ₹6,105.10.",
      whenToUse: "Use to isolate the exact monetary wealth gain generated solely by compounding interest.",
    },
    {
      modeId: "compound-interest-vars",
      title: "3. Formula Variables & Parameters",
      formulaMath: "A = \\text{Final Amount}, \\quad P = \\text{Principal}, \\quad r = \\frac{\\text{Rate}}{100}, \\quad n = \\text{Frequency}, \\quad t = \\text{Years}",
      explanation:
        "Defines the mathematical parameters where Rate is entered as a percentage (divided by 100), Frequency n represents times per year, and Time t is in years.",
      example:
        "Quarterly compounding uses n = 4; Monthly compounding uses n = 12; Daily compounding uses n = 365.",
      whenToUse: "Use as a reference guide for converting nominal interest terms into mathematical inputs.",
    },
  ],
  examples: [
    {
      title: "Example 1: ₹10,000 at 10% for 5 Years (Annual Compounding)",
      description: "Standard annual compounding on a ₹10,000 initial deposit.",
      modeId: "compound-interest",
      inputs: { principal: 10000, annualRate: 10, timeYears: 5, frequency: 1 },
      expectedOutput: "₹16,105.10",
    },
    {
      title: "Example 2: ₹10,000 at 10% for 5 Years (Monthly Compounding)",
      description: "Illustrating the additional yield from monthly interest compounding.",
      modeId: "compound-interest",
      inputs: { principal: 10000, annualRate: 10, timeYears: 5, frequency: 12 },
      expectedOutput: "₹16,453.09",
    },
    {
      title: "Example 3: ₹50,000 at 7.5% for 10 Years (Quarterly Compounding)",
      description: "Quarterly compounding on a 10-year medium-term deposit.",
      modeId: "compound-interest",
      inputs: { principal: 50000, annualRate: 7.5, timeYears: 10, frequency: 4 },
      expectedOutput: "₹105,117.46",
    },
    {
      title: "Example 4: ₹1,00,000 at 8% for 3 Years (Daily Compounding)",
      description: "Daily compounding calculation based on a 365-day annual cycle.",
      modeId: "compound-interest",
      inputs: { principal: 100000, annualRate: 8, timeYears: 3, frequency: 365 },
      expectedOutput: "₹127,121.57",
    },
  ],
  faqs: [
    {
      question: "What is compound interest?",
      answer:
        "Compound interest is the interest earned on both the initial principal deposit and the accumulated interest from prior periods. This 'interest on interest' accelerates wealth accumulation over time.",
    },
    {
      question: "How do I calculate compound interest?",
      answer:
        "Use the compound interest formula: A = P(1 + r/n)^(nt), where P is principal, r is the annual interest rate as a decimal, n is the number of times interest compounds per year, and t is the time in years. Subtract P from A to find total interest.",
    },
    {
      question: "What is the difference between simple interest and compound interest?",
      answer:
        "Simple interest is calculated only on the original principal amount throughout the investment tenure. Compound interest calculates returns on the growing balance (principal + previously earned interest), generating significantly higher returns over long horizons.",
    },
    {
      question: "How does compounding frequency affect my returns?",
      answer:
        "The more frequently interest is compounded (e.g. monthly or daily vs annually), the higher the effective yield, because accrued interest starts generating its own returns sooner.",
    },
    {
      question: "What compounding frequency do banks use for Fixed Deposits (FDs)?",
      answer:
        "Most Indian commercial banks compound Fixed Deposit interest on a quarterly basis (n = 4), crediting accrued interest every three months to the deposit balance.",
    },
    {
      question: "Can I calculate compound interest for decimal time periods?",
      answer:
        "Yes. You can enter fractional years such as 1.5 years (18 months), 2.5 years, or 5.25 years with full mathematical precision.",
    },
    {
      question: "What happens when the interest rate is 0%?",
      answer:
        "When the interest rate is 0%, no interest is earned (CI = ₹0.00), and the final maturity amount remains exactly equal to the initial principal.",
    },
  ],
  relatedCalculators: [
    {
      id: "sip-calculator",
      name: "SIP Calculator",
      category: "Finance",
      slug: "/sip-calculator",
      isAvailable: true,
    },
    {
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "Finance",
      slug: "/emi-calculator",
      isAvailable: true,
    },
    {
      id: "percentage-calculator",
      name: "Percentage Calculator",
      category: "Math",
      slug: "/percentage-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title:
      "Compound Interest Calculator — Calculate Future Value & Compounding Returns | YourCalculate",
    description:
      "Calculate compound interest, maturity amount, and total returns with annual, semi-annual, quarterly, monthly, and daily compounding.",
    canonicalPath: "/compound-interest-calculator",
    keywords: [
      "compound interest calculator",
      "compound interest",
      "ci calculator",
      "calculate compound interest",
      "compound interest formula",
      "compound growth calculator",
      "daily compound interest",
      "quarterly compound interest",
    ],
  },
};
