import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";

export type BMICategory = "Underweight" | "Healthy Weight" | "Overweight" | "Obesity";
export type ObesityClass = "Class 1" | "Class 2" | "Class 3";

export interface BMICalculationResult {
  isValid: boolean;
  error?: string;
  bmi?: number;
  formattedBmi?: string;
  category?: BMICategory;
  obesityClass?: ObesityClass;
  isPediatricAge?: boolean;
  minHealthyWeight?: number;
  maxHealthyWeight?: number;
  formattedHealthyWeightRange?: string;
  unitSystem?: "metric" | "us-customary";
  stepExplanation?: string;
  disclaimer?: string;
}

export const HEALTH_DISCLAIMER =
  "BMI is a screening measure and is not a diagnosis. It does not directly measure body composition, muscle mass, bone density, or fat distribution. For personal health assessment, consult a qualified healthcare professional.";

export const PEDIATRIC_NOTICE =
  "This calculator applies adult BMI categories for individuals aged 20 and older. For children and teens (ages 2–19), BMI must be interpreted using pediatric BMI-for-age growth percentiles.";

export function getAdultBMICategory(bmi: number): {
  category: BMICategory;
  obesityClass?: ObesityClass;
} {
  if (bmi < 18.5) {
    return { category: "Underweight" };
  }
  if (bmi < 25) {
    return { category: "Healthy Weight" };
  }
  if (bmi < 30) {
    return { category: "Overweight" };
  }
  // Obesity classes
  if (bmi < 35) {
    return { category: "Obesity", obesityClass: "Class 1" };
  }
  if (bmi < 40) {
    return { category: "Obesity", obesityClass: "Class 2" };
  }
  return { category: "Obesity", obesityClass: "Class 3" };
}

export function calculateMetricBMI(
  heightCm: number,
  weightKg: number,
  age: number = 25
): BMICalculationResult {
  if (isNaN(heightCm) || isNaN(weightKg) || isNaN(age)) {
    return { isValid: false, error: "Please enter valid numeric values for height, weight, and age." };
  }

  if (heightCm <= 0) {
    return { isValid: false, error: "Height must be a positive number greater than 0." };
  }
  if (weightKg <= 0) {
    return { isValid: false, error: "Weight must be a positive number greater than 0." };
  }
  if (heightCm < 50 || heightCm > 280) {
    return { isValid: false, error: "Height must be between 50 cm and 280 cm." };
  }
  if (weightKg < 20 || weightKg > 400) {
    return { isValid: false, error: "Weight must be between 20 kg and 400 kg." };
  }
  if (age <= 0 || age > 120) {
    return { isValid: false, error: "Age must be between 1 and 120." };
  }

  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);

  const minHealthyWeight = 18.5 * (heightMeters * heightMeters);
  const maxHealthyWeight = 24.9 * (heightMeters * heightMeters);
  const formattedHealthyWeightRange = `${minHealthyWeight.toFixed(1)} – ${maxHealthyWeight.toFixed(1)} kg`;

  const isPediatricAge = age < 20;

  if (isPediatricAge) {
    return {
      isValid: true,
      bmi,
      formattedBmi: bmi.toFixed(1),
      isPediatricAge: true,
      minHealthyWeight,
      maxHealthyWeight,
      formattedHealthyWeightRange,
      unitSystem: "metric",
      disclaimer: PEDIATRIC_NOTICE,
      stepExplanation: `Height: ${heightCm} cm (${heightMeters.toFixed(2)} m), Weight: ${weightKg} kg. Formula: ${weightKg} ÷ (${heightMeters.toFixed(2)} m)² = ${bmi.toFixed(2)} → ${bmi.toFixed(1)} BMI.`,
    };
  }

  const { category, obesityClass } = getAdultBMICategory(bmi);

  const classText = obesityClass ? `, ${obesityClass}` : "";
  const stepExplanation = `Height: ${heightCm} cm (${heightMeters.toFixed(2)} m), Weight: ${weightKg} kg. Formula: ${weightKg} ÷ (${heightMeters.toFixed(2)} m)² = ${bmi.toFixed(2)} → ${bmi.toFixed(1)} BMI (Category: ${category}${classText}).`;

  return {
    isValid: true,
    bmi,
    formattedBmi: bmi.toFixed(1),
    category,
    obesityClass,
    isPediatricAge: false,
    minHealthyWeight,
    maxHealthyWeight,
    formattedHealthyWeightRange,
    unitSystem: "metric",
    disclaimer: HEALTH_DISCLAIMER,
    stepExplanation,
  };
}

export function calculateUSCustomaryBMI(
  heightFeet: number,
  heightInches: number,
  weightLb: number,
  age: number = 25
): BMICalculationResult {
  if (isNaN(heightFeet) || isNaN(heightInches) || isNaN(weightLb) || isNaN(age)) {
    return { isValid: false, error: "Please enter valid numeric values for height, weight, and age." };
  }

  if (heightFeet <= 0 && heightInches <= 0) {
    return { isValid: false, error: "Height must be a positive number greater than 0." };
  }
  if (heightFeet < 1 || heightFeet > 9) {
    return { isValid: false, error: "Feet must be between 1 and 9." };
  }
  if (heightInches < 0 || heightInches >= 12) {
    return { isValid: false, error: "Inches must be between 0 and 11.9 (less than 12)." };
  }
  if (weightLb <= 0) {
    return { isValid: false, error: "Weight must be a positive number greater than 0." };
  }
  if (weightLb < 40 || weightLb > 900) {
    return { isValid: false, error: "Weight must be between 40 lb and 900 lb." };
  }
  if (age <= 0 || age > 120) {
    return { isValid: false, error: "Age must be between 1 and 120." };
  }

  const totalInches = heightFeet * 12 + heightInches;
  const bmi = (weightLb / (totalInches * totalInches)) * 703;

  // Exact normalized height in meters (1 in = 0.0254 m exact)
  const heightMeters = totalInches * 0.0254;
  const minHealthyWeightKg = 18.5 * (heightMeters * heightMeters);
  const maxHealthyWeightKg = 24.9 * (heightMeters * heightMeters);

  // Convert exact kg boundaries to pounds (1 lb = 0.45359237 kg exact)
  const minHealthyWeight = minHealthyWeightKg / 0.45359237;
  const maxHealthyWeight = maxHealthyWeightKg / 0.45359237;
  const formattedHealthyWeightRange = `${minHealthyWeight.toFixed(1)} – ${maxHealthyWeight.toFixed(1)} lb`;

  const isPediatricAge = age < 20;

  if (isPediatricAge) {
    return {
      isValid: true,
      bmi,
      formattedBmi: bmi.toFixed(1),
      isPediatricAge: true,
      minHealthyWeight,
      maxHealthyWeight,
      formattedHealthyWeightRange,
      unitSystem: "us-customary",
      disclaimer: PEDIATRIC_NOTICE,
      stepExplanation: `Height: ${heightFeet} ft ${heightInches} in (${totalInches} in), Weight: ${weightLb} lb. Formula: (${weightLb} ÷ ${totalInches}²) × 703 = ${bmi.toFixed(2)} → ${bmi.toFixed(1)} BMI.`,
    };
  }

  const { category, obesityClass } = getAdultBMICategory(bmi);

  const classText = obesityClass ? `, ${obesityClass}` : "";
  const stepExplanation = `Height: ${heightFeet} ft ${heightInches} in (${totalInches} in), Weight: ${weightLb} lb. Formula: (${weightLb} ÷ ${totalInches}²) × 703 = ${bmi.toFixed(2)} → ${bmi.toFixed(1)} BMI (Category: ${category}${classText}).`;

  return {
    isValid: true,
    bmi,
    formattedBmi: bmi.toFixed(1),
    category,
    obesityClass,
    isPediatricAge: false,
    minHealthyWeight,
    maxHealthyWeight,
    formattedHealthyWeightRange,
    unitSystem: "us-customary",
    disclaimer: HEALTH_DISCLAIMER,
    stepExplanation,
  };
}

export function calculateMetricBMIWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const heightCm = Number(inputs.heightCm);
  const weightKg = Number(inputs.weightKg);
  const age = inputs.age !== undefined && inputs.age !== "" ? Number(inputs.age) : 25;

  const result = calculateMetricBMI(heightCm, weightKg, age);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [];

  if (result.isPediatricAge) {
    secondaryValues.push({
      label: "Healthy Weight Range",
      value: result.formattedHealthyWeightRange || "",
    });
    secondaryValues.push({
      label: "Age Assessment",
      value: "Pediatric (Ages 2–19)",
    });
    secondaryValues.push({
      label: "Pediatric Notice",
      value: "Requires BMI-for-age percentiles",
    });

    return {
      isValid: true,
      primaryValue: `${result.formattedBmi} BMI`,
      primaryLabel: "Calculated Body Mass Index (kg/m²)",
      stepExplanation: result.stepExplanation,
      disclaimer: PEDIATRIC_NOTICE,
      disclaimerLabel: "Pediatric Notice",
      secondaryValues,
    };
  }

  secondaryValues.push({
    label: "BMI Category",
    value: result.category || "",
  });
  secondaryValues.push({
    label: "Healthy Weight Range",
    value: result.formattedHealthyWeightRange || "",
  });

  if (result.obesityClass) {
    secondaryValues.push({
      label: "Obesity Class",
      value: result.obesityClass,
    });
  }

  return {
    isValid: true,
    primaryValue: `${result.formattedBmi} BMI`,
    primaryLabel: `BMI category: ${result.category}`,
    stepExplanation: result.stepExplanation,
    disclaimer: HEALTH_DISCLAIMER,
    disclaimerLabel: "Medical Disclaimer",
    secondaryValues,
  };
}

export function calculateUSCustomaryBMIWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const heightFeet = Number(inputs.heightFeet);
  const heightInches = Number(inputs.heightInches);
  const weightLb = Number(inputs.weightLb);
  const age = inputs.age !== undefined && inputs.age !== "" ? Number(inputs.age) : 25;

  const result = calculateUSCustomaryBMI(heightFeet, heightInches, weightLb, age);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [];

  if (result.isPediatricAge) {
    secondaryValues.push({
      label: "Healthy Weight Range",
      value: result.formattedHealthyWeightRange || "",
    });
    secondaryValues.push({
      label: "Age Assessment",
      value: "Pediatric (Ages 2–19)",
    });
    secondaryValues.push({
      label: "Pediatric Notice",
      value: "Requires BMI-for-age percentiles",
    });

    return {
      isValid: true,
      primaryValue: `${result.formattedBmi} BMI`,
      primaryLabel: "Calculated Body Mass Index (kg/m²)",
      stepExplanation: result.stepExplanation,
      disclaimer: PEDIATRIC_NOTICE,
      disclaimerLabel: "Pediatric Notice",
      secondaryValues,
    };
  }

  secondaryValues.push({
    label: "BMI Category",
    value: result.category || "",
  });
  secondaryValues.push({
    label: "Healthy Weight Range",
    value: result.formattedHealthyWeightRange || "",
  });

  if (result.obesityClass) {
    secondaryValues.push({
      label: "Obesity Class",
      value: result.obesityClass,
    });
  }

  return {
    isValid: true,
    primaryValue: `${result.formattedBmi} BMI`,
    primaryLabel: `BMI category: ${result.category}`,
    stepExplanation: result.stepExplanation,
    disclaimer: HEALTH_DISCLAIMER,
    disclaimerLabel: "Medical Disclaimer",
    secondaryValues,
  };
}

export const bmiCalculatorDefinition: CalculatorDefinition = {
  id: "bmi-calculator",
  slug: "bmi-calculator",
  name: "BMI Calculator",
  category: "Health",
  categorySlug: "health",
  shortDescription: "Calculate Body Mass Index (BMI) for adults using Metric (cm/kg) or US Customary (ft/in/lb) units.",
  longDescription: "A pure, deterministic Adult BMI Calculator that computes Body Mass Index (expressed in kg/m²), standard CDC/WHO adult weight categories, healthy weight boundaries, and obesity classifications.",
  icon: "⚖️",
  searchKeywords: [
    "bmi",
    "bmi calculator",
    "body mass index",
    "body mass index calculator",
    "calculate bmi",
    "bmi calculator kg",
    "bmi calculator pounds",
    "bmi calculator feet inches",
    "bmi calculator metric",
    "bmi calculator adult",
    "weight category",
    "healthy weight",
    "healthy weight range",
  ],
  modes: [
    {
      id: "metric",
      name: "Metric (cm, kg)",
      description: "Calculate BMI using height in centimeters and weight in kilograms.",
      formulaText: "BMI = weight (kg) / (height (cm) / 100)²",
      inputs: [
        {
          id: "heightCm",
          label: "Height",
          type: "number",
          placeholder: "e.g. 170",
          defaultValue: 170,
          min: 50,
          max: 280,
          step: 0.1,
          suffix: "cm",
          helperText: "Enter height in centimeters (50–280 cm).",
        },
        {
          id: "weightKg",
          label: "Weight",
          type: "number",
          placeholder: "e.g. 70",
          defaultValue: 70,
          min: 20,
          max: 400,
          step: 0.1,
          suffix: "kg",
          helperText: "Enter weight in kilograms (20–400 kg).",
        },
        {
          id: "age",
          label: "Age (Adults 20+)",
          type: "number",
          placeholder: "e.g. 25",
          defaultValue: 25,
          min: 1,
          max: 120,
          step: 1,
          suffix: "years",
          helperText: "Adult BMI categories apply to individuals aged 20 and older.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateMetricBMIWrapper(inputs),
    },
    {
      id: "us-customary",
      name: "US Customary (ft, in, lb)",
      description: "Calculate BMI using height in feet and inches with weight in pounds.",
      formulaText: "BMI = (weight (lb) / height (in)²) × 703",
      inputs: [
        {
          id: "heightFeet",
          label: "Height (Feet)",
          type: "number",
          placeholder: "e.g. 5",
          defaultValue: 5,
          min: 1,
          max: 9,
          step: 1,
          suffix: "ft",
          helperText: "Feet component of height (1–9 ft).",
        },
        {
          id: "heightInches",
          label: "Height (Inches)",
          type: "number",
          placeholder: "e.g. 7",
          defaultValue: 7,
          min: 0,
          max: 11.9,
          step: 0.1,
          suffix: "in",
          helperText: "Inches component of height (0–11.9 in).",
        },
        {
          id: "weightLb",
          label: "Weight",
          type: "number",
          placeholder: "e.g. 154",
          defaultValue: 154,
          min: 40,
          max: 900,
          step: 0.1,
          suffix: "lb",
          helperText: "Enter weight in pounds (40–900 lb).",
        },
        {
          id: "age",
          label: "Age (Adults 20+)",
          type: "number",
          placeholder: "e.g. 25",
          defaultValue: 25,
          min: 1,
          max: 120,
          step: 1,
          suffix: "years",
          helperText: "Adult BMI categories apply to individuals aged 20 and older.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateUSCustomaryBMIWrapper(inputs),
    },
  ],
  defaultModeId: "metric",
  formulas: [
    {
      modeId: "metric",
      title: "Metric BMI Formula",
      formulaMath: "\\text{BMI} = \\frac{\\text{Weight (kg)}}{(\\text{Height (m)})^2} = \\frac{\\text{Weight (kg)}}{(\\text{Height (cm)} / 100)^2}",
      explanation:
        "Body Mass Index (expressed in kg/m²) is calculated by dividing body weight in kilograms by the square of height in meters.",
      example: "70 kg / (1.70 m)² = 70 / 2.89 = 24.22 → 24.2 BMI (Healthy Weight)",
      whenToUse: "Use when height is measured in centimeters (cm) and weight in kilograms (kg).",
    },
    {
      modeId: "us-customary",
      title: "US Customary BMI Formula",
      formulaMath: "\\text{BMI} = \\frac{\\text{Weight (lb)}}{(\\text{Height (in)})^2} \\times 703",
      explanation:
        "When using pounds and inches, total height in inches is squared and divided into weight in pounds, then multiplied by the conversion factor 703 (which equates lb/in² to kg/m²).",
      example: "Height: 5 ft 7 in (67 in), Weight: 154 lb. Calculation: (154 / 67²) × 703 = (154 / 4489) × 703 = 24.12 → 24.1 BMI (Healthy Weight)",
      whenToUse: "Use when height is measured in feet and inches (ft/in) and weight in pounds (lb).",
    },
  ],
  examples: [
    {
      title: "Metric Adult Example (Healthy Weight)",
      description: "An adult with height 170 cm and weight 70 kg.",
      modeId: "metric",
      inputs: {
        heightCm: 170,
        weightKg: 70,
        age: 25,
      },
      expectedOutput: "24.2 BMI (Healthy Weight)",
    },
    {
      title: "US Customary Adult Example (Healthy Weight)",
      description: "An adult with height 5 ft 7 in and weight 154 lb.",
      modeId: "us-customary",
      inputs: {
        heightFeet: 5,
        heightInches: 7,
        weightLb: 154,
        age: 30,
      },
      expectedOutput: "24.1 BMI (Healthy Weight)",
    },
    {
      title: "Metric Adult Example (Overweight)",
      description: "An adult with height 175 cm and weight 85 kg.",
      modeId: "metric",
      inputs: {
        heightCm: 175,
        weightKg: 85,
        age: 35,
      },
      expectedOutput: "27.8 BMI (Overweight)",
    },
    {
      title: "Metric Adult Example (Obesity Class 1)",
      description: "An adult with height 165 cm and weight 90 kg.",
      modeId: "metric",
      inputs: {
        heightCm: 165,
        weightKg: 90,
        age: 28,
      },
      expectedOutput: "33.1 BMI (Obesity, Class 1)",
    },
  ],
  faqs: [
    {
      question: "How is BMI calculated?",
      answer:
        "For metric units, BMI is calculated by dividing weight in kilograms by the square of height in meters: BMI = weight (kg) ÷ (height (m))². For US customary units, BMI is calculated as: BMI = (weight (lb) ÷ (height (in))²) × 703.",
    },
    {
      question: "What information do I need to calculate BMI?",
      answer:
        "To calculate your BMI, you need your current height (in centimeters or feet and inches), your body weight (in kilograms or pounds), and your age. Adults aged 20 and older are evaluated against standard adult weight categories.",
    },
    {
      question: "Can I calculate BMI using height in feet and weight in kilograms?",
      answer:
        "YourCalculate provides dedicated Metric (cm and kg) and US Customary (ft/in and lb) modes. If your height is in feet and your weight is in kilograms, convert your height to centimeters (1 foot = 30.48 cm, 1 inch = 2.54 cm) to use Metric mode, or convert your weight to pounds (1 kg ≈ 2.20462 lb) to use US Customary mode.",
    },
    {
      question: "Does BMI directly measure body fat?",
      answer:
        "No. BMI is an anthropometric screening ratio based solely on height and weight. It does not directly measure body fat percentage, lean muscle mass, bone density, or adipose tissue distribution. Two individuals with the same BMI may have substantially different body compositions.",
    },
    {
      question: "Does age or sex affect how BMI is interpreted?",
      answer:
        "Standard CDC and WHO adult BMI categories (18.5 to 24.9 as healthy weight) apply equally across adult men and women aged 20 and older. However, because body composition naturally varies by biological sex and changes with aging, BMI should be interpreted as an initial screening indicator rather than a comprehensive diagnostic measure.",
    },
    {
      question: "What BMI categories are used for adults?",
      answer:
        "According to standard CDC and WHO guidelines for adults (ages 20+): Underweight is BMI < 18.5, Healthy Weight is 18.5 ≤ BMI < 25.0, Overweight is 25.0 ≤ BMI < 30.0, and Obesity is BMI ≥ 30.0 (subdivided into Class 1: 30.0–34.9, Class 2: 35.0–39.9, and Class 3: ≥ 40.0).",
    },
    {
      question: "Does this BMI calculator work for children and teenagers?",
      answer:
        "No. This calculator is designed specifically for adults aged 20 and older. For children and adolescents (ages 2–19), BMI must be evaluated using pediatric BMI-for-age percentiles and sex-specific growth charts rather than fixed adult cutoff thresholds.",
    },
  ],
  relatedCalculators: [
    {
      id: "age-calculator",
      name: "Age Calculator",
      category: "Time & Date",
      slug: "/age-calculator",
      isAvailable: true,
    },
    {
      id: "percentage-calculator",
      name: "Percentage Calculator",
      category: "Math",
      slug: "/percentage-calculator",
      isAvailable: true,
    },
    {
      id: "average-calculator",
      name: "Average Calculator",
      category: "Math",
      slug: "/average-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "BMI Calculator — Calculate Body Mass Index (Metric & US) | YourCalculate",
    description:
      "Calculate your Body Mass Index (BMI) using metric or US customary units and view adult BMI categories and healthy weight range.",
    canonicalPath: "/bmi-calculator",
    keywords: [
      "BMI calculator",
      "BMI calculator kg",
      "BMI calculator pounds",
      "body mass index calculator",
      "calculate BMI",
      "BMI calculator metric",
      "BMI calculator feet inches",
      "adult BMI",
      "healthy weight range",
    ],
  },
};
