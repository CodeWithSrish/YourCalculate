import { CalculatorDefinition } from "./engine/types";
import { percentageCalculatorDefinition } from "./definitions/percentage";
import { emiCalculatorDefinition } from "./definitions/emi";
import { sipCalculatorDefinition } from "./definitions/sip";
import { percentageToCgpaCalculatorDefinition } from "./definitions/percentageToCgpa";
import { cgpaCalculatorDefinition } from "./definitions/cgpa";
import { gpaCalculatorDefinition } from "./definitions/gpa";
import { ageCalculatorDefinition } from "./definitions/age";
import { bmiCalculatorDefinition } from "./definitions/bmi";
import { discountCalculatorDefinition } from "./definitions/discount";
import { gstCalculatorDefinition } from "./definitions/gst";
import { compoundInterestCalculatorDefinition } from "./definitions/compoundInterest";
import { loanCalculatorDefinition } from "./definitions/loan";
import { simpleInterestCalculatorDefinition } from "./definitions/simpleInterest";
import { averageCalculatorDefinition } from "./definitions/average";
import { ratioCalculatorDefinition } from "./definitions/ratio";
import { fractionCalculatorDefinition } from "./definitions/fraction";
import { lcmCalculatorDefinition } from "./definitions/lcm";

const CALCULATOR_REGISTRY: Record<string, CalculatorDefinition> = {
  [percentageCalculatorDefinition.slug]: percentageCalculatorDefinition,
  [emiCalculatorDefinition.slug]: emiCalculatorDefinition,
  [sipCalculatorDefinition.slug]: sipCalculatorDefinition,
  [percentageToCgpaCalculatorDefinition.slug]: percentageToCgpaCalculatorDefinition,
  [cgpaCalculatorDefinition.slug]: cgpaCalculatorDefinition,
  [gpaCalculatorDefinition.slug]: gpaCalculatorDefinition,
  [ageCalculatorDefinition.slug]: ageCalculatorDefinition,
  [bmiCalculatorDefinition.slug]: bmiCalculatorDefinition,
  [discountCalculatorDefinition.slug]: discountCalculatorDefinition,
  [gstCalculatorDefinition.slug]: gstCalculatorDefinition,
  [compoundInterestCalculatorDefinition.slug]: compoundInterestCalculatorDefinition,
  [loanCalculatorDefinition.slug]: loanCalculatorDefinition,
  [simpleInterestCalculatorDefinition.slug]: simpleInterestCalculatorDefinition,
  [averageCalculatorDefinition.slug]: averageCalculatorDefinition,
  [ratioCalculatorDefinition.slug]: ratioCalculatorDefinition,
  [fractionCalculatorDefinition.slug]: fractionCalculatorDefinition,
  [lcmCalculatorDefinition.slug]: lcmCalculatorDefinition,
};

export function getCalculatorBySlug(slug: string): CalculatorDefinition | undefined {
  return CALCULATOR_REGISTRY[slug];
}

export function getAllCalculators(): CalculatorDefinition[] {
  return Object.values(CALCULATOR_REGISTRY);
}

export function isCalculatorAvailable(slug: string): boolean {
  return slug in CALCULATOR_REGISTRY;
}
