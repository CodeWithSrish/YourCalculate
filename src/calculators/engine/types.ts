export type InputType = "number" | "percentage" | "currency" | "select";

export interface InputOption {
  label: string;
  value: number | string;
}

export interface InputFieldDefinition {
  id: string;
  label: string;
  type: InputType;
  placeholder?: string;
  defaultValue?: number | string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  helperText?: string;
  options?: InputOption[];
}

export interface SecondaryMetric {
  label: string;
  value: string | number;
  unit?: string;
}

export interface AmortizationRow {
  paymentNumber: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
  formattedEmi: string;
  formattedPrincipal: string;
  formattedInterest: string;
  formattedBalance: string;
}

export interface SIPGrowthRow {
  year: number;
  yearLabel: string;
  monthlyInvestment: number;
  amountInvested: number;
  estimatedReturns: number;
  totalValue: number;
  formattedMonthlyInvestment: string;
  formattedAmountInvested: string;
  formattedEstimatedReturns: string;
  formattedTotalValue: string;
}

export interface CalculationOutput {
  isValid: boolean;
  primaryValue?: string | number;
  primaryLabel?: string;
  unit?: string;
  secondaryValues?: SecondaryMetric[];
  stepExplanation?: string;
  error?: string;
  amortizationSchedule?: AmortizationRow[];
  sipGrowthSchedule?: SIPGrowthRow[];
}

export interface CalculationMode {
  id: string;
  name: string;
  description: string;
  formulaText: string;
  inputs: InputFieldDefinition[];
  calculate: (inputs: Record<string, number>) => CalculationOutput;
}

export interface FormulaExplanation {
  modeId: string;
  title: string;
  formulaMath: string;
  explanation: string;
  example: string;
  whenToUse?: string;
}

export interface CalculatorExample {
  title: string;
  description: string;
  modeId: string;
  inputs: Record<string, number>;
  expectedOutput: string;
}

export interface CalculatorFAQ {
  question: string;
  answer: string;
}

export interface RelatedCalculatorLink {
  id: string;
  name: string;
  category: string;
  slug: string;
  isAvailable: boolean;
}

export interface CalculatorDefinition {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  longDescription: string;
  icon?: string;
  searchKeywords?: string[];
  modes: CalculationMode[];
  defaultModeId: string;
  formulas: FormulaExplanation[];
  examples: CalculatorExample[];
  faqs: CalculatorFAQ[];
  relatedCalculators: RelatedCalculatorLink[];
  seo: {
    title: string;
    description: string;
    canonicalPath: string;
    keywords?: string[];
  };
}
