import { CalculatorDefinition } from "./engine/types";
import { percentageCalculatorDefinition } from "./definitions/percentage";
import { emiCalculatorDefinition } from "./definitions/emi";
import { sipCalculatorDefinition } from "./definitions/sip";
import { percentageToCgpaCalculatorDefinition } from "./definitions/percentageToCgpa";
import { cgpaCalculatorDefinition } from "./definitions/cgpa";
import { gpaCalculatorDefinition } from "./definitions/gpa";

const CALCULATOR_REGISTRY: Record<string, CalculatorDefinition> = {
  [percentageCalculatorDefinition.slug]: percentageCalculatorDefinition,
  [emiCalculatorDefinition.slug]: emiCalculatorDefinition,
  [sipCalculatorDefinition.slug]: sipCalculatorDefinition,
  [percentageToCgpaCalculatorDefinition.slug]: percentageToCgpaCalculatorDefinition,
  [cgpaCalculatorDefinition.slug]: cgpaCalculatorDefinition,
  [gpaCalculatorDefinition.slug]: gpaCalculatorDefinition,
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
