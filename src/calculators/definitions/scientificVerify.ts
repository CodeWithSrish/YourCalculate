import {
  evaluateExpression,
  ASTNode,
  EvaluationOptions,
  ExactValue,
  formatResultNumber,
  CalculationStep,
} from "./scientific";
import {
  MathValue,
  ComplexNumber,
  createComplex,
} from "./scientificComplex";

// =========================================================================
// 1. VERIFICATION DATA TYPES & INTERFACES
// =========================================================================

export type VerificationStatus =
  | "valid"
  | "invalid"
  | "invalidInput"
  | "unsupported";

export interface VerificationSubstitutionSide {
  side: "LHS" | "RHS";
  originalExpression: string;
  substitutedExpression: string;
  numericResult: number;
  formattedResult: string;
  canonicalResult?: MathValue;
  exactResult: ExactValue | null;
  formattedExact: string | null;
  steps: CalculationStep[];
}

export interface VerificationResult {
  status: VerificationStatus;
  variable: string;
  proposedExpression: string;
  proposedNumericValue: number | null;
  proposedExactValue: ExactValue | null;
  proposedCanonicalValue?: MathValue;
  formattedProposedValue: string;
  equation: string;
  lhsExpression: string;
  rhsExpression: string;
  lhs?: VerificationSubstitutionSide;
  rhs?: VerificationSubstitutionSide;
  difference?: number;
  tolerance?: number;
  exactMatch?: boolean;
  message: string;
  detailedSteps: string[];
  errorMessage?: string;
}

const DEFAULT_NUMERICAL_TOLERANCE = 1e-10;

// =========================================================================
// 2. HELPER FUNCTIONS: VARIABLE EXTRACTION & PARSING
// =========================================================================

/**
 * Extracts distinct single-variable identifiers from an AST.
 */
export function extractASTVariables(node: ASTNode): Set<string> {
  const vars = new Set<string>();

  function traverse(n: ASTNode): void {
    switch (n.type) {
      case "Identifier":
        vars.add(n.name);
        break;
      case "UnaryExpression":
        traverse(n.argument);
        break;
      case "BinaryExpression":
        traverse(n.left);
        traverse(n.right);
        break;
      case "PostfixExpression":
        traverse(n.argument);
        break;
      case "Grouping":
        traverse(n.expression);
        break;
      case "FunctionCall":
        for (const arg of n.args) {
          traverse(arg);
        }
        break;
      case "NumberLiteral":
      case "Constant":
        break;
    }
  }

  traverse(node);
  return vars;
}

/**
 * Parses user proposed answer input.
 * Supports "x = 5", "x=1/2", "x = 2 + 3i", or plain value "5", "i", "sqrt(2)".
 */
export function parseProposedAnswer(
  rawAnswer: string,
  expectedVariable: string,
  options: EvaluationOptions = {}
): {
  variable: string;
  expression: string;
  numericValue: number;
  canonicalValue?: MathValue;
  exactValue: ExactValue | null;
  formattedValue: string;
  error?: string;
} {
  const clean = rawAnswer.trim();
  if (!clean) {
    return {
      variable: expectedVariable,
      expression: "",
      numericValue: 0,
      exactValue: null,
      formattedValue: "",
      error: "Please enter an answer to verify.",
    };
  }

  let varName = expectedVariable;
  let exprStr = clean;

  if (clean.includes("=")) {
    const parts = clean.split("=");
    if (parts.length !== 2) {
      return {
        variable: expectedVariable,
        expression: clean,
        numericValue: 0,
        exactValue: null,
        formattedValue: "",
        error: "Malformed answer syntax. Use format like 'x = 5' or simply '5'.",
      };
    }
    const leftVar = parts[0].trim();
    if (leftVar) {
      varName = leftVar;
    }
    exprStr = parts[1].trim();
  }

  if (!exprStr) {
    return {
      variable: varName,
      expression: "",
      numericValue: 0,
      exactValue: null,
      formattedValue: "",
      error: "Please enter a value for the variable.",
    };
  }

  const evalRes = evaluateExpression(exprStr, { ...options, isComplexMode: true });
  if (!evalRes.isValid || evalRes.result === undefined) {
    return {
      variable: varName,
      expression: exprStr,
      numericValue: 0,
      exactValue: null,
      formattedValue: "",
      error: evalRes.error || `Invalid answer expression: "${exprStr}"`,
    };
  }

  const exact = evalRes.mathematicalResult?.exact || null;
  const formatted = evalRes.mathematicalResult?.formattedExact || evalRes.formattedResult || String(evalRes.result);

  return {
    variable: varName,
    expression: exprStr,
    numericValue: evalRes.result,
    canonicalValue: evalRes.canonicalResult,
    exactValue: exact,
    formattedValue: formatted,
  };
}

/**
 * Checks whether an exact comparison can determine equality between two ExactValues.
 */
function areExactValuesEqual(a: ExactValue | null, b: ExactValue | null): boolean | null {
  if (!a || !b) return null;

  if (a.type === "integer" && b.type === "integer") {
    return a.value === b.value;
  }
  if (
    (a.type === "integer" || a.type === "rational") &&
    (b.type === "integer" || b.type === "rational")
  ) {
    const aNum = a.type === "integer" ? a.value : a.numerator;
    const aDen = a.type === "integer" ? 1 : a.denominator;
    const bNum = b.type === "integer" ? b.value : b.numerator;
    const bDen = b.type === "integer" ? 1 : b.denominator;
    return aNum * bDen === bNum * aDen;
  }
  if (a.type === "radical" && b.type === "radical") {
    return (
      a.radicand === b.radicand &&
      a.coefficient * (b.denominator || 1) === b.coefficient * (a.denominator || 1)
    );
  }
  if (a.type === "pi_multiple" && b.type === "pi_multiple") {
    return a.numerator * b.denominator === b.numerator * a.denominator;
  }
  if (a.type === "constant" && b.type === "constant") {
    return a.name === b.name;
  }
  if (a.type === "imaginary" && b.type === "imaginary") {
    return areExactValuesEqual(a.coefficient, b.coefficient);
  }
  if (a.type === "complex" && b.type === "complex") {
    return (
      areExactValuesEqual(a.real, b.real) === true &&
      areExactValuesEqual(a.imaginary.coefficient, b.imaginary.coefficient) === true
    );
  }
  return null;
}

// =========================================================================
// 3. MAIN VERIFICATION ENGINE: verifyEquationAnswer
// =========================================================================

/**
 * Mathematically verifies if a proposed user answer satisfies an equation.
 * Performs substitution: LHS(x=v) == RHS(x=v).
 * Generates clear, step-by-step verification breakdown.
 */
export function verifyEquationAnswer(
  equation: string,
  userAnswer: string,
  options: EvaluationOptions = {}
): VerificationResult {
  const cleanEq = equation.trim();
  const cleanAns = userAnswer.trim();

  if (!cleanEq) {
    return {
      status: "invalidInput",
      variable: "x",
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: "",
      lhsExpression: "",
      rhsExpression: "",
      message: "Please enter an equation to verify.",
      detailedSteps: [],
      errorMessage: "Equation cannot be empty.",
    };
  }

  // Split on '='
  const eqParts = cleanEq.split("=");
  if (eqParts.length !== 2) {
    return {
      status: "invalidInput",
      variable: "x",
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: cleanEq,
      lhsExpression: "",
      rhsExpression: "",
      message: "Equation must contain exactly one '=' sign (e.g., 2x + 5 = 15).",
      detailedSteps: [],
      errorMessage: "Missing or multiple '=' signs.",
    };
  }

  const lhsRaw = eqParts[0].trim();
  const rhsRaw = eqParts[1].trim();

  if (!lhsRaw || !rhsRaw) {
    return {
      status: "invalidInput",
      variable: "x",
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: "Both sides of the equation must contain an expression.",
      detailedSteps: [],
      errorMessage: "Empty left or right side in equation.",
    };
  }

  // Pre-parse LHS and RHS to extract variables and validate AST
  const lhsPreEval = evaluateExpression(lhsRaw, { ...options, variables: { x: 1, y: 1 } });
  const rhsPreEval = evaluateExpression(rhsRaw, { ...options, variables: { x: 1, y: 1 } });

  if (!lhsPreEval.isValid || !lhsPreEval.ast) {
    return {
      status: "invalidInput",
      variable: "x",
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: `Invalid left-hand side: ${lhsPreEval.error || "Syntax error"}`,
      detailedSteps: [],
      errorMessage: lhsPreEval.error,
    };
  }

  if (!rhsPreEval.isValid || !rhsPreEval.ast) {
    return {
      status: "invalidInput",
      variable: "x",
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: `Invalid right-hand side: ${rhsPreEval.error || "Syntax error"}`,
      detailedSteps: [],
      errorMessage: rhsPreEval.error,
    };
  }

  // Extract variables from both sides
  const allVars = new Set<string>([
    ...extractASTVariables(lhsPreEval.ast),
    ...extractASTVariables(rhsPreEval.ast),
  ]);

  if (allVars.size === 0) {
    return {
      status: "unsupported",
      variable: "x",
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: "The equation has no variables to solve or verify.",
      detailedSteps: [],
      errorMessage: "No variable found in equation.",
    };
  }

  if (allVars.size > 1) {
    return {
      status: "unsupported",
      variable: Array.from(allVars).join(", "),
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: `Multiple variables detected (${Array.from(allVars).join(", ")}). Phase 3 supports single-variable verification.`,
      detailedSteps: [],
      errorMessage: "Multi-variable equations are not supported yet.",
    };
  }

  const variableName = Array.from(allVars)[0];

  // Parse proposed answer
  const parsedAnswer = parseProposedAnswer(cleanAns, variableName, options);
  if (parsedAnswer.error) {
    return {
      status: "invalidInput",
      variable: variableName,
      proposedExpression: cleanAns,
      proposedNumericValue: null,
      proposedExactValue: null,
      formattedProposedValue: "",
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: parsedAnswer.error,
      detailedSteps: [],
      errorMessage: parsedAnswer.error,
    };
  }

  // Perform Substitution into LHS and RHS
  const substitutedVal: MathValue = parsedAnswer.canonicalValue || {
    kind: "real",
    value: parsedAnswer.numericValue,
  };

  const varMap: Record<string, MathValue> = {
    [variableName]: substitutedVal,
    [variableName.toLowerCase()]: substitutedVal,
  };
  const exactVarMap: Record<string, ExactValue> = {};
  if (parsedAnswer.exactValue) {
    exactVarMap[variableName] = parsedAnswer.exactValue;
    exactVarMap[variableName.toLowerCase()] = parsedAnswer.exactValue;
  }

  const evalOpts: EvaluationOptions = {
    ...options,
    isComplexMode: options.isComplexMode || substitutedVal.kind === "complex",
    variables: varMap,
    exactVariables: exactVarMap,
  };

  const lhsEval = evaluateExpression(lhsRaw, evalOpts);
  const rhsEval = evaluateExpression(rhsRaw, evalOpts);

  if (!lhsEval.isValid || lhsEval.result === undefined) {
    return {
      status: "invalidInput",
      variable: variableName,
      proposedExpression: cleanAns,
      proposedNumericValue: parsedAnswer.numericValue,
      proposedExactValue: parsedAnswer.exactValue,
      proposedCanonicalValue: parsedAnswer.canonicalValue,
      formattedProposedValue: parsedAnswer.formattedValue,
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: `Error evaluating left-hand side with ${variableName} = ${parsedAnswer.formattedValue}: ${lhsEval.error}`,
      detailedSteps: [],
      errorMessage: lhsEval.error,
    };
  }

  if (!rhsEval.isValid || rhsEval.result === undefined) {
    return {
      status: "invalidInput",
      variable: variableName,
      proposedExpression: cleanAns,
      proposedNumericValue: parsedAnswer.numericValue,
      proposedExactValue: parsedAnswer.exactValue,
      proposedCanonicalValue: parsedAnswer.canonicalValue,
      formattedProposedValue: parsedAnswer.formattedValue,
      equation: cleanEq,
      lhsExpression: lhsRaw,
      rhsExpression: rhsRaw,
      message: `Error evaluating right-hand side with ${variableName} = ${parsedAnswer.formattedValue}: ${rhsEval.error}`,
      detailedSteps: [],
      errorMessage: rhsEval.error,
    };
  }

  const lhsExact = lhsEval.mathematicalResult?.exact || null;
  const rhsExact = rhsEval.mathematicalResult?.exact || null;
  const lhsFormattedExact = lhsEval.mathematicalResult?.formattedExact || null;
  const rhsFormattedExact = rhsEval.mathematicalResult?.formattedExact || null;

  const lhsSide: VerificationSubstitutionSide = {
    side: "LHS",
    originalExpression: lhsRaw,
    substitutedExpression: substituteVariableString(lhsRaw, variableName, parsedAnswer.formattedValue),
    numericResult: lhsEval.result,
    canonicalResult: lhsEval.canonicalResult,
    formattedResult: lhsEval.formattedResult || formatResultNumber(lhsEval.result),
    exactResult: lhsExact,
    formattedExact: lhsFormattedExact,
    steps: lhsEval.steps || [],
  };

  const rhsSide: VerificationSubstitutionSide = {
    side: "RHS",
    originalExpression: rhsRaw,
    substitutedExpression: substituteVariableString(rhsRaw, variableName, parsedAnswer.formattedValue),
    numericResult: rhsEval.result,
    canonicalResult: rhsEval.canonicalResult,
    formattedResult: rhsEval.formattedResult || formatResultNumber(rhsEval.result),
    exactResult: rhsExact,
    formattedExact: rhsFormattedExact,
    steps: rhsEval.steps || [],
  };

  // Complex / Real difference computation
  const lhsCanonical = lhsEval.canonicalResult || { kind: "real", value: lhsEval.result };
  const rhsCanonical = rhsEval.canonicalResult || { kind: "real", value: rhsEval.result };

  const lhsComp: ComplexNumber = lhsCanonical.kind === "complex" ? lhsCanonical.value : createComplex(lhsCanonical.value, 0);
  const rhsComp: ComplexNumber = rhsCanonical.kind === "complex" ? rhsCanonical.value : createComplex(rhsCanonical.value, 0);

  const diffRe = Math.abs(lhsComp.re - rhsComp.re);
  const diffIm = Math.abs(lhsComp.im - rhsComp.im);
  const totalDiff = Math.hypot(diffRe, diffIm);

  const exactEq = areExactValuesEqual(lhsExact, rhsExact);
  const tolerance = DEFAULT_NUMERICAL_TOLERANCE;
  const isSatisfied = exactEq === true || (exactEq !== false && diffRe <= tolerance && diffIm <= tolerance);

  // Generate Step Breakdown
  const detailedSteps: string[] = [];
  detailedSteps.push(`1. Given equation: ${cleanEq}`);
  detailedSteps.push(
    `2. Substitute proposed answer ${variableName} = ${parsedAnswer.formattedValue} into both sides:`
  );

  const lhsDisplay = lhsFormattedExact || lhsSide.formattedResult;
  const rhsDisplay = rhsFormattedExact || rhsSide.formattedResult;

  detailedSteps.push(`   • Left-hand side: ${lhsSide.substitutedExpression} = ${lhsDisplay}`);
  detailedSteps.push(`   • Right-hand side: ${rhsSide.substitutedExpression} = ${rhsDisplay}`);

  if (isSatisfied) {
    detailedSteps.push(
      `3. Comparison: ${lhsDisplay} = ${rhsDisplay} (LHS = RHS).`
    );
    detailedSteps.push(
      `4. Conclusion: ${variableName} = ${parsedAnswer.formattedValue} satisfies the equation.`
    );
  } else {
    detailedSteps.push(
      `3. Comparison: ${lhsDisplay} ≠ ${rhsDisplay} (Difference = ${formatResultNumber(totalDiff)}).`
    );
    detailedSteps.push(
      `4. Conclusion: ${variableName} = ${parsedAnswer.formattedValue} does NOT satisfy the equation.`
    );
  }

  const message = isSatisfied
    ? `✓ Correct: ${variableName} = ${parsedAnswer.formattedValue} satisfies the equation.`
    : `✕ Does not satisfy: LHS evaluates to ${lhsDisplay}, but RHS is ${rhsDisplay} (Difference: ${formatResultNumber(totalDiff)}).`;

  const isComplexVerification = lhsCanonical.kind === "complex" || rhsCanonical.kind === "complex";
  const realDiff = lhsEval.result - rhsEval.result;
  const difference = isComplexVerification ? totalDiff : realDiff;

  return {
    status: isSatisfied ? "valid" : "invalid",
    variable: variableName,
    proposedExpression: cleanAns,
    proposedNumericValue: parsedAnswer.numericValue,
    proposedExactValue: parsedAnswer.exactValue,
    proposedCanonicalValue: parsedAnswer.canonicalValue,
    formattedProposedValue: parsedAnswer.formattedValue,
    equation: cleanEq,
    lhsExpression: lhsRaw,
    rhsExpression: rhsRaw,
    lhs: lhsSide,
    rhs: rhsSide,
    difference,
    tolerance,
    exactMatch: exactEq === true,
    message,
    detailedSteps,
  };
}

/**
 * Creates a visual substituted string representation, e.g. "2(5) + 5" for "2x + 5" when x = 5.
 */
function substituteVariableString(expr: string, varName: string, valStr: string): string {
  const regex = new RegExp(`(\\b|\\d)?${varName}(\\b)?`, "gi");
  return expr.replace(regex, (_match, before) => {
    if (before && /\d/.test(before)) {
      return `${before}(${valStr})`;
    }
    return `(${valStr})`;
  });
}
