import assert from "node:assert";
import {
  tokenize,
  ASTParser,
  ASTEvaluator,
  AngleService,
  evaluateExpression,
  formatResultNumber,
  formatScientificOutput,
  scientificCalculatorDefinition,
} from "./scientific";
import { searchCalculators } from "../engine/search";

console.log("Running Phase 1 Scientific Calculator Engine Tests...\n");

// ==========================================
// 1. CORE ARITHMETIC & PEMDAS PRECEDENCE
// ==========================================
const test1 = evaluateExpression("1 + 2");
assert.strictEqual(test1.result, 3);
assert.strictEqual(test1.formattedResult, "3");
console.log("✓ Test 1: Addition (1 + 2 = 3)");

const test2 = evaluateExpression("10 - 4");
assert.strictEqual(test2.result, 6);
console.log("✓ Test 2: Subtraction (10 - 4 = 6)");

const test3 = evaluateExpression("6 * 7");
assert.strictEqual(test3.result, 42);
console.log("✓ Test 3: Multiplication (6 × 7 = 42)");

const test4 = evaluateExpression("20 / 5");
assert.strictEqual(test4.result, 4);
console.log("✓ Test 4: Division (20 ÷ 5 = 4)");

const test5 = evaluateExpression("2 + 3 * 4");
assert.strictEqual(test5.result, 14);
console.log("✓ Test 5: PEMDAS Precedence (2 + 3 × 4 = 14)");

const test6 = evaluateExpression("(2 + 3) * 4");
assert.strictEqual(test6.result, 20);
console.log("✓ Test 6: Parenthesized evaluation ((2 + 3) × 4 = 20)");

const test7 = evaluateExpression("((2 + 3) * 4) / 2");
assert.strictEqual(test7.result, 10);
console.log("✓ Test 7: Nested parentheses (((2 + 3) × 4) / 2 = 10)");

// ==========================================
// 2. POWERS & EXPONENTIATION (RIGHT-ASSOCIATIVE)
// ==========================================
const test8 = evaluateExpression("2^3");
assert.strictEqual(test8.result, 8);

const test8b = evaluateExpression("5²");
assert.strictEqual(test8b.result, 25);
console.log("✓ Test 8: Power operations (2^3 = 8, 5² = 25)");

const test9 = evaluateExpression("2^3^2");
assert.strictEqual(test9.result, 512, "2^3^2 must evaluate right-associatively as 2^(3^2) = 512");
console.log("✓ Test 9: Right-associative power (2^3^2 = 512)");

// ==========================================
// 3. ROOTS, LOGARITHMS & ABSOLUTE VALUE
// ==========================================
const test10 = evaluateExpression("sqrt(144)");
assert.strictEqual(test10.result, 12);
const test10b = evaluateExpression("√144");
assert.strictEqual(test10b.result, 12);
console.log("✓ Test 10: Square root (sqrt(144) = 12 and √144 = 12)");

const test11 = evaluateExpression("cbrt(27)");
assert.strictEqual(test11.result, 3);
const test11b = evaluateExpression("abs(-42)");
assert.strictEqual(test11b.result, 42);
console.log("✓ Test 11: Cube root (cbrt(27) = 3) and absolute value (abs(-42) = 42)");

const test12 = evaluateExpression("log(100)");
assert.strictEqual(test12.result, 2);
console.log("✓ Test 12: Common logarithm (log(100) = 2)");

const test13 = evaluateExpression("ln(e)");
assert.strictEqual(test13.result, 1);
console.log("✓ Test 13: Natural logarithm (ln(e) = 1)");

const test14 = evaluateExpression("exp(1)");
assert.ok(Math.abs(test14.result! - Math.E) < 1e-12);
console.log("✓ Test 14: Exponential function (exp(1) = e)");

// ==========================================
// 4. ANGLE MODES: DEG, RAD, GRAD
// ==========================================
// DEG Mode
const degSin = evaluateExpression("sin(30)", { angleMode: "DEG" });
assert.strictEqual(degSin.result, 0.5);
const degCos = evaluateExpression("cos(60)", { angleMode: "DEG" });
assert.strictEqual(degCos.result, 0.5);
const degTan = evaluateExpression("tan(45)", { angleMode: "DEG" });
assert.strictEqual(degTan.result, 1);
console.log("✓ Test 15: DEG mode trigonometric values (sin(30)=0.5, cos(60)=0.5, tan(45)=1)");

const degSin90 = evaluateExpression("sin(90)", { angleMode: "DEG" });
assert.strictEqual(degSin90.result, 1);
const degCos180 = evaluateExpression("cos(180)", { angleMode: "DEG" });
assert.strictEqual(degCos180.result, -1);
console.log("✓ Test 16: Exact DEG boundary angles (sin(90)=1, cos(180)=-1)");

// RAD Mode
const radSin = evaluateExpression("sin(π / 2)", { angleMode: "RAD" });
assert.ok(Math.abs(radSin.result! - 1) < 1e-12);
const radCos = evaluateExpression("cos(π)", { angleMode: "RAD" });
assert.ok(Math.abs(radCos.result! - (-1)) < 1e-12);
console.log("✓ Test 17: RAD mode trigonometric values (sin(π/2)=1, cos(π)=-1)");

// GRAD Mode
const gradSin = evaluateExpression("sin(100)", { angleMode: "GRAD" });
assert.strictEqual(gradSin.result, 1, "sin(100 grad) must be exactly 1");
const gradCos = evaluateExpression("cos(200)", { angleMode: "GRAD" });
assert.strictEqual(gradCos.result, -1, "cos(200 grad) must be exactly -1");
const gradTan = evaluateExpression("tan(50)", { angleMode: "GRAD" });
assert.strictEqual(gradTan.result, 1, "tan(50 grad) must be exactly 1");
console.log("✓ Test 18: GRAD mode trigonometric values (sin(100)=1, cos(200)=-1, tan(50)=1)");

// Inverse Trigonometric
const invAsin = evaluateExpression("asin(0.5)", { angleMode: "DEG" });
assert.strictEqual(invAsin.result, 30);
const invAcos = evaluateExpression("acos(0.5)", { angleMode: "DEG" });
assert.strictEqual(invAcos.result, 60);
const invAtan = evaluateExpression("atan(1)", { angleMode: "DEG" });
assert.strictEqual(invAtan.result, 45);
console.log("✓ Test 19: Inverse trigonometric values (asin(0.5)=30°, acos(0.5)=60°, atan(1)=45°)");

// ==========================================
// 5. HYPERBOLIC FUNCTIONS
// ==========================================
const hypSinh = evaluateExpression("sinh(0)");
assert.strictEqual(hypSinh.result, 0);
const hypCosh = evaluateExpression("cosh(0)");
assert.strictEqual(hypCosh.result, 1);
const hypTanh = evaluateExpression("tanh(0)");
assert.strictEqual(hypTanh.result, 0);
const hypAsinh = evaluateExpression("asinh(0)");
assert.strictEqual(hypAsinh.result, 0);
const hypAcosh = evaluateExpression("acosh(1)");
assert.strictEqual(hypAcosh.result, 0);
console.log("✓ Test 20: Hyperbolic functions (sinh(0)=0, cosh(0)=1, tanh(0)=0, asinh(0)=0, acosh(1)=0)");

// Hyperbolic Domain Errors
const invalidAcosh = evaluateExpression("acosh(0.5)");
assert.strictEqual(invalidAcosh.isValid, false);
assert.ok(invalidAcosh.error?.includes("acosh"));

const invalidAtanh = evaluateExpression("atanh(1)");
assert.strictEqual(invalidAtanh.isValid, false);
assert.ok(invalidAtanh.error?.includes("atanh"));
console.log("✓ Test 21: Hyperbolic domain boundaries correctly enforced");

// ==========================================
// 6. COMBINATORICS: FACTORIAL, nPr, nCr
// ==========================================
const fact0 = evaluateExpression("0!");
assert.strictEqual(fact0.result, 1);
const fact5 = evaluateExpression("5!");
assert.strictEqual(fact5.result, 120);
console.log("✓ Test 22: Factorial calculations (0! = 1, 5! = 120)");

// Infix & Function nPr
const permInfix = evaluateExpression("5P2");
assert.strictEqual(permInfix.result, 20);
const permFn = evaluateExpression("nPr(5, 2)");
assert.strictEqual(permFn.result, 20);
const permZero = evaluateExpression("5P0");
assert.strictEqual(permZero.result, 1);
const permFull = evaluateExpression("5P5");
assert.strictEqual(permFull.result, 120);
console.log("✓ Test 23: Permutations nPr (5P2 = 20, 5P0 = 1, 5P5 = 120)");

// Infix & Function nCr
const combInfix = evaluateExpression("5C2");
assert.strictEqual(combInfix.result, 10);
const combFn = evaluateExpression("nCr(5, 2)");
assert.strictEqual(combFn.result, 10);
const combZero = evaluateExpression("5C0");
assert.strictEqual(combZero.result, 1);
const combFull = evaluateExpression("5C5");
assert.strictEqual(combFull.result, 1);
console.log("✓ Test 24: Combinations nCr (5C2 = 10, 5C0 = 1, 5C5 = 1)");

// Combinatorics Errors (r > n, negative)
const invalidPerm = evaluateExpression("3P5");
assert.strictEqual(invalidPerm.isValid, false);
assert.ok(invalidPerm.error?.includes("r cannot be greater than n"));

const invalidComb = evaluateExpression("3C5");
assert.strictEqual(invalidComb.isValid, false);
assert.ok(invalidComb.error?.includes("r cannot be greater than n"));
console.log("✓ Test 25: Combinatorics bounds checks (r > n) rejected safely");

// ==========================================
// 7. RANDOM FUNCTIONS (Rand & RandInt)
// ==========================================
for (let i = 0; i < 10; i++) {
  const randVal = evaluateExpression("rand");
  assert.ok(randVal.isValid);
  assert.ok(randVal.result! >= 0 && randVal.result! < 1, "Rand must be in [0, 1)");

  const randIntVal = evaluateExpression("randInt(1, 6)");
  assert.ok(randIntVal.isValid);
  assert.ok(Number.isInteger(randIntVal.result!));
  assert.ok(randIntVal.result! >= 1 && randIntVal.result! <= 6);
}

const invalidRandInt = evaluateExpression("randInt(10, 2)");
assert.strictEqual(invalidRandInt.isValid, false);
assert.ok(invalidRandInt.error?.includes("minimum must be ≤ maximum"));
console.log("✓ Test 26: Random functions (Rand in [0, 1), RandInt inclusive integer) verified");

// ==========================================
// 8. NUMBER DISPLAY MODES (NORM, SCI, ENG, FIX)
// ==========================================
// NORM
assert.strictEqual(formatResultNumber(1234567, "NORM"), "1,234,567");
assert.strictEqual(formatResultNumber(0.1 + 0.2, "NORM"), "0.3");

// SCI
assert.strictEqual(formatResultNumber(12345, "SCI"), "1.2345 × 10^4");

// ENG
assert.strictEqual(formatResultNumber(123450, "ENG"), "123.45 × 10^3");
assert.strictEqual(formatResultNumber(1200000, "ENG"), "1.2 × 10^6");

// FIX
assert.strictEqual(formatResultNumber(3.14159, "FIX", 0), "3");
assert.strictEqual(formatResultNumber(3.14159, "FIX", 2), "3.14");
assert.strictEqual(formatResultNumber(3.14159, "FIX", 4), "3.1416");
assert.strictEqual(formatResultNumber(3.5, "FIX", 2), "3.50");
console.log("✓ Test 27: Number display formatting modes (NORM, SCI, ENG, FIX 0/2/4) verified");

// ==========================================
// 9. CONSTANTS & IMPLICIT MULTIPLICATION
// ==========================================
const testImplicitPi = evaluateExpression("2π");
assert.ok(Math.abs(testImplicitPi.result! - 2 * Math.PI) < 1e-12);

const testImplicitParen = evaluateExpression("2(3)");
assert.strictEqual(testImplicitParen.result, 6);

const testImplicitParenParen = evaluateExpression("(2)(3)");
assert.strictEqual(testImplicitParenParen.result, 6);

const testImplicitSqrt = evaluateExpression("3sqrt(4)");
assert.strictEqual(testImplicitSqrt.result, 6);
console.log("✓ Test 28: Implicit multiplication (2π, 2(3), (2)(3), 3sqrt(4)) verified");

// ==========================================
// 10. ANS RECALL & MEMORY BEHAVIOR
// ==========================================
const testAns = evaluateExpression("Ans * 2", { ans: 15 });
assert.strictEqual(testAns.result, 30);
console.log("✓ Test 29: Ans variable correctly substituted and evaluated");

// ==========================================
// 11. ERROR REJECTION & SECURITY
// ==========================================
assert.strictEqual(evaluateExpression("10 / 0").isValid, false);
assert.strictEqual(evaluateExpression("sqrt(-4)").isValid, false);
assert.strictEqual(evaluateExpression("log(-10)").isValid, false);
assert.strictEqual(evaluateExpression("((2 + 3)").isValid, false);
assert.strictEqual(evaluateExpression("(-5)!").isValid, false);
assert.strictEqual(evaluateExpression("3.5!").isValid, false);

const dangerousStrings = [
  "constructor",
  "prototype",
  "__proto__",
  "window",
  "document",
  "globalThis",
  "Function('return 1')()",
  "eval('2+2')",
];
for (const s of dangerousStrings) {
  const r = evaluateExpression(s);
  assert.strictEqual(r.isValid, false, `Security: "${s}" must be rejected`);
}
console.log("✓ Test 30: Error handling and parser security against code injection verified");

// ==========================================
// 12. AST STEP TRACE FOUNDATION
// ==========================================
const stepExpr = evaluateExpression("(25 * 4) / (10 + 5)");
assert.ok(stepExpr.isValid);
assert.ok(stepExpr.steps && stepExpr.steps.length > 0, "AST evaluation must record structured trace steps");
assert.ok(stepExpr.ast !== undefined, "AST root must be attached to EvaluationResult");
console.log("✓ Test 31: Structured AST step recording trace verified");

// ==========================================
// 13. MATHFORMULA COMPLIANCE & EXAMPLES
// ==========================================
assert.strictEqual(scientificCalculatorDefinition.examples.length, 6);
assert.strictEqual(scientificCalculatorDefinition.faqs.length, 9);

for (const formula of scientificCalculatorDefinition.formulas) {
  assert.strictEqual(formula.formulaMath.includes("\\left"), false, "Formula must not contain \\left");
  assert.strictEqual(formula.formulaMath.includes("\\right"), false, "Formula must not contain \\right");
  assert.strictEqual(formula.formulaMath.includes("\\cdots"), false, "Formula must not contain \\cdots");
  assert.strictEqual(formula.formulaMath.includes("\\sum"), false, "Formula must not contain \\sum");
  assert.strictEqual(formula.formulaMath.includes("\\frac{\\frac"), false, "Formula must not contain nested \\frac");

  const openBraces = (formula.formulaMath.match(/\{/g) || []).length;
  const closeBraces = (formula.formulaMath.match(/\}/g) || []).length;
  assert.strictEqual(openBraces, closeBraces, "Braces must be balanced in formulaMath");
}
console.log("✓ Test 32: All formulas conform to MathFormula parser constraints");

// Worked examples match engine outputs
const ex1 = evaluateExpression("sin(30)", { angleMode: "DEG" });
assert.strictEqual(ex1.formattedResult, scientificCalculatorDefinition.examples[0].expectedOutput);

const ex2 = evaluateExpression("2 + 3 * sqrt(144)");
assert.strictEqual(ex2.formattedResult, scientificCalculatorDefinition.examples[1].expectedOutput);

const ex3 = evaluateExpression("cosh(0)");
assert.strictEqual(ex3.formattedResult, scientificCalculatorDefinition.examples[2].expectedOutput);

const ex4 = evaluateExpression("5C2");
assert.strictEqual(ex4.formattedResult, scientificCalculatorDefinition.examples[3].expectedOutput);

const ex5 = evaluateExpression("5P2");
assert.strictEqual(ex5.formattedResult, scientificCalculatorDefinition.examples[4].expectedOutput);

const ex6 = evaluateExpression("5!");
assert.strictEqual(ex6.formattedResult, scientificCalculatorDefinition.examples[5].expectedOutput);
console.log("✓ Test 33: All 6 worked examples match engine outputs");

// Search Discovery
const searchResultsSci = searchCalculators("scientific calculator");
assert.ok(searchResultsSci.length > 0);
assert.strictEqual(searchResultsSci[0].calculator.slug, "scientific-calculator");

const searchResultsTrig = searchCalculators("trigonometry calculator");
assert.ok(searchResultsTrig.length > 0);
assert.strictEqual(searchResultsTrig[0].calculator.slug, "scientific-calculator");
console.log("✓ Test 34: Search engine discovers Scientific Calculator for high-intent queries");

// Direct Class / Module Unit Verifications
const tokens = tokenize("2 * pi");
assert.strictEqual(tokens.length, 3);
const parser = new ASTParser(tokens);
const ast = parser.parse();
assert.strictEqual(ast.type, "BinaryExpression");

const evaluator = new ASTEvaluator({ angleMode: "DEG" });
const evalRes = evaluator.evaluate(ast);
assert.ok(Math.abs(evalRes.result - 2 * Math.PI) < 1e-12);

assert.strictEqual(AngleService.toRadians(180, "DEG"), Math.PI);
assert.strictEqual(AngleService.fromRadians(Math.PI, "GRAD"), 200);

const evalOutput = evaluateExpression("12.345", { notation: "FIX", fixDigits: 2 });
const formattedOutput = formatScientificOutput(evalOutput);
assert.strictEqual(formattedOutput.primaryValue, "12.35");
console.log("✓ Test 35: Direct AST parser, evaluator, angle service, and output formatter classes verified");

// =========================================================================
// PHASE 2: SHOW STEPS & EXACT / DECIMAL RESULT TESTS
// =========================================================================

// Test 36: Show Steps for simple addition
const stepTest1 = evaluateExpression("2 + 3");
assert.ok(stepTest1.steps && stepTest1.steps.length >= 1);
assert.strictEqual(stepTest1.steps[0].subResult, 5);
console.log("✓ Test 36: Show Steps for simple addition (2 + 3 = 5)");

// Test 37: Show Steps for PEMDAS precedence
const stepTest2 = evaluateExpression("2 + 3 * 4");
assert.ok(stepTest2.steps && stepTest2.steps.length >= 2);
assert.strictEqual(stepTest2.steps[0].operation, "Multiplication");
assert.strictEqual(stepTest2.steps[0].subResult, 12);
assert.strictEqual(stepTest2.steps[1].operation, "Addition");
assert.strictEqual(stepTest2.steps[1].subResult, 14);
console.log("✓ Test 37: Show Steps for PEMDAS precedence (3 × 4 before + 2)");

// Test 38: Show Steps for parentheses
const stepTest3 = evaluateExpression("(2 + 3) * 4");
assert.ok(stepTest3.steps && stepTest3.steps.length >= 2);
assert.strictEqual(stepTest3.steps[0].operation, "Addition");
assert.strictEqual(stepTest3.steps[0].subResult, 5);
assert.strictEqual(stepTest3.steps[stepTest3.steps.length - 1].subResult, 20);
console.log("✓ Test 38: Show Steps for parenthesized expression ((2 + 3) × 4)");

// Test 39: Show Steps for complex expression
const stepTest4 = evaluateExpression("(25 * 4) / (10 + 5)");
assert.ok(stepTest4.steps && stepTest4.steps.length >= 3);
assert.strictEqual(stepTest4.mathematicalResult?.formattedExact, "20/3");
assert.strictEqual(stepTest4.mathematicalResult?.hasExact, true);
console.log("✓ Test 39: Show Steps for complex rational expression ((25 × 4) / (10 + 5) = 20/3)");

// Test 40: Exact Rational arithmetic & reduction
const rat1 = evaluateExpression("1 / 2");
assert.strictEqual(rat1.mathematicalResult?.formattedExact, "1/2");

const rat2 = evaluateExpression("2 / 4");
assert.strictEqual(rat2.mathematicalResult?.formattedExact, "1/2");

const rat3 = evaluateExpression("6 / 9");
assert.strictEqual(rat3.mathematicalResult?.formattedExact, "2/3");

const rat4 = evaluateExpression("1/3 + 1/6");
assert.strictEqual(rat4.mathematicalResult?.formattedExact, "1/2");
console.log("✓ Test 40: Exact Rational reduction and arithmetic (2/4 = 1/2, 6/9 = 2/3, 1/3+1/6 = 1/2)");

// Test 41: Exact Radicals
const rad1 = evaluateExpression("sqrt(4)");
assert.strictEqual(rad1.mathematicalResult?.formattedExact, "2");

const rad2 = evaluateExpression("sqrt(2)");
assert.strictEqual(rad2.mathematicalResult?.formattedExact, "√2");

const rad3 = evaluateExpression("sqrt(8)");
assert.strictEqual(rad3.mathematicalResult?.formattedExact, "2√2");

const rad4 = evaluateExpression("sqrt(18)");
assert.strictEqual(rad4.mathematicalResult?.formattedExact, "3√2");
console.log("✓ Test 41: Exact Radical simplification (√4 = 2, √2 = √2, √8 = 2√2, √18 = 3√2)");

// Test 42: Exact Pi multiples
const pi1 = evaluateExpression("π");
assert.strictEqual(pi1.mathematicalResult?.formattedExact, "π");

const pi2 = evaluateExpression("2 * π");
assert.strictEqual(pi2.mathematicalResult?.formattedExact, "2π");

const pi3 = evaluateExpression("π / 2");
assert.strictEqual(pi3.mathematicalResult?.formattedExact, "π/2");

const pi4 = evaluateExpression("25 * π");
assert.strictEqual(pi4.mathematicalResult?.formattedExact, "25π");
console.log("✓ Test 42: Exact Pi multiples (π, 2π, π/2, 25π)");

// Test 43: Exact Trigonometry in DEG mode
const trig1 = evaluateExpression("sin(30)", { angleMode: "DEG" });
assert.strictEqual(trig1.mathematicalResult?.formattedExact, "1/2");

const trig2 = evaluateExpression("cos(45)", { angleMode: "DEG" });
assert.strictEqual(trig2.mathematicalResult?.formattedExact, "√2/2");

const trig3 = evaluateExpression("tan(45)", { angleMode: "DEG" });
assert.strictEqual(trig3.mathematicalResult?.formattedExact, "1");

const trig4 = evaluateExpression("cos(60)", { angleMode: "DEG" });
assert.strictEqual(trig4.mathematicalResult?.formattedExact, "1/2");

const trig5 = evaluateExpression("sin(90)", { angleMode: "DEG" });
assert.strictEqual(trig5.mathematicalResult?.formattedExact, "1");
console.log("✓ Test 43: Exact common-angle trigonometric values in DEG mode (sin 30° = 1/2, cos 45° = √2/2, tan 45° = 1)");

// Test 44: Exact Trigonometry in RAD mode
const trigRad1 = evaluateExpression("sin(π / 6)", { angleMode: "RAD" });
assert.strictEqual(trigRad1.mathematicalResult?.formattedExact, "1/2");

const trigRad2 = evaluateExpression("cos(π / 4)", { angleMode: "RAD" });
assert.strictEqual(trigRad2.mathematicalResult?.formattedExact, "√2/2");
console.log("✓ Test 44: Exact trigonometric values in RAD mode (sin(π/6) = 1/2, cos(π/4) = √2/2)");

// Test 45: Unsupported exact angles must NOT claim exactness
const nonExactTrig = evaluateExpression("sin(17)", { angleMode: "DEG" });
assert.strictEqual(nonExactTrig.mathematicalResult?.hasExact, false);
assert.strictEqual(nonExactTrig.mathematicalResult?.exact, null);
assert.ok(Math.abs(nonExactTrig.result! - 0.29237170472273677) < 1e-10);
console.log("✓ Test 45: Unsupported exact angles (sin 17°) correctly return decimal-only without false exact label");

// Test 46: MathematicalResult Model Structure
const modelTest = evaluateExpression("sqrt(2)");
assert.ok(modelTest.mathematicalResult);
assert.strictEqual(modelTest.mathematicalResult.hasExact, true);
assert.strictEqual(modelTest.mathematicalResult.formattedExact, "√2");
assert.ok(Math.abs(modelTest.mathematicalResult.decimal - Math.SQRT2) < 1e-12);
console.log("✓ Test 46: MathematicalResult model preserves exact representation alongside decimal");

// Test 47: Combinatorics exact derivation
const comb1 = evaluateExpression("5!");
assert.strictEqual(comb1.mathematicalResult?.formattedExact, "120");

const comb2 = evaluateExpression("5P2");
assert.strictEqual(comb2.mathematicalResult?.formattedExact, "20");

const comb3 = evaluateExpression("5C2");
assert.strictEqual(comb3.mathematicalResult?.formattedExact, "10");
console.log("✓ Test 47: Combinatorics exact derivation (5! = 120, 5P2 = 20, 5C2 = 10)");

// Test 48: Safe error handling on division by zero & invalid domains
const err1 = evaluateExpression("10 / 0");
assert.strictEqual(err1.isValid, false);
assert.ok(err1.error?.includes("divide by zero"));

const err2 = evaluateExpression("sqrt(-4)");
assert.strictEqual(err2.isValid, false);
assert.ok(err2.error?.includes("square root domain"));
console.log("✓ Test 48: Safe structured error handling for division by zero and domain errors");

console.log("\nAll 48 Phase 1 & Phase 2 Scientific Calculator QA tests passed successfully!");


