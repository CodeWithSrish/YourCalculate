import {
  tokenize,
  ASTParser,
  ASTEvaluator,
  ASTNode,
  AngleMode,
} from "./scientific";
import {
  ExactValue,
  ExactASTEvaluator,
  StepGenerator,
  formatExactValue,
  createExactRational,
  createExactInteger,
  CalculationStep,
} from "./scientificSteps";
import {
  PhysicalDimension,
  findUnit,
} from "./scientificUnits";

// =========================================================================
// 1. DATA MODELS & TYPES
// =========================================================================

export type FormulaCategory =
  | "Geometry"
  | "Physics"
  | "Finance"
  | "Trigonometry"
  | "Algebra";

export interface FormulaVariableDefinition {
  symbol: string;               // Variable identifier e.g. "r", "d", "t", "P", "x1"
  name: string;                 // Human-readable label e.g. "Radius"
  description: string;          // Mathematical explanation
  dimension: PhysicalDimension; // "length" | "time" | "mass" | "area" | "volume" | "speed" | "dimensionless"
  defaultUnit?: string;         // e.g. "cm", "m", "h", "s"
  allowedUnits?: string[];      // Supported unit options for this variable
  defaultValue: number;         // Default initial value
  min?: number;                 // Optional lower bound
  max?: number;                 // Optional upper bound
  step?: number;                // Input step value
}

export interface FormulaTargetDefinition {
  symbol: string;               // Target variable symbol e.g. "A", "C", "V", "v", "I"
  name: string;                 // Human-readable target name e.g. "Area"
  dimension: PhysicalDimension; // Dimension of the target
  defaultUnit?: string;         // Default output unit e.g. "cm²", "km/h"
  supportedUnits?: string[];    // Dimensionally compatible output units
}

export interface FormulaExample {
  title: string;
  description: string;
  variableValues: Record<string, number>;
  variableUnits?: Record<string, string>;
  outputUnit?: string;
  expectedResult: {
    exact?: string | null;
    decimal: number;
    formattedDecimal?: string;
  };
}

export interface FormulaDefinition {
  id: string;                   // Unique formula identifier e.g. "geom-circle-area"
  name: string;                 // "Circle Area"
  category: FormulaCategory;
  description: string;          // Concise mathematical description
  targetVariable: FormulaTargetDefinition;
  expression: string;           // Parseable RHS expression string e.g. "π * r²"
  displayFormula: string;       // LaTeX-like format for MathFormula component
  variables: FormulaVariableDefinition[];
  searchKeywords: string[];
  examples: FormulaExample[];
  notes?: string[];
}

export interface FormulaEvaluationOutput {
  isValid: boolean;
  formulaId: string;
  targetSymbol: string;
  targetName: string;
  numericResult?: number;
  formattedDecimal?: string;
  exactResult?: ExactValue | null;
  formattedExact?: string | null;
  outputUnit?: string;
  substitutedFormulaText?: string;
  substitutedFormulaLatex?: string;
  steps: CalculationStep[];
  error?: string;
}

// =========================================================================
// 2. THE 14 APPROVED BUILT-IN FORMULAS
// =========================================================================

export const BUILTIN_FORMULAS: FormulaDefinition[] = [
  // -----------------------------------------------------------------------
  // GEOMETRY
  // -----------------------------------------------------------------------
  {
    id: "geom-circle-area",
    name: "Circle Area",
    category: "Geometry",
    description: "Calculates the total two-dimensional surface area enclosed by a circle of given radius.",
    targetVariable: {
      symbol: "A",
      name: "Area",
      dimension: "area",
      defaultUnit: "cm²",
      supportedUnits: ["mm²", "cm²", "m²", "km²", "ft²"],
    },
    expression: "π * r²",
    displayFormula: "A = π r^2",
    variables: [
      {
        symbol: "r",
        name: "Radius",
        description: "Distance from the center to any point on the circle circumference",
        dimension: "length",
        defaultUnit: "cm",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
        defaultValue: 5,
        min: 0,
        step: 0.1,
      },
    ],
    searchKeywords: ["circle", "area", "radius", "surface", "pi", "geometry", "round"],
    examples: [
      {
        title: "Standard Circle (r = 5 cm)",
        description: "Calculate area for a 5 cm radius circle",
        variableValues: { r: 5 },
        variableUnits: { r: "cm" },
        outputUnit: "cm²",
        expectedResult: {
          exact: "25π",
          decimal: 78.53981633974483,
          formattedDecimal: "78.54",
        },
      },
      {
        title: "Large Circle (r = 10 m)",
        description: "Calculate area for a 10 m radius circle",
        variableValues: { r: 10 },
        variableUnits: { r: "m" },
        outputUnit: "m²",
        expectedResult: {
          exact: "100π",
          decimal: 314.1592653589793,
          formattedDecimal: "314.16",
        },
      },
    ],
    notes: ["Radius must be a non-negative real value (r ≥ 0)."],
  },

  {
    id: "geom-circle-perimeter",
    name: "Circle Perimeter / Circumference",
    category: "Geometry",
    description: "Calculates the continuous linear boundary length around a circle.",
    targetVariable: {
      symbol: "C",
      name: "Circumference",
      dimension: "length",
      defaultUnit: "cm",
      supportedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
    },
    expression: "2 * π * r",
    displayFormula: "C = 2 π r",
    variables: [
      {
        symbol: "r",
        name: "Radius",
        description: "Distance from the center of the circle to its boundary",
        dimension: "length",
        defaultUnit: "cm",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
        defaultValue: 5,
        min: 0,
        step: 0.1,
      },
    ],
    searchKeywords: ["circle", "perimeter", "circumference", "radius", "boundary", "pi"],
    examples: [
      {
        title: "Standard Circle (r = 5 cm)",
        description: "Circumference of a 5 cm radius circle",
        variableValues: { r: 5 },
        variableUnits: { r: "cm" },
        outputUnit: "cm",
        expectedResult: {
          exact: "10π",
          decimal: 31.41592653589793,
          formattedDecimal: "31.42",
        },
      },
    ],
    notes: ["Circumference is directly proportional to radius: C = 2πr."],
  },

  {
    id: "geom-rectangle-area",
    name: "Rectangle Area",
    category: "Geometry",
    description: "Calculates the enclosed 2D surface area of a four-sided quadrilateral with right angles.",
    targetVariable: {
      symbol: "A",
      name: "Area",
      dimension: "area",
      defaultUnit: "m²",
      supportedUnits: ["mm²", "cm²", "m²", "km²", "ft²"],
    },
    expression: "l * w",
    displayFormula: "A = l \\times w",
    variables: [
      {
        symbol: "l",
        name: "Length",
        description: "Longer side dimension of the rectangle",
        dimension: "length",
        defaultUnit: "m",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd"],
        defaultValue: 10,
        min: 0,
      },
      {
        symbol: "w",
        name: "Width",
        description: "Shorter side dimension of the rectangle",
        dimension: "length",
        defaultUnit: "m",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd"],
        defaultValue: 5,
        min: 0,
      },
    ],
    searchKeywords: ["rectangle", "area", "length", "width", "square", "quadrilateral", "surface"],
    examples: [
      {
        title: "Standard Rectangle (10 m × 5 m)",
        description: "Area of a 10 m by 5 m rectangle",
        variableValues: { l: 10, w: 5 },
        variableUnits: { l: "m", w: "m" },
        outputUnit: "m²",
        expectedResult: {
          exact: "50",
          decimal: 50,
          formattedDecimal: "50",
        },
      },
      {
        title: "Mixed Units (100 cm × 2 m)",
        description: "100 cm length by 2 m width converted to m²",
        variableValues: { l: 100, w: 2 },
        variableUnits: { l: "cm", w: "m" },
        outputUnit: "m²",
        expectedResult: {
          exact: "2",
          decimal: 2,
          formattedDecimal: "2",
        },
      },
    ],
    notes: ["Length and width must be non-negative real numbers."],
  },

  {
    id: "geom-triangle-area",
    name: "Triangle Area",
    category: "Geometry",
    description: "Calculates the area of any standard triangle given its base length and perpendicular height.",
    targetVariable: {
      symbol: "A",
      name: "Area",
      dimension: "area",
      defaultUnit: "m²",
      supportedUnits: ["mm²", "cm²", "m²", "km²", "ft²"],
    },
    expression: "(b * h) / 2",
    displayFormula: "A = \\frac{1}{2} b h",
    variables: [
      {
        symbol: "b",
        name: "Base",
        description: "Length of the reference base edge of the triangle",
        dimension: "length",
        defaultUnit: "m",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd"],
        defaultValue: 6,
        min: 0,
      },
      {
        symbol: "h",
        name: "Height",
        description: "Perpendicular vertical altitude from the base to opposite apex",
        dimension: "length",
        defaultUnit: "m",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd"],
        defaultValue: 4,
        min: 0,
      },
    ],
    searchKeywords: ["triangle", "area", "base", "height", "half", "geometry", "pyramid"],
    examples: [
      {
        title: "Standard Triangle (b = 6 m, h = 4 m)",
        description: "Area of a triangle with base 6 m and height 4 m",
        variableValues: { b: 6, h: 4 },
        variableUnits: { b: "m", h: "m" },
        outputUnit: "m²",
        expectedResult: {
          exact: "12",
          decimal: 12,
          formattedDecimal: "12",
        },
      },
    ],
    notes: ["Height must be perpendicular to the designated base."],
  },

  {
    id: "geom-sphere-volume",
    name: "Sphere Volume",
    category: "Geometry",
    description: "Calculates the three-dimensional volumetric space enclosed by a perfect spherical surface.",
    targetVariable: {
      symbol: "V",
      name: "Volume",
      dimension: "volume",
      defaultUnit: "cm³",
      supportedUnits: ["cm³", "m³", "mL", "L", "gal"],
    },
    expression: "4/3 * π * r³",
    displayFormula: "V = \\frac{4}{3} π r^3",
    variables: [
      {
        symbol: "r",
        name: "Radius",
        description: "Radial distance from the spherical center to its outer surface",
        dimension: "length",
        defaultUnit: "cm",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft"],
        defaultValue: 3,
        min: 0,
      },
    ],
    searchKeywords: ["sphere", "volume", "radius", "ball", "3d", "space", "pi"],
    examples: [
      {
        title: "Sphere with Radius 3 cm",
        description: "Volume of a 3 cm radius sphere",
        variableValues: { r: 3 },
        variableUnits: { r: "cm" },
        outputUnit: "cm³",
        expectedResult: {
          exact: "36π",
          decimal: 113.09733552923255,
          formattedDecimal: "113.1",
        },
      },
    ],
    notes: ["Calculates 4/3 · π · r³."],
  },

  {
    id: "geom-cylinder-volume",
    name: "Cylinder Volume",
    category: "Geometry",
    description: "Calculates the total internal volumetric capacity of a right circular cylinder.",
    targetVariable: {
      symbol: "V",
      name: "Volume",
      dimension: "volume",
      defaultUnit: "cm³",
      supportedUnits: ["cm³", "m³", "mL", "L", "gal"],
    },
    expression: "π * r² * h",
    displayFormula: "V = π r^2 h",
    variables: [
      {
        symbol: "r",
        name: "Radius",
        description: "Radius of the circular base",
        dimension: "length",
        defaultUnit: "cm",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft"],
        defaultValue: 3,
        min: 0,
      },
      {
        symbol: "h",
        name: "Height",
        description: "Height / axial distance between circular bases",
        dimension: "length",
        defaultUnit: "cm",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft"],
        defaultValue: 5,
        min: 0,
      },
    ],
    searchKeywords: ["cylinder", "volume", "radius", "height", "tube", "can", "tank", "capacity"],
    examples: [
      {
        title: "Standard Cylinder (r = 3 cm, h = 5 cm)",
        description: "Volume of a cylinder with radius 3 cm and height 5 cm",
        variableValues: { r: 3, h: 5 },
        variableUnits: { r: "cm", h: "cm" },
        outputUnit: "cm³",
        expectedResult: {
          exact: "45π",
          decimal: 141.3716694115407,
          formattedDecimal: "141.37",
        },
      },
    ],
    notes: ["Assumes a right circular cylinder perpendicular to circular cross-sections."],
  },

  // -----------------------------------------------------------------------
  // PHYSICAL MOTION
  // -----------------------------------------------------------------------
  {
    id: "phys-average-speed",
    name: "Average Speed",
    category: "Physics",
    description: "Calculates the scalar rate of motion across a given distance over an elapsed time interval.",
    targetVariable: {
      symbol: "v",
      name: "Speed",
      dimension: "speed",
      defaultUnit: "km/h",
      supportedUnits: ["km/h", "m/s", "mph"],
    },
    expression: "d / t",
    displayFormula: "v = \\frac{d}{t}",
    variables: [
      {
        symbol: "d",
        name: "Distance",
        description: "Total spatial displacement or traveled path length",
        dimension: "length",
        defaultUnit: "km",
        allowedUnits: ["mm", "cm", "m", "km", "mi", "ft", "yd"],
        defaultValue: 100,
        min: 0,
      },
      {
        symbol: "t",
        name: "Time",
        description: "Duration of time elapsed during travel",
        dimension: "time",
        defaultUnit: "h",
        allowedUnits: ["ms", "s", "min", "h", "day"],
        defaultValue: 2,
        min: 0.000001,
      },
    ],
    searchKeywords: ["speed", "velocity", "distance", "time", "rate", "motion", "kinematics", "kmh", "mph"],
    examples: [
      {
        title: "Road Trip (100 km in 2 hours)",
        description: "Average speed over a 100 km journey taking 2 hours",
        variableValues: { d: 100, t: 2 },
        variableUnits: { d: "km", t: "h" },
        outputUnit: "km/h",
        expectedResult: {
          exact: "50",
          decimal: 50,
          formattedDecimal: "50",
        },
      },
      {
        title: "Sprint (100 m in 10 seconds)",
        description: "100 metres sprint in 10 seconds in m/s",
        variableValues: { d: 100, t: 10 },
        variableUnits: { d: "m", t: "s" },
        outputUnit: "m/s",
        expectedResult: {
          exact: "10",
          decimal: 10,
          formattedDecimal: "10",
        },
      },
    ],
    notes: ["Time must be strictly positive (t > 0)."],
  },

  // -----------------------------------------------------------------------
  // FINANCE
  // -----------------------------------------------------------------------
  {
    id: "fin-simple-interest",
    name: "Simple Interest",
    category: "Finance",
    description: "Calculates non-compounding interest accrued on an initial principal over time at a fixed rate.",
    targetVariable: {
      symbol: "I",
      name: "Interest",
      dimension: "dimensionless",
    },
    expression: "P * r * t",
    displayFormula: "I = P \\times r \\times t",
    variables: [
      {
        symbol: "P",
        name: "Principal",
        description: "Initial invested or borrowed monetary principal",
        dimension: "dimensionless",
        defaultValue: 1000,
        min: 0,
      },
      {
        symbol: "r",
        name: "Interest Rate",
        description: "Annual interest rate expressed as a decimal (e.g. 0.05 for 5%)",
        dimension: "dimensionless",
        defaultValue: 0.05,
        min: 0,
        step: 0.01,
      },
      {
        symbol: "t",
        name: "Time Duration",
        description: "Time duration in years",
        dimension: "dimensionless",
        defaultValue: 3,
        min: 0,
      },
    ],
    searchKeywords: ["simple interest", "finance", "principal", "rate", "loan", "investment", "money"],
    examples: [
      {
        title: "$1,000 at 5% for 3 Years",
        description: "Simple interest on $1,000 principal at 5% per annum for 3 years",
        variableValues: { P: 1000, r: 0.05, t: 3 },
        expectedResult: {
          decimal: 150,
          formattedDecimal: "150",
        },
      },
    ],
    notes: ["Rate 'r' must be entered as a decimal ratio (e.g. 5% = 0.05)."],
  },

  {
    id: "fin-compound-interest",
    name: "Compound Interest (Future Amount)",
    category: "Finance",
    description: "Calculates the total accumulated amount when interest compounds periodically over time.",
    targetVariable: {
      symbol: "A",
      name: "Accumulated Amount",
      dimension: "dimensionless",
    },
    expression: "P * (1 + r / n)^(n * t)",
    displayFormula: "A = P \\left(1 + \\frac{r}{n}\\right)^{n t}",
    variables: [
      {
        symbol: "P",
        name: "Principal",
        description: "Initial starting deposit / principal amount",
        dimension: "dimensionless",
        defaultValue: 1000,
        min: 0,
      },
      {
        symbol: "r",
        name: "Annual Rate",
        description: "Nominal annual interest rate as a decimal (e.g. 0.05 for 5%)",
        dimension: "dimensionless",
        defaultValue: 0.05,
        min: 0,
        step: 0.01,
      },
      {
        symbol: "n",
        name: "Compounding Frequency",
        description: "Number of compounding periods per year (e.g. 1=Annual, 12=Monthly)",
        dimension: "dimensionless",
        defaultValue: 1,
        min: 1,
        step: 1,
      },
      {
        symbol: "t",
        name: "Time Duration",
        description: "Investment horizon in years",
        dimension: "dimensionless",
        defaultValue: 2,
        min: 0,
      },
    ],
    searchKeywords: ["compound interest", "finance", "principal", "growth", "apy", "investment", "wealth"],
    examples: [
      {
        title: "$1,000 at 5% Annual Compounding for 2 Years",
        description: "Compound growth on $1,000 at 5% compounded once per year for 2 years",
        variableValues: { P: 1000, r: 0.05, n: 1, t: 2 },
        expectedResult: {
          decimal: 1102.5,
          formattedDecimal: "1,102.5",
        },
      },
    ],
    notes: ["Compounding frequency 'n' represents compounding events per year."],
  },

  {
    id: "fin-future-value",
    name: "Future Value (Lump Sum)",
    category: "Finance",
    description: "Calculates the future worth of a present cash amount invested at a constant periodic rate.",
    targetVariable: {
      symbol: "FV",
      name: "Future Value",
      dimension: "dimensionless",
    },
    expression: "PV * (1 + r)^n",
    displayFormula: "FV = PV (1 + r)^n",
    variables: [
      {
        symbol: "PV",
        name: "Present Value",
        description: "Initial cash outlay or current investment balance",
        dimension: "dimensionless",
        defaultValue: 1000,
        min: 0,
      },
      {
        symbol: "r",
        name: "Periodic Rate",
        description: "Growth / interest rate per period (as a decimal)",
        dimension: "dimensionless",
        defaultValue: 0.08,
        min: 0,
        step: 0.01,
      },
      {
        symbol: "n",
        name: "Periods",
        description: "Total number of compounding periods",
        dimension: "dimensionless",
        defaultValue: 5,
        min: 0,
      },
    ],
    searchKeywords: ["future value", "fv", "pv", "tvm", "time value of money", "finance", "present value"],
    examples: [
      {
        title: "$1,000 at 8% for 5 Periods",
        description: "Future value of $1,000 at 8% per period over 5 periods",
        variableValues: { PV: 1000, r: 0.08, n: 5 },
        expectedResult: {
          decimal: 1469.3280768,
          formattedDecimal: "1,469.33",
        },
      },
    ],
    notes: ["Standard discrete time-value-of-money formula."],
  },

  {
    id: "fin-present-value",
    name: "Present Value (Discounting)",
    category: "Finance",
    description: "Calculates the current discounted value of an expected future cash sum given a discount rate.",
    targetVariable: {
      symbol: "PV",
      name: "Present Value",
      dimension: "dimensionless",
    },
    expression: "FV / (1 + r)^n",
    displayFormula: "PV = \\frac{FV}{(1 + r)^n}",
    variables: [
      {
        symbol: "FV",
        name: "Future Value",
        description: "Target future monetary amount",
        dimension: "dimensionless",
        defaultValue: 1500,
        min: 0,
      },
      {
        symbol: "r",
        name: "Discount Rate",
        description: "Discount / hurdle rate per period (as a decimal)",
        dimension: "dimensionless",
        defaultValue: 0.06,
        min: 0,
        step: 0.01,
      },
      {
        symbol: "n",
        name: "Periods",
        description: "Number of discounting periods until future payout",
        dimension: "dimensionless",
        defaultValue: 3,
        min: 0,
      },
    ],
    searchKeywords: ["present value", "discounting", "pv", "fv", "discount rate", "finance", "valuation"],
    examples: [
      {
        title: "$1,500 Discounted at 6% over 3 Periods",
        description: "Present value of $1,500 in 3 years at a 6% discount rate",
        variableValues: { FV: 1500, r: 0.06, n: 3 },
        expectedResult: {
          decimal: 1259.4289245484526,
          formattedDecimal: "1,259.43",
        },
      },
    ],
    notes: ["Inverse of the discrete compound future value formula."],
  },

  // -----------------------------------------------------------------------
  // TRIGONOMETRY / ALGEBRA
  // -----------------------------------------------------------------------
  {
    id: "trig-pythagorean",
    name: "Pythagorean Theorem",
    category: "Trigonometry",
    description: "Calculates the hypotenuse length of a right-angled triangle from the lengths of its two perpendicular legs.",
    targetVariable: {
      symbol: "c",
      name: "Hypotenuse",
      dimension: "length",
      defaultUnit: "cm",
      supportedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
    },
    expression: "sqrt(a² + b²)",
    displayFormula: "c = \\sqrt{a^2 + b^2}",
    variables: [
      {
        symbol: "a",
        name: "Leg a",
        description: "Length of the first perpendicular side",
        dimension: "length",
        defaultUnit: "cm",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
        defaultValue: 3,
        min: 0,
      },
      {
        symbol: "b",
        name: "Leg b",
        description: "Length of the second perpendicular side",
        dimension: "length",
        defaultUnit: "cm",
        allowedUnits: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
        defaultValue: 4,
        min: 0,
      },
    ],
    searchKeywords: ["pythagorean", "pythagoras", "triangle", "hypotenuse", "right triangle", "geometry", "sqrt"],
    examples: [
      {
        title: "Classic 3-4-5 Triangle",
        description: "Legs of length 3 cm and 4 cm",
        variableValues: { a: 3, b: 4 },
        variableUnits: { a: "cm", b: "cm" },
        outputUnit: "cm",
        expectedResult: {
          exact: "5",
          decimal: 5,
          formattedDecimal: "5",
        },
      },
      {
        title: "Isosceles Right Triangle (a=1, b=1)",
        description: "Hypotenuse for unit sides yielding √2",
        variableValues: { a: 1, b: 1 },
        variableUnits: { a: "cm", b: "cm" },
        outputUnit: "cm",
        expectedResult: {
          exact: "√2",
          decimal: 1.4142135623730951,
          formattedDecimal: "1.41",
        },
      },
    ],
    notes: ["Applies exclusively to Euclidean right triangles (angle = 90°)."],
  },

  {
    id: "alg-distance-formula",
    name: "Distance Formula (2D Plane)",
    category: "Algebra",
    description: "Calculates the straight-line Euclidean distance between two cartesian coordinate points (x₁, y₁) and (x₂, y₂).",
    targetVariable: {
      symbol: "d",
      name: "Distance",
      dimension: "dimensionless",
    },
    expression: "sqrt((x2 - x1)² + (y2 - y1)²)",
    displayFormula: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
    variables: [
      {
        symbol: "x1",
        name: "x₁ Coordinate",
        description: "Horizontal coordinate of initial point 1",
        dimension: "dimensionless",
        defaultValue: 0,
      },
      {
        symbol: "y1",
        name: "y₁ Coordinate",
        description: "Vertical coordinate of initial point 1",
        dimension: "dimensionless",
        defaultValue: 0,
      },
      {
        symbol: "x2",
        name: "x₂ Coordinate",
        description: "Horizontal coordinate of target point 2",
        dimension: "dimensionless",
        defaultValue: 3,
      },
      {
        symbol: "y2",
        name: "y₂ Coordinate",
        description: "Vertical coordinate of target point 2",
        dimension: "dimensionless",
        defaultValue: 4,
      },
    ],
    searchKeywords: ["distance", "euclidean distance", "coordinates", "points", "plane", "algebra", "cartesian"],
    examples: [
      {
        title: "Origin (0,0) to Point (3,4)",
        description: "Distance from (0,0) to (3,4)",
        variableValues: { x1: 0, y1: 0, x2: 3, y2: 4 },
        expectedResult: {
          exact: "5",
          decimal: 5,
          formattedDecimal: "5",
        },
      },
    ],
    notes: ["Direct application of the Pythagorean theorem across Cartesian coordinates."],
  },

  {
    id: "alg-slope",
    name: "Slope of a Line",
    category: "Algebra",
    description: "Calculates the gradient / rate of vertical change over horizontal change between two 2D points.",
    targetVariable: {
      symbol: "m",
      name: "Slope",
      dimension: "dimensionless",
    },
    expression: "(y2 - y1) / (x2 - x1)",
    displayFormula: "m = \\frac{y_2 - y_1}{x_2 - x_1}",
    variables: [
      {
        symbol: "x1",
        name: "x₁ Coordinate",
        description: "Horizontal coordinate of point 1",
        dimension: "dimensionless",
        defaultValue: 1,
      },
      {
        symbol: "y1",
        name: "y₁ Coordinate",
        description: "Vertical coordinate of point 1",
        dimension: "dimensionless",
        defaultValue: 2,
      },
      {
        symbol: "x2",
        name: "x₂ Coordinate",
        description: "Horizontal coordinate of point 2",
        dimension: "dimensionless",
        defaultValue: 4,
      },
      {
        symbol: "y2",
        name: "y₂ Coordinate",
        description: "Vertical coordinate of point 2",
        dimension: "dimensionless",
        defaultValue: 8,
      },
    ],
    searchKeywords: ["slope", "gradient", "rise over run", "line", "points", "linear", "algebra"],
    examples: [
      {
        title: "Points (1,2) and (4,8)",
        description: "Slope of line through (1,2) and (4,8)",
        variableValues: { x1: 1, y1: 2, x2: 4, y2: 8 },
        expectedResult: {
          exact: "2",
          decimal: 2,
          formattedDecimal: "2",
        },
      },
    ],
    notes: ["Vertical lines with x₁ = x₂ have an undefined slope (division by zero)."],
  },
];

// Map lookup by ID
export const FORMULA_REGISTRY: Record<string, FormulaDefinition> = Object.fromEntries(
  BUILTIN_FORMULAS.map((f) => [f.id, f])
);

export function getFormulaById(id: string): FormulaDefinition | undefined {
  return FORMULA_REGISTRY[id];
}

export function getAllFormulas(): FormulaDefinition[] {
  return BUILTIN_FORMULAS;
}

// =========================================================================
// 3. IN-MEMORY AST CACHE
// =========================================================================

const AST_CACHE = new Map<string, ASTNode>();

export function getParsedFormulaAST(expression: string): ASTNode {
  const cached = AST_CACHE.get(expression);
  if (cached) return cached;

  const tokens = tokenize(expression);
  const parser = new ASTParser(tokens);
  const ast = parser.parse();
  AST_CACHE.set(expression, ast);
  return ast;
}

// =========================================================================
// 4. UNIT NORMALIZATION & EXACT SCALE UTILITIES
// =========================================================================

/**
 * Returns the primary linear unit corresponding to an area or volume unit.
 */
function getLinearUnitForSpatial(unitSymbol: string): string {
  switch (unitSymbol) {
    case "mm²": return "mm";
    case "cm²": return "cm";
    case "m²": return "m";
    case "km²": return "km";
    case "ft²": return "ft";
    case "cm³":
    case "mL": return "cm";
    case "m³":
    case "L": return "m";
    case "gal": return "m";
    default: return unitSymbol;
  }
}

/**
 * Calculates the exact rational conversion scale between two length units.
 */
function getExactLengthScale(fromUnitStr: string, toUnitStr: string): { num: number; den: number } | null {
  const fromU = findUnit(fromUnitStr);
  const toU = findUnit(toUnitStr);
  if (!fromU || !toU || fromU.dimension !== "length" || toU.dimension !== "length") {
    return null;
  }
  // Metric exact rational ratios relative to meter
  const metricBaseRatios: Record<string, { num: number; den: number }> = {
    mm: { num: 1, den: 1000 },
    cm: { num: 1, den: 100 },
    m: { num: 1, den: 1 },
    km: { num: 1000, den: 1 },
  };

  if (metricBaseRatios[fromU.symbol] && metricBaseRatios[toU.symbol]) {
    const r1 = metricBaseRatios[fromU.symbol];
    const r2 = metricBaseRatios[toU.symbol];
    // scale = r1 / r2 = (num1 * den2) / (den1 * num2)
    return {
      num: r1.num * r2.den,
      den: r1.den * r2.num,
    };
  }

  // Float conversion check
  const floatScale = fromU.toBase(1) / toU.toBase(1);
  if (Math.abs(floatScale - 1) < 1e-12) {
    return { num: 1, den: 1 };
  }
  return null;
}

// =========================================================================
// 5. DETERMINISTIC FORMULA EVALUATION ORCHESTRATOR
// =========================================================================

export interface FormulaEvaluationOptions {
  angleMode?: AngleMode;
  userOutputUnit?: string;
}

/**
 * Returns plain unicode mathematical representation for steps and text summaries.
 */
export function getFormulaPlainText(formula: FormulaDefinition): string {
  switch (formula.id) {
    case "geom-circle-area": return "A = πr²";
    case "geom-circle-perimeter": return "C = 2πr";
    case "geom-rectangle-area": return "A = l × w";
    case "geom-triangle-area": return "A = ½ · b · h";
    case "geom-sphere-volume": return "V = 4/3 · πr³";
    case "geom-cylinder-volume": return "V = πr²h";
    case "phys-average-speed": return "v = d / t";
    case "fin-simple-interest": return "I = P · r · t";
    case "fin-compound-interest": return "A = P(1 + r/n)^(nt)";
    case "fin-future-value": return "FV = PV(1 + r)^n";
    case "fin-present-value": return "PV = FV / (1 + r)^n";
    case "trig-pythagorean": return "c = √(a² + b²)";
    case "alg-distance-formula": return "d = √((x₂ − x₁)² + (y₂ − y₁)²)";
    case "alg-slope": return "m = (y₂ − y₁) / (x₂ − x₁)";
    default: return `${formula.targetVariable.symbol} = ${formula.expression}`;
  }
}

/**
 * Cleanly formats decimal formula output without floating-point representation noise.
 */
export function formatFormulaDecimal(val: number): string {
  if (!Number.isFinite(val)) return "Error";
  if (Math.abs(val) < 1e-13) return "0";
  const abs = Math.abs(val);

  if (abs >= 1e12 || (abs > 0 && abs < 1e-6)) {
    return val.toExponential(4).replace(/e\+?/, " × 10^");
  }

  if (Number.isInteger(val)) {
    return new Intl.NumberFormat("en-US").format(val);
  }

  // Small fractions (< 0.01): e.g. 0.007853981634 -> 0.007854
  if (abs < 0.01) {
    const formatted = val.toFixed(6);
    return formatted.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  }

  // Standard range (0.01 to 100): up to 4 decimals, e.g. 78.5398
  if (abs < 100) {
    const formatted = val.toFixed(4);
    const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
    const parts = cleaned.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  // Larger financial/integer range (>= 100): 2 decimals with commas, e.g. 1,469.33
  const formatted = val.toFixed(2);
  const cleaned = formatted.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
  const parts = cleaned.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

interface SubFragment {
  text: string;
  hasUnit: boolean;
  isAtomic: boolean;
  needsParensInPower: boolean;
}

function formatSubstitutedNode(
  node: ASTNode,
  values: Record<string, number>,
  units: Record<string, string>
): SubFragment {
  switch (node.type) {
    case "NumberLiteral": {
      const isNeg = node.value < 0;
      return {
        text: String(node.value),
        hasUnit: false,
        isAtomic: !isNeg,
        needsParensInPower: isNeg,
      };
    }

    case "Constant": {
      const sym = node.name === "pi" || node.name === "π" ? "π" : node.name;
      return {
        text: sym,
        hasUnit: false,
        isAtomic: true,
        needsParensInPower: false,
      };
    }

    case "Identifier": {
      const nameLower = node.name.toLowerCase();
      if (node.name === "π" || nameLower === "pi") {
        return { text: "π", hasUnit: false, isAtomic: true, needsParensInPower: false };
      }
      if (node.name === "e" || nameLower === "e") {
        return { text: "e", hasUnit: false, isAtomic: true, needsParensInPower: false };
      }

      const val = values[node.name] !== undefined ? values[node.name] : values[nameLower];
      const unit = units[node.name] !== undefined ? units[node.name] : units[nameLower];

      if (val !== undefined) {
        if (unit) {
          return {
            text: `${val} ${unit}`,
            hasUnit: true,
            isAtomic: false,
            needsParensInPower: true,
          };
        } else {
          const isNeg = val < 0;
          return {
            text: String(val),
            hasUnit: false,
            isAtomic: !isNeg,
            needsParensInPower: isNeg,
          };
        }
      }

      return {
        text: node.name,
        hasUnit: false,
        isAtomic: true,
        needsParensInPower: false,
      };
    }

    case "Grouping": {
      const inner = formatSubstitutedNode(node.expression, values, units);
      return {
        text: `(${inner.text})`,
        hasUnit: inner.hasUnit,
        isAtomic: true,
        needsParensInPower: false,
      };
    }

    case "UnaryExpression": {
      const arg = formatSubstitutedNode(node.argument, values, units);
      const text = arg.isAtomic ? `${node.operator}${arg.text}` : `${node.operator}(${arg.text})`;
      return {
        text,
        hasUnit: arg.hasUnit,
        isAtomic: false,
        needsParensInPower: true,
      };
    }

    case "PostfixExpression": {
      const arg = formatSubstitutedNode(node.argument, values, units);
      const wrapped =
        (arg.hasUnit || !arg.isAtomic || arg.needsParensInPower) &&
        !(arg.text.startsWith("(") && arg.text.endsWith(")"))
          ? `(${arg.text})`
          : arg.text;
      return {
        text: `${wrapped}${node.operator}`,
        hasUnit: arg.hasUnit,
        isAtomic: false,
        needsParensInPower: false,
      };
    }

    case "BinaryExpression": {
      const left = formatSubstitutedNode(node.left, values, units);
      const right = formatSubstitutedNode(node.right, values, units);

      if (node.operator === "^") {
        const leftText =
          (left.hasUnit || !left.isAtomic || left.needsParensInPower) &&
          !(left.text.startsWith("(") && left.text.endsWith(")"))
            ? `(${left.text})`
            : left.text;
        const rightText =
          (!right.isAtomic || right.needsParensInPower) &&
          !(right.text.startsWith("(") && right.text.endsWith(")"))
            ? `(${right.text})`
            : right.text;
        return {
          text: `${leftText}^${rightText}`,
          hasUnit: left.hasUnit,
          isAtomic: false,
          needsParensInPower: false,
        };
      }

      if (node.operator === "*") {
        let text: string;
        if (left.text === "π" && (right.text.startsWith("(") || right.text.includes("²") || right.text.includes("³"))) {
          text = `π · ${right.text}`;
        } else {
          text = `${left.text} · ${right.text}`;
        }
        return {
          text,
          hasUnit: left.hasUnit || right.hasUnit,
          isAtomic: false,
          needsParensInPower: true,
        };
      }

      if (node.operator === "/") {
        return {
          text: `${left.text} / ${right.text}`,
          hasUnit: left.hasUnit || right.hasUnit,
          isAtomic: false,
          needsParensInPower: true,
        };
      }

      const opSym = node.operator === "-" ? "−" : "+";
      return {
        text: `${left.text} ${opSym} ${right.text}`,
        hasUnit: left.hasUnit || right.hasUnit,
        isAtomic: false,
        needsParensInPower: true,
      };
    }

    case "FunctionCall": {
      const fn = node.name.toLowerCase();
      const args = node.args.map((a) => formatSubstitutedNode(a, values, units));
      if (fn === "sqrt") {
        return {
          text: `√( ${args[0].text} )`,
          hasUnit: args[0].hasUnit,
          isAtomic: true,
          needsParensInPower: false,
        };
      }
      return {
        text: `${fn}(${args.map((a) => a.text).join(", ")})`,
        hasUnit: args.some((a) => a.hasUnit),
        isAtomic: true,
        needsParensInPower: false,
      };
    }

    default:
      return { text: "", hasUnit: false, isAtomic: true, needsParensInPower: false };
  }
}

export function formatSubstitutedFormula(
  formula: FormulaDefinition,
  variableValues: Record<string, number>,
  variableUnits: Record<string, string> = {}
): string {
  try {
    const ast = getParsedFormulaAST(formula.expression);
    const fragment = formatSubstitutedNode(ast, variableValues, variableUnits);
    return `${formula.targetVariable.symbol} = ${fragment.text}`;
  } catch {
    let text = `${formula.targetVariable.symbol} = ${formula.expression}`;
    for (const [sym, val] of Object.entries(variableValues)) {
      const u = variableUnits[sym];
      const valStr = u ? `(${val} ${u})` : String(val);
      text = text.replace(new RegExp(`\\b${sym}\\b`, "g"), valStr);
    }
    return text;
  }
}

export function evaluateFormula(
  formula: FormulaDefinition,
  variableValues: Record<string, number>,
  variableUnits: Record<string, string> = {},
  options: FormulaEvaluationOptions = {}
): FormulaEvaluationOutput {
  const angleMode = options.angleMode || "DEG";

  // 1. Input Validation: Check required variables exist and are finite
  for (const vDef of formula.variables) {
    const val = variableValues[vDef.symbol];
    if (val === undefined || Number.isNaN(val) || !Number.isFinite(val)) {
      return {
        isValid: false,
        formulaId: formula.id,
        targetSymbol: formula.targetVariable.symbol,
        targetName: formula.targetVariable.name,
        steps: [],
        error: `Please enter a valid number for ${vDef.name} (${vDef.symbol}).`,
      };
    }

    if (vDef.min !== undefined && val < vDef.min) {
      return {
        isValid: false,
        formulaId: formula.id,
        targetSymbol: formula.targetVariable.symbol,
        targetName: formula.targetVariable.name,
        steps: [],
        error: `${vDef.name} (${vDef.symbol}) must be at least ${vDef.min}.`,
      };
    }

    if (vDef.max !== undefined && val > vDef.max) {
      return {
        isValid: false,
        formulaId: formula.id,
        targetSymbol: formula.targetVariable.symbol,
        targetName: formula.targetVariable.name,
        steps: [],
        error: `${vDef.name} (${vDef.symbol}) cannot exceed ${vDef.max}.`,
      };
    }
  }

  // Domain constraints validation (e.g. division by zero in slope or speed)
  if (formula.id === "alg-slope") {
    const x1 = variableValues["x1"];
    const x2 = variableValues["x2"];
    if (Math.abs(x2 - x1) < 1e-12) {
      return {
        isValid: false,
        formulaId: formula.id,
        targetSymbol: formula.targetVariable.symbol,
        targetName: formula.targetVariable.name,
        steps: [],
        error: "Vertical line error: x₂ - x₁ = 0. Slope is undefined (division by zero).",
      };
    }
  }

  if (formula.id === "phys-average-speed") {
    const t = variableValues["t"];
    if (t <= 0) {
      return {
        isValid: false,
        formulaId: formula.id,
        targetSymbol: formula.targetVariable.symbol,
        targetName: formula.targetVariable.name,
        steps: [],
        error: "Time must be strictly positive (t > 0).",
      };
    }
  }

  // 2. Determine Output Unit
  let chosenOutputUnit: string | undefined =
    options.userOutputUnit || formula.targetVariable.defaultUnit;

  // Natural unit inheritance for geometric formulas
  if (!options.userOutputUnit && formula.targetVariable.dimension !== "dimensionless") {
    const firstVar = formula.variables[0];
    const unit1 = variableUnits[firstVar.symbol] || firstVar.defaultUnit;

    if (formula.targetVariable.dimension === "area" && unit1) {
      if (unit1 === "cm") chosenOutputUnit = "cm²";
      else if (unit1 === "mm") chosenOutputUnit = "mm²";
      else if (unit1 === "m") chosenOutputUnit = "m²";
      else if (unit1 === "km") chosenOutputUnit = "km²";
      else if (unit1 === "ft") chosenOutputUnit = "ft²";
    } else if (formula.targetVariable.dimension === "volume" && unit1) {
      if (unit1 === "cm") chosenOutputUnit = "cm³";
      else if (unit1 === "m") chosenOutputUnit = "m³";
    } else if (formula.targetVariable.dimension === "length" && unit1) {
      chosenOutputUnit = unit1;
    }
  }

  // Validate output unit compatibility if present
  if (chosenOutputUnit && formula.targetVariable.dimension !== "dimensionless") {
    const uDef = findUnit(chosenOutputUnit);
    if (uDef && uDef.dimension !== formula.targetVariable.dimension) {
      return {
        isValid: false,
        formulaId: formula.id,
        targetSymbol: formula.targetVariable.symbol,
        targetName: formula.targetVariable.name,
        steps: [],
        error: `Incompatible output unit "${chosenOutputUnit}" for dimension ${formula.targetVariable.dimension}.`,
      };
    }
  }

  // 3. Unit Normalization & Scale Mapping
  const evalNumericVars: Record<string, number> = {};
  const evalExactVars: Record<string, ExactValue> = {};
  let exactConversionFailed = false;

  // Track normalization messages for step generator
  const normalizationSteps: { varName: string; from: string; to: string }[] = [];

  for (const vDef of formula.variables) {
    const rawVal = variableValues[vDef.symbol];
    const inUnit = variableUnits[vDef.symbol] || vDef.defaultUnit;

    if (formula.id === "phys-average-speed") {
      // Speed formula: d / t
      if (vDef.symbol === "d") {
        let distTarget = "km";
        if (chosenOutputUnit === "m/s") distTarget = "m";
        else if (chosenOutputUnit === "mph") distTarget = "mi";

        const fromU = inUnit ? findUnit(inUnit) : null;
        const toU = findUnit(distTarget);
        if (!fromU || fromU.dimension !== "length" || !toU) {
          return {
            isValid: false,
            formulaId: formula.id,
            targetSymbol: formula.targetVariable.symbol,
            targetName: formula.targetVariable.name,
            steps: [],
            error: `Incompatible distance unit "${inUnit || ""}".`,
          };
        }
        const scaledD = fromU.toBase(rawVal) / toU.toBase(1);
        evalNumericVars["d"] = scaledD;
        if (inUnit && inUnit !== distTarget) {
          normalizationSteps.push({
            varName: "Distance (d)",
            from: `${rawVal} ${inUnit}`,
            to: `${formatFormulaDecimal(scaledD)} ${distTarget}`,
          });
        }
        const exactScale = inUnit ? getExactLengthScale(inUnit, distTarget) : null;
        if (exactScale && Number.isInteger(rawVal)) {
          evalExactVars["d"] = createExactRational(rawVal * exactScale.num, exactScale.den);
        } else {
          exactConversionFailed = true;
        }
      } else if (vDef.symbol === "t") {
        let timeTarget = "h";
        if (chosenOutputUnit === "m/s") timeTarget = "s";

        const fromU = inUnit ? findUnit(inUnit) : null;
        const toU = findUnit(timeTarget);
        if (!fromU || fromU.dimension !== "time" || !toU) {
          return {
            isValid: false,
            formulaId: formula.id,
            targetSymbol: formula.targetVariable.symbol,
            targetName: formula.targetVariable.name,
            steps: [],
            error: `Incompatible time unit "${inUnit || ""}".`,
          };
        }
        const scaledT = fromU.toBase(rawVal) / toU.toBase(1);
        evalNumericVars["t"] = scaledT;
        if (inUnit && inUnit !== timeTarget) {
          normalizationSteps.push({
            varName: "Time (t)",
            from: `${rawVal} ${inUnit}`,
            to: `${formatFormulaDecimal(scaledT)} ${timeTarget}`,
          });
        }
        if (Number.isInteger(rawVal) && inUnit === timeTarget) {
          evalExactVars["t"] = createExactInteger(rawVal);
        } else if (inUnit === "min" && timeTarget === "h") {
          evalExactVars["t"] = createExactRational(rawVal, 60);
        } else if (inUnit === "s" && timeTarget === "h") {
          evalExactVars["t"] = createExactRational(rawVal, 3600);
        } else if (inUnit === "ms" && timeTarget === "s") {
          evalExactVars["t"] = createExactRational(rawVal, 1000);
        } else {
          exactConversionFailed = true;
        }
      }
    } else if (vDef.dimension === "dimensionless" || !inUnit) {
      evalNumericVars[vDef.symbol] = rawVal;
      evalNumericVars[vDef.symbol.toLowerCase()] = rawVal;
      if (Number.isInteger(rawVal)) {
        evalExactVars[vDef.symbol] = createExactInteger(rawVal);
        evalExactVars[vDef.symbol.toLowerCase()] = createExactInteger(rawVal);
      }
    } else if (vDef.dimension === "length") {
      // Determine linear target unit
      const linearTarget = chosenOutputUnit ? getLinearUnitForSpatial(chosenOutputUnit) : "m";
      const fromU = inUnit ? findUnit(inUnit) : null;
      const toU = findUnit(linearTarget);

      if (!fromU || !toU || fromU.dimension !== "length") {
        return {
          isValid: false,
          formulaId: formula.id,
          targetSymbol: formula.targetVariable.symbol,
          targetName: formula.targetVariable.name,
          steps: [],
          error: `Unknown or incompatible unit "${inUnit || ""}" for ${vDef.name}.`,
        };
      }

      const scaledNum = fromU.toBase(rawVal) / toU.toBase(1);
      evalNumericVars[vDef.symbol] = scaledNum;
      evalNumericVars[vDef.symbol.toLowerCase()] = scaledNum;

      if (inUnit && inUnit !== linearTarget) {
        normalizationSteps.push({
          varName: `${vDef.name} (${vDef.symbol})`,
          from: `${rawVal} ${inUnit}`,
          to: `${formatFormulaDecimal(scaledNum)} ${linearTarget}`,
        });
      }

      // Exact rational scaling
      const exactScale = inUnit ? getExactLengthScale(inUnit, linearTarget) : null;
      if (exactScale && Number.isInteger(rawVal)) {
        const scaledNumExact = createExactRational(rawVal * exactScale.num, exactScale.den);
        evalExactVars[vDef.symbol] = scaledNumExact;
        evalExactVars[vDef.symbol.toLowerCase()] = scaledNumExact;
      } else {
        exactConversionFailed = true;
      }
    }
  }

  // 4. AST Parsing and Evaluation
  try {
    const ast = getParsedFormulaAST(formula.expression);

    // Decimal evaluation
    const evaluator = new ASTEvaluator({
      angleMode,
      variables: evalNumericVars,
    });
    const { result: numericResult } = evaluator.evaluate(ast);

    // Exact evaluation
    let exactResult: ExactValue | null = null;
    if (!exactConversionFailed) {
      const exactEvaluator = new ExactASTEvaluator(angleMode, evalExactVars);
      exactResult = exactEvaluator.deriveExact(ast);
    }

    const formattedExact = formatExactValue(exactResult);
    const formattedDecimal = formatFormulaDecimal(numericResult);

    // 5. Construct Structured Step Trace
    const stepGen = new StepGenerator(
      angleMode,
      "NORM",
      2,
      evalNumericVars,
      evalExactVars
    );
    const astSteps = stepGen.generateSteps(ast);

    // Generate AST-aware Substituted Formula
    const plainFormulaText = getFormulaPlainText(formula);
    const substitutedFormulaText = formatSubstitutedFormula(formula, variableValues, variableUnits);
    const substitutedFormulaLatex = formula.displayFormula;

    // Build comprehensive calculation steps
    const unitSuffix = chosenOutputUnit ? ` ${chosenOutputUnit}` : "";
    const finalDisplayVal = formattedExact ? `${formattedExact}${unitSuffix}` : `${formattedDecimal}${unitSuffix}`;

    const calculationSteps: CalculationStep[] = [
      {
        id: "step-1-formula",
        stepNumber: 1,
        operation: "Formula Definition",
        expression: plainFormulaText,
        subResult: numericResult,
        formattedSubResult: plainFormulaText,
        explanation: `Start with standard mathematical formula: ${plainFormulaText}`,
      },
      {
        id: "step-2-substitute",
        stepNumber: 2,
        operation: "Variable Substitution",
        expression: substitutedFormulaText,
        subResult: numericResult,
        formattedSubResult: substitutedFormulaText,
        explanation: `Substitute given values: ${substitutedFormulaText}`,
      },
    ];

    let stepCounter = 3;

    // Unit Normalization Step if units were scaled
    if (normalizationSteps.length > 0) {
      const normSummary = normalizationSteps.map((s) => `${s.from} = ${s.to}`).join(", ");
      calculationSteps.push({
        id: `step-${stepCounter}-norm`,
        stepNumber: stepCounter++,
        operation: "Unit Normalization",
        expression: normSummary,
        subResult: numericResult,
        formattedSubResult: normSummary,
        explanation: `Normalize units to target unit basis: ${normSummary}`,
      });
    }

    // Add AST calculation steps
    for (const st of astSteps) {
      calculationSteps.push({
        ...st,
        id: `step-${stepCounter}-ast`,
        stepNumber: stepCounter++,
      });
    }

    // Final Result Step
    calculationSteps.push({
      id: `step-${stepCounter}-final`,
      stepNumber: stepCounter,
      operation: "Final Result",
      expression: `${formula.targetVariable.symbol} = ${finalDisplayVal}`,
      subResult: numericResult,
      formattedSubResult: finalDisplayVal,
      exactSubResult: formattedExact ? `${formattedExact}${unitSuffix}` : undefined,
      explanation: `Evaluated ${formula.targetVariable.name} (${formula.targetVariable.symbol}) = ${finalDisplayVal}${formattedExact ? ` (≈ ${formattedDecimal}${unitSuffix})` : ""}`,
    });

    return {
      isValid: true,
      formulaId: formula.id,
      targetSymbol: formula.targetVariable.symbol,
      targetName: formula.targetVariable.name,
      numericResult,
      formattedDecimal,
      exactResult,
      formattedExact,
      outputUnit: chosenOutputUnit,
      substitutedFormulaText,
      substitutedFormulaLatex,
      steps: calculationSteps,
    };
  } catch (err) {
    return {
      isValid: false,
      formulaId: formula.id,
      targetSymbol: formula.targetVariable.symbol,
      targetName: formula.targetVariable.name,
      steps: [],
      error: (err as Error).message || "Formula evaluation error",
    };
  }
}

// =========================================================================
// 6. FORMULA SEARCH & FILTER UTILITY
// =========================================================================

export interface FormulaFilterOptions {
  category?: FormulaCategory | "All";
  searchQuery?: string;
}

export function searchFormulaLibrary(options: FormulaFilterOptions = {}): FormulaDefinition[] {
  const { category = "All", searchQuery = "" } = options;
  const q = searchQuery.trim().toLowerCase();

  return BUILTIN_FORMULAS.filter((f) => {
    // 1. Category Filter
    if (category !== "All" && f.category !== category) {
      return false;
    }

    // 2. Query Search
    if (!q) return true;

    const nameMatch = f.name.toLowerCase().includes(q);
    const catMatch = f.category.toLowerCase().includes(q);
    const descMatch = f.description.toLowerCase().includes(q);
    const keywordMatch = f.searchKeywords.some((k) => k.toLowerCase().includes(q));
    const varMatch = f.variables.some(
      (v) => v.symbol.toLowerCase() === q || v.name.toLowerCase().includes(q)
    );
    const targetMatch =
      f.targetVariable.symbol.toLowerCase() === q ||
      f.targetVariable.name.toLowerCase().includes(q);

    return nameMatch || catMatch || descMatch || keywordMatch || varMatch || targetMatch;
  });
}
