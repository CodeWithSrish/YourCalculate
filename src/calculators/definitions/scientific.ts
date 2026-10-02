import {
  CalculatorDefinition,
  CalculationOutput,
  SecondaryMetric,
} from "../engine/types";
import {
  ComplexNumber,
  MathValue,
  createComplex,
  realVal,
  complexVal,
  toCanonicalMathValue,
  addComplex,
  subComplex,
  mulComplex,
  divComplex,
  absComplex,
  conjComplex,
  argComplex,
  realComponent,
  imagComponent,
  intPowComplex,
  realPowComplex,
  sqrtComplex,
  expComplex,
  lnComplex,
  log10Complex,
  sinComplex,
  cosComplex,
  tanComplex,
  sinhComplex,
  coshComplex,
  tanhComplex,
  formatComplexRectangular,
  formatComplexPolar,
} from "./scientificComplex";

// =========================================================================
// 1. DATA TYPES, AST DISCRIMINATED UNIONS & INTERFACES
// =========================================================================

export type AngleMode = "DEG" | "RAD" | "GRAD";
export type DisplayNotationMode = "NORM" | "SCI" | "ENG" | "FIX";

export interface EvaluationOptions {
  angleMode?: AngleMode;
  isComplexMode?: boolean; // REAL vs CPLX domain mode
  notation?: DisplayNotationMode;
  fixDigits?: number; // 0 to 9 for FIX mode
  ans?: number;
  ansComplex?: ComplexNumber;
  ansMathValue?: MathValue;
  variables?: Record<string, number | ComplexNumber | MathValue>;
  exactVariables?: Record<string, ExactValue>;
}

// -------------------------------------------------------------------------
// Typed Abstract Syntax Tree (AST) Discriminated Unions
// -------------------------------------------------------------------------

export type ASTNode =
  | NumberLiteralNode
  | ConstantNode
  | IdentifierNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | FunctionCallNode
  | PostfixExpressionNode
  | GroupingNode;

export interface BaseASTNode {
  id?: string;
}

export interface NumberLiteralNode extends BaseASTNode {
  type: "NumberLiteral";
  value: number;
  raw: string;
}

export interface ConstantNode extends BaseASTNode {
  type: "Constant";
  name: "pi" | "π" | "e" | "Ans" | "i";
}

export interface IdentifierNode extends BaseASTNode {
  type: "Identifier";
  name: string;
}

export interface UnaryExpressionNode extends BaseASTNode {
  type: "UnaryExpression";
  operator: "+" | "-";
  argument: ASTNode;
}

export interface BinaryExpressionNode extends BaseASTNode {
  type: "BinaryExpression";
  operator: "+" | "-" | "*" | "/" | "%" | "^" | "P" | "C";
  left: ASTNode;
  right: ASTNode;
}

export interface FunctionCallNode extends BaseASTNode {
  type: "FunctionCall";
  name: string;
  args: ASTNode[];
}

export interface PostfixExpressionNode extends BaseASTNode {
  type: "PostfixExpression";
  operator: "!" | "²" | "³" | "%";
  argument: ASTNode;
}

export interface GroupingNode extends BaseASTNode {
  type: "Grouping";
  expression: ASTNode;
}

import type {
  ExactValue,
  ExactInteger,
  ExactRational,
  ExactRadical,
  ExactPiMultiple,
  ExactConstant,
  ExactProduct,
  ExactLinearSum,
  ExactImaginary,
  ExactComplex,
  MathematicalResult,
  CalculationStep,
} from "./scientificSteps";

import {
  ExactASTEvaluator,
  StepGenerator,
  formatExactValue,
  gcd,
  lcm,
  createExactInteger,
  createExactRational,
  simplifyRadical,
  lookupExactTrig,
} from "./scientificSteps";

import {
  hasPhysicalUnits,
  evaluateUnitExpression,
} from "./scientificUnits";

export type {
  ExactValue,
  ExactInteger,
  ExactRational,
  ExactRadical,
  ExactPiMultiple,
  ExactConstant,
  ExactProduct,
  ExactLinearSum,
  ExactImaginary,
  ExactComplex,
  MathematicalResult,
  CalculationStep,
};
export {
  ExactASTEvaluator,
  StepGenerator,
  formatExactValue,
  gcd,
  lcm,
  createExactInteger,
  createExactRational,
  simplifyRadical,
  lookupExactTrig,
};

// -------------------------------------------------------------------------
// Evaluation Results & Structured Traces
// -------------------------------------------------------------------------

export type EvaluationStep = CalculationStep;

export interface EvaluationResult {
  isValid: boolean;
  result?: number;
  formattedResult?: string;
  canonicalResult?: MathValue;
  mathematicalResult?: MathematicalResult;
  expression: string;
  ast?: ASTNode;
  steps?: CalculationStep[];
  error?: string;
  stepExplanation?: string;
  isComplex?: boolean;
}

export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  numericResult: number;
  exactResult?: string | null;
  angleMode: AngleMode;
  timestamp: number;
  canonicalResult?: MathValue;
  complexResult?: ComplexNumber;
  polarResult?: string;
  isComplex?: boolean;
}

// =========================================================================
// 2. TOKENIZER (NO eval, NO Function)
// =========================================================================

type TokenType =
  | "NUMBER"
  | "IDENTIFIER"
  | "OPERATOR"
  | "LPAREN"
  | "RPAREN"
  | "POSTFIX_OP"
  | "COMMA";

export interface Token {
  type: TokenType;
  value: string;
  numValue?: number;
}

export const KNOWN_FUNCTIONS = new Set([
  "sin",
  "cos",
  "tan",
  "asin",
  "arcsin",
  "sin-1",
  "acos",
  "arccos",
  "cos-1",
  "atan",
  "arctan",
  "tan-1",
  "sinh",
  "cosh",
  "tanh",
  "asinh",
  "arcsinh",
  "acosh",
  "arccosh",
  "atanh",
  "arctanh",
  "sqrt",
  "cbrt",
  "ln",
  "log",
  "log10",
  "log2",
  "exp",
  "abs",
  "conj",
  "arg",
  "real",
  "re",
  "imag",
  "im",
  "npr",
  "ncr",
  "fact",
  "factorial",
  "rand",
  "random",
  "randint",
  "rad",
  "deg",
  "grad",
  "ceil",
  "floor",
  "round",
  "sign",
]);

const BLOCKED_IDENTIFIERS = new Set([
  "constructor",
  "prototype",
  "__proto__",
  "window",
  "document",
  "globalthis",
  "function",
  "eval",
  "process",
  "require",
  "import",
]);

/**
 * Tokenizes mathematical expressions into a type-safe token stream.
 */
export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.trim();

  while (i < s.length) {
    const ch = s[i];

    // Whitespace
    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Commas for multi-parameter functions e.g. nPr(5, 2), randInt(1, 10)
    if (ch === ",") {
      tokens.push({ type: "COMMA", value: "," });
      i++;
      continue;
    }

    // Number literals (including decimals and scientific notation like 1.5e3, 2e-4)
    if (/\d/.test(ch) || (ch === "." && i + 1 < s.length && /\d/.test(s[i + 1]))) {
      let numStr = "";
      let hasDot = false;
      while (i < s.length && (/\d/.test(s[i]) || s[i] === ".")) {
        if (s[i] === ".") {
          if (hasDot) break;
          hasDot = true;
        }
        numStr += s[i];
        i++;
      }

      // Check for inline scientific notation literal e.g. 1.5e6 or 2e-3 (without space)
      if (
        i < s.length &&
        (s[i] === "e" || s[i] === "E") &&
        i + 1 < s.length &&
        (/\d/.test(s[i + 1]) || ((s[i + 1] === "+" || s[i + 1] === "-") && i + 2 < s.length && /\d/.test(s[i + 2])))
      ) {
        numStr += s[i];
        i++;
        if (s[i] === "+" || s[i] === "-") {
          numStr += s[i];
          i++;
        }
        while (i < s.length && /\d/.test(s[i])) {
          numStr += s[i];
          i++;
        }
      }

      const parsedNum = parseFloat(numStr);
      tokens.push({ type: "NUMBER", value: numStr, numValue: parsedNum });
      continue;
    }

    // Infix combinatorics operator: P (nPr) or C (nCr)
    if (
      (ch === "P" || ch === "C" || ch === "p" || ch === "c") &&
      (i + 1 >= s.length || /\d|\s|\(/.test(s[i + 1])) &&
      tokens.length > 0 &&
      (tokens[tokens.length - 1].type === "NUMBER" || tokens[tokens.length - 1].type === "RPAREN")
    ) {
      tokens.push({ type: "OPERATOR", value: ch.toUpperCase() });
      i++;
      continue;
    }

    // Identifiers (function names, constants, combinatoric operators, variables, imaginary unit i)
    if (/[a-zA-Zπ]/.test(ch)) {
      let idStr = "";
      while (i < s.length && /[a-zA-Z0-9_π]/.test(s[i])) {
        idStr += s[i];
        i++;
      }
      const lower = idStr.toLowerCase();
      if (BLOCKED_IDENTIFIERS.has(lower)) {
        throw new Error(`Invalid identifier: "${idStr}"`);
      }

      tokens.push({ type: "IDENTIFIER", value: idStr });
      continue;
    }

    // Single character symbols
    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }
    if (ch === "!") {
      tokens.push({ type: "POSTFIX_OP", value: "!" });
      i++;
      continue;
    }
    if (ch === "√") {
      tokens.push({ type: "IDENTIFIER", value: "sqrt" });
      i++;
      continue;
    }
    if (ch === "²") {
      tokens.push({ type: "POSTFIX_OP", value: "²" });
      i++;
      continue;
    }
    if (ch === "³") {
      tokens.push({ type: "POSTFIX_OP", value: "³" });
      i++;
      continue;
    }

    // Operators
    if (["+", "-", "*", "/", "×", "÷", "^", "%"].includes(ch)) {
      const normalizedOp = ch === "×" ? "*" : ch === "÷" ? "/" : ch;
      tokens.push({ type: "OPERATOR", value: normalizedOp });
      i++;
      continue;
    }

    throw new Error(`Unrecognized symbol in expression: "${ch}"`);
  }

  // Insert implicit multiplication tokens (e.g. 2π -> 2 * π, 2i -> 2 * i, 2(3) -> 2 * (3), 3sqrt(4) -> 3 * sqrt(4), 2x -> 2 * x, (1+i)(1-i) -> (1+i) * (1-i))
  const enriched: Token[] = [];
  for (let j = 0; j < tokens.length; j++) {
    const cur = tokens[j];
    enriched.push(cur);

    if (j + 1 < tokens.length) {
      const next = tokens[j + 1];
      const isCurMultipliable =
        cur.type === "NUMBER" ||
        cur.type === "RPAREN" ||
        cur.type === "POSTFIX_OP" ||
        (cur.type === "IDENTIFIER" && !KNOWN_FUNCTIONS.has(cur.value.toLowerCase()));

      const isNextMultipliable =
        next.type === "LPAREN" ||
        next.type === "IDENTIFIER" ||
        (next.type === "NUMBER" && cur.type === "RPAREN") ||
        (next.type === "NUMBER" && cur.type === "POSTFIX_OP");

      if (isCurMultipliable && isNextMultipliable) {
        enriched.push({ type: "OPERATOR", value: "*" });
      }
    }
  }

  return enriched;
}

// =========================================================================
// 3. RECURSIVE DESCENT AST PARSER
// =========================================================================

export class ASTParser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0) {
      throw new Error("Expression is empty.");
    }
    const root = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected token at end of expression: "${this.tokens[this.pos].value}"`);
    }
    return root;
  }

  // Expression: Additive ('+' | '-')
  private parseExpression(): ASTNode {
    let left = this.parseTerm();

    while (this.pos < this.tokens.length) {
      const op = this.peek();
      if (op.type === "OPERATOR" && (op.value === "+" || op.value === "-")) {
        this.consume();
        const right = this.parseTerm();
        left = {
          type: "BinaryExpression",
          operator: op.value as "+" | "-",
          left,
          right,
        };
      } else {
        break;
      }
    }
    return left;
  }

  // Term: Multiplicative ('*' | '/' | '%' | 'P' | 'C')
  private parseTerm(): ASTNode {
    let left = this.parseExponentiation();

    while (this.pos < this.tokens.length) {
      const op = this.peek();
      if (
        op.type === "OPERATOR" &&
        (op.value === "*" || op.value === "/" || op.value === "%" || op.value === "P" || op.value === "C")
      ) {
        this.consume();
        const right = this.parseExponentiation();
        left = {
          type: "BinaryExpression",
          operator: op.value as "*" | "/" | "%" | "P" | "C",
          left,
          right,
        };
      } else {
        break;
      }
    }
    return left;
  }

  // Exponentiation: Factor ('^' Exponentiation)? (Right-associative: 2^3^2 = 2^(3^2) = 512)
  private parseExponentiation(): ASTNode {
    const base = this.parseFactor();

    if (this.pos < this.tokens.length) {
      const op = this.peek();
      if (op.type === "OPERATOR" && op.value === "^") {
        this.consume();
        const exponent = this.parseExponentiation();
        return {
          type: "BinaryExpression",
          operator: "^",
          left: base,
          right: exponent,
        };
      }
    }
    return base;
  }

  // Factor: Unary? Primary Postfix*
  private parseFactor(): ASTNode {
    const token = this.peek();

    // Unary plus or minus
    if (token.type === "OPERATOR" && (token.value === "+" || token.value === "-")) {
      this.consume();
      const val = this.parseFactor();
      const unaryNode: ASTNode = {
        type: "UnaryExpression",
        operator: token.value as "+" | "-",
        argument: val,
      };
      return this.applyPostfixes(unaryNode);
    }

    const primary = this.parsePrimary();
    return this.applyPostfixes(primary);
  }

  private applyPostfixes(baseNode: ASTNode): ASTNode {
    let cur = baseNode;
    while (this.pos < this.tokens.length) {
      const tok = this.peek();
      if (tok.type === "POSTFIX_OP") {
        this.consume();
        cur = {
          type: "PostfixExpression",
          operator: tok.value as "!" | "²" | "³" | "%",
          argument: cur,
        };
      } else {
        break;
      }
    }
    return cur;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    // 1. Number literal
    if (token.type === "NUMBER") {
      this.consume();
      return {
        type: "NumberLiteral",
        value: token.numValue!,
        raw: token.value,
      };
    }

    // 2. Parentheses (Grouping)
    if (token.type === "LPAREN") {
      this.consume();
      const expr = this.parseExpression();
      if (this.pos >= this.tokens.length || this.peek().type !== "RPAREN") {
        throw new Error("Mismatched parentheses: missing closing ')'");
      }
      this.consume(); // eat ')'
      return {
        type: "Grouping",
        expression: expr,
      };
    }

    // 3. Identifiers (Constants, Function calls, or Variables)
    if (token.type === "IDENTIFIER") {
      const name = token.value;
      const lower = name.toLowerCase();
      this.consume();

      // Constants
      if (lower === "pi" || lower === "π") {
        return { type: "Constant", name: "π" };
      }
      if (lower === "e") {
        return { type: "Constant", name: "e" };
      }
      if (lower === "ans") {
        return { type: "Constant", name: "Ans" };
      }
      if (lower === "i") {
        return { type: "Constant", name: "i" };
      }

      // Zero-argument functions (e.g. rand, random)
      if (lower === "rand" || lower === "random") {
        if (this.pos < this.tokens.length && this.peek().type === "LPAREN") {
          this.consume(); // eat '('
          if (this.pos < this.tokens.length && this.peek().type === "RPAREN") {
            this.consume(); // eat ')'
          } else {
            throw new Error(`rand() takes no arguments`);
          }
        }
        return {
          type: "FunctionCall",
          name: "rand",
          args: [],
        };
      }

      // Function calls: if known function or followed by '('
      if (KNOWN_FUNCTIONS.has(lower)) {
        const args: ASTNode[] = [];
        if (this.pos < this.tokens.length && this.peek().type === "LPAREN") {
          this.consume(); // eat '('
          if (this.pos < this.tokens.length && this.peek().type !== "RPAREN") {
            while (true) {
              args.push(this.parseExpression());
              if (this.pos < this.tokens.length && this.peek().type === "COMMA") {
                this.consume(); // eat ','
                continue;
              }
              break;
            }
          }
          if (this.pos >= this.tokens.length || this.peek().type !== "RPAREN") {
            throw new Error(`Mismatched parentheses in function ${name}(...)`);
          }
          this.consume(); // eat ')'
        } else {
          // Immediate factor argument e.g. sin 30 or sqrt 144
          args.push(this.parseFactor());
        }

        return {
          type: "FunctionCall",
          name: lower,
          args,
        };
      }

      // Variable identifier (e.g. x, y)
      return {
        type: "Identifier",
        name,
      };
    }

    throw new Error(`Unexpected token: "${token.value}"`);
  }

  private peek(): Token {
    if (this.pos >= this.tokens.length) {
      throw new Error("Unexpected end of expression");
    }
    return this.tokens[this.pos];
  }

  private consume(): Token {
    const token = this.peek();
    this.pos++;
    return token;
  }
}

// =========================================================================
// 4. ANGLE CONVERSION LAYER (DEG / RAD / GRAD)
// =========================================================================

export class AngleService {
  public static toRadians(angle: number, mode: AngleMode): number {
    switch (mode) {
      case "DEG":
        return (angle * Math.PI) / 180;
      case "GRAD":
        return (angle * Math.PI) / 200;
      case "RAD":
      default:
        return angle;
    }
  }

  public static fromRadians(rad: number, mode: AngleMode): number {
    switch (mode) {
      case "DEG": {
        const deg = (rad * 180) / Math.PI;
        return Math.abs(deg - Math.round(deg)) < 1e-12 ? Math.round(deg) : deg;
      }
      case "GRAD": {
        const grad = (rad * 200) / Math.PI;
        return Math.abs(grad - Math.round(grad)) < 1e-12 ? Math.round(grad) : grad;
      }
      case "RAD":
      default:
        return rad;
    }
  }

  public static sin(angle: number, mode: AngleMode): number {
    if (mode === "DEG") {
      const mod = ((angle % 360) + 360) % 360;
      if (mod === 0 || mod === 180) return 0;
      if (mod === 30 || mod === 150) return 0.5;
      if (mod === 210 || mod === 330) return -0.5;
      if (mod === 90) return 1;
      if (mod === 270) return -1;
    } else if (mode === "GRAD") {
      const mod = ((angle % 400) + 400) % 400;
      if (mod === 0 || mod === 200) return 0;
      if (mod === 100) return 1;
      if (mod === 300) return -1;
    }
    return Math.sin(AngleService.toRadians(angle, mode));
  }

  public static cos(angle: number, mode: AngleMode): number {
    if (mode === "DEG") {
      const mod = ((angle % 360) + 360) % 360;
      if (mod === 90 || mod === 270) return 0;
      if (mod === 60 || mod === 300) return 0.5;
      if (mod === 120 || mod === 240) return -0.5;
      if (mod === 0) return 1;
      if (mod === 180) return -1;
    } else if (mode === "GRAD") {
      const mod = ((angle % 400) + 400) % 400;
      if (mod === 100 || mod === 300) return 0;
      if (mod === 0) return 1;
      if (mod === 200) return -1;
    }
    return Math.cos(AngleService.toRadians(angle, mode));
  }

  public static tan(angle: number, mode: AngleMode): number {
    if (mode === "DEG") {
      const mod = ((angle % 180) + 180) % 180;
      if (mod === 90) {
        throw new Error("Undefined (tan has vertical asymptote at 90°)");
      }
      if (mod === 0) return 0;
      if (mod === 45) return 1;
      if (mod === 135) return -1;
    } else if (mode === "GRAD") {
      const mod = ((angle % 200) + 200) % 200;
      if (mod === 100) {
        throw new Error("Undefined (tan has vertical asymptote at 100 grad)");
      }
      if (mod === 0) return 0;
      if (mod === 50) return 1;
      if (mod === 150) return -1;
    }
    return Math.tan(AngleService.toRadians(angle, mode));
  }
}

// =========================================================================
// 5. DETERMINISTIC AST EVALUATOR (REAL & COMPLEX)
// =========================================================================

export function hasExplicitComplexLiteral(node: ASTNode): boolean {
  switch (node.type) {
    case "Constant":
      return node.name === "i";
    case "UnaryExpression":
      return hasExplicitComplexLiteral(node.argument);
    case "BinaryExpression":
      return hasExplicitComplexLiteral(node.left) || hasExplicitComplexLiteral(node.right);
    case "FunctionCall":
      return (
        node.name === "conj" ||
        node.name === "arg" ||
        node.name === "real" ||
        node.name === "re" ||
        node.name === "imag" ||
        node.name === "im" ||
        node.args.some((a) => hasExplicitComplexLiteral(a))
      );
    case "PostfixExpression":
      return hasExplicitComplexLiteral(node.argument);
    case "Grouping":
      return hasExplicitComplexLiteral(node.expression);
    default:
      return false;
  }
}

export class ASTEvaluator {
  private angleMode: AngleMode;
  private isComplexMode: boolean;
  private ans: MathValue;
  private variables: Record<string, MathValue>;
  private steps: EvaluationStep[] = [];
  private stepCounter = 1;

  constructor(options: EvaluationOptions = {}) {
    this.angleMode = options.angleMode || "DEG";
    this.isComplexMode = options.isComplexMode || false;

    if (options.ansMathValue) {
      this.ans = options.ansMathValue;
    } else if (options.ansComplex) {
      this.ans = options.ansComplex.im === 0 ? realVal(options.ansComplex.re) : complexVal(options.ansComplex.re, options.ansComplex.im);
    } else if (options.ans !== undefined) {
      this.ans = realVal(options.ans);
    } else {
      this.ans = realVal(0);
    }

    this.variables = {};
    if (options.variables) {
      for (const [k, v] of Object.entries(options.variables)) {
        if (typeof v === "number") {
          this.variables[k] = realVal(v);
        } else if ("kind" in v) {
          this.variables[k] = v;
        } else if ("re" in v && "im" in v) {
          this.variables[k] = v.im === 0 ? realVal(v.re) : complexVal(v.re, v.im);
        }
      }
    }
  }

  public evaluate(node: ASTNode): { canonical: MathValue; result: number; steps: EvaluationStep[] } {
    this.steps = [];
    this.stepCounter = 1;
    const isExprComplex = hasExplicitComplexLiteral(node);
    const activeComplex = this.isComplexMode || isExprComplex;

    const canonical = this.evalNode(node, activeComplex);

    const numericDecimal = canonical.kind === "real" ? canonical.value : canonical.value.re;
    return { canonical, result: numericDecimal, steps: this.steps };
  }

  private evalNode(node: ASTNode, activeComplex: boolean): MathValue {
    switch (node.type) {
      case "NumberLiteral":
        return realVal(node.value);

      case "Constant": {
        if (node.name === "pi" || node.name === "π") return realVal(Math.PI);
        if (node.name === "e") return realVal(Math.E);
        if (node.name === "Ans") return this.ans;
        if (node.name === "i") return complexVal(0, 1);
        throw new Error(`Unknown constant: "${node.name}"`);
      }

      case "Identifier": {
        const varName = node.name;
        if (this.variables[varName] !== undefined) {
          return this.variables[varName];
        }
        if (this.variables[varName.toLowerCase()] !== undefined) {
          return this.variables[varName.toLowerCase()];
        }
        throw new Error(`Undefined variable: "${varName}"`);
      }

      case "Grouping":
        return this.evalNode(node.expression, activeComplex);

      case "UnaryExpression": {
        const val = this.evalNode(node.argument, activeComplex);
        if (val.kind === "real") {
          const res = node.operator === "-" ? -val.value : val.value;
          return realVal(res);
        } else {
          const re = node.operator === "-" ? -val.value.re : val.value.re;
          const im = node.operator === "-" ? -val.value.im : val.value.im;
          return complexVal(re, im);
        }
      }

      case "PostfixExpression": {
        const val = this.evalNode(node.argument, activeComplex);
        if (val.kind === "complex") {
          throw new Error(`Unsupported postfix operator for complex numbers: ${(node as PostfixExpressionNode).operator}`);
        }
        const num = val.value;
        let res: number;
        switch (node.operator) {
          case "!":
            res = this.computeFactorial(num);
            break;
          case "²":
            res = Math.pow(num, 2);
            break;
          case "³":
            res = Math.pow(num, 3);
            break;
          case "%":
            res = num / 100;
            break;
          default:
            throw new Error(`Unsupported postfix operator: ${(node as PostfixExpressionNode).operator}`);
        }
        this.recordStep(node.type, `${num}${node.operator}`, res);
        return realVal(res);
      }

      case "BinaryExpression": {
        const leftVal = this.evalNode(node.left, activeComplex);
        const rightVal = this.evalNode(node.right, activeComplex);

        // 1. Pure Real binary operations
        if (leftVal.kind === "real" && rightVal.kind === "real") {
          const lNum = leftVal.value;
          const rNum = rightVal.value;

          switch (node.operator) {
            case "+":
              return realVal(lNum + rNum);
            case "-":
              return realVal(lNum - rNum);
            case "*":
              return realVal(lNum * rNum);
            case "/":
              if (rNum === 0) throw new Error("Cannot divide by zero");
              return realVal(lNum / rNum);
            case "%":
              if (rNum === 0) throw new Error("Cannot divide by zero (modulo by 0)");
              return realVal(lNum % rNum);
            case "^": {
              if (lNum === 0 && rNum < 0) {
                throw new Error("Cannot divide by zero (0 raised to negative power)");
              }
              if (lNum < 0 && !Number.isInteger(rNum)) {
                if (activeComplex) {
                  const cRes = realPowComplex(createComplex(lNum, 0), rNum);
                  return toCanonicalMathValue(cRes);
                } else {
                  throw new Error("Invalid power operation (complex result not supported in real mode). Enable CPLX mode for complex results.");
                }
              }
              const res = Math.pow(lNum, rNum);
              if (Number.isNaN(res)) {
                throw new Error("Invalid power operation (complex result not supported in real mode). Enable CPLX mode for complex results.");
              }
              return realVal(res);
            }
            case "P":
              return realVal(this.computePermutation(lNum, rNum));
            case "C":
              return realVal(this.computeCombination(lNum, rNum));
            default:
              throw new Error(`Unknown operator: ${(node as BinaryExpressionNode).operator}`);
          }
        }

        // 2. Complex binary operations
        const lComp = leftVal.kind === "complex" ? leftVal.value : createComplex(leftVal.value, 0);
        const rComp = rightVal.kind === "complex" ? rightVal.value : createComplex(rightVal.value, 0);

        switch (node.operator) {
          case "+":
            return toCanonicalMathValue(addComplex(lComp, rComp));
          case "-":
            return toCanonicalMathValue(subComplex(lComp, rComp));
          case "*":
            return toCanonicalMathValue(mulComplex(lComp, rComp));
          case "/":
            return toCanonicalMathValue(divComplex(lComp, rComp));
          case "%":
            throw new Error("Modulo operator (%) is not defined for complex numbers");
          case "^": {
            if (rightVal.kind === "real") {
              if (Number.isInteger(rightVal.value)) {
                return toCanonicalMathValue(intPowComplex(lComp, rightVal.value));
              } else {
                return toCanonicalMathValue(realPowComplex(lComp, rightVal.value));
              }
            } else {
              throw new Error("Complex exponentiation (z^w with complex exponent) is deferred in V1.");
            }
          }
          case "P":
          case "C":
            throw new Error("Combinatorics (nPr / nCr) are defined strictly for non-negative integers");
          default:
            throw new Error(`Unknown operator: ${(node as BinaryExpressionNode).operator}`);
        }
      }

      case "FunctionCall": {
        const fn = node.name.toLowerCase();
        const argValues = node.args.map((arg) => this.evalNode(arg, activeComplex));
        return this.executeFunction(fn, argValues, activeComplex);
      }
    }
  }

  private recordStep(nodeType: string, operation: string, subResult: number): void {
    this.steps.push({
      id: `step_${this.stepCounter}`,
      stepNumber: this.stepCounter++,
      operation,
      expression: operation,
      subResult,
      formattedSubResult: formatResultNumber(subResult),
      explanation: `Evaluated ${operation} = ${formatResultNumber(subResult)}.`,
    });
  }

  private executeFunction(fn: string, args: MathValue[], activeComplex: boolean): MathValue {
    // Zero-argument Functions (rand / random)
    if (fn === "rand" || fn === "random") {
      return realVal(Math.round(Math.random() * 100000000) / 100000000);
    }

    if (args.length === 0) {
      throw new Error(`Function ${fn} requires at least one argument`);
    }

    const firstArg = args[0];

    // Component Extractors & Conjugate / Magnitude / Argument
    if (fn === "real" || fn === "re") {
      if (firstArg.kind === "real") return realVal(firstArg.value);
      return realVal(realComponent(firstArg.value));
    }
    if (fn === "imag" || fn === "im") {
      if (firstArg.kind === "real") return realVal(0);
      return realVal(imagComponent(firstArg.value));
    }
    if (fn === "conj") {
      if (firstArg.kind === "real") return firstArg;
      return toCanonicalMathValue(conjComplex(firstArg.value));
    }
    if (fn === "abs") {
      if (firstArg.kind === "real") return realVal(Math.abs(firstArg.value));
      return realVal(absComplex(firstArg.value));
    }
    if (fn === "arg") {
      if (firstArg.kind === "real") {
        return realVal(firstArg.value >= 0 ? 0 : Math.PI);
      }
      return realVal(argComplex(firstArg.value));
    }

    // Square Root
    if (fn === "sqrt") {
      if (firstArg.kind === "real") {
        if (firstArg.value >= 0) {
          return realVal(Math.sqrt(firstArg.value));
        } else {
          if (activeComplex) {
            return complexVal(0, Math.sqrt(-firstArg.value));
          } else {
            throw new Error("Invalid square root domain (argument must be ≥ 0). Enable CPLX mode for complex results.");
          }
        }
      } else {
        return toCanonicalMathValue(sqrtComplex(firstArg.value));
      }
    }

    // Exponential & Logarithm
    if (fn === "exp") {
      if (firstArg.kind === "real") return realVal(Math.exp(firstArg.value));
      return toCanonicalMathValue(expComplex(firstArg.value));
    }
    if (fn === "ln") {
      if (firstArg.kind === "real") {
        if (firstArg.value > 0) return realVal(Math.log(firstArg.value));
        if (firstArg.value === 0) throw new Error("Invalid logarithm domain: ln(0) is undefined.");
        if (activeComplex) {
          return toCanonicalMathValue(lnComplex(createComplex(firstArg.value, 0)));
        } else {
          throw new Error("Invalid logarithm domain (argument must be > 0). Enable CPLX mode for complex results.");
        }
      } else {
        return toCanonicalMathValue(lnComplex(firstArg.value));
      }
    }
    if (fn === "log" || fn === "log10") {
      if (firstArg.kind === "real") {
        if (firstArg.value > 0) return realVal(Math.log10(firstArg.value));
        if (firstArg.value === 0) throw new Error("Invalid logarithm domain: ln(0) is undefined.");
        if (activeComplex) {
          return toCanonicalMathValue(log10Complex(createComplex(firstArg.value, 0)));
        } else {
          throw new Error("Invalid logarithm domain (argument must be > 0). Enable CPLX mode for complex results.");
        }
      } else {
        return toCanonicalMathValue(log10Complex(firstArg.value));
      }
    }
    if (fn === "log2") {
      if (firstArg.kind === "real" && firstArg.value > 0) {
        return realVal(Math.log2(firstArg.value));
      }
      throw new Error("log2 is only defined for positive real numbers");
    }

    // Trigonometric Functions
    if (fn === "sin") {
      if (firstArg.kind === "real") return realVal(AngleService.sin(firstArg.value, this.angleMode));
      return toCanonicalMathValue(sinComplex(firstArg.value));
    }
    if (fn === "cos") {
      if (firstArg.kind === "real") return realVal(AngleService.cos(firstArg.value, this.angleMode));
      return toCanonicalMathValue(cosComplex(firstArg.value));
    }
    if (fn === "tan") {
      if (firstArg.kind === "real") return realVal(AngleService.tan(firstArg.value, this.angleMode));
      return toCanonicalMathValue(tanComplex(firstArg.value));
    }

    // Hyperbolic Functions
    if (fn === "sinh") {
      if (firstArg.kind === "real") return realVal(Math.sinh(firstArg.value));
      return toCanonicalMathValue(sinhComplex(firstArg.value));
    }
    if (fn === "cosh") {
      if (firstArg.kind === "real") return realVal(Math.cosh(firstArg.value));
      return toCanonicalMathValue(coshComplex(firstArg.value));
    }
    if (fn === "tanh") {
      if (firstArg.kind === "real") return realVal(Math.tanh(firstArg.value));
      return toCanonicalMathValue(tanhComplex(firstArg.value));
    }

    // Real-only Inverse Trig
    if (fn === "asin" || fn === "arcsin" || fn === "sin-1") {
      if (firstArg.kind !== "real" || firstArg.value < -1 || firstArg.value > 1) {
        throw new Error("Invalid domain for asin (must be between -1 and 1)");
      }
      return realVal(AngleService.fromRadians(Math.asin(firstArg.value), this.angleMode));
    }
    if (fn === "acos" || fn === "arccos" || fn === "cos-1") {
      if (firstArg.kind !== "real" || firstArg.value < -1 || firstArg.value > 1) {
        throw new Error("Invalid domain for acos (must be between -1 and 1)");
      }
      return realVal(AngleService.fromRadians(Math.acos(firstArg.value), this.angleMode));
    }
    if (fn === "atan" || fn === "arctan" || fn === "tan-1") {
      if (firstArg.kind !== "real") throw new Error("Complex inverse tangent is deferred in V1");
      return realVal(AngleService.fromRadians(Math.atan(firstArg.value), this.angleMode));
    }

    // Real-only Inverse Hyperbolics
    if (fn === "asinh" || fn === "arcsinh") {
      if (firstArg.kind !== "real") throw new Error("Complex asinh is deferred in V1");
      return realVal(Math.asinh(firstArg.value));
    }
    if (fn === "acosh" || fn === "arccosh") {
      if (firstArg.kind !== "real" || firstArg.value < 1) {
        throw new Error("Invalid domain for acosh (argument must be ≥ 1)");
      }
      return realVal(Math.acosh(firstArg.value));
    }
    if (fn === "atanh" || fn === "arctanh") {
      if (firstArg.kind !== "real" || firstArg.value <= -1 || firstArg.value >= 1) {
        throw new Error("Invalid domain for atanh (argument must be between -1 and 1)");
      }
      return realVal(Math.atanh(firstArg.value));
    }

    // Other Scalar Utilities
    if (fn === "cbrt") {
      if (firstArg.kind !== "real") throw new Error("cbrt is only supported for real numbers");
      return realVal(Math.cbrt(firstArg.value));
    }
    if (fn === "ceil") {
      if (firstArg.kind !== "real") throw new Error("ceil is only supported for real numbers");
      return realVal(Math.ceil(firstArg.value));
    }
    if (fn === "floor") {
      if (firstArg.kind !== "real") throw new Error("floor is only supported for real numbers");
      return realVal(Math.floor(firstArg.value));
    }
    if (fn === "round") {
      if (firstArg.kind !== "real") throw new Error("round is only supported for real numbers");
      return realVal(Math.round(firstArg.value));
    }
    if (fn === "sign") {
      if (firstArg.kind !== "real") throw new Error("sign is only supported for real numbers");
      return realVal(Math.sign(firstArg.value));
    }

    // Combinatorics
    if (fn === "npr" || fn === "perm") {
      if (args.length < 2 || args[0].kind !== "real" || args[1].kind !== "real") {
        throw new Error("nPr requires 2 non-negative integer arguments");
      }
      return realVal(this.computePermutation(args[0].value, args[1].value));
    }
    if (fn === "ncr" || fn === "comb") {
      if (args.length < 2 || args[0].kind !== "real" || args[1].kind !== "real") {
        throw new Error("nCr requires 2 non-negative integer arguments");
      }
      return realVal(this.computeCombination(args[0].value, args[1].value));
    }

    // Random Functions
    if (fn === "rand" || fn === "random") {
      return realVal(Math.round(Math.random() * 100000000) / 100000000);
    }
    if (fn === "randint") {
      if (args.length < 2 || args[0].kind !== "real" || args[1].kind !== "real") {
        throw new Error("randInt requires 2 arguments: randInt(min, max)");
      }
      const min = Math.ceil(args[0].value);
      const max = Math.floor(args[1].value);
      if (min > max) throw new Error("Invalid range for randInt: minimum must be ≤ maximum");
      return realVal(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    throw new Error(`Unknown function: "${fn}"`);
  }

  public computeFactorial(n: number): number {
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
      throw new Error("Factorial is only defined for non-negative integers (n ≥ 0)");
    }
    if (n > 170) {
      throw new Error("Factorial overflow (maximum supported factorial is 170!)");
    }
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  public computePermutation(n: number, r: number): number {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
      throw new Error("nPr arguments must be non-negative integers");
    }
    if (r > n) throw new Error("Invalid nPr: r cannot be greater than n (r ≤ n)");
    if (n > 170) throw new Error("Permutation overflow (n > 170)");
    let res = 1;
    for (let i = 0; i < r; i++) res *= n - i;
    return res;
  }

  public computeCombination(n: number, r: number): number {
    if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0) {
      throw new Error("nCr arguments must be non-negative integers");
    }
    if (r > n) throw new Error("Invalid nCr: r cannot be greater than n (r ≤ n)");
    if (r === 0 || r === n) return 1;
    const k = Math.min(r, n - r);
    let num = 1;
    let den = 1;
    for (let i = 1; i <= k; i++) {
      num *= n - (i - 1);
      den *= i;
    }
    return Math.round(num / den);
  }
}

// =========================================================================
// 6. NUMBER DISPLAY MODES (NORM / SCI / ENG / FIX)
// =========================================================================

/**
 * Cleanly formats numerical results according to display notation mode.
 */
export function formatResultNumber(
  val: number,
  mode: DisplayNotationMode = "NORM",
  fixDigits = 2
): string {
  if (!Number.isFinite(val)) {
    return "Error";
  }

  // Eliminate floating point noise near zero
  if (Math.abs(val) < 1e-13) {
    val = 0;
  }

  switch (mode) {
    case "FIX": {
      const digits = Math.max(0, Math.min(9, Math.floor(fixDigits)));
      const fixedStr = val.toFixed(digits);
      const parts = fixedStr.split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
    }

    case "SCI": {
      if (val === 0) return "0 × 10^0";
      const expStr = val.toExponential();
      return expStr.replace(/e\+?/, " × 10^");
    }

    case "ENG": {
      if (val === 0) return "0 × 10^0";
      const exp = Math.floor(Math.log10(Math.abs(val)));
      const engExp = Math.floor(exp / 3) * 3;
      const engMantissa = val / Math.pow(10, engExp);
      const roundedMantissa = Math.round(engMantissa * 1e8) / 1e8;
      return `${roundedMantissa} × 10^${engExp}`;
    }

    case "NORM":
    default: {
      const rounded = Math.round(val * 1e12) / 1e12;
      const absVal = Math.abs(rounded);

      // Extreme numbers: use scientific notation
      if (absVal >= 1e12 || (absVal > 0 && absVal < 1e-6)) {
        const expStr = rounded.toExponential();
        return expStr.replace(/e\+?/, " × 10^");
      }

      // Standard range: format with localized integer separators
      const parts = String(rounded).split(".");
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      if (parts.length > 1) {
        return `${integerPart}.${parts[1]}`;
      }
      return integerPart;
    }
  }
}

// =========================================================================
// 7. PURE DETERMINISTIC EVALUATOR PIPELINE
// =========================================================================

/**
 * Pure deterministic expression evaluator producing typed AST and trace steps.
 * Strictly avoids eval() and Function().
 */
export function evaluateExpression(
  expression: string,
  options: EvaluationOptions = {}
): EvaluationResult {
  const cleanExpr = expression.trim();
  if (!cleanExpr) {
    return {
      isValid: false,
      expression: "",
      error: "Please enter an expression.",
    };
  }

  // Check for Physical Units & Dimensional Analysis
  if (hasPhysicalUnits(cleanExpr)) {
    // If expression combines physical units with complex values, reject with Unit Error
    if (/\b[i]\b|[\d]i\b/.test(cleanExpr)) {
      return {
        isValid: false,
        expression: cleanExpr,
        error: "Unit Error: Physical unit calculations do not support complex numbers in V1.",
      };
    }

    const unitRes = evaluateUnitExpression(cleanExpr);
    if (unitRes.isValid && unitRes.value !== null) {
      const unitSteps: CalculationStep[] = unitRes.steps.map((st, idx) => ({
        id: `unit-step-${idx + 1}`,
        stepNumber: idx + 1,
        operation: "unit_calculation",
        expression: cleanExpr,
        subResult: unitRes.value!,
        formattedSubResult: unitRes.formatted,
        explanation: st,
      }));

      return {
        isValid: true,
        expression: cleanExpr,
        result: unitRes.value,
        formattedResult: unitRes.formatted,
        canonicalResult: realVal(unitRes.value),
        steps: unitSteps,
        stepExplanation: `Unit calculation: ${unitRes.formatted}`,
        isComplex: false,
        mathematicalResult: {
          canonical: realVal(unitRes.value),
          exact: null,
          formattedExact: null,
          decimal: unitRes.value,
          formattedDecimal: unitRes.formatted,
          hasExact: false,
          isComplex: false,
        },
      };
    } else if (!unitRes.isValid && unitRes.error) {
      return {
        isValid: false,
        expression: cleanExpr,
        error: unitRes.error,
      };
    }
  }

  try {
    const tokens = tokenize(cleanExpr);
    const parser = new ASTParser(tokens);
    const ast = parser.parse();

    const evaluator = new ASTEvaluator(options);
    const { canonical, result, steps } = evaluator.evaluate(ast);

    const notation = options.notation || "NORM";
    const fixDigits = options.fixDigits !== undefined ? options.fixDigits : 2;
    const isComplex = canonical.kind === "complex";

    let formattedResult = "";
    let polarObj: { r: number; thetaRadians: number } | undefined;

    if (!isComplex) {
      formattedResult = formatResultNumber(canonical.value, notation, fixDigits);
    } else {
      formattedResult = formatComplexRectangular(canonical.value, (n) =>
        formatResultNumber(n, notation, fixDigits)
      );
      polarObj = {
        r: absComplex(canonical.value),
        thetaRadians: argComplex(canonical.value),
      };
    }

    const angleLabel = options.angleMode || "DEG";
    const stepExplanation = `Evaluated in ${angleLabel} mode: ${cleanExpr} = ${formattedResult}.`;

    // Derive Exact Mathematical Representation
    const exactEvaluator = new ExactASTEvaluator(
      options.angleMode || "DEG",
      options.exactVariables || {}
    );
    const exactVal = exactEvaluator.deriveExact(ast);
    const formattedExact = formatExactValue(exactVal);
    const hasExact = exactVal !== null;

    const mathematicalResult: MathematicalResult = {
      canonical,
      exact: exactVal,
      formattedExact,
      decimal: result,
      formattedDecimal: formattedResult,
      hasExact,
      isComplex,
      polar: polarObj,
    };

    // Generate AST-Derived Step Trace
    const stepGen = new StepGenerator(
      options.angleMode || "DEG",
      notation,
      fixDigits,
      options.variables || {},
      options.exactVariables || {}
    );
    const calculationSteps = stepGen.generateSteps(ast);

    return {
      isValid: true,
      result,
      formattedResult,
      canonicalResult: canonical,
      mathematicalResult,
      expression: cleanExpr,
      ast,
      steps: calculationSteps.length > 0 ? calculationSteps : steps,
      stepExplanation,
      isComplex,
    };
  } catch (err) {
    return {
      isValid: false,
      expression: cleanExpr,
      error: (err as Error).message || "Invalid expression",
    };
  }
}

// =========================================================================
// 8. OUTPUT WRAPPER FOR CALCULATOR RESULT
// =========================================================================

export function formatScientificOutput(
  result: EvaluationResult,
  angleMode: AngleMode = "DEG",
  memoryValue = 0
): CalculationOutput {
  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Invalid expression",
    };
  }

  const secondaryValues: SecondaryMetric[] = [
    {
      label: "Expression",
      value: result.expression,
    },
    {
      label: "Angle Mode",
      value: angleMode,
    },
  ];

  if (result.isComplex && result.mathematicalResult?.polar) {
    const polarStr = formatComplexPolar(
      (result.canonicalResult as { kind: "complex"; value: ComplexNumber }).value,
      angleMode,
      (n) => formatResultNumber(n)
    );
    secondaryValues.push({
      label: "Polar Form",
      value: polarStr,
    });
  }

  if (memoryValue !== 0) {
    secondaryValues.push({
      label: "Stored Memory (M)",
      value: formatResultNumber(memoryValue),
    });
  }

  return {
    isValid: true,
    primaryValue: result.formattedResult,
    primaryLabel: "Evaluated Result",
    stepExplanation: result.stepExplanation,
    disclaimer:
      "All calculations are evaluated deterministically using typed AST parsing, standard mathematical precedence, and IEEE-754 precision.",
    disclaimerLabel: "Evaluation Principle",
    secondaryValues,
  };
}

// =========================================================================
// 9. CALCULATOR DEFINITION SCHEMA
// =========================================================================

export const scientificCalculatorDefinition: CalculatorDefinition = {
  id: "scientific-calculator",
  slug: "scientific-calculator",
  name: "Scientific Calculator",
  category: "Math",
  categorySlug: "math",
  shortDescription:
    "Advanced scientific calculator for trigonometry, hyperbolic functions, complex numbers (a + bi, polar), logarithms, combinatorics (nPr, nCr), powers, roots, and physical expressions.",
  longDescription:
    "A full-featured digital scientific calculator instrument with DEG/RAD/GRAD modes, REAL/CPLX domain toggles, complex arithmetic (a + bi, polar r∠θ), display notation controls (NORM, SCI, ENG, FIX), hyperbolic functions, combinatorics, memory registers, Ans recall, and calculation history.",
  icon: "🔬",
  searchKeywords: [
    "scientific calculator",
    "scientific calculator online",
    "online scientific calculator",
    "advanced calculator",
    "complex number calculator",
    "imaginary number calculator",
    "polar to rectangular calculator",
    "complex arithmetic with steps",
    "trigonometry calculator",
    "hyperbolic calculator",
    "combinatorics calculator",
    "npr ncr calculator",
    "sin cos tan calculator",
    "scientific math calculator",
    "algebra calculator",
    "math solver",
    "web scientific calculator",
  ],
  defaultModeId: "standard-scientific",
  modes: [
    {
      id: "standard-scientific",
      name: "Scientific Calculator",
      description:
        "Interactive scientific calculator with trigonometric, complex number, hyperbolic, logarithmic, combinatoric, and power functions.",
      formulaText: "f(x) = \\sin(x) + \\log(x) + x^y + (a + bi)",
      inputs: [
        {
          id: "expression",
          label: "Mathematical Expression",
          type: "number",
          defaultValue: "sin(30) + sqrt(144)",
          placeholder: "e.g. sin(30) + sqrt(144) or 2 + 3i",
          helperText: "Enter expression or click calculator keys",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      calculate: (inputs: any) => {
        const expr = String(inputs?.expression || "sin(30) + sqrt(144)");
        const res = evaluateExpression(expr, { angleMode: "DEG" });
        return formatScientificOutput(res, "DEG");
      },
    },
  ],
  formulas: [
    {
      modeId: "standard-scientific",
      title: "1. Complex Numbers & Euler's Formula",
      formulaMath: "z = a + bi = r(\\cos\\theta + i\\sin\\theta) = re^{i\\theta}",
      explanation:
        "Complex numbers represent two-dimensional quantities consisting of a real component 'a' and an imaginary component 'bi' (where i = √(-1)). Operations support rectangular form (a + bi) and polar form (r∠θ).",
      example: "(2 + 3i)(4 - i) = 11 + 10i; |3 + 4i| = 5; e^(iπ) = -1.",
      whenToUse: "Use in AC circuit analysis, electromagnetism, signal processing, quantum physics, and fluid dynamics.",
    },
    {
      modeId: "standard-scientific",
      title: "2. Trigonometric Functions & Angle Conversion",
      formulaMath: "\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}",
      explanation:
        "Trigonometric functions compute circular ratios. In Degree mode (DEG), degrees are converted to radians (θ × π / 180), while Gradian mode (GRAD) converts as (θ × π / 200).",
      example: "In DEG mode: sin(30) = 0.5. In RAD mode: sin(π / 6) = 0.5. In GRAD mode: sin(100) = 1.",
      whenToUse: "Use in geometry, physics, wave mechanics, and engineering calculations.",
    },
    {
      modeId: "standard-scientific",
      title: "3. Hyperbolic Trigonometry",
      formulaMath: "\\sinh(x) = \\frac{e^x - e^{-x}}{2}, \\quad \\cosh(x) = \\frac{e^x + e^{-x}}{2}",
      explanation:
        "Hyperbolic functions describe geometric properties of hyperbolas and appear in catenary curves, relativity, and heat diffusion.",
      example: "sinh(0) = 0; cosh(0) = 1; tanh(0) = 0.",
      whenToUse: "Use in electrical transmission lines, suspension bridges, and special relativity.",
    },
    {
      modeId: "standard-scientific",
      title: "4. Combinatorics (Permutations & Combinations)",
      formulaMath: "n\\text{P}r = \\frac{n!}{(n - r)!}, \\quad n\\text{C}r = \\frac{n!}{r!(n - r)!}",
      explanation:
        "Permutations (nPr) calculate ordered arrangements, while combinations (nCr) calculate unordered selections of r items from n elements.",
      example: "5P2 = 20; 5C2 = 10.",
      whenToUse: "Use in probability, statistics, cryptography, and combinatoric optimization.",
    },
    {
      modeId: "standard-scientific",
      title: "5. Power and Exponentiation",
      formulaMath: "x^y = \\exp(y \\times \\ln(x))",
      explanation:
        "Power operations evaluate right-associatively (2^3^2 = 2^(3^2) = 512). Roots are equivalent to fractional exponents (√x = x^(1/2)). In CPLX mode, negative square roots produce imaginary outputs.",
      example: "2^3 = 8; √144 = 12; √(-4) = 2i (in CPLX mode); i^2 = -1.",
      whenToUse: "Use in compounding growth, scientific notation, and geometric scaling.",
    },
    {
      modeId: "standard-scientific",
      title: "6. Factorial Operation",
      formulaMath: "n! = n \\times (n - 1) \\times (n - 2) \\times 1",
      explanation:
        "Factorial calculates the product of all positive integers less than or equal to n. Defined strictly for non-negative integers, with 0! = 1.",
      example: "5! = 5 × 4 × 3 × 2 × 1 = 120.",
      whenToUse: "Use in combinatorics, permutations, probability, and series expansions.",
    },
    {
      modeId: "standard-scientific",
      title: "7. Logarithms & Antilogarithms",
      formulaMath: "\\text{antilog}_{10}(x) = 10^x, \\quad \\text{antilog}_e(x) = e^x",
      explanation:
        "Antilogarithm is the inverse of a logarithm. For common logarithms (base 10), antilog(x) = 10^x (using the 10ˣ key or 2nd + log). For natural logarithms (base e), antilog(x) = exp(x) = e^x (using the eˣ key). The change-of-base formula is log_b(x) = ln(x) / ln(b).",
      example: "antilog(2) in base 10 = 10^2 = 100; antilog(1) in base e = e^1 ≈ 2.71828; log(100) = 2; ln(e) = 1.",
      whenToUse: "Use in exponential decay, acoustics (dB), chemistry (pH), and inverse exponential modeling.",
    },
  ],
  examples: [
    {
      title: "Example 1: Trigonometric Sine in Degrees",
      description: "Evaluate sin(30) in degree mode.",
      modeId: "standard-scientific",
      inputs: { expression: "sin(30)" },
      expectedOutput: "0.5",
    },
    {
      title: "Example 2: Arithmetic with Square Root",
      description: "Evaluate 2 + 3 * sqrt(144).",
      modeId: "standard-scientific",
      inputs: { expression: "2 + 3 * sqrt(144)" },
      expectedOutput: "38",
    },
    {
      title: "Example 3: Hyperbolic Cosine",
      description: "Evaluate cosh(0).",
      modeId: "standard-scientific",
      inputs: { expression: "cosh(0)" },
      expectedOutput: "1",
    },
    {
      title: "Example 4: Combinations (nCr)",
      description: "Evaluate 5C2 (5 choose 2).",
      modeId: "standard-scientific",
      inputs: { expression: "5C2" },
      expectedOutput: "10",
    },
    {
      title: "Example 5: Permutations (nPr)",
      description: "Evaluate 5P2 (5 permute 2).",
      modeId: "standard-scientific",
      inputs: { expression: "5P2" },
      expectedOutput: "20",
    },
    {
      title: "Example 6: Factorial Calculation",
      description: "Evaluate 5!.",
      modeId: "standard-scientific",
      inputs: { expression: "5!" },
      expectedOutput: "120",
    },
  ],
  faqs: [
    {
      question: "What is a scientific calculator?",
      answer:
        "A scientific calculator is an advanced mathematical tool designed to evaluate complex expressions beyond basic arithmetic, including trigonometric and hyperbolic functions, natural (ln) and common (log₁₀) logarithms, powers, roots, combinatorics (nPr, nCr, !), angle conversions (DEG/RAD/GRAD), and complex numbers (a + bi).",
    },
    {
      question: "How do I use a scientific calculator?",
      answer:
        "Enter your mathematical expression naturally using the keypad or keyboard (such as sin(30) + sqrt(16) or 2^3). Press '=' or Enter to evaluate. You can toggle angle units (DEG, RAD, GRAD), access secondary functions with the '2nd' button, and switch between REAL and CPLX modes for complex numbers.",
    },
    {
      question: "How do I calculate antilog on a scientific calculator?",
      answer:
        "Antilogarithm is the inverse of a logarithm. For common log (base 10), antilog(x) = 10^x (using the 10ˣ key or 2nd + log). For natural log (base e), natural antilog(x) = e^x (using the eˣ key or exp(x)). For example, the antilog of 2 in base 10 is 10² = 100.",
    },
    {
      question: "How do I calculate logarithms on a scientific calculator?",
      answer:
        "Use the 'log' button for base-10 common logarithms (log₁₀(x)) or the 'ln' button for base-e natural logarithms (ln(x)). For example, log(100) = 2 and ln(e) = 1. You can also compute logarithms with complex numbers in CPLX mode.",
    },
    {
      question: "How do I calculate log base 2 on a scientific calculator?",
      answer:
        "To calculate log base 2 of a number x, use the change-of-base formula: log₂(x) = ln(x) / ln(2) or log(x) / log(2). For example, to evaluate log₂(8): ln(8) / ln(2) = 3.",
    },
    {
      question: "What does 'e' mean on a scientific calculator?",
      answer:
        "On a scientific calculator, 'e' can mean two different things depending on context: (1) Euler's number (e ≈ 2.71828), which is a fundamental mathematical constant used as the base of natural logarithms (ln) and exponential functions like eˣ; or (2) Scientific notation shorthand (e.g. 1.5e6), which represents 1.5 × 10⁶ = 1,500,000 for expressing very large or very small numbers.",
    },
    {
      question: "How do I calculate with complex numbers (a + bi)?",
      answer:
        "You can type the imaginary unit 'i' directly (e.g. 2 + 3i, 4i * 2i) or use the secondary key (2nd + π) on the keypad. The calculator automatically computes rectangular (a + bi) and polar (r∠θ) representations.",
    },
    {
      question: "What is the difference between REAL and CPLX mode?",
      answer:
        "In REAL mode, expressions like sqrt(-1) return a real-domain error unless 'i' is explicitly entered. In CPLX mode, negative square roots automatically evaluate to complex numbers (sqrt(-1) = i, sqrt(-4) = 2i).",
    },
    {
      question: "How do I switch between Degree (DEG), Radian (RAD), and Gradian (GRAD) mode?",
      answer:
        "Click the DEG / RAD / GRAD toggle button in the calculator status bar or keypad. In DEG mode, sin(30) = 0.5. In RAD mode, sin(π / 6) = 0.5. In GRAD mode, a right angle is 100 gradians so sin(100) = 1.",
    },
  ],
  relatedCalculators: [
    {
      id: "fraction-calculator",
      name: "Fraction Calculator",
      category: "Math",
      slug: "/fraction-calculator",
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
      id: "lcm-calculator",
      name: "LCM & GCD Calculator",
      category: "Math",
      slug: "/lcm-calculator",
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
    title: "Scientific Calculator — Online Advanced Math & Complex Calculator | YourCalculate",
    description:
      "Free online scientific calculator with full arithmetic, complex numbers (a + bi, polar r∠θ), trigonometry, hyperbolics, logarithms, combinatorics (nPr, nCr, !), angle modes (DEG/RAD/GRAD), and REAL/CPLX modes.",
    canonicalPath: "/scientific-calculator",
    keywords: [
      "scientific calculator",
      "complex number calculator",
      "imaginary number calculator",
      "online scientific calculator",
      "polar to rectangular calculator",
      "advanced calculator",
      "trigonometry calculator",
      "hyperbolic calculator",
      "permutations calculator",
      "combinations calculator",
      "math calculator with steps",
      "deg rad grad calculator",
      "scientific notation calculator",
    ],
  },
};
