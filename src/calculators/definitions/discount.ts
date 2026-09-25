import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatResultNumber } from "../engine/validation";

export interface DiscountSalePriceResult {
  isValid: boolean;
  error?: string;
  originalPrice?: number;
  discountPercent?: number;
  savings?: number;
  salePrice?: number;
  formattedSalePrice?: string;
  formattedSavings?: string;
  formattedOriginalPrice?: string;
  stepExplanation?: string;
}

export interface DiscountPercentageResult {
  isValid: boolean;
  error?: string;
  originalPrice?: number;
  salePrice?: number;
  savings?: number;
  discountPercent?: number;
  formattedDiscountPercent?: string;
  formattedSavings?: string;
  formattedOriginalPrice?: string;
  formattedSalePrice?: string;
  stepExplanation?: string;
}

export interface DiscountOriginalPriceResult {
  isValid: boolean;
  error?: string;
  salePrice?: number;
  discountPercent?: number;
  originalPrice?: number;
  savings?: number;
  formattedOriginalPrice?: string;
  formattedSavings?: string;
  formattedSalePrice?: string;
  stepExplanation?: string;
}

// Mode 1: Calculate Sale Price
export function calculateSalePrice(
  originalPrice: number,
  discountPercent: number
): DiscountSalePriceResult {
  if (isNaN(originalPrice) || isNaN(discountPercent)) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }
  if (originalPrice <= 0) {
    return { isValid: false, error: "Original price must be greater than 0." };
  }
  if (discountPercent < 0) {
    return { isValid: false, error: "Discount percentage cannot be negative." };
  }
  if (discountPercent > 100) {
    return { isValid: false, error: "Discount percentage cannot exceed 100%." };
  }

  const savings = originalPrice * (discountPercent / 100);
  const salePrice = originalPrice - savings;

  const formattedOriginalPrice = formatResultNumber(originalPrice, 2);
  const formattedSavings = formatResultNumber(savings, 2);
  const formattedSalePrice = formatResultNumber(salePrice, 2);

  const stepExplanation = `Original Price: ${formattedOriginalPrice}. Discount (${formatResultNumber(discountPercent, 2)}%): ${formattedOriginalPrice} × ${formatResultNumber(discountPercent, 2)} / 100 = ${formattedSavings}. Final Price: ${formattedOriginalPrice} − ${formattedSavings} = ${formattedSalePrice}.`;

  return {
    isValid: true,
    originalPrice,
    discountPercent,
    savings,
    salePrice,
    formattedSalePrice,
    formattedSavings,
    formattedOriginalPrice,
    stepExplanation,
  };
}

// Mode 2: Calculate Discount Percentage
export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number
): DiscountPercentageResult {
  if (isNaN(originalPrice) || isNaN(salePrice)) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }
  if (originalPrice <= 0) {
    return { isValid: false, error: "Original price must be greater than 0." };
  }
  if (salePrice < 0) {
    return { isValid: false, error: "Sale price cannot be negative." };
  }
  if (salePrice > originalPrice) {
    return { isValid: false, error: "Sale price cannot exceed the original price for a discount calculation." };
  }

  const savings = originalPrice - salePrice;
  const discountPercent = (savings / originalPrice) * 100;

  const formattedOriginalPrice = formatResultNumber(originalPrice, 2);
  const formattedSalePrice = formatResultNumber(salePrice, 2);
  const formattedSavings = formatResultNumber(savings, 2);
  const formattedDiscountPercent = formatResultNumber(discountPercent, 2);

  const stepExplanation = `Original Price: ${formattedOriginalPrice}, Sale Price: ${formattedSalePrice}. Savings: ${formattedOriginalPrice} − ${formattedSalePrice} = ${formattedSavings}. Discount Percentage: (${formattedSavings} / ${formattedOriginalPrice}) × 100 = ${formattedDiscountPercent}%.`;

  return {
    isValid: true,
    originalPrice,
    salePrice,
    savings,
    discountPercent,
    formattedDiscountPercent,
    formattedSavings,
    formattedOriginalPrice,
    formattedSalePrice,
    stepExplanation,
  };
}

// Mode 3: Calculate Original Price
export function calculateOriginalPrice(
  salePrice: number,
  discountPercent: number
): DiscountOriginalPriceResult {
  if (isNaN(salePrice) || isNaN(discountPercent)) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }
  if (salePrice <= 0) {
    return { isValid: false, error: "Sale price must be greater than 0." };
  }
  if (discountPercent < 0) {
    return { isValid: false, error: "Discount percentage cannot be negative." };
  }
  if (discountPercent >= 100) {
    return { isValid: false, error: "Discount percentage must be less than 100% to calculate original price." };
  }

  const originalPrice = salePrice / (1 - discountPercent / 100);
  const savings = originalPrice - salePrice;

  const formattedSalePrice = formatResultNumber(salePrice, 2);
  const formattedOriginalPrice = formatResultNumber(originalPrice, 2);
  const formattedSavings = formatResultNumber(savings, 2);
  const formattedDiscountPercent = formatResultNumber(discountPercent, 2);

  const factor = formatResultNumber(1 - discountPercent / 100, 4);
  const stepExplanation = `Sale Price: ${formattedSalePrice}, Discount (${formattedDiscountPercent}%). Original Price: ${formattedSalePrice} / (1 − ${formattedDiscountPercent} / 100) = ${formattedSalePrice} / ${factor} = ${formattedOriginalPrice}. Total Savings: ${formattedOriginalPrice} − ${formattedSalePrice} = ${formattedSavings}.`;

  return {
    isValid: true,
    salePrice,
    discountPercent,
    originalPrice,
    savings,
    formattedOriginalPrice,
    formattedSavings,
    formattedSalePrice,
    stepExplanation,
  };
}

export function calculateSalePriceWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const originalPrice = Number(inputs.originalPrice);
  const discountPercent = Number(inputs.discountPercent);

  const result = calculateSalePrice(originalPrice, discountPercent);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "You Save",
      value: `${result.formattedSavings} (${formatResultNumber(discountPercent, 2)}%)`,
    },
    {
      label: "Original Price",
      value: result.formattedOriginalPrice || "",
    },
    {
      label: "Final Price",
      value: result.formattedSalePrice || "",
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedSalePrice,
    primaryLabel: `Final price after ${formatResultNumber(discountPercent, 2)}% discount`,
    stepExplanation: result.stepExplanation,
    secondaryValues,
  };
}

export function calculateDiscountPercentageWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const originalPrice = Number(inputs.originalPrice);
  const salePrice = Number(inputs.salePrice);

  const result = calculateDiscountPercentage(originalPrice, salePrice);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Total Savings",
      value: result.formattedSavings || "",
    },
    {
      label: "Original Price",
      value: result.formattedOriginalPrice || "",
    },
    {
      label: "Sale Price",
      value: result.formattedSalePrice || "",
    },
  ];

  return {
    isValid: true,
    primaryValue: `${result.formattedDiscountPercent}%`,
    primaryLabel: "Total discount percentage applied",
    stepExplanation: result.stepExplanation,
    secondaryValues,
  };
}

export function calculateOriginalPriceWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const salePrice = Number(inputs.salePrice);
  const discountPercent = Number(inputs.discountPercent);

  const result = calculateOriginalPrice(salePrice, discountPercent);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Total Savings",
      value: `${result.formattedSavings} (${formatResultNumber(discountPercent, 2)}%)`,
    },
    {
      label: "Sale Price",
      value: result.formattedSalePrice || "",
    },
    {
      label: "Original Price",
      value: result.formattedOriginalPrice || "",
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedOriginalPrice,
    primaryLabel: `Original price before ${formatResultNumber(discountPercent, 2)}% discount`,
    stepExplanation: result.stepExplanation,
    secondaryValues,
  };
}

export const discountCalculatorDefinition: CalculatorDefinition = {
  id: "discount-calculator",
  slug: "discount-calculator",
  name: "Discount Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription: "Calculate final sale price, discount percentage, savings, and original retail price.",
  longDescription: "A pure, deterministic commercial calculation utility that computes net discounted prices, applied percentage markdowns, total savings, and pre-discount retail values.",
  icon: "🏷️",
  searchKeywords: [
    "discount",
    "discount calculator",
    "sale price",
    "sale calculator",
    "percentage discount",
    "discount percentage",
    "discount amount",
    "price after discount",
    "calculate discount",
    "sale discount",
    "savings calculator",
    "price markdown",
    "20 percent off calculator",
    "how much is 20 percent off",
    "percent off",
  ],
  defaultModeId: "sale-price",
  modes: [
    {
      id: "sale-price",
      name: "Calculate Sale Price",
      description: "Find the discounted final price and total savings from an original price and percentage discount.",
      formulaText: "Final Price = Original Price − (Original Price × Discount% / 100)",
      inputs: [
        {
          id: "originalPrice",
          label: "Original Price",
          type: "number",
          placeholder: "e.g. 2000",
          defaultValue: 2000,
          min: 0.01,
          step: 0.01,
          helperText: "Initial retail or list price before discount.",
        },
        {
          id: "discountPercent",
          label: "Discount",
          type: "number",
          placeholder: "e.g. 25",
          defaultValue: 25,
          min: 0,
          max: 100,
          step: 0.1,
          suffix: "%",
          helperText: "Discount percentage (0–100%).",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateSalePriceWrapper(inputs),
    },
    {
      id: "discount-percentage",
      name: "Calculate Discount %",
      description: "Determine the exact percentage discount applied between the original price and sale price.",
      formulaText: "Discount % = ((Original Price − Sale Price) / Original Price) × 100",
      inputs: [
        {
          id: "originalPrice",
          label: "Original Price",
          type: "number",
          placeholder: "e.g. 2500",
          defaultValue: 2500,
          min: 0.01,
          step: 0.01,
          helperText: "Original price before markdown.",
        },
        {
          id: "salePrice",
          label: "Sale Price",
          type: "number",
          placeholder: "e.g. 2000",
          defaultValue: 2000,
          min: 0,
          step: 0.01,
          helperText: "Final discounted price paid.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateDiscountPercentageWrapper(inputs),
    },
    {
      id: "original-price",
      name: "Calculate Original Price",
      description: "Calculate the original retail price before a known discount percentage was applied.",
      formulaText: "Original Price = Sale Price / (1 − Discount% / 100)",
      inputs: [
        {
          id: "salePrice",
          label: "Sale Price",
          type: "number",
          placeholder: "e.g. 1500",
          defaultValue: 1500,
          min: 0.01,
          step: 0.01,
          helperText: "Discounted price after percentage reduction.",
        },
        {
          id: "discountPercent",
          label: "Discount",
          type: "number",
          placeholder: "e.g. 25",
          defaultValue: 25,
          min: 0,
          max: 99.99,
          step: 0.1,
          suffix: "%",
          helperText: "Discount percentage applied (0–99.99%).",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateOriginalPriceWrapper(inputs),
    },
  ],
  formulas: [
    {
      modeId: "sale-price",
      title: "1. Sale Price & Savings Formula",
      formulaMath: "\\text{Final Price} = \\text{Original Price} - (\\text{Original Price} \\times \\frac{\\text{Discount %}}{100})",
      explanation:
        "Multiply the original list price by the discount percentage to calculate total savings, then subtract those savings from the original price to determine the final sale price.",
      example: "Original 2,000 with 25% off: Savings = 2,000 × (25 / 100) = 500. Final Price = 2,000 − 500 = 1,500.",
      whenToUse: "Use when you know the initial item price and the percentage markdown (e.g. 20% off sales).",
    },
    {
      modeId: "discount-percentage",
      title: "2. Applied Discount Percentage Formula",
      formulaMath: "\\text{Discount %} = \\frac{\\text{Original Price} - \\text{Sale Price}}{\\text{Original Price}} \\times 100",
      explanation:
        "Subtract the sale price from the original price to find the total money saved, divide that reduction by the original baseline price, and multiply by 100.",
      example: "Original 2,500 and Sale 2,000: Savings = 2,500 − 2,000 = 500. Discount % = (500 / 2,500) × 100 = 20%.",
      whenToUse: "Use when you know both the starting price and the final sale price and want to find the discount rate.",
    },
    {
      modeId: "original-price",
      title: "3. Original Price Before Discount Formula",
      formulaMath: "\\text{Original Price} = \\frac{\\text{Sale Price}}{1 - (\\text{Discount %} / 100)}",
      explanation:
        "Divide the sale price by the remaining paid percentage proportion (1 − Discount% / 100) to reconstruct the initial list price before the discount occurred.",
      example: "Sale price 1,500 after 25% discount: Original Price = 1,500 / (1 − 0.25) = 1,500 / 0.75 = 2,000.",
      whenToUse: "Use when an item is on sale and you need to determine the original pre-sale retail price.",
    },
  ],
  examples: [
    {
      title: "Example 1: 25% off 2,000",
      description: "Calculating the discounted price and savings on an item priced at 2,000 with 25% off.",
      modeId: "sale-price",
      inputs: { originalPrice: 2000, discountPercent: 25 },
      expectedOutput: "1,500",
    },
    {
      title: "Example 2: 40% off 5,000",
      description: "Calculating the sale price on a larger purchase with 40% discount.",
      modeId: "sale-price",
      inputs: { originalPrice: 5000, discountPercent: 40 },
      expectedOutput: "3,000",
    },
    {
      title: "Example 3: Original 2,500 to Sale 2,000",
      description: "Determining the applied percentage discount from original and sale prices.",
      modeId: "discount-percentage",
      inputs: { originalPrice: 2500, salePrice: 2000 },
      expectedOutput: "20%",
    },
    {
      title: "Example 4: Sale Price 1,500 at 25% Discount",
      description: "Finding the original pre-discount retail price from a discounted price of 1,500.",
      modeId: "original-price",
      inputs: { salePrice: 1500, discountPercent: 25 },
      expectedOutput: "2,000",
    },
  ],
  faqs: [
    {
      question: "How do I calculate a discount?",
      answer:
        "To calculate a discount, multiply the original price by the discount percentage and divide by 100 to get total savings. For example, a 20% discount on a 1,000 item is: 1,000 × (20 / 100) = 200 savings.",
    },
    {
      question: "How do I calculate the final sale price?",
      answer:
        "Subtract the discount savings from the original price: Final Price = Original Price − Discount Amount. Alternatively, multiply the original price by (1 − Discount% / 100).",
    },
    {
      question: "How do I calculate the discount percentage?",
      answer:
        "Subtract the sale price from the original price to find the savings, divide that savings by the original price, and multiply by 100: Discount % = ((Original Price − Sale Price) / Original Price) × 100.",
    },
    {
      question: "How do I find the original price before a discount?",
      answer:
        "Divide the sale price by (1 − Discount% / 100). For example, if a jacket on a 25% sale costs 1,500, the original price was: 1,500 / (1 − 0.25) = 1,500 / 0.75 = 2,000.",
    },
    {
      question: "How much is 20% off 1,000?",
      answer:
        "20% off 1,000 saves you 200, resulting in a final sale price of 800.",
    },
    {
      question: "Can I calculate decimal discounts and prices?",
      answer:
        "Yes. YourCalculate supports fractional discount percentages (such as 12.5% or 17.5%) and exact decimal currency values with full floating-point precision.",
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
  ],
  seo: {
    title: "Discount Calculator — Calculate Sale Price & Savings | YourCalculate",
    description:
      "Calculate sale prices, discount percentages, savings, and original prices with step-by-step calculations.",
    canonicalPath: "/discount-calculator",
    keywords: [
      "discount calculator",
      "sale price calculator",
      "percentage discount",
      "discount percentage",
      "price after discount",
      "calculate discount",
      "savings calculator",
      "how much is 20 percent off",
    ],
  },
};
