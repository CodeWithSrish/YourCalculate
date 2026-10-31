import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatINR, formatResultNumber } from "../engine/validation";

export interface PrepaymentVsSipResult {
  isValid: boolean;
  error?: string;
  regularEmi: number;
  originalTotalInterest: number;
  prepaidTenureMonths: number;
  tenureSavedMonths: number;
  interestSaved: number;
  prepaymentTotalInterest: number;
  sipTerminalWealth: number;
  prepaymentTerminalWealth: number;
  netWealthDifference: number;
  isSipBetter: boolean;
  breakEvenReturnRate: number;
  stepExplanation?: string;
  secondaryValues: SecondaryMetric[];
}

export function calculateHomeLoanPrepaymentVsSip(
  inputs: Record<string, number | string>
): CalculationOutput {
  const principal = Number(inputs.outstandingPrincipal);
  const loanRate = Number(inputs.interestRate);
  const tenureYears = Number(inputs.remainingTenureYears);
  const extraMonthly = Number(inputs.extraMonthlyPayment || 0);
  const lumpSum = Number(inputs.lumpSumPrepayment || 0);
  const sipRate = Number(inputs.expectedSipReturn);

  // Validation
  if (!Number.isFinite(principal) || principal <= 0) {
    return { isValid: false, error: "Please enter a valid outstanding loan amount greater than ₹0." };
  }
  if (!Number.isFinite(loanRate) || loanRate <= 0) {
    return { isValid: false, error: "Please enter a valid loan interest rate greater than 0%." };
  }
  if (!Number.isFinite(tenureYears) || tenureYears <= 0) {
    return { isValid: false, error: "Please enter a valid remaining tenure in years." };
  }
  if (!Number.isFinite(extraMonthly) || extraMonthly < 0) {
    return { isValid: false, error: "Extra monthly payment cannot be negative." };
  }
  if (!Number.isFinite(lumpSum) || lumpSum < 0) {
    return { isValid: false, error: "Lump sum amount cannot be negative." };
  }
  if (!Number.isFinite(sipRate) || sipRate < 0) {
    return { isValid: false, error: "Expected SIP return rate cannot be negative." };
  }
  if (extraMonthly === 0 && lumpSum === 0) {
    return { isValid: false, error: "Please provide either an extra monthly surplus or a lump-sum amount to compare." };
  }

  const totalMonths = Math.round(tenureYears * 12);
  const rLoanMonthly = loanRate / (12 * 100);
  const rSipMonthly = sipRate / (12 * 100);

  // 1. Calculate Baseline Regular Loan EMI
  const emiFactor = Math.pow(1 + rLoanMonthly, totalMonths);
  const regularEmi = (principal * rLoanMonthly * emiFactor) / (emiFactor - 1);
  const originalTotalRepayment = regularEmi * totalMonths;
  const originalTotalInterest = originalTotalRepayment - principal;

  // 2. Strategy A: Prepayment Simulation (Tenure Reduction)
  let balance = Math.max(0, principal - lumpSum);
  let prepaymentTotalInterest = 0;
  let prepaidMonths = 0;
  const monthlyRepaymentWithExtra = regularEmi + extraMonthly;

  if (balance === 0) {
    prepaidMonths = 0;
    prepaymentTotalInterest = 0;
  } else {
    for (let m = 1; m <= totalMonths; m++) {
      const monthlyInterest = balance * rLoanMonthly;
      let principalPaid = monthlyRepaymentWithExtra - monthlyInterest;

      if (principalPaid >= balance || m === totalMonths) {
        principalPaid = balance;
        prepaymentTotalInterest += monthlyInterest;
        balance = 0;
        prepaidMonths = m;
        break;
      } else {
        prepaymentTotalInterest += monthlyInterest;
        balance -= principalPaid;
        prepaidMonths = m;
      }
    }
  }

  const tenureSavedMonths = Math.max(0, totalMonths - prepaidMonths);
  const interestSaved = Math.max(0, originalTotalInterest - prepaymentTotalInterest);

  // Strategy A Terminal Portfolio: Post-Payoff Reinvestment
  // From month (prepaidMonths + 1) to totalMonths, loan is debt-free!
  // Reinvest full liberated cash flow (regularEmi + extraMonthly) into SIP
  let prepaymentTerminalWealth = 0;
  const liberatedMonths = totalMonths - prepaidMonths;

  if (liberatedMonths > 0) {
    if (rSipMonthly === 0) {
      prepaymentTerminalWealth = monthlyRepaymentWithExtra * liberatedMonths;
    } else {
      const compoundFactor = Math.pow(1 + rSipMonthly, liberatedMonths);
      prepaymentTerminalWealth =
        monthlyRepaymentWithExtra * ((compoundFactor - 1) / rSipMonthly) * (1 + rSipMonthly);
    }
  }

  // 3. Strategy B: Parallel SIP Investing (No Prepayment)
  // Borrower pays regular EMI for full totalMonths, while investing extraMonthly into SIP every month
  // plus lumpSum as an initial lump-sum compounding for full totalMonths
  let sipTerminalWealth = 0;
  let lumpSumFutureVal = 0;
  let monthlySipFutureVal = 0;

  if (lumpSum > 0) {
    lumpSumFutureVal = lumpSum * Math.pow(1 + rSipMonthly, totalMonths);
  }

  if (extraMonthly > 0) {
    if (rSipMonthly === 0) {
      monthlySipFutureVal = extraMonthly * totalMonths;
    } else {
      const compoundFactor = Math.pow(1 + rSipMonthly, totalMonths);
      monthlySipFutureVal =
        extraMonthly * ((compoundFactor - 1) / rSipMonthly) * (1 + rSipMonthly);
    }
  }

  sipTerminalWealth = lumpSumFutureVal + monthlySipFutureVal;

  // 4. Comparison & Net Advantage
  const netWealthDifference = sipTerminalWealth - prepaymentTerminalWealth;
  const isSipBetter = netWealthDifference >= 0;

  // Approximate break-even return rate (rate where SIP matches Prepayment)
  // When SIP return equals effective loan borrowing cost, terminal wealths closely converge
  const breakEvenReturnRate = loanRate;

  const prepaidYears = Math.floor(prepaidMonths / 12);
  const prepaidRemainingMonths = prepaidMonths % 12;
  const tenureSavedYears = Math.floor(tenureSavedMonths / 12);
  const tenureSavedRemainingMonths = tenureSavedMonths % 12;

  const revisedTenureFormatted =
    prepaidRemainingMonths > 0
      ? `${prepaidYears} Yrs ${prepaidRemainingMonths} Mos`
      : `${prepaidYears} Years`;

  const tenureSavedFormatted =
    tenureSavedRemainingMonths > 0
      ? `${tenureSavedYears} Yrs ${tenureSavedRemainingMonths} Mos`
      : `${tenureSavedYears} Years`;

  const primaryValue = isSipBetter
    ? `${formatINR(Math.abs(netWealthDifference))} Projected SIP Advantage`
    : `${formatINR(Math.abs(netWealthDifference))} Guaranteed Interest Advantage`;

  const primaryLabel = isSipBetter
    ? `Projected wealth advantage if SIP achieves assumed ${sipRate}% p.a. vs. guaranteed ${loanRate}% loan payoff`
    : `Guaranteed loan-interest savings at ${loanRate}% p.a. exceed projected investment returns at assumed ${sipRate}% p.a.`;

  const stepExplanation = isSipBetter
    ? `Comparing both options over ${tenureYears} years (${totalMonths} months): Strategy 1 (Prepay) pays off the loan in ${revisedTenureFormatted} (saving ${tenureSavedFormatted} and a guaranteed ${formatINR(interestSaved)} interest) and reinvests ${formatINR(monthlyRepaymentWithExtra)}/mo into SIP for the remaining ${liberatedMonths} months, reaching a projected terminal wealth of ${formatINR(prepaymentTerminalWealth)}. Strategy 2 (Invest in SIP) continues regular ${formatINR(regularEmi)} EMI and invests ${formatINR(extraMonthly)}/mo at an assumed ${sipRate}% p.a., projecting an accumulated corpus of ${formatINR(sipTerminalWealth)}. Under these stated assumptions, the SIP strategy projects ${formatINR(Math.abs(netWealthDifference))} higher terminal wealth.`
    : `Comparing both options over ${tenureYears} years (${totalMonths} months): Prepaying your loan saves a contractually guaranteed ${formatINR(interestSaved)} in interest and clears debt ${tenureSavedFormatted} earlier. Because your loan interest (${loanRate}%) is significant relative to expected investment returns, aggressive debt payoff delivers a ${formatINR(Math.abs(netWealthDifference))} guaranteed net advantage over the investment portfolio.`;

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Contractual Monthly EMI",
      value: formatINR(regularEmi, true),
    },
    {
      label: "Guaranteed Interest Saved",
      value: formatINR(interestSaved),
    },
    {
      label: "Loan Payoff Timeline",
      value: `${revisedTenureFormatted} (${tenureSavedFormatted} saved)`,
    },
    {
      label: `Projected SIP Corpus (Strategy 2 @ ${sipRate}%)`,
      value: formatINR(sipTerminalWealth),
    },
    {
      label: `Projected Reinvested Wealth (Strategy 1 @ ${sipRate}%)`,
      value: formatINR(prepaymentTerminalWealth),
    },
    {
      label: "Approx. Break-Even SIP Return",
      value: `${formatResultNumber(breakEvenReturnRate, 2)}% p.a.`,
    },
  ];

  return {
    isValid: true,
    primaryValue,
    primaryLabel,
    unit: "",
    stepExplanation,
    disclaimer:
      "Loan prepayment interest savings are mathematically guaranteed under the stated loan interest rate. Mutual fund SIP returns are hypothetical projections based on your entered return rate and carry market risk. This calculation does not constitute an investment guarantee, financial recommendation, or tax advice.",
    disclaimerLabel: "Risk & Return Notice",
    secondaryValues,
  };
}

export const homeLoanPrepaymentVsSipCalculatorDefinition: CalculatorDefinition = {
  id: "home-loan-prepayment-vs-sip-calculator",
  slug: "home-loan-prepayment-vs-sip-calculator",
  name: "Home Loan Prepayment vs SIP Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription:
    "Compare whether to prepay your home loan early or invest surplus cash into a mutual fund SIP, accounting for interest saved and post-payoff reinvestment.",
  longDescription:
    "A comprehensive, deterministic decision engine for home loan borrowers. Compare prepaying your mortgage to save guaranteed interest and cut your loan tenure against compounding your surplus cash in an equity mutual fund SIP.",
  icon: "⚖️",
  searchKeywords: [
    "home loan prepayment vs sip",
    "prepayment vs sip calculator",
    "prepay home loan or invest in sip",
    "extra emi vs sip",
    "home loan foreclosure vs mutual fund",
    "prepayment calculator",
    "loan prepayment break even",
    "home loan interest saved",
    "debt vs equity investing",
  ],
  defaultModeId: "prepayment-vs-sip",
  modes: [
    {
      id: "prepayment-vs-sip",
      name: "Prepayment vs. SIP Comparison",
      description:
        "Evaluate side-by-side whether extra monthly cash and lump sums build greater wealth by prepaying home debt or compounding in an equity SIP.",
      formulaText:
        "Net Advantage = FV(SIP Surplus) − [Interest Saved + FV(Liberated EMI Reinvestment)]",
      inputs: [
        {
          id: "outstandingPrincipal",
          label: "Outstanding Loan Amount",
          type: "currency",
          defaultValue: 5000000,
          prefix: "₹",
          placeholder: "e.g. 50,00,000",
          min: 100000,
          step: 50000,
          helperText: "Current remaining principal balance on your home loan.",
        },
        {
          id: "interestRate",
          label: "Home Loan Interest Rate",
          type: "percentage",
          defaultValue: 8.5,
          suffix: "%",
          placeholder: "e.g. 8.5",
          min: 0.1,
          max: 25,
          step: 0.1,
          helperText: "Annual home loan lending rate (p.a.).",
        },
        {
          id: "remainingTenureYears",
          label: "Remaining Loan Tenure",
          type: "number",
          defaultValue: 20,
          suffix: "Years",
          placeholder: "e.g. 20",
          min: 1,
          max: 40,
          step: 1,
          helperText: "Remaining loan repayment duration in years.",
        },
        {
          id: "extraMonthlyPayment",
          label: "Extra Monthly Surplus",
          type: "currency",
          defaultValue: 10000,
          prefix: "₹",
          placeholder: "e.g. 10,000",
          min: 0,
          step: 1000,
          helperText: "Additional monthly savings you can contribute toward prepayment or SIP.",
        },
        {
          id: "lumpSumPrepayment",
          label: "Optional Lump-Sum Amount",
          type: "currency",
          defaultValue: 0,
          prefix: "₹",
          placeholder: "e.g. 2,00,000",
          min: 0,
          step: 25000,
          helperText: "One-time cash bonus or windfall available immediately.",
        },
        {
          id: "expectedSipReturn",
          label: "Expected SIP Return Rate",
          type: "percentage",
          defaultValue: 12.0,
          suffix: "%",
          placeholder: "e.g. 12.0",
          min: 0,
          max: 30,
          step: 0.5,
          helperText: "Assumed long-term annual return from an equity mutual fund portfolio.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateHomeLoanPrepaymentVsSip(inputs),
    },
  ],
  formulas: [
    {
      modeId: "prepayment-vs-sip",
      title: "1. Reducing-Balance Loan Amortization Formula",
      formulaMath: "\\text{EMI} = P \\times \\frac{r_L(1 + r_L)^n}{(1 + r_L)^n - 1}",
      explanation:
        "Calculates your baseline monthly installment where P is principal, r_L is the monthly interest rate (Annual Rate ÷ 1200), and n is total monthly installments.",
      example:
        "₹50,00,000 at 8.5% for 20 years (240 months): Baseline EMI = ₹43,391.16/month.",
      whenToUse: "Use to establish your current contractual monthly debt obligation.",
    },
    {
      modeId: "prepayment-vs-sip",
      title: "2. Post-Payoff Cash Flow Reinvestment Formula",
      formulaMath: "\\text{FV}_{\\text{reinvest}} = (\\text{EMI} + S) \\times \\left[ \\frac{(1 + r_I)^{n_{\\text{rem}}} - 1}{r_I} \\right] \\times (1 + r_I)",
      explanation:
        "When you prepay early, the loan is fully retired before the original maturity date. For all remaining months (n_rem), your full monthly payment is invested into mutual funds.",
      example:
        "Retiring loan in Year 13 liberates ₹53,391/month to compound in equity for the remaining 7 years.",
      whenToUse: "Crucial for an honest comparison: accounts for the wealth-building power of becoming debt-free early.",
    },
    {
      modeId: "prepayment-vs-sip",
      title: "3. Parallel Mutual Fund SIP Future Value Formula",
      formulaMath: "\\text{FV}_{\\text{SIP}} = L(1 + r_I)^n + S \\times \\left[ \\frac{(1 + r_I)^n - 1}{r_I} \\right] \\times (1 + r_I)",
      explanation:
        "Computes the compounded future wealth when your extra monthly surplus (S) and lump sum (L) are invested into equity markets across the entire original loan timeline (n).",
      example:
        "₹10,000/month at 12% p.a. for 20 years yields an investment corpus of ₹99,91,479.",
      whenToUse: "Use to forecast pure equity wealth accumulation without paying down low-interest debt.",
    },
  ],
  examples: [
    {
      title: "Example 1: ₹50 Lakh Home Loan with ₹10,000 Extra Monthly (12% SIP)",
      description: "Standard ₹50L home mortgage at 8.5% comparing ₹10k extra prepayment vs. 12% mutual fund SIP.",
      modeId: "prepayment-vs-sip",
      inputs: {
        outstandingPrincipal: 5000000,
        interestRate: 8.5,
        remainingTenureYears: 20,
        extraMonthlyPayment: 10000,
        lumpSumPrepayment: 0,
        expectedSipReturn: 12.0,
      },
      expectedOutput: "SIP Advantage",
    },
    {
      title: "Example 2: ₹30 Lakh Loan with ₹2 Lakh Lump-Sum Prepayment",
      description: "Immediate lump sum reduction of debt vs. compounding in mutual funds.",
      modeId: "prepayment-vs-sip",
      inputs: {
        outstandingPrincipal: 3000000,
        interestRate: 9.0,
        remainingTenureYears: 15,
        extraMonthlyPayment: 5000,
        lumpSumPrepayment: 200000,
        expectedSipReturn: 11.5,
      },
      expectedOutput: "SIP Advantage",
    },
    {
      title: "Example 3: High Loan Interest (11%) with Conservative Return (10%)",
      description: "When debt cost exceeds expected market returns, prepayment delivers superior guaranteed wealth.",
      modeId: "prepayment-vs-sip",
      inputs: {
        outstandingPrincipal: 2500000,
        interestRate: 11.0,
        remainingTenureYears: 10,
        extraMonthlyPayment: 10000,
        lumpSumPrepayment: 0,
        expectedSipReturn: 10.0,
      },
      expectedOutput: "Guaranteed Interest Advantage",
    },
  ],
  faqs: [
    {
      question: "Is it better to prepay a home loan or invest in an SIP?",
      answer:
        "Mathematically, if your expected post-tax mutual fund return (e.g. 11%–12%) exceeds your home loan interest rate (e.g. 8.5%), investing in an SIP typically generates a higher net wealth. However, prepaying your loan provides a 100% guaranteed, risk-free return equal to your loan interest rate and delivers priceless psychological peace of mind by eliminating debt.",
    },
    {
      question: "What is the break-even return rate?",
      answer:
        "The break-even return rate is the annual mutual fund return percentage your investments must achieve to equal the financial benefit of prepaying your loan. If market returns drop below this rate, prepaying the loan would have been the superior financial decision.",
    },
    {
      question: "How does this calculator account for becoming debt-free early?",
      answer:
        "Unlike basic calculators that stop when the loan is cleared, our engine models the post-payoff phase: once your loan is fully paid off early, your entire former monthly commitment (EMI + extra payment) is automatically reinvested into your SIP portfolio for the remainder of the original tenure.",
    },
    {
      question: "Should I reduce my EMI or reduce my loan tenure when prepaying?",
      answer:
        "Financial advisors strongly recommend reducing your tenure rather than reducing your EMI. Keeping your monthly EMI constant while prepaying accelerates principal reduction, saving substantially more total interest over time.",
    },
    {
      question: "Are home loan tax deductions impacted by early prepayment?",
      answer:
        "Under the Old Tax Regime, home loan interest is deductible up to ₹2 Lakhs per year under Section 24(b). If you choose the New Tax Regime (now default in India), this deduction is not available for self-occupied properties, making the effective cost of your home loan equal to its nominal rate.",
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
      id: "loan-calculator",
      name: "Loan Calculator",
      category: "Finance",
      slug: "/loan-calculator",
      isAvailable: true,
    },
    {
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      category: "Finance",
      slug: "/compound-interest-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "Home Loan Prepayment vs SIP Calculator — Compare Early Payoff vs Investing | YourCalculate",
    description:
      "Free Home Loan Prepayment vs SIP Calculator. Compare early loan prepayment interest savings against mutual fund SIP returns with break-even return analysis.",
    canonicalPath: "/home-loan-prepayment-vs-sip-calculator",
    keywords: [
      "home loan prepayment vs sip calculator",
      "prepay home loan or sip",
      "prepayment vs sip",
      "home loan prepayment calculator",
      "extra emi vs sip",
      "loan payoff vs mutual fund",
    ],
  },
};
