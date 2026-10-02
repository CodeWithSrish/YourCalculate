import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import { formatResultNumber } from "../engine/validation";

export type TaxType = "intra" | "inter";

export interface AddGstResult {
  isValid: boolean;
  error?: string;
  basePrice?: number;
  gstRate?: number;
  taxType?: TaxType;
  gstAmount?: number;
  finalPrice?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  formattedBasePrice?: string;
  formattedGstAmount?: string;
  formattedFinalPrice?: string;
  formattedCgstAmount?: string;
  formattedSgstAmount?: string;
  formattedIgstAmount?: string;
  stepExplanation?: string;
}

export interface RemoveGstResult {
  isValid: boolean;
  error?: string;
  inclusivePrice?: number;
  gstRate?: number;
  taxType?: TaxType;
  basePrice?: number;
  gstAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  formattedInclusivePrice?: string;
  formattedBasePrice?: string;
  formattedGstAmount?: string;
  formattedCgstAmount?: string;
  formattedSgstAmount?: string;
  formattedIgstAmount?: string;
  stepExplanation?: string;
}

// Helper: Split and reconcile GST into CGST and SGST with guaranteed display sum equality
function splitGstAmounts(gstAmount: number, gstRate: number, taxType: TaxType) {
  const formattedGstAmount = formatResultNumber(gstAmount, 2);
  const numericGst = Number(formattedGstAmount.replace(/,/g, ""));

  if (taxType === "inter") {
    return {
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: gstAmount,
      formattedGstAmount,
      formattedCgstAmount: "0",
      formattedSgstAmount: "0",
      formattedIgstAmount: formattedGstAmount,
    };
  }

  // Intra-State: 50% CGST + 50% SGST
  const halfGst = gstAmount / 2;
  const formattedCgstAmount = formatResultNumber(halfGst, 2);
  const numericCgst = Number(formattedCgstAmount.replace(/,/g, ""));
  const reconciledSgst = Math.max(0, numericGst - numericCgst);
  const formattedSgstAmount = formatResultNumber(reconciledSgst, 2);

  return {
    cgstAmount: halfGst,
    sgstAmount: halfGst,
    igstAmount: 0,
    formattedGstAmount,
    formattedCgstAmount,
    formattedSgstAmount,
    formattedIgstAmount: "0",
  };
}

// Mode 1: Add GST Calculation Engine
export function calculateAddGst(
  basePrice: number,
  gstRate: number,
  taxType: TaxType = "intra"
): AddGstResult {
  if (isNaN(basePrice) || isNaN(gstRate)) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }
  if (basePrice <= 0) {
    return { isValid: false, error: "Base price must be greater than 0." };
  }
  if (gstRate < 0) {
    return { isValid: false, error: "GST rate cannot be negative." };
  }
  if (gstRate > 100) {
    return { isValid: false, error: "GST rate cannot exceed 100%." };
  }

  const gstAmount = basePrice * (gstRate / 100);
  const finalPrice = basePrice + gstAmount;

  const formattedBasePrice = formatResultNumber(basePrice, 2);
  const formattedFinalPrice = formatResultNumber(finalPrice, 2);
  const formattedGstRate = formatResultNumber(gstRate, 2);
  const halfRate = formatResultNumber(gstRate / 2, 2);

  const split = splitGstAmounts(gstAmount, gstRate, taxType);

  let stepExplanation = "";
  if (taxType === "intra") {
    stepExplanation = `Base Price: ${formattedBasePrice}, GST Rate: ${formattedGstRate}% (Intra-State: CGST ${halfRate}% + SGST ${halfRate}%). GST Amount: ${formattedBasePrice} × (${formattedGstRate} / 100) = ${split.formattedGstAmount}. CGST: ${split.formattedGstAmount} / 2 = ${split.formattedCgstAmount}. SGST: ${split.formattedGstAmount} − ${split.formattedCgstAmount} = ${split.formattedSgstAmount}. Final Price: ${formattedBasePrice} + ${split.formattedGstAmount} = ${formattedFinalPrice}.`;
  } else {
    stepExplanation = `Base Price: ${formattedBasePrice}, GST Rate: ${formattedGstRate}% (Inter-State: IGST ${formattedGstRate}%). GST Amount: ${formattedBasePrice} × (${formattedGstRate} / 100) = ${split.formattedGstAmount}. IGST: ${split.formattedGstAmount}. Final Price: ${formattedBasePrice} + ${split.formattedGstAmount} = ${formattedFinalPrice}.`;
  }

  return {
    isValid: true,
    basePrice,
    gstRate,
    taxType,
    gstAmount,
    finalPrice,
    cgstAmount: split.cgstAmount,
    sgstAmount: split.sgstAmount,
    igstAmount: split.igstAmount,
    formattedBasePrice,
    formattedFinalPrice,
    formattedGstAmount: split.formattedGstAmount,
    formattedCgstAmount: split.formattedCgstAmount,
    formattedSgstAmount: split.formattedSgstAmount,
    formattedIgstAmount: split.formattedIgstAmount,
    stepExplanation,
  };
}

// Mode 2: Remove GST Calculation Engine
export function calculateRemoveGst(
  inclusivePrice: number,
  gstRate: number,
  taxType: TaxType = "intra"
): RemoveGstResult {
  if (isNaN(inclusivePrice) || isNaN(gstRate)) {
    return { isValid: false, error: "Please enter valid numeric values." };
  }
  if (inclusivePrice <= 0) {
    return { isValid: false, error: "GST-inclusive price must be greater than 0." };
  }
  if (gstRate < 0) {
    return { isValid: false, error: "GST rate cannot be negative." };
  }
  if (gstRate > 100) {
    return { isValid: false, error: "GST rate cannot exceed 100%." };
  }

  const factor = 1 + gstRate / 100;
  const basePrice = inclusivePrice / factor;
  const gstAmount = inclusivePrice - basePrice;

  const formattedInclusivePrice = formatResultNumber(inclusivePrice, 2);
  const formattedBasePrice = formatResultNumber(basePrice, 2);
  const formattedGstRate = formatResultNumber(gstRate, 2);
  const formattedFactor = formatResultNumber(factor, 4);
  const halfRate = formatResultNumber(gstRate / 2, 2);

  const split = splitGstAmounts(gstAmount, gstRate, taxType);

  let stepExplanation = "";
  if (taxType === "intra") {
    stepExplanation = `Inclusive Price: ${formattedInclusivePrice}, GST Rate: ${formattedGstRate}% (Intra-State: CGST ${halfRate}% + SGST ${halfRate}%). Base Price: ${formattedInclusivePrice} / (1 + ${formattedGstRate} / 100) = ${formattedInclusivePrice} / ${formattedFactor} = ${formattedBasePrice}. GST Amount: ${formattedInclusivePrice} − ${formattedBasePrice} = ${split.formattedGstAmount}. CGST: ${split.formattedGstAmount} / 2 = ${split.formattedCgstAmount}. SGST: ${split.formattedGstAmount} − ${split.formattedCgstAmount} = ${split.formattedSgstAmount}.`;
  } else {
    stepExplanation = `Inclusive Price: ${formattedInclusivePrice}, GST Rate: ${formattedGstRate}% (Inter-State: IGST ${formattedGstRate}%). Base Price: ${formattedInclusivePrice} / (1 + ${formattedGstRate} / 100) = ${formattedInclusivePrice} / ${formattedFactor} = ${formattedBasePrice}. GST Amount: ${formattedInclusivePrice} − ${formattedBasePrice} = ${split.formattedGstAmount}. IGST: ${split.formattedGstAmount}.`;
  }

  return {
    isValid: true,
    inclusivePrice,
    gstRate,
    taxType,
    basePrice,
    gstAmount,
    cgstAmount: split.cgstAmount,
    sgstAmount: split.sgstAmount,
    igstAmount: split.igstAmount,
    formattedInclusivePrice,
    formattedBasePrice,
    formattedGstAmount: split.formattedGstAmount,
    formattedCgstAmount: split.formattedCgstAmount,
    formattedSgstAmount: split.formattedSgstAmount,
    formattedIgstAmount: split.formattedIgstAmount,
    stepExplanation,
  };
}

export function calculateAddGstWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const basePrice = Number(inputs.basePrice);
  const gstRate = Number(inputs.gstRate);
  const taxType = (inputs.taxType as TaxType) || "intra";

  const result = calculateAddGst(basePrice, gstRate, taxType);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Base Price",
      value: result.formattedBasePrice || "",
    },
    {
      label: `Total GST (${formatResultNumber(gstRate, 2)}%)`,
      value: result.formattedGstAmount || "",
    },
  ];

  if (taxType === "intra") {
    secondaryValues.push(
      {
        label: `CGST (${formatResultNumber(gstRate / 2, 2)}%)`,
        value: result.formattedCgstAmount || "",
      },
      {
        label: `SGST (${formatResultNumber(gstRate / 2, 2)}%)`,
        value: result.formattedSgstAmount || "",
      }
    );
  } else {
    secondaryValues.push({
      label: `IGST (${formatResultNumber(gstRate, 2)}%)`,
      value: result.formattedIgstAmount || "",
    });
  }

  const gstDisclaimer =
    "This calculator performs arithmetic using the GST rate you enter. GST rates and tax treatment may vary depending on the goods, services, and transaction. Verify the applicable rate using official GST guidance or consult a qualified tax professional.";

  return {
    isValid: true,
    primaryValue: result.formattedFinalPrice,
    primaryLabel: `Total price including ${formatResultNumber(gstRate, 2)}% GST`,
    stepExplanation: result.stepExplanation,
    disclaimer: gstDisclaimer,
    disclaimerLabel: "Important Tax Notice",
    secondaryValues,
  };
}

export function calculateRemoveGstWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const inclusivePrice = Number(inputs.inclusivePrice);
  const gstRate = Number(inputs.gstRate);
  const taxType = (inputs.taxType as TaxType) || "intra";

  const result = calculateRemoveGst(inclusivePrice, gstRate, taxType);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Please enter valid numeric values.",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "GST-Inclusive Price",
      value: result.formattedInclusivePrice || "",
    },
    {
      label: `Total GST (${formatResultNumber(gstRate, 2)}%)`,
      value: result.formattedGstAmount || "",
    },
  ];

  if (taxType === "intra") {
    secondaryValues.push(
      {
        label: `CGST (${formatResultNumber(gstRate / 2, 2)}%)`,
        value: result.formattedCgstAmount || "",
      },
      {
        label: `SGST (${formatResultNumber(gstRate / 2, 2)}%)`,
        value: result.formattedSgstAmount || "",
      }
    );
  } else {
    secondaryValues.push({
      label: `IGST (${formatResultNumber(gstRate, 2)}%)`,
      value: result.formattedIgstAmount || "",
    });
  }

  const gstDisclaimer =
    "This calculator performs arithmetic using the GST rate you enter. GST rates and tax treatment may vary depending on the goods, services, and transaction. Verify the applicable rate using official GST guidance or consult a qualified tax professional.";

  return {
    isValid: true,
    primaryValue: result.formattedBasePrice,
    primaryLabel: `Original base price before ${formatResultNumber(gstRate, 2)}% GST`,
    stepExplanation: result.stepExplanation,
    disclaimer: gstDisclaimer,
    disclaimerLabel: "Important Tax Notice",
    secondaryValues,
  };
}

export const gstCalculatorDefinition: CalculatorDefinition = {
  id: "gst-calculator",
  slug: "gst-calculator",
  name: "GST Calculator",
  category: "Finance",
  categorySlug: "finance",
  shortDescription: "Calculate GST amounts, add or remove GST from prices, and compute CGST, SGST, and IGST splits.",
  longDescription: "A pure commercial Goods and Services Tax computation utility for adding GST to net base prices, removing GST from inclusive totals, and breaking down intra-state (CGST + SGST) and inter-state (IGST) tax components.",
  icon: "🧾",
  searchKeywords: [
    "gst",
    "gst calculator",
    "gst calculator india",
    "calculate gst",
    "gst amount",
    "add gst",
    "remove gst",
    "gst inclusive",
    "gst exclusive",
    "cgst",
    "sgst",
    "igst",
    "cgst sgst calculator",
    "igst calculator",
    "18 gst",
    "gst percentage",
    "reverse gst",
    "price before gst",
    "tax invoice calculator",
  ],
  defaultModeId: "add-gst",
  modes: [
    {
      id: "add-gst",
      name: "Add GST",
      description: "Compute total price and tax components from a tax-exclusive base price and GST percentage rate.",
      formulaText: "Final Price = Base Price + (Base Price × GST% / 100)",
      inputs: [
        {
          id: "basePrice",
          label: "Base Price",
          type: "number",
          placeholder: "e.g. 10000",
          defaultValue: 10000,
          min: 0.01,
          step: 0.01,
          helperText: "Net pre-tax amount before GST is added.",
        },
        {
          id: "gstRate",
          label: "GST Rate",
          type: "number",
          placeholder: "e.g. 18",
          defaultValue: 18,
          min: 0,
          max: 100,
          step: 0.1,
          suffix: "%",
          helperText: "Common slabs: 0%, 5%, 12%, 18%, 28%. Enter a custom rate if needed.",
        },
        {
          id: "taxType",
          label: "Transaction Type",
          type: "select",
          defaultValue: "intra",
          options: [
            { label: "Intra-State (CGST + SGST)", value: "intra" },
            { label: "Inter-State (IGST)", value: "inter" },
          ],
          helperText: "Intra-state applies CGST + SGST; inter-state applies IGST.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateAddGstWrapper(inputs),
    },
    {
      id: "remove-gst",
      name: "Remove GST",
      description: "Determine the original pre-tax base price and tax amount from a GST-inclusive price.",
      formulaText: "Base Price = Inclusive Price / (1 + GST% / 100)",
      inputs: [
        {
          id: "inclusivePrice",
          label: "GST-Inclusive Price",
          type: "number",
          placeholder: "e.g. 11800",
          defaultValue: 11800,
          min: 0.01,
          step: 0.01,
          helperText: "Gross bill amount or MRP including GST.",
        },
        {
          id: "gstRate",
          label: "GST Rate",
          type: "number",
          placeholder: "e.g. 18",
          defaultValue: 18,
          min: 0,
          max: 100,
          step: 0.1,
          suffix: "%",
          helperText: "Common slabs: 0%, 5%, 12%, 18%, 28%. Enter a custom rate if needed.",
        },
        {
          id: "taxType",
          label: "Transaction Type",
          type: "select",
          defaultValue: "intra",
          options: [
            { label: "Intra-State (CGST + SGST)", value: "intra" },
            { label: "Inter-State (IGST)", value: "inter" },
          ],
          helperText: "Intra-state applies CGST + SGST; inter-state applies IGST.",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => calculateRemoveGstWrapper(inputs),
    },
  ],
  formulas: [
    {
      modeId: "add-gst",
      title: "1. Add GST Formula (Forward Calculation)",
      formulaMath: "\\text{Final Price} = \\text{Base Price} + (\\text{Base Price} \\times \\frac{\\text{GST %}}{100})",
      explanation:
        "Multiply the pre-tax base price by the GST rate percentage and divide by 100 to compute the GST amount, then add it to the base price to find the total invoice amount.",
      example: "Base Price 10,000 at 18% GST: GST = 10,000 × (18 / 100) = 1,800. Final Price = 10,000 + 1,800 = 11,800.",
      whenToUse: "Use when billing customers from a net catalog price or calculating tax on pre-tax quotes.",
    },
    {
      modeId: "remove-gst",
      title: "2. Remove GST Formula (Reverse Calculation)",
      formulaMath: "\\text{Base Price} = \\frac{\\text{Inclusive Price}}{1 + (\\text{GST %} / 100)}",
      explanation:
        "Divide the gross inclusive price by (1 + GST% / 100) to extract the pre-tax base price, then subtract the base price from the inclusive price to obtain the exact GST amount.",
      example: "Inclusive Price 11,800 at 18% GST: Base Price = 11,800 / 1.18 = 10,000. GST Amount = 11,800 − 10,000 = 1,800.",
      whenToUse: "Use when analyzing MRP retail bills or reverse-engineering pre-tax amounts from gross receipts.",
    },
    {
      modeId: "tax-split",
      title: "3. Tax Component Split (CGST, SGST & IGST)",
      formulaMath: "\\text{CGST} = \\frac{\\text{GST Amount}}{2}, \\quad \\text{SGST} = \\frac{\\text{GST Amount}}{2}, \\quad \\text{IGST} = \\text{GST Amount}",
      explanation:
        "For intra-state transactions (within the same state), GST is split equally between Central GST (CGST) and State GST (SGST). For inter-state transactions, Integrated GST (IGST) applies to the full tax amount.",
      example: "GST Amount 1,800 at 18%: Intra-state yields CGST = 900 (9%) and SGST = 900 (9%). Inter-state yields IGST = 1,800 (18%).",
      whenToUse: "Use when preparing invoice tax summaries and determining tax liability across state boundaries.",
    },
  ],
  examples: [
    {
      title: "Example 1: 10,000 with 18% GST (Intra-State)",
      description: "Adding 18% GST to a base service fee of 10,000 within the same state.",
      modeId: "add-gst",
      inputs: { basePrice: 10000, gstRate: 18, taxType: "intra" },
      expectedOutput: "11,800",
    },
    {
      title: "Example 2: 11,800 Gross Amount at 18% GST (Remove GST)",
      description: "Extracting the base price and tax amount from an 11,800 gross bill.",
      modeId: "remove-gst",
      inputs: { inclusivePrice: 11800, gstRate: 18, taxType: "intra" },
      expectedOutput: "10,000",
    },
    {
      title: "Example 3: 10,000 with 5% GST (Intra-State)",
      description: "Calculating 5% essential goods GST on a 10,000 base purchase.",
      modeId: "add-gst",
      inputs: { basePrice: 10000, gstRate: 5, taxType: "intra" },
      expectedOutput: "10,500",
    },
    {
      title: "Example 4: 10,000 with 18% GST (Inter-State IGST)",
      description: "Calculating inter-state supply tax with integrated IGST applied.",
      modeId: "add-gst",
      inputs: { basePrice: 10000, gstRate: 18, taxType: "inter" },
      expectedOutput: "11,800",
    },
  ],
  faqs: [
    {
      question: "How do I calculate GST using a calculator?",
      answer:
        "Enter your pre-tax base price and the applicable GST percentage rate into the calculator. The tool calculates total GST (Base Price × GST% ÷ 100) and displays both the tax amount and the gross total price.",
    },
    {
      question: "How do I calculate 18% GST?",
      answer:
        "To add 18% GST, multiply the base price by 0.18 to find the tax amount, or by 1.18 to get the final inclusive total. To remove 18% GST from a gross amount, divide the gross inclusive price by 1.18 to find the pre-tax base price.",
    },
    {
      question: "How do I calculate GST-inclusive and GST-exclusive prices?",
      answer:
        "To find a GST-inclusive price from an exclusive amount, use the 'Add GST' mode (Final Price = Base Price + Base Price × GST% ÷ 100). To extract an exclusive base price from an inclusive total, use the 'Remove GST' mode (Base Price = Inclusive Price ÷ (1 + GST% ÷ 100)).",
    },
    {
      question: "What is the difference between CGST, SGST/UTGST and IGST?",
      answer:
        "In this calculator, Intra-State mode splits the entered GST rate equally between Central GST (CGST) and State/UT GST (SGST/UTGST). Inter-State mode applies the entered rate fully as Integrated GST (IGST). Actual GST treatment and classification depend on the specific transaction and prevailing tax rules.",
    },
    {
      question: "How do I calculate the price before GST?",
      answer:
        "Use the Remove GST mode and enter the gross invoice amount and GST rate. The calculator divides the inclusive price by (1 + GST% ÷ 100) to find the pre-tax base price.",
    },
    {
      question: "How do I add GST to an amount?",
      answer:
        "Enter the pre-tax amount and GST percentage in the 'Add GST' mode. The calculator multiplies the base price by the rate percentage and adds it to the base price to produce the final gross total.",
    },
    {
      question: "Can I enter a custom or decimal GST rate?",
      answer:
        "Yes. YourCalculate supports standard GST slabs (0%, 5%, 12%, 18%, 28%) as well as custom or fractional rates (such as 0.25%, 3%, or 18.5%) with exact floating-point precision.",
    },
  ],
  relatedCalculators: [
    {
      id: "discount-calculator",
      name: "Discount Calculator",
      category: "Finance",
      slug: "/discount-calculator",
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
      id: "emi-calculator",
      name: "EMI Calculator",
      category: "Finance",
      slug: "/emi-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "GST Calculator — Add or Remove GST, CGST, SGST & IGST | YourCalculate",
    description:
      "Calculate GST amounts, add or remove GST from prices, and split CGST, SGST, and IGST with instant step-by-step calculations.",
    canonicalPath: "/gst-calculator",
    keywords: [
      "gst calculator",
      "gst calculation",
      "add gst",
      "remove gst",
      "gst inclusive",
      "gst exclusive",
      "cgst sgst calculator",
      "igst calculator",
      "18 gst calculator",
      "price before gst",
    ],
  },
};
