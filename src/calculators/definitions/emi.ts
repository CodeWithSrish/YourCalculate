import {
  CalculatorDefinition,
  CalculationOutput,
  AmortizationRow,
} from "../engine/types";
import { formatINR } from "../engine/validation";

export function calculateEMI(inputs: Record<string, number>): CalculationOutput {
  const principal = inputs.principal;
  const annualRate = inputs.annualRate;
  const tenureYears = inputs.tenureYears;

  if (principal === undefined || !Number.isFinite(principal)) {
    return { isValid: false, error: "Enter a valid loan amount." };
  }
  if (principal <= 0) {
    return { isValid: false, error: "Loan amount must be greater than 0." };
  }

  if (annualRate === undefined || !Number.isFinite(annualRate)) {
    return { isValid: false, error: "Enter a valid interest rate." };
  }
  if (annualRate < 0) {
    return { isValid: false, error: "Interest rate cannot be negative." };
  }

  if (tenureYears === undefined || !Number.isFinite(tenureYears)) {
    return { isValid: false, error: "Enter a valid loan tenure." };
  }
  if (tenureYears <= 0) {
    return { isValid: false, error: "Loan tenure must be greater than 0." };
  }

  const n = Math.round(tenureYears * 12);
  if (n <= 0) {
    return { isValid: false, error: "Loan tenure must be at least 1 month." };
  }

  const r = annualRate / 12 / 100;

  let emi = 0;
  let totalRepayment = 0;
  let totalInterest = 0;

  if (r === 0) {
    emi = principal / n;
    totalRepayment = principal;
    totalInterest = 0;
  } else {
    const pow = Math.pow(1 + r, n);
    emi = (principal * r * pow) / (pow - 1);
    totalRepayment = emi * n;
    totalInterest = totalRepayment - principal;
  }

  // Generate complete amortization schedule
  const schedule: AmortizationRow[] = [];
  let remainingBalance = principal;
  let cumulativeInterest = 0;

  for (let month = 1; month <= n; month++) {
    const interestComponent = r === 0 ? 0 : remainingBalance * r;
    let principalComponent = emi - interestComponent;

    // Handle last month and floating-point residue
    if (month === n || principalComponent > remainingBalance) {
      principalComponent = remainingBalance;
      remainingBalance = 0;
    } else {
      remainingBalance -= principalComponent;
    }

    // Clamp small floating residues to 0
    if (Math.abs(remainingBalance) < 0.0001) {
      remainingBalance = 0;
    }

    cumulativeInterest += interestComponent;

    schedule.push({
      paymentNumber: month,
      emi,
      principal: principalComponent,
      interest: interestComponent,
      balance: remainingBalance,
      formattedEmi: formatINR(emi, true),
      formattedPrincipal: formatINR(principalComponent, true),
      formattedInterest: formatINR(interestComponent, true),
      formattedBalance: formatINR(remainingBalance, true),
    });
  }

  totalInterest = r === 0 ? 0 : cumulativeInterest;
  totalRepayment = principal + totalInterest;

  const stepText =
    r === 0
      ? `EMI = ${formatINR(principal)} ÷ ${n} months = ${formatINR(emi, true)}`
      : `(${formatINR(principal)} × ${(r * 100).toFixed(4)}% × (1 + ${(r * 100).toFixed(4)}%)^${n}) ÷ ((1 + ${(r * 100).toFixed(4)}%)^${n} − 1) = ${formatINR(emi, true)}`;

  return {
    isValid: true,
    primaryValue: formatINR(emi, true),
    primaryLabel: "Monthly Equated Installment (EMI)",
    unit: "₹",
    stepExplanation: stepText,
    secondaryValues: [
      { label: "Principal Loan Amount", value: formatINR(principal) },
      { label: "Total Interest Payable", value: formatINR(totalInterest, true) },
      { label: "Total Amount Payable", value: formatINR(totalRepayment, true) },
      { label: "Total Payments", value: `${n} Months (${tenureYears} Years)` },
    ],
    amortizationSchedule: schedule,
  };
}

export const emiCalculatorDefinition: CalculatorDefinition = {
  id: "emi-calculator",
  slug: "emi-calculator",
  name: "EMI Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription: "Calculate monthly EMI, total interest payable, and complete amortization schedule for loans.",
  longDescription: "A pure, deterministic financial utility to calculate Equated Monthly Installments (EMI) for home loans, car loans, and personal loans with complete repayment schedules.",
  icon: "₹",
  searchKeywords: [
    "emi",
    "loan",
    "home loan",
    "car loan",
    "personal loan",
    "loan calculator",
    "monthly installment",
    "interest rate",
    "amortization",
    "housing loan",
    "mortgage",
    "repayment",
    "calculate emi",
  ],
  defaultModeId: "standard-emi",
  modes: [
    {
      id: "standard-emi",
      name: "Loan EMI",
      description: "Compute fixed monthly repayment amounts, cumulative interest, and month-by-month loan balances.",
      formulaText: "EMI = (P × r × (1+r)^n) ÷ ((1+r)^n − 1)",
      inputs: [
        {
          id: "principal",
          label: "Loan Amount",
          type: "currency",
          defaultValue: 5000000,
          prefix: "₹",
          placeholder: "e.g. 50,00,000",
          min: 1,
          step: 10000,
        },
        {
          id: "annualRate",
          label: "Interest Rate (p.a.)",
          type: "percentage",
          defaultValue: 8.5,
          suffix: "%",
          placeholder: "e.g. 8.5",
          min: 0,
          step: 0.1,
        },
        {
          id: "tenureYears",
          label: "Loan Tenure",
          type: "number",
          defaultValue: 20,
          suffix: "Years",
          placeholder: "e.g. 20",
          min: 1,
          step: 1,
        },
      ],
      calculate: calculateEMI,
    },
  ],
  formulas: [
    {
      modeId: "standard-emi",
      title: "How EMI Is Calculated",
      formulaMath: "\\text{EMI} = \\frac{P \\times r \\times (1 + r)^n}{(1 + r)^n - 1}",
      explanation: "P is the Principal loan amount, r is the monthly interest rate (Annual Rate ÷ 12 ÷ 100), and n is the total number of monthly installments (Tenure in Years × 12). For zero-interest loans, EMI = P ÷ n.",
      example: "₹50,00,000 at 8.5% for 20 years (240 months): r = 8.5 ÷ 1200 ≈ 0.007083, EMI = ₹43,391.16.",
      whenToUse: "Use to evaluate monthly affordability, budget planning, loan comparisons, and interest obligations before borrowing.",
    },
  ],
  examples: [
    {
      title: "Example 1: ₹50 Lakh Home Loan (8.5% for 20 Years)",
      description: "Standard long-term home mortgage with monthly reducing balance calculation.",
      modeId: "standard-emi",
      inputs: { principal: 5000000, annualRate: 8.5, tenureYears: 20 },
      expectedOutput: "₹43,391.16 / month",
    },
    {
      title: "Example 2: ₹8 Lakh Vehicle Loan (9% for 5 Years)",
      description: "Medium-term car or auto loan financing with fixed monthly installments.",
      modeId: "standard-emi",
      inputs: { principal: 800000, annualRate: 9, tenureYears: 5 },
      expectedOutput: "₹16,606.59 / month",
    },
    {
      title: "Example 3: ₹10 Lakh Personal Loan (10% for 5 Years)",
      description: "Standard personal loan financing with equal monthly installments.",
      modeId: "standard-emi",
      inputs: { principal: 1000000, annualRate: 10, tenureYears: 5 },
      expectedOutput: "₹21,247.04 / month",
    },
    {
      title: "Example 4: ₹5 Lakh 0% Interest Loan (5 Years)",
      description: "Zero-cost promotional financing with equal monthly principal distribution.",
      modeId: "standard-emi",
      inputs: { principal: 500000, annualRate: 0, tenureYears: 5 },
      expectedOutput: "₹8,333.33 / month",
    },
  ],
  faqs: [
    {
      question: "How do I calculate EMI using a calculator?",
      answer: "To calculate EMI on this calculator, enter the principal loan amount, the annual interest rate percentage, and the loan tenure in years. The calculator immediately computes your monthly payment, total interest payable, total repayment amount, and a month-by-month amortization schedule.",
    },
    {
      question: "What is an EMI calculator?",
      answer: "An EMI calculator is a financial tool that computes the Equated Monthly Installment (EMI) required to repay a loan over a specified period, breaking down each payment into principal repayment and interest charges.",
    },
    {
      question: "How is EMI calculated?",
      answer: "EMI is calculated using the reducing-balance amortization formula: EMI = [P × r × (1+r)^n] ÷ [(1+r)^n − 1], where P is the principal loan amount, r is the monthly interest rate (Annual Rate ÷ 1200), and n is the total number of monthly installments (Tenure in Years × 12).",
    },
    {
      question: "What factors affect EMI?",
      answer: "EMI depends on three primary variables: the principal loan amount (higher principal raises EMI), the annual interest rate (higher rates increase monthly interest charges), and the loan tenure (longer tenure lowers monthly EMI but increases total interest paid over time).",
    },
    {
      question: "What is the difference between reducing-balance and flat-interest EMI?",
      answer: "In a reducing-balance method (used by this calculator and standard institutional loans), interest is calculated each month only on the remaining outstanding principal, meaning the interest component decreases over time as the principal is repaid. In a flat-interest method, interest is calculated on the entire original principal for the full loan tenure. Consequently, two loans with the same nominal interest rate can result in significantly different monthly EMI and total interest amounts depending on whether reducing-balance or flat-interest calculation is applied.",
    },
    {
      question: "How is monthly interest calculated from an annual interest rate?",
      answer: "The annual interest rate is divided by 12 (months in a year) and then divided by 100 to convert the percentage into a monthly decimal fraction: r = Annual Rate ÷ 1200.",
    },
    {
      question: "What happens if the interest rate is 0%?",
      answer: "At 0% interest, no interest charges accrue. The total principal is simply divided equally across the number of monthly payments: EMI = Principal ÷ Months.",
    },
    {
      question: "How is total interest calculated?",
      answer: "Total Interest is calculated by multiplying the monthly EMI by the total number of installments and subtracting the original principal: Total Interest = (EMI × n) − Principal.",
    },
  ],
  relatedCalculators: [
    {
      id: "loan-calculator",
      name: "Loan Calculator",
      category: "Finance",
      slug: "/loan-calculator",
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
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      category: "Finance",
      slug: "/compound-interest-calculator",
      isAvailable: true,
    },
    {
      id: "simple-interest-calculator",
      name: "Simple Interest Calculator",
      category: "Finance",
      slug: "/simple-interest-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "EMI Calculator - Calculate Home Loan, Car Loan & Personal Loan EMI | YourCalculate",
    description: "Free EMI calculator to calculate your monthly loan installment, total interest payable, and amortization schedule for home, car, and personal loans.",
    canonicalPath: "/emi-calculator",
    keywords: ["emi calculator", "home loan emi calculator", "car loan emi", "personal loan emi", "loan repayment schedule", "amortization calculator"],
  },
};
