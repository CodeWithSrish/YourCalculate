import {
  ASTNode,
  PostfixExpressionNode,
  AngleMode,
  DisplayNotationMode,
  formatResultNumber,
} from "./scientific";
import {
  ComplexNumber,
  MathValue,
  createComplex,
  absComplex,
  formatComplexRectangular,
} from "./scientificComplex";

// =========================================================================
// 1. EXACT MATHEMATICAL TYPES & DISCRIMINATED UNIONS
// =========================================================================

export type ExactValue =
  | ExactInteger
  | ExactRational
  | ExactRadical
  | ExactPiMultiple
  | ExactConstant
  | ExactProduct
  | ExactLinearSum
  | ExactImaginary
  | ExactComplex;

export interface ExactInteger {
  type: "integer";
  value: number;
}

export interface ExactRational {
  type: "rational";
  numerator: number;
  denominator: number;
}

export interface ExactRadical {
  type: "radical";
  coefficient: number; // e.g., 2 in 2√3
  radicand: number;    // e.g., 3 in 2√3
  denominator?: number; // e.g., 2 in (√2)/2
}

export interface ExactPiMultiple {
  type: "pi_multiple";
  numerator: number;   // e.g., 1 for π, 2 for 2π, 1 for π/2 (with den=2)
  denominator: number; // e.g., 2 for π/2
}

export interface ExactConstant {
  type: "constant";
  name: "e";
}

export interface ExactProduct {
  type: "product";
  rational: { numerator: number; denominator: number };
  symbolicPart: "pi" | "e" | string;
}

export interface ExactLinearSum {
  type: "linear_sum";
  rationalPart: { numerator: number; denominator: number };
  symbolicPart: ExactRadical | ExactPiMultiple;
}

export interface ExactImaginary {
  type: "imaginary";
  coefficient: ExactInteger | ExactRational;
}

export interface ExactComplex {
  type: "complex";
  real: ExactInteger | ExactRational;
  imaginary: ExactImaginary;
}

export interface MathematicalResult {
  canonical: MathValue;
  exact: ExactValue | null;
  formattedExact: string | null;
  decimal: number;
  formattedDecimal: string;
  hasExact: boolean;
  isComplex: boolean;
  polar?: {
    r: number;
    thetaRadians: number;
  };
}

export interface CalculationStep {
  id: string;
  stepNumber: number;
  operation: string;
  expression: string;
  subResult: number;
  formattedSubResult: string;
  exactSubResult?: string;
  explanation: string;
  rule?: string;
}

// =========================================================================
// 2. EXACT ARITHMETIC HELPER FUNCTIONS
// =========================================================================

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round((a / gcd(a, b)) * b));
}

export function createExactInteger(n: number): ExactInteger {
  return { type: "integer", value: Math.round(n) };
}

export function createExactRational(num: number, den: number): ExactInteger | ExactRational {
  if (den === 0) {
    throw new Error("Cannot divide by zero in exact rational arithmetic");
  }
  let n = Math.round(num);
  let d = Math.round(den);

  if (d < 0) {
    n = -n;
    d = -d;
  }

  const g = gcd(n, d);
  n = n / g;
  d = d / g;

  if (d === 1) {
    return { type: "integer", value: n };
  }

  return {
    type: "rational",
    numerator: n,
    denominator: d,
  };
}

export function simplifyRadical(radicand: number, coeff = 1, den = 1): ExactInteger | ExactRational | ExactRadical {
  if (radicand < 0) {
    throw new Error("Negative square root has no real exact radical representation");
  }
  if (radicand === 0) {
    return { type: "integer", value: 0 };
  }
  if (!Number.isInteger(radicand)) {
    throw new Error("Radicand must be an integer for exact simplification");
  }

  // Check if perfect square
  const sqrt = Math.sqrt(radicand);
  if (Number.isInteger(sqrt)) {
    return createExactRational(coeff * sqrt, den);
  }

  // Factor out largest square factor
  let currentCoeff = coeff;
  let remainingRadicand = radicand;

  const maxCheck = Math.min(10000, Math.floor(Math.sqrt(radicand)));
  for (let i = maxCheck; i >= 2; i--) {
    const sq = i * i;
    while (remainingRadicand % sq === 0) {
      currentCoeff *= i;
      remainingRadicand /= sq;
    }
  }

  const g = gcd(currentCoeff, den);
  const reducedCoeff = currentCoeff / g;
  const reducedDen = den / g;

  if (reducedDen === 1) {
    return {
      type: "radical",
      coefficient: reducedCoeff,
      radicand: remainingRadicand,
    };
  }

  return {
    type: "radical",
    coefficient: reducedCoeff,
    radicand: remainingRadicand,
    denominator: reducedDen,
  };
}

// =========================================================================
// 3. EXACT VALUE FORMATTER
// =========================================================================

export function formatExactValue(val: ExactValue | null): string | null {
  if (!val) return null;

  switch (val.type) {
    case "integer":
      return String(val.value);

    case "rational":
      return `${val.numerator}/${val.denominator}`;

    case "radical": {
      const coeffStr =
        val.coefficient === 1
          ? ""
          : val.coefficient === -1
          ? "-"
          : `${val.coefficient}`;
      const rootStr = `${coeffStr}√${val.radicand}`;
      if (val.denominator && val.denominator !== 1) {
        return `${rootStr}/${val.denominator}`;
      }
      return rootStr;
    }

    case "pi_multiple": {
      const num = val.numerator;
      const den = val.denominator;
      if (num === 0) return "0";

      let numStr = "";
      if (num === 1) numStr = "π";
      else if (num === -1) numStr = "-π";
      else numStr = `${num}π`;

      if (den === 1) return numStr;
      return `${numStr}/${den}`;
    }

    case "constant":
      return val.name;

    case "product": {
      const { numerator, denominator } = val.rational;
      if (numerator === 0) return "0";
      let numStr = "";
      if (numerator === 1) numStr = val.symbolicPart;
      else if (numerator === -1) numStr = `-${val.symbolicPart}`;
      else numStr = `${numerator}${val.symbolicPart}`;

      if (denominator === 1) return numStr;
      return `${numStr}/${denominator}`;
    }

    case "linear_sum": {
      const { numerator, denominator } = val.rationalPart;
      const ratStr = denominator === 1 ? String(numerator) : `${numerator}/${denominator}`;
      const symStr = formatExactValue(val.symbolicPart);
      if (!symStr) return ratStr;
      if (symStr.startsWith("-")) {
        return `${ratStr} - ${symStr.slice(1)}`;
      }
      return `${ratStr} + ${symStr}`;
    }

    case "imaginary": {
      const coeff = val.coefficient;
      if (coeff.type === "integer") {
        if (coeff.value === 0) return "0";
        if (coeff.value === 1) return "i";
        if (coeff.value === -1) return "-i";
        return `${coeff.value}i`;
      } else {
        return `(${coeff.numerator}/${coeff.denominator})i`;
      }
    }

    case "complex": {
      const reStr = formatExactValue(val.real);
      const imCoeff = val.imaginary.coefficient;
      let isNeg = false;
      let imStr = "";

      if (imCoeff.type === "integer") {
        if (imCoeff.value === 0) return reStr;
        if (imCoeff.value < 0) {
          isNeg = true;
          imStr = imCoeff.value === -1 ? "i" : `${Math.abs(imCoeff.value)}i`;
        } else {
          imStr = imCoeff.value === 1 ? "i" : `${imCoeff.value}i`;
        }
      } else {
        if (imCoeff.numerator < 0) {
          isNeg = true;
          imStr = `(${Math.abs(imCoeff.numerator)}/${imCoeff.denominator})i`;
        } else {
          imStr = `(${imCoeff.numerator}/${imCoeff.denominator})i`;
        }
      }

      if (reStr === "0") {
        return isNeg ? `-${imStr}` : imStr;
      }

      return isNeg ? `${reStr} - ${imStr}` : `${reStr} + ${imStr}`;
    }

    default:
      return null;
  }
}

// =========================================================================
// 4. EXACT TRIGONOMETRIC TABLE
// =========================================================================

interface ExactTrigEntry {
  sin: ExactValue | null;
  cos: ExactValue | null;
  tan: ExactValue | null;
}

const EXACT_DEG_TABLE: Record<number, ExactTrigEntry> = {
  0: {
    sin: { type: "integer", value: 0 },
    cos: { type: "integer", value: 1 },
    tan: { type: "integer", value: 0 },
  },
  30: {
    sin: { type: "rational", numerator: 1, denominator: 2 },
    cos: { type: "radical", coefficient: 1, radicand: 3, denominator: 2 },
    tan: { type: "radical", coefficient: 1, radicand: 3, denominator: 3 },
  },
  45: {
    sin: { type: "radical", coefficient: 1, radicand: 2, denominator: 2 },
    cos: { type: "radical", coefficient: 1, radicand: 2, denominator: 2 },
    tan: { type: "integer", value: 1 },
  },
  60: {
    sin: { type: "radical", coefficient: 1, radicand: 3, denominator: 2 },
    cos: { type: "rational", numerator: 1, denominator: 2 },
    tan: { type: "radical", coefficient: 1, radicand: 3, denominator: 1 },
  },
  90: {
    sin: { type: "integer", value: 1 },
    cos: { type: "integer", value: 0 },
    tan: null, // Undefined
  },
  120: {
    sin: { type: "radical", coefficient: 1, radicand: 3, denominator: 2 },
    cos: { type: "rational", numerator: -1, denominator: 2 },
    tan: { type: "radical", coefficient: -1, radicand: 3 },
  },
  135: {
    sin: { type: "radical", coefficient: 1, radicand: 2, denominator: 2 },
    cos: { type: "radical", coefficient: -1, radicand: 2, denominator: 2 },
    tan: { type: "integer", value: -1 },
  },
  150: {
    sin: { type: "rational", numerator: 1, denominator: 2 },
    cos: { type: "radical", coefficient: -1, radicand: 3, denominator: 2 },
    tan: { type: "radical", coefficient: -1, radicand: 3, denominator: 3 },
  },
  180: {
    sin: { type: "integer", value: 0 },
    cos: { type: "integer", value: -1 },
    tan: { type: "integer", value: 0 },
  },
  210: {
    sin: { type: "rational", numerator: -1, denominator: 2 },
    cos: { type: "radical", coefficient: -1, radicand: 3, denominator: 2 },
    tan: { type: "radical", coefficient: 1, radicand: 3, denominator: 3 },
  },
  225: {
    sin: { type: "radical", coefficient: -1, radicand: 2, denominator: 2 },
    cos: { type: "radical", coefficient: -1, radicand: 2, denominator: 2 },
    tan: { type: "integer", value: 1 },
  },
  240: {
    sin: { type: "radical", coefficient: -1, radicand: 3, denominator: 2 },
    cos: { type: "rational", numerator: -1, denominator: 2 },
    tan: { type: "radical", coefficient: 1, radicand: 3 },
  },
  270: {
    sin: { type: "integer", value: -1 },
    cos: { type: "integer", value: 0 },
    tan: null,
  },
  300: {
    sin: { type: "radical", coefficient: -1, radicand: 3, denominator: 2 },
    cos: { type: "rational", numerator: 1, denominator: 2 },
    tan: { type: "radical", coefficient: -1, radicand: 3 },
  },
  315: {
    sin: { type: "radical", coefficient: -1, radicand: 2, denominator: 2 },
    cos: { type: "radical", coefficient: 1, radicand: 2, denominator: 2 },
    tan: { type: "integer", value: -1 },
  },
  330: {
    sin: { type: "rational", numerator: -1, denominator: 2 },
    cos: { type: "radical", coefficient: 1, radicand: 3, denominator: 2 },
    tan: { type: "radical", coefficient: -1, radicand: 3, denominator: 3 },
  },
};

export function lookupExactTrig(
  fn: "sin" | "cos" | "tan",
  angle: number,
  mode: AngleMode
): ExactValue | null {
  let degAngle: number;
  if (mode === "DEG") {
    degAngle = ((angle % 360) + 360) % 360;
  } else if (mode === "GRAD") {
    degAngle = (((angle * 0.9) % 360) + 360) % 360;
  } else {
    // RAD mode: check for multiples of pi
    const piMultiple = angle / Math.PI;
    const roundedPiMultiple = Math.round(piMultiple * 12) / 12;
    if (Math.abs(piMultiple - roundedPiMultiple) < 1e-9) {
      degAngle = (((roundedPiMultiple * 180) % 360) + 360) % 360;
    } else {
      return null;
    }
  }

  const roundedDeg = Math.round(degAngle * 1000) / 1000;
  const entry = EXACT_DEG_TABLE[roundedDeg];
  if (!entry) return null;
  return entry[fn];
}

// =========================================================================
// 5. EXACT AST EVALUATOR
// =========================================================================

export class ExactASTEvaluator {
  private angleMode: AngleMode;
  private variables: Record<string, ExactValue>;

  constructor(angleMode: AngleMode = "DEG", variables: Record<string, ExactValue> = {}) {
    this.angleMode = angleMode;
    this.variables = variables;
  }

  public deriveExact(node: ASTNode): ExactValue | null {
    switch (node.type) {
      case "NumberLiteral": {
        if (Number.isInteger(node.value)) {
          return { type: "integer", value: node.value };
        }
        return null;
      }

      case "Constant": {
        if (node.name === "pi" || node.name === "π") {
          return { type: "pi_multiple", numerator: 1, denominator: 1 };
        }
        if (node.name === "e") {
          return { type: "constant", name: "e" };
        }
        if (node.name === "i") {
          return { type: "imaginary", coefficient: { type: "integer", value: 1 } };
        }
        return null;
      }

      case "Identifier": {
        const lower = node.name.toLowerCase();
        if (this.variables[lower]) {
          return this.variables[lower];
        }
        return null;
      }

      case "Grouping":
        return this.deriveExact(node.expression);

      case "UnaryExpression": {
        const inner = this.deriveExact(node.argument);
        if (!inner) return null;
        if (node.operator === "+") return inner;
        return this.negate(inner);
      }

      case "PostfixExpression": {
        const inner = this.deriveExact(node.argument);
        if (!inner) return null;
        if (node.operator === "!" && inner.type === "integer" && inner.value >= 0 && inner.value <= 170) {
          let res = 1;
          for (let i = 2; i <= inner.value; i++) res *= i;
          return { type: "integer", value: res };
        }
        if (node.operator === "²") {
          return this.multiply(inner, inner);
        }
        if (node.operator === "³") {
          const sq = this.multiply(inner, inner);
          return sq ? this.multiply(sq, inner) : null;
        }
        if (node.operator === "%" && inner.type === "integer") {
          return createExactRational(inner.value, 100);
        }
        return null;
      }

      case "BinaryExpression": {
        const leftExact = this.deriveExact(node.left);
        const rightExact = this.deriveExact(node.right);

        if (!leftExact || !rightExact) return null;

        switch (node.operator) {
          case "+":
            return this.add(leftExact, rightExact);
          case "-":
            return this.subtract(leftExact, rightExact);
          case "*":
            return this.multiply(leftExact, rightExact);
          case "/":
            return this.divide(leftExact, rightExact);
          case "^":
            return this.power(leftExact, rightExact);
          case "P":
          case "C":
            if (
              leftExact.type === "integer" &&
              rightExact.type === "integer" &&
              leftExact.value >= 0 &&
              rightExact.value >= 0 &&
              rightExact.value <= leftExact.value &&
              leftExact.value <= 170
            ) {
              const n = leftExact.value;
              const r = rightExact.value;
              if (node.operator === "P") {
                let res = 1;
                for (let i = 0; i < r; i++) res *= n - i;
                return { type: "integer", value: res };
              } else {
                if (r === 0 || r === n) return { type: "integer", value: 1 };
                const k = Math.min(r, n - r);
                let num = 1;
                let den = 1;
                for (let i = 1; i <= k; i++) {
                  num *= n - (i - 1);
                  den *= i;
                }
                return { type: "integer", value: Math.round(num / den) };
              }
            }
            return null;
          default:
            return null;
        }
      }

      case "FunctionCall": {
        const fn = node.name.toLowerCase();
        if (node.args.length === 1) {
          const argExact = this.deriveExact(node.args[0]);

          if (fn === "sqrt") {
            if (argExact && argExact.type === "integer") {
              if (argExact.value >= 0) {
                return simplifyRadical(argExact.value);
              } else {
                // Negative integer square root: sqrt(-1) = i, sqrt(-4) = 2i
                const posVal = -argExact.value;
                const sqrt = Math.sqrt(posVal);
                if (Number.isInteger(sqrt)) {
                  return {
                    type: "imaginary",
                    coefficient: { type: "integer", value: sqrt },
                  };
                }
                // Non-integer radical imaginary coefficient (e.g. sqrt(-12)) falls back to decimal in V1
                return null;
              }
            }
            if (argExact && argExact.type === "rational") {
              if (argExact.numerator > 0) {
                const numSqrt = Math.sqrt(argExact.numerator);
                const denSqrt = Math.sqrt(argExact.denominator);
                if (Number.isInteger(numSqrt) && Number.isInteger(denSqrt)) {
                  return createExactRational(numSqrt, denSqrt);
                }
              } else if (argExact.numerator < 0) {
                // e.g. sqrt(-1/9) = (1/3)i
                const posNum = -argExact.numerator;
                const numSqrt = Math.sqrt(posNum);
                const denSqrt = Math.sqrt(argExact.denominator);
                if (Number.isInteger(numSqrt) && Number.isInteger(denSqrt)) {
                  return {
                    type: "imaginary",
                    coefficient: createExactRational(numSqrt, denSqrt),
                  };
                }
              }
            }
          }

          if (fn === "abs" && argExact) {
            if (argExact.type === "integer") return { type: "integer", value: Math.abs(argExact.value) };
            if (argExact.type === "rational") return createExactRational(Math.abs(argExact.numerator), argExact.denominator);
            if (argExact.type === "radical") return { ...argExact, coefficient: Math.abs(argExact.coefficient) };
            if (argExact.type === "pi_multiple") return { ...argExact, numerator: Math.abs(argExact.numerator) };
            if (argExact.type === "imaginary") {
              const coeff = argExact.coefficient;
              if (coeff.type === "integer") return { type: "integer", value: Math.abs(coeff.value) };
              return createExactRational(Math.abs(coeff.numerator), coeff.denominator);
            }
            if (argExact.type === "complex") {
              // |a + bi| = sqrt(a^2 + b^2) if perfect square integer
              const a = argExact.real.type === "integer" ? argExact.real.value : argExact.real.numerator / argExact.real.denominator;
              const b = argExact.imaginary.coefficient.type === "integer" ? argExact.imaginary.coefficient.value : argExact.imaginary.coefficient.numerator / argExact.imaginary.coefficient.denominator;
              const hypSq = a * a + b * b;
              const hyp = Math.sqrt(hypSq);
              if (Number.isInteger(hyp)) {
                return { type: "integer", value: hyp };
              }
            }
          }

          if (fn === "real" || fn === "re") {
            if (argExact) {
              if (argExact.type === "complex") return argExact.real;
              if (argExact.type === "imaginary") return { type: "integer", value: 0 };
              return argExact;
            }
          }

          if (fn === "imag" || fn === "im") {
            if (argExact) {
              if (argExact.type === "complex") return argExact.imaginary.coefficient;
              if (argExact.type === "imaginary") return argExact.coefficient;
              return { type: "integer", value: 0 };
            }
          }

          if (fn === "conj") {
            if (argExact) {
              if (argExact.type === "complex") {
                return {
                  type: "complex",
                  real: argExact.real,
                  imaginary: {
                    type: "imaginary",
                    coefficient: this.negateRationalOrInteger(argExact.imaginary.coefficient),
                  },
                };
              }
              if (argExact.type === "imaginary") {
                return {
                  type: "imaginary",
                  coefficient: this.negateRationalOrInteger(argExact.coefficient),
                };
              }
              return argExact;
            }
          }

          if (fn === "sin" || fn === "cos" || fn === "tan") {
            if (argExact && (argExact.type === "integer" || argExact.type === "rational" || argExact.type === "pi_multiple")) {
              let angleNumeric: number;
              if (argExact.type === "integer") angleNumeric = argExact.value;
              else if (argExact.type === "rational") angleNumeric = argExact.numerator / argExact.denominator;
              else angleNumeric = (argExact.numerator * Math.PI) / argExact.denominator;
              return lookupExactTrig(fn, angleNumeric, this.angleMode);
            }
          }
        }
        return null;
      }

      default:
        return null;
    }
  }

  private negateRationalOrInteger(val: ExactInteger | ExactRational): ExactInteger | ExactRational {
    if (val.type === "integer") {
      return { type: "integer", value: -val.value };
    }
    return { type: "rational", numerator: -val.numerator, denominator: val.denominator };
  }

  private addRationalOrInteger(
    a: ExactInteger | ExactRational,
    b: ExactInteger | ExactRational
  ): ExactInteger | ExactRational {
    const aNum = a.type === "integer" ? a.value : a.numerator;
    const aDen = a.type === "integer" ? 1 : a.denominator;
    const bNum = b.type === "integer" ? b.value : b.numerator;
    const bDen = b.type === "integer" ? 1 : b.denominator;
    return createExactRational(aNum * bDen + bNum * aDen, aDen * bDen);
  }

  private mulRationalOrInteger(
    a: ExactInteger | ExactRational,
    b: ExactInteger | ExactRational
  ): ExactInteger | ExactRational {
    const aNum = a.type === "integer" ? a.value : a.numerator;
    const aDen = a.type === "integer" ? 1 : a.denominator;
    const bNum = b.type === "integer" ? b.value : b.numerator;
    const bDen = b.type === "integer" ? 1 : b.denominator;
    return createExactRational(aNum * bNum, aDen * bDen);
  }

  private divRationalOrInteger(
    a: ExactInteger | ExactRational,
    b: ExactInteger | ExactRational
  ): ExactInteger | ExactRational | null {
    const aNum = a.type === "integer" ? a.value : a.numerator;
    const aDen = a.type === "integer" ? 1 : a.denominator;
    const bNum = b.type === "integer" ? b.value : b.numerator;
    const bDen = b.type === "integer" ? 1 : b.denominator;
    if (bNum === 0) return null;
    return createExactRational(aNum * bDen, aDen * bNum);
  }

  private negate(val: ExactValue): ExactValue {
    switch (val.type) {
      case "integer":
        return { type: "integer", value: -val.value };
      case "rational":
        return { type: "rational", numerator: -val.numerator, denominator: val.denominator };
      case "radical":
        return { ...val, coefficient: -val.coefficient };
      case "pi_multiple":
        return { ...val, numerator: -val.numerator };
      case "product":
        return {
          ...val,
          rational: { numerator: -val.rational.numerator, denominator: val.rational.denominator },
        };
      case "linear_sum":
        return {
          type: "linear_sum",
          rationalPart: { numerator: -val.rationalPart.numerator, denominator: val.rationalPart.denominator },
          symbolicPart: this.negate(val.symbolicPart) as ExactRadical | ExactPiMultiple,
        };
      case "imaginary":
        return {
          type: "imaginary",
          coefficient: this.negateRationalOrInteger(val.coefficient),
        };
      case "complex":
        return {
          type: "complex",
          real: this.negateRationalOrInteger(val.real),
          imaginary: {
            type: "imaginary",
            coefficient: this.negateRationalOrInteger(val.imaginary.coefficient),
          },
        };
      default:
        return val;
    }
  }

  private add(a: ExactValue, b: ExactValue): ExactValue | null {
    // Exact Imaginary + Exact Imaginary
    if (a.type === "imaginary" && b.type === "imaginary") {
      const sumCoeff = this.addRationalOrInteger(a.coefficient, b.coefficient);
      if (sumCoeff.type === "integer" && sumCoeff.value === 0) {
        return { type: "integer", value: 0 };
      }
      return { type: "imaginary", coefficient: sumCoeff };
    }

    // Exact Imaginary + Real (Integer / Rational)
    if (a.type === "imaginary" && (b.type === "integer" || b.type === "rational")) {
      return {
        type: "complex",
        real: b,
        imaginary: a,
      };
    }
    if ((a.type === "integer" || a.type === "rational") && b.type === "imaginary") {
      return {
        type: "complex",
        real: a,
        imaginary: b,
      };
    }

    // Exact Complex + Real (Integer / Rational)
    if (a.type === "complex" && (b.type === "integer" || b.type === "rational")) {
      const newReal = this.addRationalOrInteger(a.real, b);
      return {
        type: "complex",
        real: newReal,
        imaginary: a.imaginary,
      };
    }
    if ((a.type === "integer" || a.type === "rational") && b.type === "complex") {
      return this.add(b, a);
    }

    // Exact Complex + Imaginary
    if (a.type === "complex" && b.type === "imaginary") {
      const newIm = this.addRationalOrInteger(a.imaginary.coefficient, b.coefficient);
      if (newIm.type === "integer" && newIm.value === 0) {
        return a.real;
      }
      return {
        type: "complex",
        real: a.real,
        imaginary: { type: "imaginary", coefficient: newIm },
      };
    }
    if (a.type === "imaginary" && b.type === "complex") {
      return this.add(b, a);
    }

    // Exact Complex + Exact Complex
    if (a.type === "complex" && b.type === "complex") {
      const newReal = this.addRationalOrInteger(a.real, b.real);
      const newIm = this.addRationalOrInteger(a.imaginary.coefficient, b.imaginary.coefficient);
      if (newIm.type === "integer" && newIm.value === 0) {
        return newReal;
      }
      return {
        type: "complex",
        real: newReal,
        imaginary: { type: "imaginary", coefficient: newIm },
      };
    }

    // Integer + Integer
    if (a.type === "integer" && b.type === "integer") {
      return { type: "integer", value: a.value + b.value };
    }
    // Rational + Integer / Rational
    if (
      (a.type === "integer" || a.type === "rational") &&
      (b.type === "integer" || b.type === "rational")
    ) {
      return this.addRationalOrInteger(a, b);
    }
    // Pi multiple + Pi multiple
    if (a.type === "pi_multiple" && b.type === "pi_multiple") {
      const totalNum = a.numerator * b.denominator + b.numerator * a.denominator;
      const totalDen = a.denominator * b.denominator;
      const g = gcd(totalNum, totalDen);
      return {
        type: "pi_multiple",
        numerator: totalNum / g,
        denominator: totalDen / g,
      };
    }
    // Radical + Radical with same radicand
    if (a.type === "radical" && b.type === "radical" && a.radicand === b.radicand) {
      const aCoeff = a.coefficient;
      const aDen = a.denominator || 1;
      const bCoeff = b.coefficient;
      const bDen = b.denominator || 1;
      const totalNum = aCoeff * bDen + bCoeff * aDen;
      const totalDen = aDen * bDen;
      return simplifyRadical(a.radicand, totalNum, totalDen);
    }
    // Rational/Integer + Radical (Linear sum: e.g. 2 + 2√2)
    if (
      (a.type === "integer" || a.type === "rational") &&
      b.type === "radical"
    ) {
      const aNum = a.type === "integer" ? a.value : a.numerator;
      const aDen = a.type === "integer" ? 1 : a.denominator;
      return {
        type: "linear_sum",
        rationalPart: { numerator: aNum, denominator: aDen },
        symbolicPart: b,
      };
    }
    if (
      a.type === "radical" &&
      (b.type === "integer" || b.type === "rational")
    ) {
      return this.add(b, a);
    }
    return null;
  }

  private subtract(a: ExactValue, b: ExactValue): ExactValue | null {
    return this.add(a, this.negate(b));
  }

  private multiply(a: ExactValue, b: ExactValue): ExactValue | null {
    // Imaginary * Imaginary: (ai) * (bi) = -ab
    if (a.type === "imaginary" && b.type === "imaginary") {
      const prod = this.mulRationalOrInteger(a.coefficient, b.coefficient);
      return this.negateRationalOrInteger(prod);
    }

    // Real * Imaginary: a * (bi) = (ab)i
    if ((a.type === "integer" || a.type === "rational") && b.type === "imaginary") {
      const prod = this.mulRationalOrInteger(a, b.coefficient);
      return { type: "imaginary", coefficient: prod };
    }
    if (a.type === "imaginary" && (b.type === "integer" || b.type === "rational")) {
      return this.multiply(b, a);
    }

    // Real * Complex: k * (a + bi) = ka + kbi
    if ((a.type === "integer" || a.type === "rational") && b.type === "complex") {
      const newReal = this.mulRationalOrInteger(a, b.real);
      const newIm = this.mulRationalOrInteger(a, b.imaginary.coefficient);
      return {
        type: "complex",
        real: newReal,
        imaginary: { type: "imaginary", coefficient: newIm },
      };
    }
    if (a.type === "complex" && (b.type === "integer" || b.type === "rational")) {
      return this.multiply(b, a);
    }

    // Imaginary * Complex: (di) * (a + bi) = -bd + adi
    if (a.type === "imaginary" && b.type === "complex") {
      const d = a.coefficient;
      const c = b.real;
      const e = b.imaginary.coefficient;
      // (di) * (c + ei) = -de + cdi
      const newReal = this.negateRationalOrInteger(this.mulRationalOrInteger(d, e));
      const newIm = this.mulRationalOrInteger(c, d);
      return {
        type: "complex",
        real: newReal,
        imaginary: { type: "imaginary", coefficient: newIm },
      };
    }
    if (a.type === "complex" && b.type === "imaginary") {
      return this.multiply(b, a);
    }

    // Complex * Complex: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
    if (a.type === "complex" && b.type === "complex") {
      const ar = a.real;
      const ai = a.imaginary.coefficient;
      const br = b.real;
      const bi = b.imaginary.coefficient;

      const ac = this.mulRationalOrInteger(ar, br);
      const bd = this.mulRationalOrInteger(ai, bi);
      const ad = this.mulRationalOrInteger(ar, bi);
      const bc = this.mulRationalOrInteger(ai, br);

      const realPart = this.addRationalOrInteger(ac, this.negateRationalOrInteger(bd));
      const imagPart = this.addRationalOrInteger(ad, bc);

      if (imagPart.type === "integer" && imagPart.value === 0) {
        return realPart;
      }

      return {
        type: "complex",
        real: realPart,
        imaginary: { type: "imaginary", coefficient: imagPart },
      };
    }

    // Rational/Integer * Rational/Integer
    if (
      (a.type === "integer" || a.type === "rational") &&
      (b.type === "integer" || b.type === "rational")
    ) {
      return this.mulRationalOrInteger(a, b);
    }

    // Rational/Integer * Pi multiple
    if (
      (a.type === "integer" || a.type === "rational") &&
      b.type === "pi_multiple"
    ) {
      const aNum = a.type === "integer" ? a.value : a.numerator;
      const aDen = a.type === "integer" ? 1 : a.denominator;
      const resNum = aNum * b.numerator;
      const resDen = aDen * b.denominator;
      const g = gcd(resNum, resDen);
      return {
        type: "pi_multiple",
        numerator: resNum / g,
        denominator: resDen / g,
      };
    }

    if (
      a.type === "pi_multiple" &&
      (b.type === "integer" || b.type === "rational")
    ) {
      return this.multiply(b, a);
    }

    // Rational/Integer * Radical
    if (
      (a.type === "integer" || a.type === "rational") &&
      b.type === "radical"
    ) {
      const aNum = a.type === "integer" ? a.value : a.numerator;
      const aDen = a.type === "integer" ? 1 : a.denominator;
      const bDen = b.denominator || 1;
      return simplifyRadical(b.radicand, aNum * b.coefficient, aDen * bDen);
    }

    if (
      a.type === "radical" &&
      (b.type === "integer" || b.type === "rational")
    ) {
      return this.multiply(b, a);
    }

    // Radical * Radical
    if (a.type === "radical" && b.type === "radical") {
      const aDen = a.denominator || 1;
      const bDen = b.denominator || 1;
      const combinedRadicand = a.radicand * b.radicand;
      const combinedCoeff = a.coefficient * b.coefficient;
      return simplifyRadical(combinedRadicand, combinedCoeff, aDen * bDen);
    }

    return null;
  }

  private divide(a: ExactValue, b: ExactValue): ExactValue | null {
    // Imaginary / Real
    if (a.type === "imaginary" && (b.type === "integer" || b.type === "rational")) {
      const quot = this.divRationalOrInteger(a.coefficient, b);
      if (!quot) return null;
      return { type: "imaginary", coefficient: quot };
    }

    // Real / Imaginary: a / (bi) = -(a/b)i
    if ((a.type === "integer" || a.type === "rational") && b.type === "imaginary") {
      const quot = this.divRationalOrInteger(a, b.coefficient);
      if (!quot) return null;
      return { type: "imaginary", coefficient: this.negateRationalOrInteger(quot) };
    }

    // Imaginary / Imaginary: (ai) / (bi) = a / b
    if (a.type === "imaginary" && b.type === "imaginary") {
      return this.divRationalOrInteger(a.coefficient, b.coefficient);
    }

    // Complex / Real: (a + bi) / k = (a/k) + (b/k)i
    if (a.type === "complex" && (b.type === "integer" || b.type === "rational")) {
      const newReal = this.divRationalOrInteger(a.real, b);
      const newIm = this.divRationalOrInteger(a.imaginary.coefficient, b);
      if (!newReal || !newIm) return null;
      return {
        type: "complex",
        real: newReal,
        imaginary: { type: "imaginary", coefficient: newIm },
      };
    }

    // Complex / Complex: (a + bi) / (c + di) = ((ac + bd)/(c^2 + d^2)) + ((bc - ad)/(c^2 + d^2))i
    if (a.type === "complex" && b.type === "complex") {
      const ar = a.real;
      const ai = a.imaginary.coefficient;
      const br = b.real;
      const bi = b.imaginary.coefficient;

      const ac = this.mulRationalOrInteger(ar, br);
      const bd = this.mulRationalOrInteger(ai, bi);
      const bc = this.mulRationalOrInteger(ai, br);
      const ad = this.mulRationalOrInteger(ar, bi);

      const cSq = this.mulRationalOrInteger(br, br);
      const dSq = this.mulRationalOrInteger(bi, bi);
      const den = this.addRationalOrInteger(cSq, dSq);

      const numReal = this.addRationalOrInteger(ac, bd);
      const numImag = this.addRationalOrInteger(bc, this.negateRationalOrInteger(ad));

      const finalReal = this.divRationalOrInteger(numReal, den);
      const finalImag = this.divRationalOrInteger(numImag, den);
      if (!finalReal || !finalImag) return null;

      if (finalImag.type === "integer" && finalImag.value === 0) {
        return finalReal;
      }

      return {
        type: "complex",
        real: finalReal,
        imaginary: { type: "imaginary", coefficient: finalImag },
      };
    }

    if (
      (a.type === "integer" || a.type === "rational") &&
      (b.type === "integer" || b.type === "rational")
    ) {
      return this.divRationalOrInteger(a, b);
    }

    // Pi multiple / Rational
    if (
      a.type === "pi_multiple" &&
      (b.type === "integer" || b.type === "rational")
    ) {
      const bNum = b.type === "integer" ? b.value : b.numerator;
      const bDen = b.type === "integer" ? 1 : b.denominator;
      if (bNum === 0) return null;
      const resNum = a.numerator * bDen;
      const resDen = a.denominator * bNum;
      const g = gcd(resNum, resDen);
      return {
        type: "pi_multiple",
        numerator: resNum / g,
        denominator: resDen / g,
      };
    }

    // Radical / Rational
    if (
      a.type === "radical" &&
      (b.type === "integer" || b.type === "rational")
    ) {
      const bNum = b.type === "integer" ? b.value : b.numerator;
      const bDen = b.type === "integer" ? 1 : b.denominator;
      if (bNum === 0) return null;
      const aDen = a.denominator || 1;
      return simplifyRadical(a.radicand, a.coefficient * bDen, aDen * bNum);
    }

    // Radical / Radical
    if (a.type === "radical" && b.type === "radical") {
      const aDen = a.denominator || 1;
      const bDen = b.denominator || 1;
      if (a.radicand === b.radicand) {
        return createExactRational(a.coefficient * bDen, aDen * b.coefficient);
      }
      if (a.radicand % b.radicand === 0) {
        const quotRad = a.radicand / b.radicand;
        return simplifyRadical(quotRad, a.coefficient * bDen, aDen * b.coefficient);
      }
    }

    return null;
  }

  private power(a: ExactValue, b: ExactValue): ExactValue | null {
    if (b.type === "integer") {
      if (b.value === 0) return { type: "integer", value: 1 };
      if (b.value === 1) return a;

      if (a.type === "imaginary" && a.coefficient.type === "integer" && a.coefficient.value === 1) {
        // Powers of i: i^0=1, i^1=i, i^2=-1, i^3=-i, i^4=1
        const mod = ((b.value % 4) + 4) % 4;
        if (mod === 0) return { type: "integer", value: 1 };
        if (mod === 1) return { type: "imaginary", coefficient: { type: "integer", value: 1 } };
        if (mod === 2) return { type: "integer", value: -1 };
        if (mod === 3) return { type: "imaginary", coefficient: { type: "integer", value: -1 } };
      }

      if (b.value > 1 && b.value <= 10) {
        let res: ExactValue | null = a;
        for (let i = 1; i < b.value; i++) {
          if (!res) return null;
          res = this.multiply(res, a);
        }
        return res;
      }
      if (b.value === -1) {
        return this.divide({ type: "integer", value: 1 }, a);
      }
    }
    return null;
  }
}

// =========================================================================
// 6. AST-DERIVED STEP GENERATOR
// =========================================================================

export class StepGenerator {
  private steps: CalculationStep[] = [];
  private stepCounter = 1;
  private angleMode: AngleMode;
  private notation: DisplayNotationMode;
  private fixDigits: number;
  private exactEvaluator: ExactASTEvaluator;
  private variables: Record<string, number | ComplexNumber | MathValue>;
  private exactVariables: Record<string, ExactValue>;

  constructor(
    angleMode: AngleMode = "DEG",
    notation: DisplayNotationMode = "NORM",
    fixDigits = 2,
    variables: Record<string, number | ComplexNumber | MathValue> = {},
    exactVariables: Record<string, ExactValue> = {}
  ) {
    this.angleMode = angleMode;
    this.notation = notation;
    this.fixDigits = fixDigits;
    this.variables = variables;
    this.exactVariables = exactVariables;
    this.exactEvaluator = new ExactASTEvaluator(angleMode, exactVariables);
  }

  public generateSteps(ast: ASTNode): CalculationStep[] {
    this.steps = [];
    this.stepCounter = 1;
    this.traverse(ast);
    return this.steps;
  }

  private traverse(node: ASTNode): { mathVal: MathValue; exact: ExactValue | null; exprStr: string } {
    switch (node.type) {
      case "NumberLiteral": {
        return {
          mathVal: { kind: "real", value: node.value },
          exact: Number.isInteger(node.value) ? { type: "integer", value: node.value } : null,
          exprStr: node.raw || String(node.value),
        };
      }

      case "Constant": {
        if (node.name === "pi" || node.name === "π") {
          return {
            mathVal: { kind: "real", value: Math.PI },
            exact: { type: "pi_multiple", numerator: 1, denominator: 1 },
            exprStr: "π",
          };
        }
        if (node.name === "e") {
          return {
            mathVal: { kind: "real", value: Math.E },
            exact: { type: "constant", name: "e" },
            exprStr: "e",
          };
        }
        if (node.name === "i") {
          return {
            mathVal: { kind: "complex", value: { re: 0, im: 1 } },
            exact: { type: "imaginary", coefficient: { type: "integer", value: 1 } },
            exprStr: "i",
          };
        }
        return {
          mathVal: { kind: "real", value: 0 },
          exact: null,
          exprStr: node.name,
        };
      }

      case "Identifier": {
        const lower = node.name.toLowerCase();
        const stored = this.variables[lower];
        let mathVal: MathValue = { kind: "real", value: 0 };
        if (stored !== undefined) {
          if (typeof stored === "number") {
            mathVal = { kind: "real", value: stored };
          } else if ("kind" in stored) {
            mathVal = stored;
          } else if ("re" in stored && "im" in stored) {
            mathVal = stored.im === 0 ? { kind: "real", value: stored.re } : { kind: "complex", value: stored };
          }
        }
        const exact = this.exactVariables[lower] ?? (mathVal.kind === "real" && Number.isInteger(mathVal.value) ? { type: "integer", value: mathVal.value } : null);
        return { mathVal, exact, exprStr: node.name };
      }

      case "Grouping": {
        const inner = this.traverse(node.expression);
        if (node.expression.type !== "NumberLiteral" && node.expression.type !== "Constant" && node.expression.type !== "Identifier") {
          const exactStr = formatExactValue(inner.exact);
          const formattedSub = inner.mathVal.kind === "real"
            ? formatResultNumber(inner.mathVal.value, this.notation, this.fixDigits)
            : formatComplexRectangular(inner.mathVal.value, (n) => formatResultNumber(n, this.notation, this.fixDigits));

          this.steps.push({
            id: `step_${this.stepCounter}`,
            stepNumber: this.stepCounter++,
            operation: "Parentheses",
            expression: `(${inner.exprStr})`,
            subResult: inner.mathVal.kind === "real" ? inner.mathVal.value : inner.mathVal.value.re,
            formattedSubResult: formattedSub,
            exactSubResult: exactStr || undefined,
            explanation: `Evaluate expression inside parentheses: (${inner.exprStr}) = ${exactStr || formattedSub}`,
            rule: "P in PEMDAS (Parentheses first)",
          });
        }
        return {
          mathVal: inner.mathVal,
          exact: inner.exact,
          exprStr: `(${inner.exprStr})`,
        };
      }

      case "UnaryExpression": {
        const arg = this.traverse(node.argument);
        let resMath: MathValue;
        if (arg.mathVal.kind === "real") {
          resMath = { kind: "real", value: node.operator === "-" ? -arg.mathVal.value : arg.mathVal.value };
        } else {
          const re = node.operator === "-" ? -arg.mathVal.value.re : arg.mathVal.value.re;
          const im = node.operator === "-" ? -arg.mathVal.value.im : arg.mathVal.value.im;
          resMath = { kind: "complex", value: createComplex(re, im) };
        }

        const exact = this.exactEvaluator.deriveExact(node);
        const exactStr = formatExactValue(exact);
        const formattedSub = resMath.kind === "real"
          ? formatResultNumber(resMath.value, this.notation, this.fixDigits)
          : formatComplexRectangular(resMath.value, (n) => formatResultNumber(n, this.notation, this.fixDigits));

        const exprStr = `${node.operator}${arg.exprStr}`;
        this.steps.push({
          id: `step_${this.stepCounter}`,
          stepNumber: this.stepCounter++,
          operation: "Unary",
          expression: exprStr,
          subResult: resMath.kind === "real" ? resMath.value : resMath.value.re,
          formattedSubResult: formattedSub,
          exactSubResult: exactStr || undefined,
          explanation: `Apply unary ${node.operator === "-" ? "negation" : "positive"} to ${arg.exprStr} = ${exactStr || formattedSub}`,
        });

        return { mathVal: resMath, exact, exprStr };
      }

      case "PostfixExpression": {
        const arg = this.traverse(node.argument);
        let resNumeric: number;
        let explanation: string;
        let opName: string;

        const numVal = arg.mathVal.kind === "real" ? arg.mathVal.value : arg.mathVal.value.re;

        switch (node.operator) {
          case "!":
            opName = "Factorial";
            resNumeric = 1;
            for (let i = 2; i <= Math.round(numVal); i++) resNumeric *= i;
            explanation = `Calculate factorial: ${arg.exprStr}! = ${formatResultNumber(resNumeric, this.notation, this.fixDigits)}`;
            break;
          case "²":
            opName = "Square";
            resNumeric = Math.pow(numVal, 2);
            explanation = `Square the value: (${arg.exprStr})² = ${formatResultNumber(resNumeric, this.notation, this.fixDigits)}`;
            break;
          case "³":
            opName = "Cube";
            resNumeric = Math.pow(numVal, 3);
            explanation = `Cube the value: (${arg.exprStr})³ = ${formatResultNumber(resNumeric, this.notation, this.fixDigits)}`;
            break;
          case "%":
            opName = "Percentage";
            resNumeric = numVal / 100;
            explanation = `Convert to percentage fraction: ${arg.exprStr}% = ${formatResultNumber(resNumeric, this.notation, this.fixDigits)}`;
            break;
          default:
            opName = "Postfix";
            resNumeric = numVal;
            explanation = `Evaluate ${arg.exprStr}${(node as PostfixExpressionNode).operator}`;
        }

        const exact = this.exactEvaluator.deriveExact(node);
        const exactStr = formatExactValue(exact);
        const formattedSub = formatResultNumber(resNumeric, this.notation, this.fixDigits);

        const exprStr = `${arg.exprStr}${node.operator}`;
        this.steps.push({
          id: `step_${this.stepCounter}`,
          stepNumber: this.stepCounter++,
          operation: opName,
          expression: exprStr,
          subResult: resNumeric,
          formattedSubResult: formattedSub,
          exactSubResult: exactStr || undefined,
          explanation,
        });

        return { mathVal: { kind: "real", value: resNumeric }, exact, exprStr };
      }

      case "BinaryExpression": {
        const left = this.traverse(node.left);
        const right = this.traverse(node.right);

        let resMath: MathValue = { kind: "real", value: 0 };
        let opName = "BinaryOp";
        let explanation = "";
        let rule: string | undefined;

        if (left.mathVal.kind === "real" && right.mathVal.kind === "real") {
          const lNum = left.mathVal.value;
          const rNum = right.mathVal.value;
          switch (node.operator) {
            case "+":
              opName = "Addition";
              resMath = { kind: "real", value: lNum + rNum };
              explanation = `Add ${left.exprStr} and ${right.exprStr}`;
              rule = "Addition in PEMDAS";
              break;
            case "-":
              opName = "Subtraction";
              resMath = { kind: "real", value: lNum - rNum };
              explanation = `Subtract ${right.exprStr} from ${left.exprStr}`;
              rule = "Subtraction in PEMDAS";
              break;
            case "*":
              opName = "Multiplication";
              resMath = { kind: "real", value: lNum * rNum };
              explanation = `Multiply ${left.exprStr} by ${right.exprStr}`;
              rule = "Multiplication in PEMDAS";
              break;
            case "/":
              opName = "Division";
              resMath = { kind: "real", value: lNum / rNum };
              explanation = `Divide ${left.exprStr} by ${right.exprStr}`;
              rule = "Division in PEMDAS";
              break;
            case "%":
              opName = "Modulo";
              resMath = { kind: "real", value: lNum % rNum };
              explanation = `Modulo remainder of ${left.exprStr} divided by ${right.exprStr}`;
              break;
            case "^":
              opName = "Exponentiation";
              resMath = { kind: "real", value: Math.pow(lNum, rNum) };
              explanation = `Raise ${left.exprStr} to the power of ${right.exprStr}`;
              rule = "E in PEMDAS (Exponentiation)";
              break;
            case "P":
            case "C":
              opName = node.operator === "P" ? "Permutations" : "Combinations";
              resMath = { kind: "real", value: lNum };
              explanation = `Evaluate ${left.exprStr}${node.operator}${right.exprStr}`;
              break;
          }
        } else {
          // Complex binary operation
          const lComp = left.mathVal.kind === "complex" ? left.mathVal.value : createComplex(left.mathVal.value, 0);
          const rComp = right.mathVal.kind === "complex" ? right.mathVal.value : createComplex(right.mathVal.value, 0);

          switch (node.operator) {
            case "+": {
              opName = "Complex Addition";
              const re = lComp.re + rComp.re;
              const im = lComp.im + rComp.im;
              resMath = im === 0 ? { kind: "real", value: re } : { kind: "complex", value: createComplex(re, im) };
              explanation = `Group real and imaginary parts: (${lComp.re} + ${rComp.re}) + (${lComp.im} + ${rComp.im})i`;
              break;
            }
            case "-": {
              opName = "Complex Subtraction";
              const re = lComp.re - rComp.re;
              const im = lComp.im - rComp.im;
              resMath = im === 0 ? { kind: "real", value: re } : { kind: "complex", value: createComplex(re, im) };
              explanation = `Subtract real and imaginary parts: (${lComp.re} - ${rComp.re}) + (${lComp.im} - ${rComp.im})i`;
              break;
            }
            case "*": {
              opName = "Complex Multiplication";
              const re = lComp.re * rComp.re - lComp.im * rComp.im;
              const im = lComp.re * rComp.im + lComp.im * rComp.re;
              resMath = im === 0 ? { kind: "real", value: re } : { kind: "complex", value: createComplex(re, im) };
              explanation = `Multiply terms with FOIL: (${lComp.re}×${rComp.re} - ${lComp.im}×${rComp.im}) + (${lComp.re}×${rComp.im} + ${lComp.im}×${rComp.re})i using i² = -1`;
              break;
            }
            case "/": {
              opName = "Complex Division";
              const c = rComp.re;
              const d = rComp.im;
              const den = c * c + d * d;
              const re = (lComp.re * c + lComp.im * d) / den;
              const im = (lComp.im * c - lComp.re * d) / den;
              resMath = im === 0 ? { kind: "real", value: re } : { kind: "complex", value: createComplex(re, im) };
              explanation = `Multiply numerator and denominator by conjugate (${c} ${d >= 0 ? "-" : "+"} ${Math.abs(d)}i) over denominator (${den})`;
              break;
            }
            case "^": {
              opName = "Complex Power";
              resMath = { kind: "complex", value: createComplex(0, 0) };
              explanation = `Evaluate complex power ${left.exprStr} ^ ${right.exprStr}`;
              break;
            }
          }
        }

        const exact = this.exactEvaluator.deriveExact(node);
        const exactStr = formatExactValue(exact);
        const formattedSub = resMath.kind === "real"
          ? formatResultNumber(resMath.value, this.notation, this.fixDigits)
          : formatComplexRectangular(resMath.value, (n) => formatResultNumber(n, this.notation, this.fixDigits));

        const exprStr = `${left.exprStr} ${node.operator === "*" ? "×" : node.operator === "/" ? "÷" : node.operator} ${right.exprStr}`;

        this.steps.push({
          id: `step_${this.stepCounter}`,
          stepNumber: this.stepCounter++,
          operation: opName,
          expression: exprStr,
          subResult: resMath.kind === "real" ? resMath.value : resMath.value.re,
          formattedSubResult: formattedSub,
          exactSubResult: exactStr || undefined,
          explanation: `${explanation} = ${exactStr || formattedSub}`,
          rule,
        });

        return { mathVal: resMath, exact, exprStr: `(${exprStr})` };
      }

      case "FunctionCall": {
        const fn = node.name.toLowerCase();
        const argResults = node.args.map((a) => this.traverse(a));
        const argStrs = argResults.map((a) => a.exprStr).join(", ");

        let resMath: MathValue = { kind: "real", value: 0 };
        let explanation = "";

        const firstArg = argResults[0];

        if (fn === "rand" || fn === "random") {
          resMath = { kind: "real", value: Math.round(Math.random() * 100000000) / 100000000 };
          explanation = `Generate random value: rand() = ${formatResultNumber(resMath.value, this.notation, this.fixDigits)}`;
        } else if (firstArg) {
          if (fn === "real" || fn === "re") {
            const val = firstArg.mathVal.kind === "real" ? firstArg.mathVal.value : firstArg.mathVal.value.re;
            resMath = { kind: "real", value: val };
            explanation = `Extract real component: Re(${argStrs}) = ${formatResultNumber(val, this.notation, this.fixDigits)}`;
          } else if (fn === "imag" || fn === "im") {
            const val = firstArg.mathVal.kind === "real" ? 0 : firstArg.mathVal.value.im;
            resMath = { kind: "real", value: val };
            explanation = `Extract imaginary component: Im(${argStrs}) = ${formatResultNumber(val, this.notation, this.fixDigits)}`;
          } else if (fn === "conj") {
            if (firstArg.mathVal.kind === "real") {
              resMath = firstArg.mathVal;
              explanation = `Conjugate of real number ${argStrs} = ${argStrs}`;
            } else {
              const conj = createComplex(firstArg.mathVal.value.re, -firstArg.mathVal.value.im);
              resMath = { kind: "complex", value: conj };
              explanation = `Complex conjugate: conj(${argStrs}) = ${formatComplexRectangular(conj, (n) => formatResultNumber(n, this.notation, this.fixDigits))}`;
            }
          } else if (fn === "abs") {
            if (firstArg.mathVal.kind === "real") {
              const val = Math.abs(firstArg.mathVal.value);
              resMath = { kind: "real", value: val };
              explanation = `Calculate absolute value: |${argStrs}| = ${formatResultNumber(val, this.notation, this.fixDigits)}`;
            } else {
              const val = absComplex(firstArg.mathVal.value);
              resMath = { kind: "real", value: val };
              explanation = `Calculate complex magnitude: |${argStrs}| = √(${firstArg.mathVal.value.re}² + ${firstArg.mathVal.value.im}²) = ${formatResultNumber(val, this.notation, this.fixDigits)}`;
            }
          } else if (fn === "arg") {
            const thetaRad = firstArg.mathVal.kind === "real" ? (firstArg.mathVal.value >= 0 ? 0 : Math.PI) : Math.atan2(firstArg.mathVal.value.im, firstArg.mathVal.value.re);
            resMath = { kind: "real", value: thetaRad };
            explanation = `Calculate complex argument: arg(${argStrs}) = ${formatResultNumber(thetaRad, this.notation, this.fixDigits)} rad`;
          } else if (fn === "sqrt") {
            if (firstArg.mathVal.kind === "real" && firstArg.mathVal.value >= 0) {
              const val = Math.sqrt(firstArg.mathVal.value);
              resMath = { kind: "real", value: val };
              explanation = `Calculate square root: √(${argStrs}) = ${formatResultNumber(val, this.notation, this.fixDigits)}`;
            } else if (firstArg.mathVal.kind === "real") {
              const im = Math.sqrt(-firstArg.mathVal.value);
              resMath = { kind: "complex", value: createComplex(0, im) };
              explanation = `Calculate square root of negative number: √(${argStrs}) = ${im === 1 ? "i" : `${formatResultNumber(im, this.notation, this.fixDigits)}i`}`;
            }
          } else {
            resMath = firstArg.mathVal;
            explanation = `Evaluate ${fn}(${argStrs})`;
          }
        }

        const exact = this.exactEvaluator.deriveExact(node);
        const exactStr = formatExactValue(exact);
        const formattedSub = resMath.kind === "real"
          ? formatResultNumber(resMath.value, this.notation, this.fixDigits)
          : formatComplexRectangular(resMath.value, (n) => formatResultNumber(n, this.notation, this.fixDigits));

        const exprStr = `${fn}(${argStrs})`;
        this.steps.push({
          id: `step_${this.stepCounter}`,
          stepNumber: this.stepCounter++,
          operation: `Function ${fn}`,
          expression: exprStr,
          subResult: resMath.kind === "real" ? resMath.value : resMath.value.re,
          formattedSubResult: formattedSub,
          exactSubResult: exactStr || undefined,
          explanation: exactStr ? `${explanation} (${exactStr})` : explanation,
        });

        return { mathVal: resMath, exact, exprStr };
      }

      default:
        return { mathVal: { kind: "real", value: 0 }, exact: null, exprStr: "" };
    }
  }
}
