import {
  CalculatorDefinition,
  CalculationOutput,
  SIPGrowthRow,
} from "../engine/types";
import { formatINR } from "../engine/validation";

export function calculateSIP(inputs: Record<string, number>): CalculationOutput {
  const monthlyInvestment = inputs.monthlyInvestment;
  const annualRate = inputs.annualRate;
  const durationYears = inputs.durationYears;

  if (monthlyInvestment === undefined || !Number.isFinite(monthlyInvestment)) {
    return { isValid: false, error: "Enter a valid monthly investment." };
  }
  if (monthlyInvestment <= 0) {
    return { isValid: false, error: "Monthly investment must be greater than 0." };
  }

  if (annualRate === undefined || !Number.isFinite(annualRate)) {
    return { isValid: false, error: "Enter a valid expected return rate." };
  }
  if (annualRate < 0) {
    return { isValid: false, error: "Expected return rate cannot be negative." };
  }

  if (durationYears === undefined || !Number.isFinite(durationYears)) {
    return { isValid: false, error: "Enter a valid investment duration." };
  }
  if (durationYears <= 0) {
    return { isValid: false, error: "Investment duration must be greater than 0." };
  }

  const n = Math.round(durationYears * 12);
  if (n <= 0) {
    return { isValid: false, error: "Investment duration must be at least 1 month." };
  }

  const r = annualRate / 12 / 100;

  let futureValue = 0;
  const totalInvested = monthlyInvestment * n;
  let estimatedReturns = 0;

  if (r === 0) {
    futureValue = totalInvested;
    estimatedReturns = 0;
  } else {
    const compoundFactor = Math.pow(1 + r, n);
    futureValue = monthlyInvestment * ((compoundFactor - 1) / r) * (1 + r);
    estimatedReturns = futureValue - totalInvested;
  }

  // Generate Year-by-Year Growth Schedule
  const growthSchedule: SIPGrowthRow[] = [];
  const fullYears = Math.floor(durationYears);

  for (let year = 1; year <= fullYears; year++) {
    const monthsPassed = year * 12;
    const yearInvested = monthlyInvestment * monthsPassed;
    let yearFV = 0;

    if (r === 0) {
      yearFV = yearInvested;
    } else {
      const yearFactor = Math.pow(1 + r, monthsPassed);
      yearFV = monthlyInvestment * ((yearFactor - 1) / r) * (1 + r);
    }

    const yearReturns = yearFV - yearInvested;

    growthSchedule.push({
      year,
      yearLabel: `Year ${year}`,
      monthlyInvestment,
      amountInvested: yearInvested,
      estimatedReturns: yearReturns,
      totalValue: yearFV,
      formattedMonthlyInvestment: formatINR(monthlyInvestment, true),
      formattedAmountInvested: formatINR(yearInvested, true),
      formattedEstimatedReturns: formatINR(yearReturns, true),
      formattedTotalValue: formatINR(yearFV, true),
    });
  }

  // If fractional duration exists (e.g., 3.5 years), append final partial year
  if (durationYears > fullYears && fullYears > 0) {
    growthSchedule.push({
      year: durationYears,
      yearLabel: `Year ${durationYears}`,
      monthlyInvestment,
      amountInvested: totalInvested,
      estimatedReturns,
      totalValue: futureValue,
      formattedMonthlyInvestment: formatINR(monthlyInvestment, true),
      formattedAmountInvested: formatINR(totalInvested, true),
      formattedEstimatedReturns: formatINR(estimatedReturns, true),
      formattedTotalValue: formatINR(futureValue, true),
    });
  }

  const stepText =
    r === 0
      ? `FV = ${formatINR(monthlyInvestment)} × ${n} months = ${formatINR(futureValue, true)}`
      : `FV = ${formatINR(monthlyInvestment)} × [((1 + ${(r * 100).toFixed(4)}%)^${n} − 1) ÷ ${(r * 100).toFixed(4)}%] × (1 + ${(r * 100).toFixed(4)}%) = ${formatINR(futureValue, true)}`;

  return {
    isValid: true,
    primaryValue: formatINR(futureValue, true),
    primaryLabel: `Estimated Future Value (after ${durationYears} years)`,
    unit: "₹",
    stepExplanation: stepText,
    secondaryValues: [
      { label: "Total Invested Amount", value: formatINR(totalInvested, true) },
      { label: "Estimated Returns (Wealth Gain)", value: formatINR(estimatedReturns, true) },
      { label: "Monthly Investment", value: formatINR(monthlyInvestment, true) },
      { label: "Assumed Annual Return", value: `${annualRate}% p.a.` },
      { label: "Investment Duration", value: `${durationYears} Years (${n} Months)` },
    ],
    sipGrowthSchedule: growthSchedule,
  };
}

export const sipCalculatorDefinition: CalculatorDefinition = {
  id: "sip-calculator",
  slug: "sip-calculator",
  name: "SIP Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription: "Calculate potential future wealth, total investment, and compounding returns from regular monthly SIP investments.",
  longDescription: "A pure, deterministic financial projection tool to estimate maturity wealth and compounding returns for Systematic Investment Plans (SIP) in mutual funds, index funds, and equity portfolios.",
  icon: "📈",
  searchKeywords: [
    "sip",
    "sip calculator",
    "systematic investment plan",
    "mutual fund",
    "investment",
    "wealth growth",
    "compound interest",
    "compounding",
    "returns",
    "maturity value",
    "monthly investment",
    "calculate sip",
  ],
  defaultModeId: "standard-sip",
  modes: [
    {
      id: "standard-sip",
      name: "Monthly SIP",
      description: "Project future investment value, total capital contributed, and compounded wealth gains.",
      formulaText: "FV = P × [((1 + r)^n − 1) ÷ r] × (1 + r)",
      inputs: [
        {
          id: "monthlyInvestment",
          label: "Monthly Investment",
          type: "currency",
          defaultValue: 10000,
          prefix: "₹",
          placeholder: "e.g. 10,000",
          min: 1,
          step: 500,
        },
        {
          id: "annualRate",
          label: "Expected Annual Return (p.a.)",
          type: "percentage",
          defaultValue: 12,
          suffix: "%",
          placeholder: "e.g. 12",
          min: 0,
          step: 0.5,
        },
        {
          id: "durationYears",
          label: "Investment Duration",
          type: "number",
          defaultValue: 10,
          suffix: "Years",
          placeholder: "e.g. 10",
          min: 0.1,
          step: 1,
        },
      ],
      calculate: calculateSIP,
    },
  ],
  formulas: [
    {
      modeId: "standard-sip",
      title: "How SIP Returns Are Calculated",
      formulaMath: "\\text{FV} = P \\times \\left[ \\frac{(1 + r)^n - 1}{r} \\right] \\times (1 + r)",
      explanation: "P is your monthly installment, r is the periodic monthly return rate (Annual Return Rate ÷ 12 ÷ 100), and n is the total number of monthly contributions (Years × 12). Monthly SIP contributions are assumed to be made at the beginning of each month, with the multiplying factor (1 + r) accounting for each installment compounding from its deposit date. For zero expected return, FV = P × n.",
      example: "₹10,000/month at 12% p.a. for 10 years (120 months): r = 0.01, FV = ₹23,23,390.76. Total Invested = ₹12,00,000, Estimated Returns = ₹11,23,390.76.",
      whenToUse: "Use to plan long-term financial goals, retirement funds, education corpus, and wealth accumulation via periodic disciplined investing.",
    },
  ],
  examples: [
    {
      title: "Example 1: ₹10,000/Month at 12% Return for 10 Years",
      description: "Standard long-term equity SIP compounding over a decade with beginning-of-month deposits.",
      modeId: "standard-sip",
      inputs: { monthlyInvestment: 10000, annualRate: 12, durationYears: 10 },
      expectedOutput: "₹23,23,390.76 Future Value",
    },
    {
      title: "Example 2: ₹5,000/Month at 10% Return for 5 Years",
      description: "Medium-term conservative growth portfolio with periodic beginning-of-month savings.",
      modeId: "standard-sip",
      inputs: { monthlyInvestment: 5000, annualRate: 10, durationYears: 5 },
      expectedOutput: "₹3,90,411.91 Future Value",
    },
    {
      title: "Example 3: ₹5,000/Month at 0% Return for 5 Years",
      description: "Capital preservation baseline without compounding interest.",
      modeId: "standard-sip",
      inputs: { monthlyInvestment: 5000, annualRate: 0, durationYears: 5 },
      expectedOutput: "₹3,00,000.00 Future Value",
    },
  ],
  faqs: [
    {
      question: "What is a SIP?",
      answer: "A Systematic Investment Plan (SIP) is an investment vehicle offered by mutual funds allowing investors to invest a fixed amount regularly (typically monthly) into a chosen scheme, fostering financial discipline and rupee cost averaging.",
    },
    {
      question: "How is SIP future value calculated?",
      answer: "SIP future value is calculated using the compound interest annuity due formula: FV = P × [((1 + r)^n − 1) ÷ r] × (1 + r), where P is monthly investment, r is the monthly rate of return, and n is the total number of monthly installments. Monthly SIP contributions are assumed to be made at the beginning of each month.",
    },
    {
      question: "What is the difference between total invested and estimated returns?",
      answer: "Total invested is the actual cumulative capital contributed from your pocket (Monthly Investment × Months). Estimated returns represent the compounded wealth gain generated on top of your invested capital over the investment horizon.",
    },
    {
      question: "Does SIP guarantee returns?",
      answer: "No. Mutual fund and equity SIP investments are subject to market risks. The return rate entered in the calculator is an assumed average rate for projection purposes, and actual market outcomes can fluctuate.",
    },
    {
      question: "What happens if the expected return is 0%?",
      answer: "At 0% annual return, no compounding or interest is earned. Your future value equals exactly the total amount invested across all monthly payments (P × n), with zero wealth gain.",
    },
    {
      question: "Can I use a decimal investment amount?",
      answer: "Yes. The calculator fully supports decimal values for monthly investment (e.g. ₹2,500.50), expected return rate (e.g. 11.5%), and duration (e.g. 3.5 years).",
    },
    {
      question: "Can I change the SIP amount later?",
      answer: "In real-world mutual funds, you can increase your SIP periodically through step-up SIP features or by starting additional SIPs. This calculator computes projections based on a steady fixed monthly installment.",
    },
    {
      question: "How does investment duration affect compounding?",
      answer: "Compounding growth is non-linear. The longer your money stays invested, the larger the proportion of your final corpus comes from compounded returns rather than direct contributions.",
    },
    {
      question: "Is SIP the same as a recurring deposit?",
      answer: "No. A Recurring Deposit (RD) offers a fixed, guaranteed interest rate backed by a bank. A mutual fund SIP invests in market instruments (equities or debt) where returns are market-linked rather than fixed.",
    },
    {
      question: "What rate of return should I enter?",
      answer: "Historical broad-market equity index returns have averaged 10%–14% annually over long horizons (7+ years), while debt or hybrid funds typically range between 6%–9%. You should enter a realistic return rate based on your asset allocation.",
    },
  ],
  relatedCalculators: [
    {
      id: "percentage-calculator",
      name: "Percentage Calculator",
      category: "Math",
      slug: "/percentage-calculator",
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
      id: "cgpa-calculator",
      name: "CGPA Calculator",
      category: "Education & Exams",
      slug: "/cgpa-calculator",
      isAvailable: true,
    },
    {
      id: "percentage-to-cgpa-calculator",
      name: "Percentage to CGPA Calculator",
      category: "Education & Exams",
      slug: "/percentage-to-cgpa-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "SIP Calculator - Calculate SIP Returns & Future Value | YourCalculate",
    description: "Free SIP calculator to estimate future value, total investment, and potential returns from monthly SIP investments with step-by-step calculations.",
    canonicalPath: "/sip-calculator",
    keywords: ["sip calculator", "mutual fund sip calculator", "systematic investment plan", "sip returns calculator", "future value calculator", "wealth gain calculator"],
  },
};
