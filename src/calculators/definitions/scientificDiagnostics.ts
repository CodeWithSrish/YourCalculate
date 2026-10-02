import {
  evaluateExpression,
  EvaluationOptions,
  AngleMode,
  formatResultNumber,
} from "./scientific";
import {
  MathValue,
  ComplexNumber,
  createComplex,
  absComplex,
  formatComplexRectangular,
} from "./scientificComplex";

// =========================================================================
// 1. DIAGNOSTIC DATA TYPES & INTERFACES
// =========================================================================

export type DiagnosticCause =
  | "same_answer"
  | "operator_precedence"
  | "missing_parentheses"
  | "angle_mode_mismatch"
  | "rounding_or_approximation"
  | "exact_vs_decimal"
  | "sign_error"
  | "reciprocal_error"
  | "percentage_scale"
  | "complex_i_squared_sign"
  | "complex_component_division"
  | "complex_polar_vs_rect"
  | "unexplained_difference"
  | "invalid_input";

export interface DiagnosticHypothesis {
  cause: DiagnosticCause;
  confidence: "exact_match" | "approximate_match" | "unverified";
  title: string;
  explanation: string;
  userInterpretationExpression?: string;
  userInterpretationResult?: number;
  formattedUserInterpretation?: string;
  calculatorExpression?: string;
  calculatorResult?: number;
  formattedCalculatorResult?: string;
  difference?: number;
  steps?: string[];
  recommendation?: string;
}

export interface DiagnosticResult {
  status: "success" | "invalid_input" | "unsupported";
  expression: string;
  calculatorNumericResult: number | null;
  formattedCalculatorResult: string;
  userAnswerRaw: string;
  userNumericAnswer: number | null;
  formattedUserAnswer: string;
  angleMode: AngleMode;
  causes: DiagnosticHypothesis[];
  primaryHypothesis: DiagnosticHypothesis;
  errorMessage?: string;
}

const TOLERANCE = 1e-10;

// =========================================================================
// 2. DETERMINISTIC ALTERNATIVE EXPRESSION GENERATORS
// =========================================================================

interface AlternativeCandidate {
  expression: string;
  description: string;
  cause: DiagnosticCause;
  rule: string;
}

/**
 * Deterministically generates plausible alternative mathematical interpretations
 * (e.g. left-to-right sequential evaluation, inverted precedence, power grouping, etc.)
 */
export function generateAlternativeInterpretations(rawExpr: string): AlternativeCandidate[] {
  const candidates: AlternativeCandidate[] = [];
  const clean = rawExpr.trim();

  if (!clean) return candidates;

  // Normalize simple operator symbols for regex parsing
  const norm = clean
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-");

  // Regex tokenization for basic arithmetic chains: number op number op number...
  const tokenPattern = /^([+-]?\s*(?:\d+(?:\.\d+)?|\bpi\b|\be\b|\bi\b))\s*([+\-*/^])\s*([+-]?\s*(?:\d+(?:\.\d+)?|\bpi\b|\be\b|\bi\b))(?:\s*([+\-*/^])\s*([+-]?\s*(?:\d+(?:\.\d+)?|\bpi\b|\be\b|\bi\b)))?(?:\s*([+\-*/^])\s*([+-]?\s*(?:\d+(?:\.\d+)?|\bpi\b|\be\b|\bi\b)))?$/;
  const match = norm.match(tokenPattern);

  if (match) {
    const t1 = match[1].trim();
    const op1 = match[2];
    const t2 = match[3].trim();
    const op2 = match[4];
    const t3 = match[5]?.trim();
    const op3 = match[6];
    const t4 = match[7]?.trim();

    // Case: 3 numbers with 2 operators (e.g., 2 + 3 * 4 or 10 - 2 * 3 or 2 * 3 ^ 2)
    if (t1 && op1 && t2 && op2 && t3 && !op3) {
      if ((op1 === "+" || op1 === "-") && (op2 === "*" || op2 === "/")) {
        candidates.push({
          expression: `(${t1} ${op1} ${t2}) ${op2} ${t3}`,
          description: "Left-to-right sequential evaluation (ignoring standard operator precedence)",
          cause: "operator_precedence",
          rule: "PEMDAS: Multiplication/Division must be computed before Addition/Subtraction",
        });
        candidates.push({
          expression: `${t1} ${op1} (${t2} ${op2} ${t3})`,
          description: "Explicit standard operator precedence grouping",
          cause: "operator_precedence",
          rule: "PEMDAS: Multiplication/Division evaluated first",
        });
      }
      if ((op1 === "*" || op1 === "/") && op2 === "^") {
        candidates.push({
          expression: `(${t1} ${op1} ${t2}) ^ ${t3}`,
          description: "Evaluating base multiplication before exponentiation",
          cause: "operator_precedence",
          rule: "PEMDAS: Exponents must be evaluated before Multiplication",
        });
      }
      if (op1 === "^" && op2 === "^") {
        candidates.push({
          expression: `(${t1} ^ ${t2}) ^ ${t3}`,
          description: "Evaluating exponentiation left-to-right instead of right-to-left",
          cause: "operator_precedence",
          rule: "Exponentiation is right-associative: a^b^c = a^(b^c)",
        });
      }
    }

    // Case: 4 numbers with 3 operators
    if (t1 && op1 && t2 && op2 && t3 && op3 && t4) {
      if (op1 === "+" && op2 === "*" && op3 === "+") {
        candidates.push({
          expression: `(${t1} + ${t2}) * (${t3} + ${t4})`,
          description: "Evaluating outer additions before middle multiplication",
          cause: "missing_parentheses",
          rule: "PEMDAS: Multiplication evaluates before Addition unless grouped by parentheses",
        });
      }
    }
  }

  return candidates;
}

// =========================================================================
// 3. MAIN DIAGNOSTIC ENGINE: diagnoseAnswerDifference
// =========================================================================

/**
 * Deterministically analyzes why a user's manual answer differs from the calculator output.
 */
export function diagnoseAnswerDifference(
  expression: string,
  userAnswerRaw: string,
  options: EvaluationOptions = {}
): DiagnosticResult {
  const expr = expression.trim();
  const rawAns = userAnswerRaw.trim();
  const currentAngleMode = options.angleMode || "DEG";

  if (!expr || !rawAns) {
    return {
      status: "invalid_input",
      expression: expr,
      calculatorNumericResult: null,
      formattedCalculatorResult: "",
      userAnswerRaw: rawAns,
      userNumericAnswer: null,
      formattedUserAnswer: "",
      angleMode: currentAngleMode,
      causes: [],
      primaryHypothesis: {
        cause: "invalid_input",
        confidence: "unverified",
        title: "Missing Input",
        explanation: "Please provide both the original calculation expression and your manual answer to analyze.",
      },
      errorMessage: "Expression or user answer cannot be empty.",
    };
  }

  // 1. Evaluate Calculator Result
  const isCplxMode = options.isComplexMode || /\bi\b|[\d]i\b/.test(expr) || /\bi\b|[\d]i\b/.test(rawAns);
  const calcEval = evaluateExpression(expr, { ...options, isComplexMode: isCplxMode });
  if (!calcEval.isValid || calcEval.result === undefined) {
    return {
      status: "invalid_input",
      expression: expr,
      calculatorNumericResult: null,
      formattedCalculatorResult: "",
      userAnswerRaw: rawAns,
      userNumericAnswer: null,
      formattedUserAnswer: "",
      angleMode: currentAngleMode,
      causes: [],
      primaryHypothesis: {
        cause: "invalid_input",
        confidence: "unverified",
        title: "Invalid Calculator Expression",
        explanation: `The calculator expression "${expr}" could not be evaluated: ${calcEval.error}`,
      },
      errorMessage: calcEval.error,
    };
  }

  const calcResult = calcEval.result;
  const formattedCalc = calcEval.mathematicalResult?.formattedExact || calcEval.formattedResult || formatResultNumber(calcResult, "NORM");
  const calcCanonical: MathValue = calcEval.canonicalResult || { kind: "real", value: calcResult };

  // 2. Evaluate User Answer Expression
  const cleanUserAns = rawAns.startsWith("=") ? rawAns.slice(1).trim() : rawAns;
  const userEval = evaluateExpression(cleanUserAns, { ...options, isComplexMode: isCplxMode });
  if (!userEval.isValid || userEval.result === undefined) {
    return {
      status: "invalid_input",
      expression: expr,
      calculatorNumericResult: calcResult,
      formattedCalculatorResult: formattedCalc,
      userAnswerRaw: rawAns,
      userNumericAnswer: null,
      formattedUserAnswer: rawAns,
      angleMode: currentAngleMode,
      causes: [],
      primaryHypothesis: {
        cause: "invalid_input",
        confidence: "unverified",
        title: "Invalid User Answer Expression",
        explanation: `Your answer "${rawAns}" is not a valid mathematical value: ${userEval.error}`,
      },
      errorMessage: userEval.error,
    };
  }

  const userResult = userEval.result;
  const formattedUser = userEval.mathematicalResult?.formattedExact || userEval.formattedResult || formatResultNumber(userResult, "NORM");
  const userCanonical: MathValue = userEval.canonicalResult || { kind: "real", value: userResult };

  // Check equality
  const calcComp: ComplexNumber = calcCanonical.kind === "complex" ? calcCanonical.value : createComplex(calcCanonical.value, 0);
  const userComp: ComplexNumber = userCanonical.kind === "complex" ? userCanonical.value : createComplex(userCanonical.value, 0);

  const diffRe = Math.abs(calcComp.re - userComp.re);
  const diffIm = Math.abs(calcComp.im - userComp.im);
  const numDiff = Math.hypot(diffRe, diffIm);

  const hypotheses: DiagnosticHypothesis[] = [];

  // =========================================================================
  // CAUSE 1: ANSWERS ARE MATHEMATICALLY IDENTICAL
  // =========================================================================
  if (diffRe <= TOLERANCE && diffIm <= TOLERANCE) {
    const sameHypothesis: DiagnosticHypothesis = {
      cause: "same_answer",
      confidence: "exact_match",
      title: "Answers Match",
      explanation: `Your answer (${formattedUser}) is mathematically identical to the calculator result (${formattedCalc}).`,
      calculatorExpression: `${expr} = ${formattedCalc}`,
      calculatorResult: calcResult,
      formattedCalculatorResult: formattedCalc,
      userInterpretationExpression: `${cleanUserAns} = ${formattedUser}`,
      userInterpretationResult: userResult,
      formattedUserInterpretation: formattedUser,
      difference: 0,
      recommendation: "No difference detected. Your answer is correct.",
    };

    return {
      status: "success",
      expression: expr,
      calculatorNumericResult: calcResult,
      formattedCalculatorResult: formattedCalc,
      userAnswerRaw: rawAns,
      userNumericAnswer: userResult,
      formattedUserAnswer: formattedUser,
      angleMode: currentAngleMode,
      causes: [sameHypothesis],
      primaryHypothesis: sameHypothesis,
    };
  }

  // =========================================================================
  // CAUSE: COMPLEX i² SIGN INVERSION MISTAKE
  // =========================================================================
  // For multiplication (a + bi)(c + di) = (ac - bd) + (ad + bc)i
  // Mistake: (ac + bd) + (ad + bc)i
  if (isCplxMode) {
    // Check component-wise division: (a + bi) / (c + di) mistakenly evaluated as (a/c) + (b/d)i
    const divMatch = expr.match(/^\s*(?:\((.*?)\)|(.*?))\s*[\/÷]\s*(?:\((.*?)\)|(.*?))\s*$/);
    if (divMatch) {
      const numExpr = (divMatch[1] || divMatch[2] || "").trim();
      const denExpr = (divMatch[3] || divMatch[4] || "").trim();
      if (numExpr && denExpr) {
        const numEval = evaluateExpression(numExpr, { ...options, isComplexMode: true });
        const denEval = evaluateExpression(denExpr, { ...options, isComplexMode: true });
        if (numEval.isValid && denEval.isValid && numEval.canonicalResult && denEval.canonicalResult) {
          const numC: ComplexNumber = numEval.canonicalResult.kind === "complex" ? numEval.canonicalResult.value : createComplex(numEval.canonicalResult.value, 0);
          const denC: ComplexNumber = denEval.canonicalResult.kind === "complex" ? denEval.canonicalResult.value : createComplex(denEval.canonicalResult.value, 0);
          if (Math.abs(denC.re) > 1e-12 && Math.abs(denC.im) > 1e-12) {
            const compDivRe = numC.re / denC.re;
            const compDivIm = numC.im / denC.im;
            if (Math.abs(compDivRe - userComp.re) <= TOLERANCE && Math.abs(compDivIm - userComp.im) <= TOLERANCE) {
              hypotheses.push({
                cause: "complex_component_division",
                confidence: "exact_match",
                title: "Component-wise Division Mistake",
                explanation: `You divided real parts (${formatResultNumber(numC.re)} / ${formatResultNumber(denC.re)} = ${formatResultNumber(compDivRe)}) and imaginary parts (${formatResultNumber(numC.im)} / ${formatResultNumber(denC.im)} = ${formatResultNumber(compDivIm)}) separately. Complex division requires multiplying numerator and denominator by the conjugate of the denominator: (${formatComplexRectangular(denC)})* = ${denC.re} - ${denC.im}i.`,
                calculatorExpression: `${expr} = ${formattedCalc}`,
                calculatorResult: calcResult,
                formattedCalculatorResult: formattedCalc,
                difference: numDiff,
                recommendation: "Multiply top and bottom by the denominator's conjugate to eliminate the imaginary component in the denominator.",
              });
            }
          }
        }
      }
    }

    // Check if difference is purely in the real part
    if (diffIm <= TOLERANCE && diffRe > TOLERANCE) {
      hypotheses.push({
        cause: "complex_i_squared_sign",
        confidence: "approximate_match",
        title: "Imaginary Unit Square (i² = -1) Sign Error",
        explanation: `In complex multiplication, i² evaluates to -1, which changes the sign of the imaginary product: (bi)(di) = bd(i²) = -bd. Check if you mistakenly added +bd instead of subtracting bd.`,
        calculatorExpression: `${expr} = ${formattedCalc}`,
        calculatorResult: calcResult,
        formattedCalculatorResult: formattedCalc,
        difference: numDiff,
        recommendation: "Remember the rule: i² = -1 turns the product of imaginary terms negative.",
      });
    }

    // Check polar representation vs rectangular
    if (Math.abs(absComplex(calcComp) - userComp.re) <= TOLERANCE && userComp.im === 0) {
      hypotheses.push({
        cause: "complex_polar_vs_rect",
        confidence: "exact_match",
        title: "Modulus (r) vs Full Complex Number",
        explanation: `Your answer (${formattedUser}) matches the magnitude / modulus (|z| = ${formatResultNumber(userComp.re)}) of the complex result (${formattedCalc}).`,
        calculatorExpression: `${expr} = ${formattedCalc}`,
        calculatorResult: calcResult,
        formattedCalculatorResult: formattedCalc,
        difference: numDiff,
        recommendation: "The calculator result is a full complex number (a + bi), while your answer is the scalar magnitude |z|.",
      });
    }
  }

  // =========================================================================
  // CAUSE 2: ANGLE MODE MISMATCH (DEG / RAD / GRAD)
  // =========================================================================
  const trigTokens = ["sin", "cos", "tan", "asin", "acos", "atan", "sinh", "cosh", "tanh"];
  const hasTrig = trigTokens.some((t) => expr.toLowerCase().includes(t));

  if (hasTrig) {
    const otherModes: AngleMode[] = (["DEG", "RAD", "GRAD"] as AngleMode[]).filter(
      (m) => m !== currentAngleMode
    );

    for (const altMode of otherModes) {
      const altEval = evaluateExpression(expr, { ...options, angleMode: altMode });
      if (altEval.isValid && typeof altEval.result === "number") {
        const altRes = altEval.result;
        const altDiff = Math.abs(altRes - userResult);
        if (altDiff <= 1e-4) {
          hypotheses.push({
            cause: "angle_mode_mismatch",
            confidence: altDiff <= TOLERANCE ? "exact_match" : "approximate_match",
            title: `Angle Mode Mismatch (${altMode} vs ${currentAngleMode})`,
            explanation: `Your answer (${formattedUser}) matches evaluating ${expr} in ${altMode} mode (${formatResultNumber(altRes, "NORM")}), but the calculator is currently set to ${currentAngleMode} mode (${formattedCalc}).`,
            calculatorExpression: `${expr} [in ${currentAngleMode}] = ${formattedCalc}`,
            calculatorResult: calcResult,
            formattedCalculatorResult: formattedCalc,
            userInterpretationExpression: `${expr} [in ${altMode}] = ${formatResultNumber(altRes, "NORM")}`,
            userInterpretationResult: altRes,
            formattedUserInterpretation: formatResultNumber(altRes, "NORM"),
            difference: numDiff,
            recommendation: `Switch the calculator angle mode to ${altMode} if your angles are measured in ${altMode.toLowerCase()}.`,
          });
        }
      }
    }
  }

  // =========================================================================
  // CAUSE 3: OPERATOR PRECEDENCE & ALTERNATIVE PARENTHESIZATIONS
  // =========================================================================
  const alternativeCandidates = generateAlternativeInterpretations(expr);
  for (const alt of alternativeCandidates) {
    const altEval = evaluateExpression(alt.expression, options);
    if (altEval.isValid && typeof altEval.result === "number") {
      const altRes = altEval.result;
      const altDiff = Math.abs(altRes - userResult);
      if (altDiff <= TOLERANCE) {
        hypotheses.push({
          cause: alt.cause,
          confidence: "exact_match",
          title: alt.cause === "operator_precedence" ? "Operator Precedence Difference" : "Parentheses Grouping Difference",
          explanation: `Your answer matches the alternative interpretation: ${alt.expression} = ${formattedUser}. In standard order of operations (PEMDAS), the calculator evaluated: ${expr} = ${formattedCalc}.`,
          calculatorExpression: `${expr} = ${formattedCalc}`,
          calculatorResult: calcResult,
          formattedCalculatorResult: formattedCalc,
          userInterpretationExpression: `${alt.expression} = ${formattedUser}`,
          userInterpretationResult: altRes,
          formattedUserInterpretation: formattedUser,
          difference: numDiff,
          recommendation: `Use parentheses ${alt.expression} if you want that specific operation order to be executed first.`,
        });
      }
    }
  }

  // =========================================================================
  // CAUSE 4: SIGN ERROR (OPPOSITE SIGN)
  // =========================================================================
  if (Math.abs(calcComp.re + userComp.re) <= TOLERANCE && Math.abs(calcComp.im + userComp.im) <= TOLERANCE) {
    hypotheses.push({
      cause: "sign_error",
      confidence: "exact_match",
      title: "Opposite Sign Error",
      explanation: `Your answer (${formattedUser}) has the exact opposite sign of the calculator result (${formattedCalc}).`,
      calculatorExpression: `${expr} = ${formattedCalc}`,
      calculatorResult: calcResult,
      formattedCalculatorResult: formattedCalc,
      userInterpretationExpression: `-(${expr}) = ${formattedUser}`,
      userInterpretationResult: userResult,
      formattedUserInterpretation: formattedUser,
      difference: numDiff,
      recommendation: "Check negative signs or subtraction steps in your calculation.",
    });
  }

  // =========================================================================
  // CAUSE 5: RECIPROCAL / INVERTED FRACTION (REAL DOMAIN)
  // =========================================================================
  if (calcComp.im === 0 && userComp.im === 0 && Math.abs(calcResult) > 1e-12 && Math.abs((1 / calcResult) - userResult) <= TOLERANCE) {
    hypotheses.push({
      cause: "reciprocal_error",
      confidence: "exact_match",
      title: "Inverted Division / Reciprocal",
      explanation: `Your answer matches the reciprocal (1 / ${formattedCalc} = ${formattedUser}) of the calculator result.`,
      calculatorExpression: `${expr} = ${formattedCalc}`,
      calculatorResult: calcResult,
      formattedCalculatorResult: formattedCalc,
      userInterpretationExpression: `1 / (${expr}) = ${formattedUser}`,
      userInterpretationResult: userResult,
      formattedUserInterpretation: formattedUser,
      difference: numDiff,
      recommendation: "Check if the numerator and denominator were accidentally swapped.",
    });
  }

  // =========================================================================
  // CAUSE 6: PERCENTAGE / FACTOR OF 100 SCALE
  // =========================================================================
  if (
    calcComp.im === 0 && userComp.im === 0 &&
    (Math.abs(calcResult * 100 - userResult) <= TOLERANCE ||
     Math.abs(calcResult / 100 - userResult) <= TOLERANCE)
  ) {
    const isTimes100 = Math.abs(calcResult * 100 - userResult) <= TOLERANCE;
    hypotheses.push({
      cause: "percentage_scale",
      confidence: "exact_match",
      title: "Factor of 100 (Percentage Scale)",
      explanation: isTimes100
        ? `Your answer (${formattedUser}) is 100× larger than the calculator result (${formattedCalc}).`
        : `Your answer (${formattedUser}) is 100× smaller than the calculator result (${formattedCalc}).`,
      calculatorExpression: `${expr} = ${formattedCalc}`,
      calculatorResult: calcResult,
      formattedCalculatorResult: formattedCalc,
      difference: numDiff,
      recommendation: "Verify whether the value is intended as a percentage (%) or a decimal proportion.",
    });
  }

  // =========================================================================
  // CAUSE 7: ROUNDING OR APPROXIMATION
  // =========================================================================
  if (hypotheses.length === 0 && calcComp.im === 0 && userComp.im === 0) {
    let isRounding = false;
    for (let digits = 1; digits <= 6; digits++) {
      const roundedFixed = Number(calcResult.toFixed(digits));
      const roundedPrec = Number(calcResult.toPrecision(digits));
      if (
        Math.abs(roundedFixed - userResult) <= 1e-10 ||
        Math.abs(roundedPrec - userResult) <= 1e-10
      ) {
        isRounding = true;
        hypotheses.push({
          cause: "rounding_or_approximation",
          confidence: "approximate_match",
          title: "Rounding / Decimal Approximation",
          explanation: `Your answer (${formattedUser}) appears to be a rounded approximation of the calculator result (${formattedCalc}). The difference is ${formatResultNumber(numDiff, "NORM")}.`,
          calculatorExpression: `${expr} = ${formattedCalc}`,
          calculatorResult: calcResult,
          formattedCalculatorResult: formattedCalc,
          userInterpretationExpression: `Rounded(${formattedCalc}, ${digits} places) = ${formattedUser}`,
          userInterpretationResult: userResult,
          formattedUserInterpretation: formattedUser,
          difference: numDiff,
          recommendation: "For maximum precision in multi-step problems, keep full unrounded intermediate values.",
        });
        break;
      }
    }

    if (!isRounding && Math.abs(calcResult) > 1e-6 && numDiff / Math.abs(calcResult) < 0.005) {
      hypotheses.push({
        cause: "rounding_or_approximation",
        confidence: "approximate_match",
        title: "Close Numerical Approximation",
        explanation: `Your answer (${formattedUser}) is very close to the calculator result (${formattedCalc}), differing by only ${formatResultNumber(numDiff, "NORM")} (${((numDiff / Math.abs(calcResult)) * 100).toFixed(3)}% relative difference).`,
        calculatorExpression: `${expr} = ${formattedCalc}`,
        calculatorResult: calcResult,
        formattedCalculatorResult: formattedCalc,
        difference: numDiff,
        recommendation: "This minor variance is typically caused by intermediate decimal rounding.",
      });
    }
  }

  // =========================================================================
  // CAUSE 8: UNEXPLAINED DIFFERENCE (FALLBACK)
  // =========================================================================
  if (hypotheses.length === 0) {
    const unexplainedHypothesis: DiagnosticHypothesis = {
      cause: "unexplained_difference",
      confidence: "unverified",
      title: "Unexplained Difference",
      explanation: `We verified that your answer (${formattedUser}) differs from the calculator result (${formattedCalc}) by ${formatResultNumber(numDiff, "NORM")}, but this difference does not match common operator precedence, angle mode, sign, or rounding variations.`,
      calculatorExpression: `${expr} = ${formattedCalc}`,
      calculatorResult: calcResult,
      formattedCalculatorResult: formattedCalc,
      difference: numDiff,
      recommendation: `Check the step-by-step breakdown in "How it was calculated" below to see where your manual calculation diverged.`,
    };
    hypotheses.push(unexplainedHypothesis);
  }

  const primaryHypothesis =
    hypotheses.find((h) => h.confidence === "exact_match") ||
    hypotheses.find((h) => h.confidence === "approximate_match") ||
    hypotheses[0];

  return {
    status: "success",
    expression: expr,
    calculatorNumericResult: calcResult,
    formattedCalculatorResult: formattedCalc,
    userAnswerRaw: rawAns,
    userNumericAnswer: userResult,
    formattedUserAnswer: formattedUser,
    angleMode: currentAngleMode,
    causes: hypotheses,
    primaryHypothesis,
  };
}
