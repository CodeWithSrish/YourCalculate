import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatINR, formatResultNumber } from "../engine/validation";

export interface SimpleInterestResult {
  isValid: boolean;
  error?: string;
  principal?: number;
  annualRate?: number;
  timeYears?: number;
  simpleInterest?: number;
  totalAmount?: number;
  growthPercentage?: number;
  formattedPrincipal?: string;
  formattedSimpleInterest?: string;
  formattedTotalAmount?: string;
  formattedGrowthPercentage?: string;
  stepExplanation?: string;
}

export function calculateSimpleInterest(
  principal: number,
  annualRate: number,
  timeYears: number
): SimpleInterestResult {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(timeYears)
  ) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }

  if (principal <= 0) {
    return { isValid: false, error: "Principal amount must be greater than 0." };
  }

  if (annualRate < 0) {
    return { isValid: false, error: "Interest rate cannot be negative." };
  }

  if (timeYears <= 0) {
    return { isValid: false, error: "Time period must be greater than 0." };
  }

  // Exact unrounded mathematical formulas:
  // SI = (P * R * T) / 100
  // A = P + SI
  const simpleInterest = (principal * annualRate * timeYears) / 100;
  const totalAmount = principal + simpleInterest;
  const growthPercentage = (simpleInterest / principal) * 100;

  const formattedPrincipal = formatINR(principal, true);
  const formattedSimpleInterest = formatINR(simpleInterest, true);
  const formattedTotalAmount = formatINR(totalAmount, true);
  const formattedGrowthPercentage = `${formatResultNumber(growthPercentage, 2)}%`;

  const stepExplanation =
    annualRate === 0
      ? `Principal: ${formattedPrincipal}, Annual Rate: 0%, Time: ${timeYears} Years. Simple Interest = ₹0.00. Total Maturity Amount = ${formattedPrincipal}.`
      : `Principal: ${formattedPrincipal}, Annual Rate: ${annualRate}%, Time: ${timeYears} Years. Formula: SI = (P × R × T) / 100. SI = (${formattedPrincipal} × ${annualRate} × ${timeYears}) / 100 = ${formattedSimpleInterest}. Total Maturity Amount (A) = ${formattedPrincipal} + ${formattedSimpleInterest} = ${formattedTotalAmount} (${formattedGrowthPercentage} growth on principal).`;

  return {
    isValid: true,
    principal,
    annualRate,
    timeYears,
    simpleInterest,
    totalAmount,
    growthPercentage,
    formattedPrincipal,
    formattedSimpleInterest,
    formattedTotalAmount,
    formattedGrowthPercentage,
    stepExplanation,
  };
}

export function calculateSimpleInterestWrapper(
  inputs: Record<string, number | string>
): CalculationOutput {
  const principal = Number(inputs.principal);
  const annualRate = Number(inputs.annualRate);
  const timeYears = Number(inputs.timeYears);

  const result = calculateSimpleInterest(principal, annualRate, timeYears);

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
      label: "Total Maturity Amount",
      value: result.formattedTotalAmount || "",
    },
    {
      label: "Total Growth",
      value: result.formattedGrowthPercentage || "",
    },
    {
      label: "Annual Interest Rate",
      value: `${result.annualRate}%`,
    },
    {
      label: "Time Period",
      value: `${result.timeYears} ${result.timeYears === 1 ? "Year" : "Years"}`,
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedSimpleInterest,
    primaryLabel: "Simple Interest",
    unit: "₹",
    stepExplanation: result.stepExplanation,
    disclaimer:
      "This calculator provides mathematical estimates based on constant simple interest rates. Actual bank deposit or loan terms may vary according to institution rules and taxes.",
    disclaimerLabel: "Informational Notice",
    secondaryValues,
  };
}

export const simpleInterestCalculatorDefinition: CalculatorDefinition = {
  id: "simple-interest-calculator",
  slug: "simple-interest-calculator",
  name: "Simple Interest Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription:
    "Calculate simple interest earned, total maturity amount, and overall growth for loans or savings deposits.",
  longDescription:
    "A pure, deterministic financial calculator that computes simple interest and total maturity amount on principal sums over any time horizon using the standard SI = (P × R × T) / 100 formula.",
  icon: "💵",
  searchKeywords: [
    "simple interest",
    "simple interest calculator",
    "si calculator",
    "interest calculator",
    "simple interest formula",
    "calculate simple interest",
    "interest on principal",
    "simple interest in india",
    "simple interest calculation",
    "simple loan interest",
  ],
  defaultModeId: "simple-interest",
  modes: [
    {
      id: "simple-interest",
      name: "Simple Interest",
      description:
        "Calculate simple interest and final maturity amount for a given principal, rate, and time period.",
      formulaText: "SI = (P × R × T) / 100",
      inputs: [
        {
          id: "principal",
          label: "Principal Amount",
          type: "number",
          placeholder: "e.g. 10000",
          defaultValue: 10000,
          min: 1,
          step: 1000,
          prefix: "₹",
          helperText: "Initial principal or deposit amount.",
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
          helperText: "Annual nominal interest rate (e.g., 7.5% or 10%).",
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
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateSimpleInterestWrapper(inputs),
    },
  ],
  formulas: [
    {
      modeId: "simple-interest",
      title: "1. Simple Interest Formula",
      formulaMath: "\\text{SI} = \\frac{P \\times R \\times T}{100}",
      explanation:
        "Calculates the total interest earned by multiplying the principal amount by the annual interest rate and time period in years, divided by 100.",
      example:
        "Principal ₹10,000 at 10% for 5 years: SI = (10,000 × 10 × 5) / 100 = ₹5,000.00.",
      whenToUse:
        "Use when calculating interest on loans or fixed investments where interest is not reinvested into the principal.",
    },
    {
      modeId: "simple-interest-amount",
      title: "2. Total Maturity Amount Formula",
      formulaMath: "A = P + \\text{SI}",
      explanation:
        "Determines the final maturity amount by adding the simple interest earned to the original principal sum.",
      example:
        "Principal ₹10,000.00 + Simple Interest ₹5,000.00 = Total Maturity Amount of ₹15,000.00.",
      whenToUse:
        "Use to determine the total payout received at the conclusion of the investment or loan term.",
    },
    {
      modeId: "simple-interest-combined",
      title: "3. Direct Maturity Value Formula",
      formulaMath: "A = P \\times (1 + \\frac{R \\times T}{100})",
      explanation:
        "Computes the final accumulated maturity value directly in a single mathematical step using the principal growth factor.",
      example:
        "₹10,000 × (1 + (10 × 5) / 100) = ₹10,000 × 1.50 = ₹15,000.00.",
      whenToUse:
        "Use for quick direct evaluation of final maturity values without separate interest breakdown.",
    },
  ],
  examples: [
    {
      title: "Example 1: ₹10,000 at 10% for 5 Years",
      description: "Standard simple interest on a ₹10,000 initial principal deposit.",
      modeId: "simple-interest",
      inputs: { principal: 10000, annualRate: 10, timeYears: 5 },
      expectedOutput: "₹5,000.00",
    },
    {
      title: "Example 2: ₹50,000 at 7.5% for 3 Years",
      description: "Simple interest calculation with fractional rate.",
      modeId: "simple-interest",
      inputs: { principal: 50000, annualRate: 7.5, timeYears: 3 },
      expectedOutput: "₹11,250.00",
    },
    {
      title: "Example 3: ₹1,00,000 at 8% for 2.5 Years",
      description: "Simple interest computation with decimal tenure (30 months).",
      modeId: "simple-interest",
      inputs: { principal: 100000, annualRate: 8, timeYears: 2.5 },
      expectedOutput: "₹20,000.00",
    },
    {
      title: "Example 4: ₹50,000 at 9% for 0.5 Years (Short-Term)",
      description: "Short-term 6-month simple interest calculation demonstrating decimal tenure.",
      modeId: "simple-interest",
      inputs: { principal: 50000, annualRate: 9, timeYears: 0.5 },
      expectedOutput: "₹2,250.00",
    },
  ],
  faqs: [
    {
      question: "What is a simple interest calculator?",
      answer:
        "A simple interest calculator is a financial tool that computes the interest earned or owed on an initial principal balance over a given time duration at a fixed annual interest rate, without compounding.",
    },
    {
      question: "How do I calculate simple interest using a calculator?",
      answer:
        "Enter the initial principal amount, the annual interest rate percentage, and the time period in years. The calculator applies the formula SI = (P × R × T) ÷ 100 to instantly display the accrued simple interest and final maturity amount.",
    },
    {
      question: "What is the formula for simple interest?",
      answer:
        "The standard formula for simple interest is SI = (P × R × T) ÷ 100, where P is the Principal amount, R is the Annual Interest Rate in percent, and T is the Time period in years.",
    },
    {
      question: "What is the difference between simple interest and compound interest?",
      answer:
        "Simple interest is computed strictly on the initial principal sum throughout the duration. Compound interest calculates returns on both the principal and all accumulated interest from previous compounding periods, leading to exponential growth.",
    },
    {
      question: "Can I calculate simple interest for decimal years or months?",
      answer:
        "Yes. You can enter fractional years such as 0.5 years (6 months), 1.5 years (18 months), or 2.5 years (30 months) with full mathematical precision.",
    },
    {
      question: "How is the total maturity amount calculated?",
      answer:
        "The total maturity amount is the sum of the initial principal and the total simple interest earned: Total Amount = Principal + Simple Interest, or A = P × (1 + (R × T) ÷ 100).",
    },
    {
      question: "What happens when the interest rate is 0%?",
      answer:
        "When the interest rate is 0%, no interest is earned or owed (SI = ₹0.00), and the final total amount remains exactly equal to the starting principal amount.",
    },
  ],
  relatedCalculators: [
    {
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      category: "Finance",
      slug: "/compound-interest-calculator",
      isAvailable: true,
    },
    {
      id: "loan-calculator",
      name: "Loan Calculator",
      category: "Finance",
      slug: "/loan-calculator",
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
    title: "Simple Interest Calculator – Calculate Interest & Total Amount | YourCalculate",
    description:
      "Free online simple interest calculator to quickly calculate interest earned, total maturity amount, and growth rates on loans or deposits with transparent formulas.",
    canonicalPath: "/simple-interest-calculator",
    keywords: [
      "simple interest calculator",
      "simple interest",
      "si calculator",
      "interest calculator",
      "simple interest formula",
      "calculate simple interest",
      "interest on principal",
      "simple interest in india",
    ],
  },
};
