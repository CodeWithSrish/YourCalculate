import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatINR, formatResultNumber } from "../engine/validation";

export interface LoanPaymentResult {
  isValid: boolean;
  error?: string;
  principal?: number;
  annualRate?: number;
  tenureYears?: number;
  monthlyPayment?: number;
  totalRepayment?: number;
  totalInterest?: number;
  interestToLoanRatio?: number;
  formattedPrincipal?: string;
  formattedMonthlyPayment?: string;
  formattedTotalRepayment?: string;
  formattedTotalInterest?: string;
  formattedInterestToLoanRatio?: string;
  stepExplanation?: string;
}

export interface BorrowingCapacityResult {
  isValid: boolean;
  error?: string;
  monthlyPayment?: number;
  annualRate?: number;
  tenureYears?: number;
  maxLoanAmount?: number;
  totalRepayment?: number;
  totalInterest?: number;
  formattedMonthlyPayment?: string;
  formattedMaxLoanAmount?: string;
  formattedTotalRepayment?: string;
  formattedTotalInterest?: string;
  stepExplanation?: string;
}

export interface LoanTenureResult {
  isValid: boolean;
  error?: string;
  principal?: number;
  annualRate?: number;
  monthlyPayment?: number;
  initialMonthlyInterest?: number;
  months?: number;
  years?: number;
  formattedPrincipal?: string;
  formattedMonthlyPayment?: string;
  formattedInitialMonthlyInterest?: string;
  formattedDuration?: string;
  formattedYears?: string;
  stepExplanation?: string;
}

// ==========================================
// Mode 1: Loan Payment Calculation
// ==========================================
export function calculateLoanPayment(
  principal: number,
  annualRate: number,
  tenureYears: number
): LoanPaymentResult {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(tenureYears)
  ) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }

  if (principal <= 0) {
    return { isValid: false, error: "Loan amount must be greater than 0." };
  }

  if (annualRate < 0) {
    return { isValid: false, error: "Interest rate cannot be negative." };
  }

  if (tenureYears <= 0) {
    return { isValid: false, error: "Loan tenure must be greater than 0." };
  }

  const n = tenureYears * 12;
  const r = annualRate / (12 * 100);

  let monthlyPayment = 0;
  let totalRepayment = 0;
  let totalInterest = 0;

  if (r === 0) {
    monthlyPayment = principal / n;
    totalRepayment = principal;
    totalInterest = 0;
  } else {
    const pow = Math.pow(1 + r, n);
    monthlyPayment = (principal * r * pow) / (pow - 1);
    totalRepayment = monthlyPayment * n;
    totalInterest = totalRepayment - principal;
  }

  const interestToLoanRatio = (totalInterest / principal) * 100;

  const formattedPrincipal = formatINR(principal, true);
  const formattedMonthlyPayment = formatINR(monthlyPayment, true);
  const formattedTotalRepayment = formatINR(totalRepayment, true);
  const formattedTotalInterest = formatINR(totalInterest, true);
  const formattedInterestToLoanRatio = `${formatResultNumber(interestToLoanRatio, 2)}%`;

  const stepExplanation =
    r === 0
      ? `Loan Amount: ${formattedPrincipal}, Tenure: ${tenureYears} Years (${n} Months), Interest Rate: 0%. Monthly Payment = ${formattedPrincipal} / ${n} = ${formattedMonthlyPayment}. Total Interest = ₹0.00.`
      : `Loan Amount: ${formattedPrincipal}, Annual Rate: ${annualRate}%, Tenure: ${tenureYears} Years (${n} Months). Monthly Rate (r) = ${annualRate}% / 12 = ${formatResultNumber(r, 6)}. Formula: PMT = P × [r(1+r)^n] / [(1+r)^n - 1]. Monthly Payment = ${formattedMonthlyPayment}. Total Repayment = ${formattedMonthlyPayment} × ${n} = ${formattedTotalRepayment}. Total Interest = ${formattedTotalRepayment} − ${formattedPrincipal} = ${formattedTotalInterest} (${formattedInterestToLoanRatio} of principal).`;

  return {
    isValid: true,
    principal,
    annualRate,
    tenureYears,
    monthlyPayment,
    totalRepayment,
    totalInterest,
    interestToLoanRatio,
    formattedPrincipal,
    formattedMonthlyPayment,
    formattedTotalRepayment,
    formattedTotalInterest,
    formattedInterestToLoanRatio,
    stepExplanation,
  };
}

export function calculateLoanPaymentWrapper(
  inputs: Record<string, number | string>
): CalculationOutput {
  const principal = Number(inputs.principal);
  const annualRate = Number(inputs.annualRate);
  const tenureYears = Number(inputs.tenureYears);

  const result = calculateLoanPayment(principal, annualRate, tenureYears);

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
      label: "Total Interest",
      value: result.formattedTotalInterest || "",
    },
    {
      label: "Total Repayment",
      value: result.formattedTotalRepayment || "",
    },
    {
      label: "Interest-to-Loan Ratio",
      value: result.formattedInterestToLoanRatio || "",
    },
    {
      label: "Loan Tenure",
      value: `${result.tenureYears} ${result.tenureYears === 1 ? "Year" : "Years"} (${formatResultNumber((result.tenureYears || 0) * 12, 0)} Months)`,
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedMonthlyPayment,
    primaryLabel: "Monthly Loan Payment",
    unit: "₹",
    stepExplanation: result.stepExplanation,
    disclaimer:
      "This calculation provides mathematical estimates based on constant interest rates. Actual lender terms, taxes, and fees may vary.",
    disclaimerLabel: "Informational Notice",
    secondaryValues,
  };
}

// ==========================================
// Mode 2: How Much Can I Borrow? (Borrowing Capacity)
// ==========================================
export function calculateBorrowingCapacity(
  monthlyPayment: number,
  annualRate: number,
  tenureYears: number
): BorrowingCapacityResult {
  if (
    !Number.isFinite(monthlyPayment) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(tenureYears)
  ) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }

  if (monthlyPayment <= 0) {
    return { isValid: false, error: "Monthly payment budget must be greater than 0." };
  }

  if (annualRate < 0) {
    return { isValid: false, error: "Interest rate cannot be negative." };
  }

  if (tenureYears <= 0) {
    return { isValid: false, error: "Loan tenure must be greater than 0." };
  }

  const n = tenureYears * 12;
  const r = annualRate / (12 * 100);

  let maxLoanAmount = 0;
  const totalRepayment = monthlyPayment * n;
  let totalInterest = 0;

  if (r === 0) {
    maxLoanAmount = totalRepayment;
    totalInterest = 0;
  } else {
    const pow = Math.pow(1 + r, n);
    maxLoanAmount = (monthlyPayment * (pow - 1)) / (r * pow);
    totalInterest = totalRepayment - maxLoanAmount;
  }

  const formattedMonthlyPayment = formatINR(monthlyPayment, true);
  const formattedMaxLoanAmount = formatINR(maxLoanAmount, true);
  const formattedTotalRepayment = formatINR(totalRepayment, true);
  const formattedTotalInterest = formatINR(totalInterest, true);

  const stepExplanation =
    r === 0
      ? `Monthly Budget: ${formattedMonthlyPayment}, Tenure: ${tenureYears} Years (${n} Months), Interest Rate: 0%. Maximum Loan Amount = ${formattedMonthlyPayment} × ${n} = ${formattedMaxLoanAmount}. Total Interest = ₹0.00.`
      : `Monthly Budget: ${formattedMonthlyPayment}, Annual Rate: ${annualRate}%, Tenure: ${tenureYears} Years (${n} Months). Monthly Rate (r) = ${formatResultNumber(r, 6)}. Formula: P = PMT × [(1+r)^n - 1] / [r(1+r)^n]. Maximum Loan Amount = ${formattedMaxLoanAmount}. Total Repayment (${n} × ${formattedMonthlyPayment}) = ${formattedTotalRepayment}. Total Interest Paid = ${formattedTotalRepayment} − ${formattedMaxLoanAmount} = ${formattedTotalInterest}.`;

  return {
    isValid: true,
    monthlyPayment,
    annualRate,
    tenureYears,
    maxLoanAmount,
    totalRepayment,
    totalInterest,
    formattedMonthlyPayment,
    formattedMaxLoanAmount,
    formattedTotalRepayment,
    formattedTotalInterest,
    stepExplanation,
  };
}

export function calculateBorrowingCapacityWrapper(
  inputs: Record<string, number | string>
): CalculationOutput {
  const monthlyPayment = Number(inputs.monthlyPayment);
  const annualRate = Number(inputs.annualRate);
  const tenureYears = Number(inputs.tenureYears);

  const result = calculateBorrowingCapacity(monthlyPayment, annualRate, tenureYears);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Monthly Budget",
      value: result.formattedMonthlyPayment || "",
    },
    {
      label: "Total Repayment",
      value: result.formattedTotalRepayment || "",
    },
    {
      label: "Total Interest",
      value: result.formattedTotalInterest || "",
    },
    {
      label: "Loan Tenure",
      value: `${result.tenureYears} ${result.tenureYears === 1 ? "Year" : "Years"} (${formatResultNumber((result.tenureYears || 0) * 12, 0)} Months)`,
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedMaxLoanAmount,
    primaryLabel: "Maximum Loan Amount",
    unit: "₹",
    stepExplanation: result.stepExplanation,
    disclaimer:
      "This indicates theoretical maximum borrowing power based on installment math. Lenders also evaluate debt-to-income ratios, credit scores, and eligibility norms.",
    disclaimerLabel: "Informational Notice",
    secondaryValues,
  };
}

// ==========================================
// Mode 3: Loan Tenure Calculation
// ==========================================
export function calculateLoanTenure(
  principal: number,
  annualRate: number,
  monthlyPayment: number
): LoanTenureResult {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(monthlyPayment)
  ) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }

  if (principal <= 0) {
    return { isValid: false, error: "Loan amount must be greater than 0." };
  }

  if (annualRate < 0) {
    return { isValid: false, error: "Interest rate cannot be negative." };
  }

  if (monthlyPayment <= 0) {
    return { isValid: false, error: "Monthly payment must be greater than 0." };
  }

  const r = annualRate / (12 * 100);
  const initialMonthlyInterest = principal * r;
  const formattedInitialMonthlyInterest = formatINR(initialMonthlyInterest, true);
  const formattedPrincipal = formatINR(principal, true);
  const formattedMonthlyPayment = formatINR(monthlyPayment, true);

  if (annualRate > 0 && monthlyPayment <= initialMonthlyInterest) {
    return {
      isValid: false,
      error: `Monthly payment must be greater than ${formattedInitialMonthlyInterest} to cover initial monthly interest and reduce the loan principal.`,
    };
  }

  let months = 0;
  if (r === 0) {
    months = principal / monthlyPayment;
  } else {
    const numerator = -Math.log(1 - (principal * r) / monthlyPayment);
    const denominator = Math.log(1 + r);
    months = numerator / denominator;
  }

  const years = months / 12;

  const formattedDuration = `${formatResultNumber(months, 2)} Months`;
  const formattedYears = `${formatResultNumber(years, 2)} ${years === 1 ? "Year" : "Years"}`;

  const stepExplanation =
    r === 0
      ? `Loan Amount: ${formattedPrincipal}, Monthly Payment: ${formattedMonthlyPayment}, Interest Rate: 0%. Duration = ${formattedPrincipal} / ${formattedMonthlyPayment} = ${formatResultNumber(months, 2)} Months (${formattedYears}).`
      : `Loan Amount: ${formattedPrincipal}, Annual Rate: ${annualRate}%, Monthly Payment: ${formattedMonthlyPayment}. Initial Monthly Interest = ${formattedPrincipal} × (${annualRate}% / 12) = ${formattedInitialMonthlyInterest}. Formula: n = -ln(1 - P × r / PMT) / ln(1 + r). Payoff Duration = ${formatResultNumber(months, 2)} Months (${formattedYears}).`;

  return {
    isValid: true,
    principal,
    annualRate,
    monthlyPayment,
    initialMonthlyInterest,
    months,
    years,
    formattedPrincipal,
    formattedMonthlyPayment,
    formattedInitialMonthlyInterest,
    formattedDuration,
    formattedYears,
    stepExplanation,
  };
}

export function calculateLoanTenureWrapper(
  inputs: Record<string, number | string>
): CalculationOutput {
  const principal = Number(inputs.principal);
  const annualRate = Number(inputs.annualRate);
  const monthlyPayment = Number(inputs.monthlyPayment);

  const result = calculateLoanTenure(principal, annualRate, monthlyPayment);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Loan Amount",
      value: result.formattedPrincipal || "",
    },
    {
      label: "Monthly Payment",
      value: result.formattedMonthlyPayment || "",
    },
    {
      label: "Initial Monthly Interest",
      value: result.formattedInitialMonthlyInterest || "",
    },
    {
      label: "Approximate Years",
      value: result.formattedYears || "",
    },
  ];

  return {
    isValid: true,
    primaryValue: `${result.formattedDuration} (~${result.formattedYears})`,
    primaryLabel: "Payoff Duration",
    unit: "",
    stepExplanation: result.stepExplanation,
    disclaimer:
      "Assumes a constant fixed interest rate and steady monthly payments without prepayment penalties or changing interest cycles.",
    disclaimerLabel: "Informational Notice",
    secondaryValues,
  };
}

// ==========================================
// Canonical Calculator Definition
// ==========================================
export const loanCalculatorDefinition: CalculatorDefinition = {
  id: "loan-calculator",
  slug: "loan-calculator",
  name: "Loan Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription:
    "Calculate monthly loan payments, determine maximum borrowing capacity, or find out how long it takes to pay off debt.",
  longDescription:
    "A comprehensive, deterministic 3-mode loan decision calculator. Calculate exact monthly repayments, estimate maximum affordable loan principal from your monthly budget, or compute the exact time required to clear a loan.",
  icon: "🏦",
  searchKeywords: [
    "loan",
    "loan calculator",
    "loan payment calculator",
    "monthly loan payment",
    "how much can i borrow",
    "borrowing capacity",
    "borrowing power",
    "loan tenure calculator",
    "loan payoff calculator",
    "personal loan calculator",
    "home loan calculator",
    "car loan calculator",
    "loan interest calculator",
    "loan repayment",
  ],
  defaultModeId: "loan-payment",
  modes: [
    {
      id: "loan-payment",
      name: "Loan Payment",
      description:
        "Calculate your monthly installment, total interest, and total repayment for a given loan amount.",
      formulaText: "PMT = P × [r(1+r)^n] / [(1+r)^n - 1]",
      inputs: [
        {
          id: "principal",
          label: "Loan Amount",
          type: "number",
          placeholder: "e.g. 1000000",
          defaultValue: 1000000,
          min: 1,
          step: 10000,
          prefix: "₹",
          helperText: "Total principal amount you wish to borrow.",
        },
        {
          id: "annualRate",
          label: "Annual Interest Rate",
          type: "number",
          placeholder: "e.g. 9.5",
          defaultValue: 9.5,
          min: 0,
          step: 0.1,
          suffix: "%",
          helperText: "Annual lending interest rate (e.g., 8.5% or 9.5%).",
        },
        {
          id: "tenureYears",
          label: "Loan Tenure (Years)",
          type: "number",
          placeholder: "e.g. 5",
          defaultValue: 5,
          min: 0.1,
          step: 0.5,
          suffix: "Yrs",
          helperText: "Repayment duration in years (e.g., 5 or 20).",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateLoanPaymentWrapper(inputs),
    },
    {
      id: "borrowing-capacity",
      name: "How Much Can I Borrow?",
      description:
        "Estimate the maximum loan principal you can qualify for based on your monthly repayment budget.",
      formulaText: "P = PMT × [(1+r)^n - 1] / [r(1+r)^n]",
      inputs: [
        {
          id: "monthlyPayment",
          label: "Monthly Repayment Budget",
          type: "number",
          placeholder: "e.g. 25000",
          defaultValue: 25000,
          min: 1,
          step: 1000,
          prefix: "₹",
          helperText: "Maximum amount you can comfortably pay every month.",
        },
        {
          id: "annualRate",
          label: "Annual Interest Rate",
          type: "number",
          placeholder: "e.g. 9.0",
          defaultValue: 9.0,
          min: 0,
          step: 0.1,
          suffix: "%",
          helperText: "Expected annual loan interest rate.",
        },
        {
          id: "tenureYears",
          label: "Loan Tenure (Years)",
          type: "number",
          placeholder: "e.g. 15",
          defaultValue: 15,
          min: 0.1,
          step: 0.5,
          suffix: "Yrs",
          helperText: "Desired loan tenure in years.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateBorrowingCapacityWrapper(inputs),
    },
    {
      id: "loan-tenure",
      name: "Loan Tenure",
      description:
        "Determine the exact number of months and years needed to pay off a loan given a fixed monthly payment.",
      formulaText: "n = -ln(1 - P × r / PMT) / ln(1+r)",
      inputs: [
        {
          id: "principal",
          label: "Loan Amount",
          type: "number",
          placeholder: "e.g. 500000",
          defaultValue: 500000,
          min: 1,
          step: 10000,
          prefix: "₹",
          helperText: "Current outstanding loan balance or target borrow amount.",
        },
        {
          id: "annualRate",
          label: "Annual Interest Rate",
          type: "number",
          placeholder: "e.g. 10.0",
          defaultValue: 10.0,
          min: 0,
          step: 0.1,
          suffix: "%",
          helperText: "Annual interest rate on the loan.",
        },
        {
          id: "monthlyPayment",
          label: "Monthly Payment",
          type: "number",
          placeholder: "e.g. 15000",
          defaultValue: 15000,
          min: 1,
          step: 500,
          prefix: "₹",
          helperText: "Fixed monthly amount you intend to pay toward the loan.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateLoanTenureWrapper(inputs),
    },
  ],
  formulas: [
    {
      modeId: "loan-payment",
      title: "1. Monthly Loan Payment Formula",
      formulaMath: "\\text{PMT} = P \\times \\frac{r(1 + r)^n}{(1 + r)^n - 1}",
      explanation:
        "Calculates the fixed monthly installment required to fully amortize loan principal P at monthly interest rate r over n total monthly periods.",
      example:
        "₹10,00,000 at 9.5% for 5 years: r = 0.095 / 12, n = 60. PMT = ₹21,001.86/month.",
      whenToUse:
        "Use when you know your loan amount, interest rate, and target tenure, and need to find the monthly repayment.",
    },
    {
      modeId: "borrowing-capacity",
      title: "2. Maximum Borrowing Capacity Formula",
      formulaMath: "P = \\text{PMT} \\times \\frac{(1 + r)^n - 1}{r(1 + r)^n}",
      explanation:
        "Calculates the maximum loan principal you can borrow given a target monthly budget PMT, periodic monthly interest rate r, and tenure n.",
      example:
        "₹25,000 monthly budget at 9% for 15 years yields a maximum loan of ₹24,64,835.22.",
      whenToUse:
        "Use to determine how much loan you can afford based on your monthly disposable income or salary.",
    },
    {
      modeId: "loan-tenure",
      title: "3. Loan Payoff Duration Formula",
      formulaMath: "n = \\frac{-\\ln(1 - P \\times r / \\text{PMT})}{\\ln(1 + r)}",
      explanation:
        "Determines the total number of monthly payments required to extinguish loan principal P when paying fixed installment PMT at monthly interest rate r.",
      example:
        "₹5,00,000 at 10% paying ₹15,000/month takes approximately 39.21 months (~3.27 years).",
      whenToUse:
        "Use when you want to accelerate debt payoff and find out how fast a fixed monthly payment will clear your loan.",
    },
    {
      modeId: "loan-interest",
      title: "4. Total Financing Interest Formula",
      formulaMath: "\\text{Total Interest} = (\\text{PMT} \\times n) - P",
      explanation:
        "Calculates the net financing charge paid to the lender across the entire loan lifespan.",
      example:
        "Total Repayment of ₹12,60,111.68 − Principal ₹10,00,000.00 = Total Interest of ₹2,60,111.68.",
      whenToUse:
        "Use to evaluate the total financing cost and compare different loan tenure options.",
    },
  ],
  examples: [
    {
      title: "Example 1: ₹10,00,000 Loan at 9.5% for 5 Years",
      description: "Standard personal or vehicle loan payment calculation.",
      modeId: "loan-payment",
      inputs: { principal: 1000000, annualRate: 9.5, tenureYears: 5 },
      expectedOutput: "₹21,001.86",
    },
    {
      title: "Example 2: ₹50,00,000 Home Loan at 8.5% for 20 Years",
      description: "Long-term home loan repayment with 240 monthly installments.",
      modeId: "loan-payment",
      inputs: { principal: 5000000, annualRate: 8.5, tenureYears: 20 },
      expectedOutput: "₹43,391.16",
    },
    {
      title: "Example 3: ₹25,000 Monthly Budget at 9% for 15 Years",
      description: "Calculating maximum borrowing capacity from a monthly budget.",
      modeId: "borrowing-capacity",
      inputs: { monthlyPayment: 25000, annualRate: 9.0, tenureYears: 15 },
      expectedOutput: "₹24,64,835.22",
    },
    {
      title: "Example 4: ₹5,00,000 Loan at 10% Paying ₹15,000/Month",
      description: "Calculating payoff duration with accelerated monthly payments.",
      modeId: "loan-tenure",
      inputs: { principal: 500000, annualRate: 10.0, monthlyPayment: 15000 },
      expectedOutput: "39.21 Months (~3.27 Years)",
    },
  ],
  faqs: [
    {
      question: "How is a Loan Calculator different from an EMI Calculator?",
      answer:
        "While both calculate loan installments, our Loan Calculator offers three distinct modes: calculating monthly payments, reverse-calculating maximum borrowing capacity from your monthly budget, and finding payoff duration. Our EMI Calculator specifically focuses on month-by-month amortization schedules.",
    },
    {
      question: "How does the loan payment formula work?",
      answer:
        "Monthly payments are calculated using the reducing balance method: PMT = P × [r(1+r)^n] / [(1+r)^n - 1], where P is the principal, r is the monthly interest rate (annual rate / 12 / 100), and n is the total number of monthly payments.",
    },
    {
      question: "What is borrowing capacity and how is it calculated?",
      answer:
        "Borrowing capacity represents the maximum loan principal a lender will extend based on your monthly repayment budget. It calculates the present value of all future monthly installments at the given interest rate.",
    },
    {
      question: "Why must my monthly payment exceed initial monthly interest in Mode 3?",
      answer:
        "If your monthly payment is less than or equal to the initial monthly interest charge, the principal balance will never decrease (a condition known as negative amortization). Your payment must exceed the monthly interest to reduce the loan balance over time.",
    },
    {
      question: "How does increasing my monthly payment shorten loan tenure?",
      answer:
        "Every rupee paid above the monthly interest directly reduces the principal balance. Because subsequent interest is calculated on a lower balance, a larger share of future payments goes toward principal, drastically shortening payoff duration.",
    },
    {
      question: "Does this calculator account for processing fees and taxes?",
      answer:
        "This tool performs pure mathematical interest and principal calculations. Bank processing fees, documentation charges, and GST on financial services are determined by individual lending institutions.",
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
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      category: "Finance",
      slug: "/compound-interest-calculator",
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
      "Loan Calculator — Calculate Monthly Payments, Borrowing Capacity & Payoff | YourCalculate",
    description:
      "Free online loan calculator to compute monthly loan payments, calculate maximum borrowing capacity, and determine exact debt payoff timelines with full mathematical transparency.",
    canonicalPath: "/loan-calculator",
    keywords: [
      "loan calculator",
      "loan payment calculator",
      "borrowing capacity calculator",
      "how much can i borrow",
      "loan tenure calculator",
      "loan payoff calculator",
      "personal loan calculator",
      "home loan calculator",
    ],
  },
};
