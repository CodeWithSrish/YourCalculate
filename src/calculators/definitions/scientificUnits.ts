// =========================================================================
// PHYSICAL DIMENSIONS & UNIT DEFINITIONS FOR SCIENTIFIC CALCULATOR
// =========================================================================

export type PhysicalDimension =
  | "length"
  | "mass"
  | "time"
  | "temperature"
  | "area"
  | "volume"
  | "speed"
  | "dimensionless";

export interface UnitDefinition {
  symbol: string;
  name: string;
  dimension: PhysicalDimension;
  category: "Length" | "Mass" | "Time" | "Temperature" | "Area" | "Volume" | "Speed";
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
  aliases: string[];
}

export const KNOWN_UNITS: Record<string, UnitDefinition> = {
  // LENGTH (Base: m)
  mm: {
    symbol: "mm",
    name: "millimetre",
    dimension: "length",
    category: "Length",
    toBase: (v) => v * 0.001,
    fromBase: (b) => b / 0.001,
    aliases: ["mm", "millimeter", "millimeters", "millimetre", "millimetres"],
  },
  cm: {
    symbol: "cm",
    name: "centimetre",
    dimension: "length",
    category: "Length",
    toBase: (v) => v * 0.01,
    fromBase: (b) => b / 0.01,
    aliases: ["cm", "centimeter", "centimeters", "centimetre", "centimetres"],
  },
  m: {
    symbol: "m",
    name: "metre",
    dimension: "length",
    category: "Length",
    toBase: (v) => v,
    fromBase: (b) => b,
    aliases: ["m", "meter", "meters", "metre", "metres"],
  },
  km: {
    symbol: "km",
    name: "kilometre",
    dimension: "length",
    category: "Length",
    toBase: (v) => v * 1000,
    fromBase: (b) => b / 1000,
    aliases: ["km", "kilometer", "kilometers", "kilometre", "kilometres"],
  },
  in: {
    symbol: "in",
    name: "inch",
    dimension: "length",
    category: "Length",
    toBase: (v) => v * 0.0254,
    fromBase: (b) => b / 0.0254,
    aliases: ["in", "inch", "inches"],
  },
  ft: {
    symbol: "ft",
    name: "foot",
    dimension: "length",
    category: "Length",
    toBase: (v) => v * 0.3048,
    fromBase: (b) => b / 0.3048,
    aliases: ["ft", "foot", "feet"],
  },
  yd: {
    symbol: "yd",
    name: "yard",
    dimension: "length",
    category: "Length",
    toBase: (v) => v * 0.9144,
    fromBase: (b) => b / 0.9144,
    aliases: ["yd", "yard", "yards"],
  },
  mi: {
    symbol: "mi",
    name: "mile",
    dimension: "length",
    category: "Length",
    toBase: (v) => v * 1609.344,
    fromBase: (b) => b / 1609.344,
    aliases: ["mi", "mile", "miles"],
  },

  // MASS (Base: kg)
  mg: {
    symbol: "mg",
    name: "milligram",
    dimension: "mass",
    category: "Mass",
    toBase: (v) => v * 1e-6,
    fromBase: (b) => b / 1e-6,
    aliases: ["mg", "milligram", "milligrams"],
  },
  g: {
    symbol: "g",
    name: "gram",
    dimension: "mass",
    category: "Mass",
    toBase: (v) => v * 0.001,
    fromBase: (b) => b / 0.001,
    aliases: ["g", "gram", "grams"],
  },
  kg: {
    symbol: "kg",
    name: "kilogram",
    dimension: "mass",
    category: "Mass",
    toBase: (v) => v,
    fromBase: (b) => b,
    aliases: ["kg", "kilogram", "kilograms"],
  },
  oz: {
    symbol: "oz",
    name: "ounce",
    dimension: "mass",
    category: "Mass",
    toBase: (v) => v * 0.028349523125,
    fromBase: (b) => b / 0.028349523125,
    aliases: ["oz", "ounce", "ounces"],
  },
  lb: {
    symbol: "lb",
    name: "pound",
    dimension: "mass",
    category: "Mass",
    toBase: (v) => v * 0.45359237,
    fromBase: (b) => b / 0.45359237,
    aliases: ["lb", "lbs", "pound", "pounds"],
  },

  // TIME (Base: s)
  ms: {
    symbol: "ms",
    name: "millisecond",
    dimension: "time",
    category: "Time",
    toBase: (v) => v * 0.001,
    fromBase: (b) => b / 0.001,
    aliases: ["ms", "millisecond", "milliseconds"],
  },
  s: {
    symbol: "s",
    name: "second",
    dimension: "time",
    category: "Time",
    toBase: (v) => v,
    fromBase: (b) => b,
    aliases: ["s", "sec", "second", "seconds"],
  },
  min: {
    symbol: "min",
    name: "minute",
    dimension: "time",
    category: "Time",
    toBase: (v) => v * 60,
    fromBase: (b) => b / 60,
    aliases: ["min", "mins", "minute", "minutes"],
  },
  h: {
    symbol: "h",
    name: "hour",
    dimension: "time",
    category: "Time",
    toBase: (v) => v * 3600,
    fromBase: (b) => b / 3600,
    aliases: ["h", "hr", "hrs", "hour", "hours"],
  },
  day: {
    symbol: "day",
    name: "day",
    dimension: "time",
    category: "Time",
    toBase: (v) => v * 86400,
    fromBase: (b) => b / 86400,
    aliases: ["day", "days"],
  },

  // TEMPERATURE (Base: K)
  "°C": {
    symbol: "°C",
    name: "degree Celsius",
    dimension: "temperature",
    category: "Temperature",
    toBase: (v) => v + 273.15,
    fromBase: (b) => b - 273.15,
    aliases: ["°c", "degc", "c", "celsius"],
  },
  "°F": {
    symbol: "°F",
    name: "degree Fahrenheit",
    dimension: "temperature",
    category: "Temperature",
    toBase: (v) => ((v - 32) * 5) / 9 + 273.15,
    fromBase: (b) => ((b - 273.15) * 9) / 5 + 32,
    aliases: ["°f", "degf", "f", "fahrenheit"],
  },
  K: {
    symbol: "K",
    name: "Kelvin",
    dimension: "temperature",
    category: "Temperature",
    toBase: (v) => v,
    fromBase: (b) => b,
    aliases: ["k", "kelvin"],
  },

  // AREA (Base: m²)
  "mm²": {
    symbol: "mm²",
    name: "square millimetre",
    dimension: "area",
    category: "Area",
    toBase: (v) => v * 1e-6,
    fromBase: (b) => b / 1e-6,
    aliases: ["mm²", "mm2", "sqmm"],
  },
  "cm²": {
    symbol: "cm²",
    name: "square centimetre",
    dimension: "area",
    category: "Area",
    toBase: (v) => v * 1e-4,
    fromBase: (b) => b / 1e-4,
    aliases: ["cm²", "cm2", "sqcm"],
  },
  "m²": {
    symbol: "m²",
    name: "square metre",
    dimension: "area",
    category: "Area",
    toBase: (v) => v,
    fromBase: (b) => b,
    aliases: ["m²", "m2", "sqm"],
  },
  "km²": {
    symbol: "km²",
    name: "square kilometre",
    dimension: "area",
    category: "Area",
    toBase: (v) => v * 1e6,
    fromBase: (b) => b / 1e6,
    aliases: ["km²", "km2", "sqkm"],
  },
  "ft²": {
    symbol: "ft²",
    name: "square foot",
    dimension: "area",
    category: "Area",
    toBase: (v) => v * 0.09290304,
    fromBase: (b) => b / 0.09290304,
    aliases: ["ft²", "ft2", "sqft"],
  },

  // VOLUME (Base: L)
  mL: {
    symbol: "mL",
    name: "millilitre",
    dimension: "volume",
    category: "Volume",
    toBase: (v) => v * 0.001,
    fromBase: (b) => b / 0.001,
    aliases: ["ml", "milliliter", "millilitre"],
  },
  L: {
    symbol: "L",
    name: "litre",
    dimension: "volume",
    category: "Volume",
    toBase: (v) => v,
    fromBase: (b) => b,
    aliases: ["l", "liter", "litre", "liters", "litres"],
  },
  "cm³": {
    symbol: "cm³",
    name: "cubic centimetre",
    dimension: "volume",
    category: "Volume",
    toBase: (v) => v * 0.001,
    fromBase: (b) => b / 0.001,
    aliases: ["cm³", "cm3", "cc"],
  },
  "m³": {
    symbol: "m³",
    name: "cubic metre",
    dimension: "volume",
    category: "Volume",
    toBase: (v) => v * 1000,
    fromBase: (b) => b / 1000,
    aliases: ["m³", "m3", "cum"],
  },
  gal: {
    symbol: "gal",
    name: "gallon",
    dimension: "volume",
    category: "Volume",
    toBase: (v) => v * 3.785411784,
    fromBase: (b) => b / 3.785411784,
    aliases: ["gal", "gallon", "gallons"],
  },

  // SPEED (Base: m/s)
  "m/s": {
    symbol: "m/s",
    name: "metres per second",
    dimension: "speed",
    category: "Speed",
    toBase: (v) => v,
    fromBase: (b) => b,
    aliases: ["m/s", "mps"],
  },
  "km/h": {
    symbol: "km/h",
    name: "kilometres per hour",
    dimension: "speed",
    category: "Speed",
    toBase: (v) => v / 3.6,
    fromBase: (b) => b * 3.6,
    aliases: ["km/h", "kmh", "kph"],
  },
  mph: {
    symbol: "mph",
    name: "miles per hour",
    dimension: "speed",
    category: "Speed",
    toBase: (v) => v * 0.44704,
    fromBase: (b) => b / 0.44704,
    aliases: ["mph"],
  },
};

// Map of lowercased alias -> UnitDefinition
const ALIAS_MAP = new Map<string, UnitDefinition>();
for (const unit of Object.values(KNOWN_UNITS)) {
  for (const alias of unit.aliases) {
    ALIAS_MAP.set(alias.toLowerCase(), unit);
  }
}

/**
 * Finds a unit definition by symbol or alias.
 */
export function findUnit(token: string): UnitDefinition | null {
  const clean = token.trim().toLowerCase();
  return ALIAS_MAP.get(clean) || null;
}

export interface UnitQuantity {
  value: number;
  unit: UnitDefinition | null;
  dimension: PhysicalDimension;
}

export interface UnitEvaluationResult {
  isValid: boolean;
  value: number | null;
  unit: string | null;
  dimension: PhysicalDimension;
  formatted: string;
  steps: string[];
  error?: string;
}

/**
 * Converts a value from one unit to another within the same dimension.
 */
export function convertUnit(
  val: number,
  fromUnit: UnitDefinition,
  toUnit: UnitDefinition
): { result: number; step: string } {
  if (fromUnit.dimension !== toUnit.dimension) {
    throw new Error(
      `Cannot convert incompatible dimensions: ${fromUnit.name} (${fromUnit.dimension}) to ${toUnit.name} (${toUnit.dimension}).`
    );
  }

  const baseVal = fromUnit.toBase(val);
  const targetVal = toUnit.fromBase(baseVal);
  const step = `${val} ${fromUnit.symbol} = ${parseFloat(targetVal.toFixed(8))} ${toUnit.symbol}`;
  return { result: targetVal, step };
}

/**
 * Checks whether an expression contains physical units.
 */
export function hasPhysicalUnits(expr: string): boolean {
  const words = expr.match(/[a-zA-Z°²³]+/g) || [];
  const mathKeywords = new Set([
    "sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh",
    "sqrt", "cbrt", "log", "ln", "exp", "abs", "rand", "randint", "ans",
    "pi", "e", "npr", "ncr", "deg", "rad", "grad", "p", "c", "x", "y"
  ]);

  return words.some((w) => {
    const low = w.toLowerCase();
    if (mathKeywords.has(low)) return false;
    return ALIAS_MAP.has(low) || ALIAS_MAP.has(w);
  });
}

/**
 * Deterministic Unit-Aware Expression Evaluator.
 * Handles dimensional operations:
 * - Addition/subtraction: 5 km + 300 m -> 5.3 km
 * - Dimensional error: 5 m + 3 s -> Error
 * - Multiplication: 100 cm * 2 -> 200 cm, 5 m * 2 m -> 10 m²
 * - Division: 60 km / 2 h -> 30 km/h, 10 m / 2 s -> 5 m/s, 10 m / 2 m -> 5
 * - Temperature conversion: 0 °C to °F -> 32 °F
 */
export function evaluateUnitExpression(expr: string): UnitEvaluationResult {
  const s = expr.trim();
  const steps: string[] = [];

  // Check for direct conversion syntax e.g. "0 °C to °F", "100 cm to m", "5 km in m", "0 C to F"
  const convMatch = s.match(/^([+-]?\s*\d+(?:\.\d+)?)\s*([a-zA-Z°²³]+)\s+(?:to|in|into)\s+([a-zA-Z°²³]+)$/i);
  if (convMatch) {
    const rawVal = parseFloat(convMatch[1].replace(/\s+/g, ""));
    const fromU = findUnit(convMatch[2]);
    const toU = findUnit(convMatch[3]);

    if (!fromU) {
      return {
        isValid: false,
        value: null,
        unit: null,
        dimension: "dimensionless",
        formatted: "",
        steps: [],
        error: `Unknown unit "${convMatch[2]}".`,
      };
    }
    if (!toU) {
      return {
        isValid: false,
        value: null,
        unit: null,
        dimension: "dimensionless",
        formatted: "",
        steps: [],
        error: `Unknown unit "${convMatch[3]}".`,
      };
    }
    if (fromU.dimension !== toU.dimension) {
      return {
        isValid: false,
        value: null,
        unit: null,
        dimension: "dimensionless",
        formatted: "",
        steps: [],
        error: `Incompatible units: ${fromU.name} (${fromU.dimension}) and ${toU.name} (${toU.dimension}) cannot be converted.`,
      };
    }

    const { result, step } = convertUnit(rawVal, fromU, toU);
    steps.push(`Convert ${rawVal} ${fromU.symbol} to ${toU.symbol}`);
    steps.push(step);
    return {
      isValid: true,
      value: result,
      unit: toU.symbol,
      dimension: toU.dimension,
      formatted: `${parseFloat(result.toFixed(6))} ${toU.symbol}`,
      steps,
    };
  }

  // Single temperature representation with default conversion check e.g. "0 °C", "100 °C", "32 °F"
  const singleTempMatch = s.match(/^([+-]?\s*\d+(?:\.\d+)?)\s*(°C|degC|°F|degF|K)$/i);
  if (singleTempMatch) {
    const val = parseFloat(singleTempMatch[1].replace(/\s+/g, ""));
    const u = findUnit(singleTempMatch[2]);
    if (u && u.dimension === "temperature") {
      let altConv = "";
      if (u.symbol === "°C") {
        const toF = ((val * 9) / 5 + 32);
        const toK = val + 273.15;
        altConv = ` (${parseFloat(toF.toFixed(4))} °F / ${parseFloat(toK.toFixed(4))} K)`;
        steps.push(`${val} °C = ${parseFloat(toF.toFixed(4))} °F = ${parseFloat(toK.toFixed(4))} K`);
      } else if (u.symbol === "°F") {
        const toC = (((val - 32) * 5) / 9);
        altConv = ` (${parseFloat(toC.toFixed(4))} °C)`;
        steps.push(`${val} °F = ${parseFloat(toC.toFixed(4))} °C`);
      }
      return {
        isValid: true,
        value: val,
        unit: u.symbol,
        dimension: "temperature",
        formatted: `${val} ${u.symbol}${altConv}`,
        steps,
      };
    }
  }

  // Binary unit expressions: Quantity OP Quantity (e.g. 5 km + 300 m, 60 km / 2 h, 100 cm * 2, 5 m * 2 m)
  // Regex parsing quantities: <num> <unit?> <op> <num> <unit?>
  const binaryPattern = /^([+-]?\s*\d+(?:\.\d+)?)\s*([a-zA-Z°²³]+)?\s*([+\-*/×÷−])\s*([+-]?\s*\d+(?:\.\d+)?)\s*([a-zA-Z°²³]+)?$/;
  const match = s.match(binaryPattern);

  if (match) {
    const v1 = parseFloat(match[1].replace(/\s+/g, ""));
    const u1Raw = match[2];
    const op = match[3].replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-");
    const v2 = parseFloat(match[4].replace(/\s+/g, ""));
    const u2Raw = match[5];

    const u1 = u1Raw ? findUnit(u1Raw) : null;
    const u2 = u2Raw ? findUnit(u2Raw) : null;

    if (u1Raw && !u1) {
      return {
        isValid: false,
        value: null,
        unit: null,
        dimension: "dimensionless",
        formatted: "",
        steps: [],
        error: `Unknown unit "${u1Raw}".`,
      };
    }
    if (u2Raw && !u2) {
      return {
        isValid: false,
        value: null,
        unit: null,
        dimension: "dimensionless",
        formatted: "",
        steps: [],
        error: `Unknown unit "${u2Raw}".`,
      };
    }

    // =========================================================================
    // 1. ADDITION & SUBTRACTION (+) / (-)
    // =========================================================================
    if (op === "+" || op === "-") {
      // Temperature addition/subtraction safety:
      if (u1?.dimension === "temperature" || u2?.dimension === "temperature") {
        return {
          isValid: false,
          value: null,
          unit: null,
          dimension: "temperature",
          formatted: "",
          steps: [],
          error: "Direct temperature addition requires explicit temperature intervals or conversion syntax (e.g. 0 °C to °F).",
        };
      }

      // Case: Dimension mismatch e.g. 5 m + 3 s
      if (u1 && u2 && u1.dimension !== u2.dimension) {
        return {
          isValid: false,
          value: null,
          unit: null,
          dimension: "dimensionless",
          formatted: "",
          steps: [],
          error: `Incompatible units: ${u1.name} (${u1.dimension}) and ${u2.name} (${u2.dimension}) cannot be added or subtracted.`,
        };
      }

      // Case: Unit + Dimensionless or vice-versa
      if ((u1 && !u2) || (!u1 && u2)) {
        return {
          isValid: false,
          value: null,
          unit: null,
          dimension: "dimensionless",
          formatted: "",
          steps: [],
          error: "Cannot add a dimensionless number to a physical unit quantity without a specified unit.",
        };
      }

      // Case: Both have compatible dimension (e.g. 5 km + 300 m)
      if (u1 && u2 && u1.dimension === u2.dimension) {
        if (u1.symbol === u2.symbol) {
          const res = op === "+" ? v1 + v2 : v1 - v2;
          steps.push(`Perform operation on identical units (${u1.symbol}):`);
          steps.push(`${v1} ${u1.symbol} ${op} ${v2} ${u1.symbol} = ${res} ${u1.symbol}`);
          return {
            isValid: true,
            value: res,
            unit: u1.symbol,
            dimension: u1.dimension,
            formatted: `${parseFloat(res.toFixed(6))} ${u1.symbol}`,
            steps,
          };
        } else {
          // Convert second quantity to first quantity's unit
          const { result: convertedV2, step: convStep } = convertUnit(v2, u2, u1);
          steps.push(`Convert ${v2} ${u2.symbol} to ${u1.name} (${u1.symbol}):`);
          steps.push(convStep);
          const res = op === "+" ? v1 + convertedV2 : v1 - convertedV2;
          steps.push(`Compute ${op === "+" ? "addition" : "subtraction"}:`);
          steps.push(`${v1} ${u1.symbol} ${op} ${parseFloat(convertedV2.toFixed(6))} ${u1.symbol} = ${parseFloat(res.toFixed(6))} ${u1.symbol}`);

          return {
            isValid: true,
            value: res,
            unit: u1.symbol,
            dimension: u1.dimension,
            formatted: `${parseFloat(res.toFixed(6))} ${u1.symbol}`,
            steps,
          };
        }
      }
    }

    // =========================================================================
    // 2. MULTIPLICATION (*)
    // =========================================================================
    if (op === "*") {
      // Unit × Scalar: e.g. 100 cm * 2 -> 200 cm
      if (u1 && !u2) {
        const res = v1 * v2;
        steps.push(`Multiply ${v1} ${u1.symbol} by scalar ${v2}:`);
        steps.push(`${v1} ${u1.symbol} × ${v2} = ${parseFloat(res.toFixed(6))} ${u1.symbol}`);
        return {
          isValid: true,
          value: res,
          unit: u1.symbol,
          dimension: u1.dimension,
          formatted: `${parseFloat(res.toFixed(6))} ${u1.symbol}`,
          steps,
        };
      }
      if (!u1 && u2) {
        const res = v1 * v2;
        steps.push(`Multiply scalar ${v1} by ${v2} ${u2.symbol}:`);
        steps.push(`${v1} × ${v2} ${u2.symbol} = ${parseFloat(res.toFixed(6))} ${u2.symbol}`);
        return {
          isValid: true,
          value: res,
          unit: u2.symbol,
          dimension: u2.dimension,
          formatted: `${parseFloat(res.toFixed(6))} ${u2.symbol}`,
          steps,
        };
      }

      // Length × Length -> Area: e.g. 5 m * 2 m -> 10 m²
      if (u1?.dimension === "length" && u2?.dimension === "length") {
        const { result: convertedV2, step: convStep } = convertUnit(v2, u2, u1);
        if (u1.symbol !== u2.symbol) {
          steps.push(`Convert ${v2} ${u2.symbol} to ${u1.symbol}:`);
          steps.push(convStep);
        }
        const res = v1 * convertedV2;
        const areaUnitSymbol = u1.symbol === "m" ? "m²" : u1.symbol === "cm" ? "cm²" : u1.symbol === "mm" ? "mm²" : u1.symbol === "km" ? "km²" : `${u1.symbol}²`;
        steps.push(`Calculate area (length × length):`);
        steps.push(`${v1} ${u1.symbol} × ${parseFloat(convertedV2.toFixed(6))} ${u1.symbol} = ${parseFloat(res.toFixed(6))} ${areaUnitSymbol}`);
        return {
          isValid: true,
          value: res,
          unit: areaUnitSymbol,
          dimension: "area",
          formatted: `${parseFloat(res.toFixed(6))} ${areaUnitSymbol}`,
          steps,
        };
      }
    }

    // =========================================================================
    // 3. DIVISION (/)
    // =========================================================================
    if (op === "/") {
      if (v2 === 0) {
        return {
          isValid: false,
          value: null,
          unit: null,
          dimension: "dimensionless",
          formatted: "",
          steps: [],
          error: "Division by zero.",
        };
      }

      // Unit / Scalar: e.g. 10 m / 2 -> 5 m
      if (u1 && !u2) {
        const res = v1 / v2;
        steps.push(`Divide ${v1} ${u1.symbol} by scalar ${v2}:`);
        steps.push(`${v1} ${u1.symbol} ÷ ${v2} = ${parseFloat(res.toFixed(6))} ${u1.symbol}`);
        return {
          isValid: true,
          value: res,
          unit: u1.symbol,
          dimension: u1.dimension,
          formatted: `${parseFloat(res.toFixed(6))} ${u1.symbol}`,
          steps,
        };
      }

      // Unit / Unit of Same Dimension -> Dimensionless ratio: e.g. 10 m / 2 m -> 5
      if (u1 && u2 && u1.dimension === u2.dimension) {
        const { result: convertedV2, step: convStep } = convertUnit(v2, u2, u1);
        if (u1.symbol !== u2.symbol) {
          steps.push(`Convert ${v2} ${u2.symbol} to ${u1.symbol}:`);
          steps.push(convStep);
        }
        const res = v1 / convertedV2;
        steps.push(`Compute dimensionless ratio:`);
        steps.push(`${v1} ${u1.symbol} ÷ ${parseFloat(convertedV2.toFixed(6))} ${u1.symbol} = ${parseFloat(res.toFixed(6))}`);
        return {
          isValid: true,
          value: res,
          unit: null,
          dimension: "dimensionless",
          formatted: `${parseFloat(res.toFixed(6))}`,
          steps,
        };
      }

      // Length / Time -> Speed: e.g. 60 km / 2 h -> 30 km/h, 10 m / 2 s -> 5 m/s
      if (u1?.dimension === "length" && u2?.dimension === "time") {
        // If km and h -> km/h
        if (u1.symbol === "km" && u2.symbol === "h") {
          const res = v1 / v2;
          steps.push(`Calculate speed (distance / time):`);
          steps.push(`${v1} km ÷ ${v2} h = ${parseFloat(res.toFixed(6))} km/h`);
          return {
            isValid: true,
            value: res,
            unit: "km/h",
            dimension: "speed",
            formatted: `${parseFloat(res.toFixed(6))} km/h`,
            steps,
          };
        }

        // If m and s -> m/s
        if (u1.symbol === "m" && u2.symbol === "s") {
          const res = v1 / v2;
          steps.push(`Calculate speed (distance / time):`);
          steps.push(`${v1} m ÷ ${v2} s = ${parseFloat(res.toFixed(6))} m/s`);
          return {
            isValid: true,
            value: res,
            unit: "m/s",
            dimension: "speed",
            formatted: `${parseFloat(res.toFixed(6))} m/s`,
            steps,
          };
        }

        // Other length / time: normalize to m/s
        const baseDist = u1.toBase(v1);
        const baseTime = u2.toBase(v2);
        const speedBase = baseDist / baseTime;
        steps.push(`Convert distance to metres and time to seconds:`);
        steps.push(`${v1} ${u1.symbol} = ${baseDist} m, ${v2} ${u2.symbol} = ${baseTime} s`);
        steps.push(`Compute speed in m/s:`);
        steps.push(`${baseDist} m ÷ ${baseTime} s = ${parseFloat(speedBase.toFixed(6))} m/s`);
        return {
          isValid: true,
          value: speedBase,
          unit: "m/s",
          dimension: "speed",
          formatted: `${parseFloat(speedBase.toFixed(6))} m/s`,
          steps,
        };
      }
    }
  }

  // Fallback: single value with unit e.g. "100 cm", "5 km", "60 min"
  const singleMatch = s.match(/^([+-]?\s*\d+(?:\.\d+)?)\s*([a-zA-Z°²³]+)$/);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1].replace(/\s+/g, ""));
    const u = findUnit(singleMatch[2]);
    if (u) {
      // Find standard canonical conversions to display alongside
      let convNote = "";
      if (u.symbol === "cm") {
        const mVal = u.toBase(val);
        convNote = ` = ${parseFloat(mVal.toFixed(6))} m`;
        steps.push(`${val} cm = ${parseFloat(mVal.toFixed(6))} m`);
      } else if (u.symbol === "km") {
        const mVal = u.toBase(val);
        convNote = ` = ${parseFloat(mVal.toFixed(6))} m`;
        steps.push(`${val} km = ${parseFloat(mVal.toFixed(6))} m`);
      } else if (u.symbol === "min") {
        const hVal = val / 60;
        convNote = ` = ${parseFloat(hVal.toFixed(6))} h`;
        steps.push(`${val} min = ${parseFloat(hVal.toFixed(6))} h`);
      } else if (u.symbol === "g") {
        const kgVal = val / 1000;
        convNote = ` = ${parseFloat(kgVal.toFixed(6))} kg`;
        steps.push(`${val} g = ${parseFloat(kgVal.toFixed(6))} kg`);
      }
      return {
        isValid: true,
        value: val,
        unit: u.symbol,
        dimension: u.dimension,
        formatted: `${val} ${u.symbol}${convNote}`,
        steps,
      };
    }
  }

  return {
    isValid: false,
    value: null,
    unit: null,
    dimension: "dimensionless",
    formatted: "",
    steps: [],
    error: "Could not parse unit expression.",
  };
}
