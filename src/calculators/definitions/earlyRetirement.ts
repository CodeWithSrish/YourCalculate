import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatINR, formatResultNumber } from "../engine/validation";

export interface EarlyRetirementCalculationResult {
  isValid: boolean;
  error?: string;
  targetCorpus: number;
  projectedCorpus: number;
  monthlyExpenseAtRetirement: number;
  annualExpenseAtRetirement: number;
  corpusMultiple: number;
  surplusOrShortfall: number;
  isSurplus: boolean;
  requiredMonthlySavings: number;
  additionalMonthlyNeeded: number;
  leanFireCorpus: number;
  fatFireCorpus: number;
  stepExplanation?: string;
  secondaryValues: SecondaryMetric[];
}

export type FireCalculationResult = EarlyRetirementCalculationResult;

export function calculateEarlyRetirement(
  inputs: Record<string, number | string>
): CalculationOutput {
  const currentAge = Number(inputs.currentAge);
  const retirementAge = Number(inputs.retirementAge);
  const lifeExpectancy = Number(inputs.lifeExpectancy);
  const currentMonthlyExpenses = Number(inputs.currentMonthlyExpenses);
  const inflationRate = Number(inputs.inflationRate ?? 6.0);
  const existingInvestments = Number(inputs.existingInvestments ?? 0);
  const monthlySavings = Number(inputs.monthlySavings ?? 0);
  const preRetirementReturn = Number(inputs.preRetirementReturn ?? 11.0);
  const postRetirementReturn = Number(inputs.postRetirementReturn ?? 8.0);

  // Validation
  if (!Number.isFinite(currentAge) || currentAge < 18 || currentAge > 80) {
    return { isValid: false, error: "Please enter a valid current age between 18 and 80." };
  }
  if (!Number.isFinite(retirementAge) || retirementAge < currentAge || retirementAge > 90) {
    return {
      isValid: false,
      error: `Planned retirement age must be at least your current age (${currentAge}).`,
    };
  }
  if (!Number.isFinite(lifeExpectancy) || lifeExpectancy <= retirementAge || lifeExpectancy > 110) {
    return {
      isValid: false,
      error: `Life expectancy must be greater than planned retirement age (${retirementAge}).`,
    };
  }
  if (!Number.isFinite(currentMonthlyExpenses) || currentMonthlyExpenses <= 0) {
    return { isValid: false, error: "Monthly expenses must be greater than ₹0." };
  }
  if (!Number.isFinite(inflationRate) || inflationRate < 0 || inflationRate > 25) {
    return { isValid: false, error: "Inflation rate must be between 0% and 25%." };
  }
  if (!Number.isFinite(existingInvestments) || existingInvestments < 0) {
    return { isValid: false, error: "Existing savings cannot be negative." };
  }
  if (!Number.isFinite(monthlySavings) || monthlySavings < 0) {
    return { isValid: false, error: "Monthly investment cannot be negative." };
  }
  if (!Number.isFinite(preRetirementReturn) || preRetirementReturn <= 0) {
    return { isValid: false, error: "Pre-retirement return must be greater than 0%." };
  }
  if (!Number.isFinite(postRetirementReturn) || postRetirementReturn < 0) {
    return { isValid: false, error: "Post-retirement return cannot be negative." };
  }

  const yearsToRetire = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;
  const i = inflationRate / 100;
  const rPre = preRetirementReturn / 100;
  const rPost = postRetirementReturn / 100;

  // 1. Inflation-Adjusted Monthly and Annual Expenses at Retirement
  const monthlyExpenseAtRetirement =
    currentMonthlyExpenses * Math.pow(1 + i, yearsToRetire);
  const annualExpenseAtRetirement = monthlyExpenseAtRetirement * 12;

  // 2. Real Rate of Return during Retirement (Fisher Equation)
  // r_real = (1 + r_post) / (1 + i) - 1
  const rReal = (1 + rPost) / (1 + i) - 1;

  // 3. Target Retirement Corpus (Present Value of Inflation-Protected Annuity)
  let targetCorpus = 0;
  if (Math.abs(rReal) < 0.0001) {
    targetCorpus = annualExpenseAtRetirement * yearsInRetirement;
  } else {
    targetCorpus =
      annualExpenseAtRetirement *
      ((1 - Math.pow(1 + rReal, -yearsInRetirement)) / rReal);
  }

  const corpusMultiple = targetCorpus / annualExpenseAtRetirement;

  // 4. Projected Corpus at Retirement from Existing + Ongoing SIP
  const accumulationMonths = yearsToRetire * 12;
  const rMonthlyPre = rPre / 12;

  const fvExisting = existingInvestments * Math.pow(1 + rPre, yearsToRetire);

  let fvMonthly = 0;
  if (accumulationMonths > 0 && monthlySavings > 0) {
    const sipFactor = Math.pow(1 + rMonthlyPre, accumulationMonths);
    fvMonthly =
      monthlySavings * ((sipFactor - 1) / rMonthlyPre) * (1 + rMonthlyPre);
  }

  const projectedCorpus = fvExisting + fvMonthly;
  const surplusOrShortfall = projectedCorpus - targetCorpus;
  const isSurplus = surplusOrShortfall >= 0;

  // 5. Additional Monthly Savings Needed if Shortfall Exists
  let requiredMonthlySavings = monthlySavings;
  let additionalMonthlyNeeded = 0;

  if (!isSurplus) {
    if (accumulationMonths > 0) {
      const neededFromMonthly = Math.max(0, targetCorpus - fvExisting);
      const sipFactor = Math.pow(1 + rMonthlyPre, accumulationMonths);
      const sipMultiplier = ((sipFactor - 1) / rMonthlyPre) * (1 + rMonthlyPre);

      requiredMonthlySavings = neededFromMonthly / sipMultiplier;
      additionalMonthlyNeeded = Math.max(0, requiredMonthlySavings - monthlySavings);
    } else {
      requiredMonthlySavings = 0;
      additionalMonthlyNeeded = 0;
    }
  }

  // 6. FIRE Milestones
  const leanFireCorpus = targetCorpus * 0.75;
  const fatFireCorpus = targetCorpus * 1.30;

  const primaryValue = formatINR(targetCorpus);
  const primaryLabel = `Target Retirement Corpus Needed at Age ${retirementAge}`;

  const retirementContext =
    yearsToRetire === 0
      ? `retiring immediately at age ${retirementAge}`
      : `upon retiring at age ${retirementAge} (${yearsToRetire} years from now with ${inflationRate}% annual inflation)`;

  const stepExplanation = `At age ${currentAge}, your current monthly expenses of ${formatINR(currentMonthlyExpenses)} will correspond to ${formatINR(monthlyExpenseAtRetirement, true)}/month (${formatINR(annualExpenseAtRetirement)}/year) ${retirementContext}. To fund ${yearsInRetirement} years of retirement until age ${lifeExpectancy} with a ${postRetirementReturn}% post-retirement return (${formatResultNumber(rReal * 100, 2)}% real return), you need a retirement corpus of ${formatINR(targetCorpus)} (~${formatResultNumber(corpusMultiple, 1)}× first-year retirement expenses). Your current savings and monthly investment will project to ${formatINR(projectedCorpus)}, resulting in a ${isSurplus ? `surplus of ${formatINR(surplusOrShortfall)}` : `shortfall of ${formatINR(Math.abs(surplusOrShortfall))}`}.`;

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Projected Corpus at Retirement",
      value: formatINR(projectedCorpus),
    },
    {
      label: isSurplus ? "Projected Corpus Surplus" : "Projected Corpus Shortfall",
      value: formatINR(Math.abs(surplusOrShortfall)),
    },
    {
      label: `Monthly Expense at Age ${retirementAge}`,
      value: formatINR(monthlyExpenseAtRetirement, true),
    },
    {
      label: "Corpus Multiplier",
      value: `${formatResultNumber(corpusMultiple, 1)}× Annual Expenses`,
    },
    {
      label: "Lean FIRE Corpus (75% Baseline)",
      value: formatINR(leanFireCorpus),
    },
    {
      label: "Fat FIRE Corpus (130% Comfort)",
      value: formatINR(fatFireCorpus),
    },
  ];

  if (!isSurplus && additionalMonthlyNeeded > 0) {
    secondaryValues.push({
      label: "Required Total Monthly SIP",
      value: formatINR(requiredMonthlySavings, true),
    });
    secondaryValues.push({
      label: "Additional Monthly SIP Needed",
      value: formatINR(additionalMonthlyNeeded, true),
    });
  }

  return {
    isValid: true,
    primaryValue,
    primaryLabel,
    unit: "₹",
    stepExplanation,
    disclaimer:
      "Calculations model inflation-adjusted cash flows and constant compound asset growth based on early retirement and FIRE principles. Actual post-retirement wealth depends on sequence-of-returns risk, market fluctuations, changes in lifestyle expenses, and long-term healthcare costs.",
    disclaimerLabel: "Retirement Planning Notice",
    secondaryValues,
  };
}

export const calculateFire = calculateEarlyRetirement;

export const earlyRetirementCalculatorDefinition: CalculatorDefinition = {
  id: "early-retirement-calculator",
  slug: "early-retirement-calculator",
  name: "Early Retirement Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription:
    "Estimate how much you need to save and invest to retire early based on your current savings, expenses, expected returns, and retirement goals.",
  longDescription:
    "A comprehensive, deterministic early retirement and corpus planning calculator tailored for Indian economic realities. Grounded in the principles of FIRE (Financial Independence, Retire Early), it accounts for long-term inflation, real post-retirement returns, and milestone targets across Lean FIRE, Standard FIRE, and Fat FIRE.",
  icon: "🔥",
  searchKeywords: [
    "early retirement calculator",
    "fire calculator",
    "fire calculator india",
    "retirement corpus calculator",
    "financial independence retire early",
    "when can you retire",
    "when can i retire calculator",
    "retirement planning calculator",
    "lean fire india",
    "fat fire india",
    "safe withdrawal rate india",
  ],
  defaultModeId: "early-retirement",
  modes: [
    {
      id: "early-retirement",
      name: "Early Retirement & FIRE Readiness",
      description:
        "Project inflation-adjusted retirement expenses and nest egg targets using FIRE (Financial Independence, Retire Early) methodology to see if your investments are on track.",
      formulaText:
        "Corpus = Annual Expenses × [(1 − (1 + r_real)^−n) ÷ r_real], where r_real = (1 + r_post)/(1 + i) − 1",
      inputs: [
        {
          id: "currentAge",
          label: "Current Age",
          type: "number",
          defaultValue: 30,
          suffix: "Yrs",
          placeholder: "e.g. 30",
          min: 18,
          max: 75,
          step: 1,
          helperText: "Your current age today in years.",
        },
        {
          id: "retirementAge",
          label: "Target Retirement Age",
          type: "number",
          defaultValue: 45,
          suffix: "Yrs",
          placeholder: "e.g. 45",
          min: 25,
          max: 80,
          step: 1,
          helperText: "The age at which you intend to stop working full-time.",
        },
        {
          id: "lifeExpectancy",
          label: "Life Expectancy (Planning Age)",
          type: "number",
          defaultValue: 85,
          suffix: "Yrs",
          placeholder: "e.g. 85",
          min: 55,
          max: 100,
          step: 1,
          helperText: "Target planning age for retirement fund longevity.",
        },
        {
          id: "currentMonthlyExpenses",
          label: "Current Monthly Living Expenses",
          type: "currency",
          defaultValue: 50000,
          prefix: "₹",
          placeholder: "e.g. 50,000",
          min: 5000,
          step: 2500,
          helperText: "Your typical monthly household expenditure today (excluding home loan EMI).",
        },
        {
          id: "inflationRate",
          label: "Expected Inflation Rate (p.a.)",
          type: "percentage",
          defaultValue: 6.0,
          suffix: "%",
          placeholder: "e.g. 6.0",
          min: 1,
          max: 15,
          step: 0.5,
          helperText: "Expected long-term inflation rate in India (typically 6%–7%).",
        },
        {
          id: "existingInvestments",
          label: "Current Retirement Portfolio",
          type: "currency",
          defaultValue: 1500000,
          prefix: "₹",
          placeholder: "e.g. 15,00,000",
          min: 0,
          step: 50000,
          helperText: "Existing mutual funds, stocks, PF, and retirement savings.",
        },
        {
          id: "monthlySavings",
          label: "Current Monthly Investment / SIP",
          type: "currency",
          defaultValue: 30000,
          prefix: "₹",
          placeholder: "e.g. 30,000",
          min: 0,
          step: 2500,
          helperText: "Amount you actively invest every month toward retirement.",
        },
        {
          id: "preRetirementReturn",
          label: "Pre-Retirement Return (p.a.)",
          type: "percentage",
          defaultValue: 11.0,
          suffix: "%",
          placeholder: "e.g. 11.0",
          min: 1,
          max: 25,
          step: 0.5,
          helperText: "Expected growth rate of your portfolio before retiring (equity-oriented).",
        },
        {
          id: "postRetirementReturn",
          label: "Post-Retirement Return (p.a.)",
          type: "percentage",
          defaultValue: 8.0,
          suffix: "%",
          placeholder: "e.g. 8.0",
          min: 1,
          max: 20,
          step: 0.5,
          helperText: "Conservative growth rate after retiring (balanced debt + equity).",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateEarlyRetirement(inputs),
    },
  ],
  formulas: [
    {
      modeId: "early-retirement",
      title: "1. Future Expense Inflation Formula",
      formulaMath: "E_r = E_0 \\times (1 + i)^n",
      explanation:
        "Calculates your monthly household expenses at retirement age after compounding at annual inflation rate i over n accumulation years.",
      example:
        "₹50,000/month today compounding at 6% inflation for 15 years becomes ₹1,19,828/month (₹14.38 Lakhs/year).",
      whenToUse: "Use to understand the purchasing power erosion caused by long-term inflation.",
    },
    {
      modeId: "early-retirement",
      title: "2. Real Rate of Return (Fisher Equation)",
      formulaMath: "r_{\\text{real}} = \\frac{1 + r_{\\text{post}}}{1 + i} - 1",
      explanation:
        "Determines the net growth of your retirement nest egg after stripping out inflation. For example, an 8% return with 6% inflation yields a real return of 1.89% p.a.",
      example:
        "(1 + 0.08) ÷ (1 + 0.06) − 1 = 1.8867% net real growth per year.",
      whenToUse: "Crucial for accurately sizing retirement funds without underestimating longevity risks.",
    },
    {
      modeId: "early-retirement",
      title: "3. Retirement Corpus Capitalization Formula",
      formulaMath: "\\text{Corpus} = E_{\\text{annual}} \\times \\left[ \\frac{1 - (1 + r_{\\text{real}})^{-Y_{\\text{ret}}}}{r_{\\text{real}}} \\right]",
      explanation:
        "The present value of an inflation-growing annuity designed to supply living expenses over Y_ret retirement years until life expectancy.",
      example:
        "Funding ₹14.38 Lakhs/year for 40 years at 1.89% real return requires a corpus of ~₹4.01 Crores (~27.9× expenses).",
      whenToUse: "Determines the definitive target wealth milestone for financial independence and early retirement.",
    },
  ],
  examples: [
    {
      title: "Example 1: Retiring at 45 (₹50k Expenses Today, 6% Inflation)",
      description: "Standard early retirement scenario starting at age 30 planning 40 years of retirement.",
      modeId: "early-retirement",
      inputs: {
        currentAge: 30,
        retirementAge: 45,
        lifeExpectancy: 85,
        currentMonthlyExpenses: 50000,
        inflationRate: 6.0,
        existingInvestments: 1500000,
        monthlySavings: 30000,
        preRetirementReturn: 11.0,
        postRetirementReturn: 8.0,
      },
      expectedOutput: "₹4,01,15,483",
    },
    {
      title: "Example 2: Traditional Retirement at 60 (₹40k Expenses Today)",
      description: "Retiring at 60 with 25-year post-retirement span.",
      modeId: "early-retirement",
      inputs: {
        currentAge: 30,
        retirementAge: 60,
        lifeExpectancy: 85,
        currentMonthlyExpenses: 40000,
        inflationRate: 6.0,
        existingInvestments: 500000,
        monthlySavings: 20000,
        preRetirementReturn: 11.0,
        postRetirementReturn: 7.5,
      },
      expectedOutput: "Target Corpus",
    },
    {
      title: "Example 3: Aggressive Early Retirement at 40 (10-Year Horizon)",
      description: "Aggressive savings plan targeting financial independence in 10 years.",
      modeId: "early-retirement",
      inputs: {
        currentAge: 30,
        retirementAge: 40,
        lifeExpectancy: 85,
        currentMonthlyExpenses: 60000,
        inflationRate: 6.0,
        existingInvestments: 3000000,
        monthlySavings: 75000,
        preRetirementReturn: 12.0,
        postRetirementReturn: 8.0,
      },
      expectedOutput: "Target Corpus",
    },
  ],
  faqs: [
    {
      question: "What is FIRE (Financial Independence, Retire Early)?",
      answer:
        "FIRE stands for Financial Independence, Retire Early. It is a financial framework where individuals maximize savings, invest systematically, and build an inflation-protected investment portfolio large enough that investment returns fund all living expenses indefinitely, allowing them to retire decades before traditional retirement age.",
    },
    {
      question: "How does this Early Retirement Calculator work?",
      answer:
        "The calculator projects your current monthly expenses to your planned retirement age using your expected inflation rate. It then uses the Fisher real return equation to calculate the exact retirement nest egg (corpus) needed to fund living expenses through your life expectancy, and determines whether your current savings and monthly investments will create a surplus or shortfall.",
    },
    {
      question: "Why does the Western 4% rule fail in India?",
      answer:
        "The Western 4% rule (25× annual expenses) is based on the US Trinity Study, which assumed historical US inflation of 2%–3% and moderate retirement spans (30 years). In India, structural inflation is higher (6%–7%), lifestyle inflation can reach 8%–10%, and early retirees face retirement horizons of 40–50 years. Therefore, Indian financial planners recommend conservative multiples of 30× to 40× annual expenses (2.5% to 3.3% safe withdrawal rate).",
    },
    {
      question: "What is the difference between Lean FIRE, Standard FIRE, and Fat FIRE?",
      answer:
        "Lean FIRE targets a minimalist nest egg covering essential survival needs (typically ~75% of baseline corpus). Standard FIRE covers your full current lifestyle with moderate buffers (100% of corpus). Fat FIRE provides an abundant nest egg (130%+ of corpus) allowing extensive travel, luxury purchases, and substantial medical safety buffers.",
    },
    {
      question: "How does inflation impact my retirement target?",
      answer:
        "Inflation acts as compound interest in reverse. At 6% inflation, living costs double approximately every 12 years. A monthly expenditure of ₹50,000 today will require ₹1,20,000 per month in 15 years just to maintain the exact same standard of living.",
    },
    {
      question: "What asset allocation should I maintain after retiring early?",
      answer:
        "Early retirees in India cannot invest 100% in fixed deposits because taxes and inflation will erode the principal. Planners suggest a bucket strategy: 2–3 years of expenses in liquid funds/cash, 5–7 years in conservative debt instruments, and the remaining 60%+ in equity index funds to generate inflation-beating real returns over long decades.",
    },
    {
      question: "How is the target corpus calculated?",
      answer:
        "Our engine calculates the present value of a growing annuity during retirement using the Fisher real return equation: r_real = [(1 + r_post) / (1 + inflation)] − 1. This ensures every rupee withdrawn retains full real purchasing power throughout your entire lifespan.",
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
      id: "compound-interest-calculator",
      name: "Compound Interest Calculator",
      category: "Finance",
      slug: "/compound-interest-calculator",
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
      id: "ctc-to-in-hand-salary-calculator",
      name: "In-Hand Salary Calculator",
      category: "Finance",
      slug: "/ctc-to-in-hand-salary-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "Early Retirement Calculator – When Can You Retire?",
    description:
      "Estimate how much you need to save and invest to retire early based on your current savings, expenses, expected returns, and retirement goals.",
    canonicalPath: "/early-retirement-calculator",
    keywords: [
      "early retirement calculator",
      "fire calculator",
      "fire calculator india",
      "retirement corpus calculator",
      "when can you retire",
      "when can i retire calculator",
      "financial independence retire early",
      "lean fire india",
      "fat fire india",
      "safe withdrawal rate india",
    ],
  },
};

export const fireCalculatorDefinition = earlyRetirementCalculatorDefinition;
