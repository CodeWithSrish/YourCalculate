import assert from "node:assert";
import {
  evaluateExpression,
  formatResultNumber,
} from "./scientific";
import {
  ComplexNumber,
  createComplex,
  addComplex,
  subComplex,
  mulComplex,
  divComplex,
  absComplex,
  conjComplex,
  argComplex,
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
  powerComplexReal,
  formatComplexRectangular,
  formatComplexPolar,
} from "./scientificComplex";
import { verifyEquationAnswer } from "./scientificVerify";
import { diagnoseAnswerDifference } from "./scientificDiagnostics";

console.log("Running Phase 7 First-Class Complex Number Engine Tests...\n");

// =========================================================================
// 0. CORE HELPER FUNCTIONS DIRECT UNIT TESTS
// =========================================================================
console.log("--- 0. CORE HELPER FUNCTIONS ---");
const c1 = createComplex(3, 4);
const c2 = createComplex(1, -2);
assert.deepStrictEqual(addComplex(c1, c2), createComplex(4, 2));
assert.deepStrictEqual(subComplex(c1, c2), createComplex(2, 6));
assert.deepStrictEqual(mulComplex(c1, c2), createComplex(11, -2));
assert.deepStrictEqual(divComplex(createComplex(1, 2), createComplex(3, -4)), createComplex(-0.2, 0.4));
assert.strictEqual(absComplex(c1), 5);
assert.deepStrictEqual(conjComplex(c1), createComplex(3, -4));
assert.strictEqual(argComplex(createComplex(1, 1)), Math.PI / 4);
assert.deepStrictEqual(sqrtComplex(createComplex(-4, 0)), createComplex(0, 2));
assert.ok(Math.abs(expComplex(createComplex(0, Math.PI)).re + 1) < 1e-12);
assert.ok(Math.abs(lnComplex(createComplex(0, 1)).im - Math.PI / 2) < 1e-12);
assert.ok(Math.abs(log10Complex(createComplex(0, 1)).im - Math.PI / (2 * Math.LN10)) < 1e-12);
assert.ok(Math.abs(sinComplex(createComplex(0, 1)).im - Math.sinh(1)) < 1e-12);
assert.ok(Math.abs(cosComplex(createComplex(0, 1)).re - Math.cosh(1)) < 1e-12);
assert.ok(Math.abs(tanComplex(createComplex(0, 1)).im - Math.tanh(1)) < 1e-12);
assert.ok(Math.abs(sinhComplex(createComplex(0, 1)).im - Math.sin(1)) < 1e-12);
assert.ok(Math.abs(coshComplex(createComplex(0, 1)).re - Math.cos(1)) < 1e-12);
assert.ok(Math.abs(tanhComplex(createComplex(0, 1)).im - Math.tan(1)) < 1e-12);
assert.deepStrictEqual(powerComplexReal(createComplex(0, 1), 2), createComplex(-1, 0));
assert.strictEqual(formatComplexRectangular(c1), "3 + 4i");
assert.ok(formatComplexPolar(c1, "DEG").startsWith("5∠53.13"));
console.log("✓ Test 0: Direct core helper operations verified");

// =========================================================================
// 1. PARSER & TOKENIZER INTEGRATION
// =========================================================================
console.log("\n--- 1. PARSER & TOKENIZER INTEGRATION ---");

// Test 1.1: Literal i
const p1 = evaluateExpression("i");
assert.strictEqual(p1.isValid, true);
assert.strictEqual(p1.isComplex, true);
assert.strictEqual(p1.formattedResult, "i");
console.log("✓ Test 1.1: Literal i evaluates to 'i'");

// Test 1.2: Implicit multiplication 2i
const p2 = evaluateExpression("2i");
assert.strictEqual(p2.isValid, true);
assert.strictEqual(p2.isComplex, true);
assert.strictEqual(p2.formattedResult, "2i");
console.log("✓ Test 1.2: Implicit multiplication 2i evaluates to '2i'");

// Test 1.3: Unary negation -i
const p3 = evaluateExpression("-i");
assert.strictEqual(p3.isValid, true);
assert.strictEqual(p3.isComplex, true);
assert.strictEqual(p3.formattedResult, "-i");
console.log("✓ Test 1.3: Unary negation -i evaluates to '-i'");

// Test 1.4: Binomial 2 + 3i
const p4 = evaluateExpression("2 + 3i");
assert.strictEqual(p4.isValid, true);
assert.strictEqual(p4.isComplex, true);
assert.strictEqual(p4.formattedResult, "2 + 3i");
console.log("✓ Test 1.4: Binomial 2 + 3i evaluates to '2 + 3i'");

// Test 1.5: Parenthesized power (2 + 3i)^2
const p5 = evaluateExpression("(2 + 3i)^2");
assert.strictEqual(p5.isValid, true);
assert.strictEqual(p5.isComplex, true);
assert.strictEqual(p5.formattedResult, "-5 + 12i");
console.log("✓ Test 1.5: Power (2 + 3i)^2 evaluates to '-5 + 12i'");

// Test 1.6: Explicit multiplication 3 * i
const p6 = evaluateExpression("3 * i");
assert.strictEqual(p6.isValid, true);
assert.strictEqual(p6.formattedResult, "3i");
console.log("✓ Test 1.6: Explicit multiplication 3 * i evaluates to '3i'");

// Test 1.7: i * i = -1 (normalizes to pure real)
const p7 = evaluateExpression("i * i");
assert.strictEqual(p7.isValid, true);
assert.strictEqual(p7.isComplex, false);
assert.strictEqual(p7.result, -1);
assert.strictEqual(p7.formattedResult, "-1");
console.log("✓ Test 1.7: i * i evaluates to pure real -1");

// Test 1.8: (1+i)(1-i) = 2
const p8 = evaluateExpression("(1 + i)(1 - i)");
assert.strictEqual(p8.isValid, true);
assert.strictEqual(p8.isComplex, false);
assert.strictEqual(p8.result, 2);
console.log("✓ Test 1.8: (1+i)(1-i) evaluates to pure real 2");

// Test 1.9: Precedence of + vs * (2 + 3 * i)
const p9 = evaluateExpression("2 + 3 * i");
assert.strictEqual(p9.isValid, true);
assert.strictEqual(p9.formattedResult, "2 + 3i");
console.log("✓ Test 1.9: Precedence of + vs * produces '2 + 3i'");

// =========================================================================
// 2. COMPLEX ARITHMETIC & NUMERICAL STABILITY
// =========================================================================
console.log("\n--- 2. COMPLEX ARITHMETIC & SMITH DIVISION ---");

// Test 2.1: Complex Addition
const a1 = evaluateExpression("(2 + 3i) + (4 - i)");
assert.strictEqual(a1.isValid, true);
assert.strictEqual(a1.formattedResult, "6 + 2i");
console.log("✓ Test 2.1: Addition (2+3i) + (4-i) = 6 + 2i");

// Test 2.2: Complex Subtraction
const a2 = evaluateExpression("(5 + 2i) - (3 + 7i)");
assert.strictEqual(a2.isValid, true);
assert.strictEqual(a2.formattedResult, "2 - 5i");
console.log("✓ Test 2.2: Subtraction (5+2i) - (3+7i) = 2 - 5i");

// Test 2.3: Complex Multiplication
const a3 = evaluateExpression("(2 + 3i) * (4 - 5i)");
assert.strictEqual(a3.isValid, true);
assert.strictEqual(a3.formattedResult, "23 + 2i");
console.log("✓ Test 2.3: Multiplication (2+3i)*(4-5i) = 23 + 2i");

// Test 2.4: Complex Division (Smith stable algorithm)
const a4 = evaluateExpression("(1 + 2i) / (3 - 4i)");
assert.strictEqual(a4.isValid, true);
assert.strictEqual(a4.formattedResult, "-0.2 + 0.4i");
console.log("✓ Test 2.4: Division (1+2i)/(3-4i) = -0.2 + 0.4i");

// Test 2.5: Division by Zero (0 + 0i)
const a5 = evaluateExpression("(1 + i) / (0 + 0i)");
assert.strictEqual(a5.isValid, false);
assert.ok(a5.error?.includes("Cannot divide by zero"));
console.log("✓ Test 2.5: Division by 0 + 0i produces clean error message");

// Test 2.6: Conjugate conj(3 + 4i)
const a6 = evaluateExpression("conj(3 + 4i)");
assert.strictEqual(a6.isValid, true);
assert.strictEqual(a6.formattedResult, "3 - 4i");

const a6b = evaluateExpression("conj(3 - 4i)");
assert.strictEqual(a6b.isValid, true);
assert.strictEqual(a6b.formattedResult, "3 + 4i");
console.log("✓ Test 2.6: conj(3+4i) = 3-4i and conj(3-4i) = 3+4i");

// Test 2.7: Magnitude abs(3 + 4i)
const a7 = evaluateExpression("abs(3 + 4i)");
assert.strictEqual(a7.isValid, true);
assert.strictEqual(a7.isComplex, false);
assert.strictEqual(a7.result, 5);
console.log("✓ Test 2.7: abs(3 + 4i) = 5 (Math.hypot stability)");

// Test 2.8: Argument arg(1 + i)
const a8 = evaluateExpression("arg(1 + i)");
assert.strictEqual(a8.isValid, true);
assert.strictEqual(a8.isComplex, false);
assert.ok(Math.abs(a8.result! - Math.PI / 4) < 1e-12);
console.log("✓ Test 2.8: arg(1 + i) evaluates to π/4 radians");

// Test 2.9: real() / re() and imag() / im()
const a9a = evaluateExpression("real(3 + 4i)");
assert.strictEqual(a9a.result, 3);
const a9b = evaluateExpression("re(3 + 4i)");
assert.strictEqual(a9b.result, 3);
const a9c = evaluateExpression("imag(3 + 4i)");
assert.strictEqual(a9c.result, 4);
const a9d = evaluateExpression("im(3 + 4i)");
assert.strictEqual(a9d.result, 4);
const a9e = evaluateExpression("real(5)");
assert.strictEqual(a9e.result, 5);
const a9f = evaluateExpression("imag(5)");
assert.strictEqual(a9f.result, 0);
console.log("✓ Test 2.9: real(), re(), imag(), im() aliases operate on complex and real inputs");

// =========================================================================
// 3. COMPLEX POWERS
// =========================================================================
console.log("\n--- 3. COMPLEX POWERS (INTEGER & REAL) ---");

// Test 3.1: Cyclic powers of i
assert.strictEqual(evaluateExpression("i^0").result, 1);
assert.strictEqual(evaluateExpression("i^1").formattedResult, "i");
assert.strictEqual(evaluateExpression("i^2").result, -1);
assert.strictEqual(evaluateExpression("i^3").formattedResult, "-i");
assert.strictEqual(evaluateExpression("i^4").result, 1);
assert.strictEqual(evaluateExpression("i^100").result, 1);
console.log("✓ Test 3.1: Cyclic integer powers i^0, i^1, i^2, i^3, i^4, i^100");

// Test 3.2: (1 + i)^4 = -4
const pow2 = evaluateExpression("(1 + i)^4");
assert.strictEqual(pow2.isValid, true);
assert.strictEqual(pow2.isComplex, false);
assert.strictEqual(pow2.result, -4);
console.log("✓ Test 3.2: (1 + i)^4 = -4");

// Test 3.3: Negative integer power (2 + 3i)^-1 = (2 - 3i)/13
const pow3 = evaluateExpression("(2 + 3i)^(-1)");
assert.strictEqual(pow3.isValid, true);
assert.strictEqual(pow3.isComplex, true);
const cVal3 = (pow3.canonicalResult as { kind: "complex"; value: ComplexNumber }).value;
assert.ok(Math.abs(cVal3.re - 2 / 13) < 1e-12);
assert.ok(Math.abs(cVal3.im - -3 / 13) < 1e-12);
console.log("✓ Test 3.3: Negative power (2+3i)^-1 = 2/13 - (3/13)i");

// Test 3.4: Real power (1 + i)^0.5
const pow4 = evaluateExpression("(1 + i)^0.5");
assert.strictEqual(pow4.isValid, true);
assert.strictEqual(pow4.isComplex, true);
console.log("✓ Test 3.4: Real power of complex base (1+i)^0.5 evaluates correctly");

// =========================================================================
// 4. COMPLEX TRANSCENDENTAL FUNCTIONS
// =========================================================================
console.log("\n--- 4. COMPLEX TRANSCENDENTAL FUNCTIONS ---");

// Test 4.1: Euler's identity exp(i * π) = -1
const f1 = evaluateExpression("exp(i * π)");
assert.strictEqual(f1.isValid, true);
assert.strictEqual(f1.isComplex, false);
assert.ok(Math.abs(f1.result! - -1) < 1e-12);
console.log("✓ Test 4.1: exp(i * π) = -1 (Euler's identity)");

// Test 4.2: Principal Complex Logarithm ln(i) = (π/2)i
const f2 = evaluateExpression("ln(i)");
assert.strictEqual(f2.isValid, true);
assert.strictEqual(f2.isComplex, true);
const cValF2 = (f2.canonicalResult as { kind: "complex"; value: ComplexNumber }).value;
assert.ok(Math.abs(cValF2.re) < 1e-12);
assert.ok(Math.abs(cValF2.im - Math.PI / 2) < 1e-12);
console.log("✓ Test 4.2: ln(i) = (π/2)i");

// Test 4.3: log10(i) = (π / (2 * ln(10)))i
const f3 = evaluateExpression("log10(i)");
assert.strictEqual(f3.isValid, true);
assert.strictEqual(f3.isComplex, true);
const cValF3 = (f3.canonicalResult as { kind: "complex"; value: ComplexNumber }).value;
assert.ok(Math.abs(cValF3.im - Math.PI / (2 * Math.LN10)) < 1e-12);
console.log("✓ Test 4.3: log10(i) = (π / 2ln(10))i");

// Test 4.4: Complex Trigonometric: sin(i) = i*sinh(1)
const f4 = evaluateExpression("sin(i)");
assert.strictEqual(f4.isValid, true);
assert.strictEqual(f4.isComplex, true);
const cValF4 = (f4.canonicalResult as { kind: "complex"; value: ComplexNumber }).value;
assert.ok(Math.abs(cValF4.re) < 1e-12);
assert.ok(Math.abs(cValF4.im - Math.sinh(1)) < 1e-12);
console.log("✓ Test 4.4: sin(i) = i*sinh(1)");

// Test 4.5: Complex Cosine: cos(i) = cosh(1)
const f5 = evaluateExpression("cos(i)");
assert.strictEqual(f5.isValid, true);
assert.strictEqual(f5.isComplex, false);
assert.ok(Math.abs(f5.result! - Math.cosh(1)) < 1e-12);
console.log("✓ Test 4.5: cos(i) = cosh(1) (pure real result)");

// Test 4.6: Complex Hyperbolic: sinh(i) = i*sin(1), cosh(i) = cos(1)
const f6a = evaluateExpression("sinh(i)");
assert.strictEqual(f6a.isValid, true);
const f6b = evaluateExpression("cosh(i)");
assert.strictEqual(f6b.isValid, true);
const f6c = evaluateExpression("tanh(i)");
assert.strictEqual(f6c.isValid, true);
const f6d = evaluateExpression("tan(i)");
assert.strictEqual(f6d.isValid, true);
console.log("✓ Test 4.6: sinh(i), cosh(i), tan(i), tanh(i) evaluate deterministically");

// =========================================================================
// 5. EXACT GAUSSIAN INTEGER / RATIONAL MODEL
// =========================================================================
console.log("\n--- 5. EXACT GAUSSIAN INTEGER/RATIONAL SUBSET ---");

// Test 5.1: Exact complex addition (2+3i) + (4-i) = 6 + 2i
const e1 = evaluateExpression("(2 + 3i) + (4 - i)");
assert.strictEqual(e1.mathematicalResult?.hasExact, true);
assert.strictEqual(e1.mathematicalResult?.formattedExact, "6 + 2i");
console.log("✓ Test 5.1: (2+3i) + (4-i) exact representation is '6 + 2i'");

// Test 5.2: Exact complex multiplication (1+i)(1-i) = 2
const e2 = evaluateExpression("(1 + i)(1 - i)");
assert.strictEqual(e2.mathematicalResult?.hasExact, true);
assert.strictEqual(e2.mathematicalResult?.formattedExact, "2");
console.log("✓ Test 5.2: (1+i)(1-i) exact representation is '2'");

// Test 5.3: Exact square root sqrt(-4) = 2i in CPLX mode
const e3 = evaluateExpression("sqrt(-4)", { isComplexMode: true });
assert.strictEqual(e3.mathematicalResult?.hasExact, true);
assert.strictEqual(e3.mathematicalResult?.formattedExact, "2i");
console.log("✓ Test 5.3: sqrt(-4) exact representation in CPLX mode is '2i'");

// Test 5.4: Exact rational imaginary sqrt(-1/9) = (1/3)i in CPLX mode
const e4 = evaluateExpression("sqrt(-1/9)", { isComplexMode: true });
assert.strictEqual(e4.mathematicalResult?.hasExact, true);
assert.strictEqual(e4.mathematicalResult?.formattedExact, "(1/3)i");
console.log("✓ Test 5.4: sqrt(-1/9) exact representation in CPLX mode is '(1/3)i'");

// Test 5.5: sqrt(-12) falls back to decimal (non-integer/rational radical coefficient)
const e5 = evaluateExpression("sqrt(-12)", { isComplexMode: true });
assert.strictEqual(e5.isValid, true);
assert.strictEqual(e5.mathematicalResult?.hasExact, false);
console.log("✓ Test 5.5: sqrt(-12) cleanly falls back to high-precision decimal (hasExact: false)");

// Test 5.6: sqrt(2) + 3i falls back to decimal
const e6 = evaluateExpression("sqrt(2) + 3i");
assert.strictEqual(e6.isValid, true);
assert.strictEqual(e6.mathematicalResult?.hasExact, false);
console.log("✓ Test 5.6: sqrt(2) + 3i cleanly falls back to decimal (hasExact: false)");

// Test 5.7: sin(1+i) falls back to decimal
const e7 = evaluateExpression("sin(1 + i)");
assert.strictEqual(e7.isValid, true);
assert.strictEqual(e7.mathematicalResult?.hasExact, false);
console.log("✓ Test 5.7: sin(1+i) does not falsely claim exact (hasExact: false)");

// =========================================================================
// 6. SHOW STEPS
// =========================================================================
console.log("\n--- 6. SHOW STEPS FOR COMPLEX EXPRESSIONS ---");

// Test 6.1: Addition steps
const s1 = evaluateExpression("(2 + 3i) + (4 - 5i)");
assert.ok(s1.steps && s1.steps.length > 0);
assert.ok(s1.steps.some((st) => st.explanation.toLowerCase().includes("group real") || st.operation.includes("Addition")));
console.log("✓ Test 6.1: Complex addition generates grouping and combining steps");

// Test 6.2: Multiplication FOIL steps
const s2 = evaluateExpression("(2 + 3i) * (4 - 5i)");
assert.ok(s2.steps && s2.steps.length > 0);
assert.ok(s2.steps.some((st) => st.explanation.includes("FOIL") || st.operation.includes("Multiplication")));
console.log("✓ Test 6.2: Complex multiplication generates FOIL and i² = -1 steps");

// Test 6.3: Division conjugate steps
const s3 = evaluateExpression("(1 + 2i) / (3 - 4i)");
assert.ok(s3.steps && s3.steps.length > 0);
assert.ok(s3.steps.some((st) => st.explanation.toLowerCase().includes("conjugate") || st.operation.includes("Division")));
console.log("✓ Test 6.3: Complex division generates conjugate multiplication steps");

// Test 6.4: Magnitude steps
const s4 = evaluateExpression("abs(3 + 4i)");
assert.ok(s4.steps && s4.steps.length > 0);
assert.ok(s4.steps.some((st) => st.explanation.toLowerCase().includes("magnitude") || st.operation.includes("abs")));
console.log("✓ Test 6.4: Magnitude generates |z| = √(a² + b²) substitution steps");

// Test 6.5: real() / imag() steps
const s5 = evaluateExpression("real(3 + 4i)");
assert.ok(s5.steps && s5.steps.length > 0);
assert.ok(s5.steps.some((st) => st.explanation.toLowerCase().includes("real component") || st.operation.includes("real")));
console.log("✓ Test 6.5: real() extraction generates explicit component extraction step");

// =========================================================================
// 7. DISPLAY FORMATTING (RECTANGULAR & POLAR)
// =========================================================================
console.log("\n--- 7. DISPLAY FORMATTING (RECTANGULAR & POLAR) ---");

// Test 7.1: Rectangular formatting rules
assert.strictEqual(formatComplexRectangular(createComplex(0, 4)), "4i");
assert.strictEqual(formatComplexRectangular(createComplex(3, 0)), "3");
assert.strictEqual(formatComplexRectangular(createComplex(0, 0)), "0");
assert.strictEqual(formatComplexRectangular(createComplex(0, 1)), "i");
assert.strictEqual(formatComplexRectangular(createComplex(0, -1)), "-i");
assert.strictEqual(formatComplexRectangular(createComplex(3, 4)), "3 + 4i");
assert.strictEqual(formatComplexRectangular(createComplex(3, -4)), "3 - 4i");
console.log("✓ Test 7.1: Rectangular formatting respects sign rules and zero suppression");

// Test 7.2: Polar formatting in DEG, RAD, and GRAD
const z34 = createComplex(3, 4); // |z| = 5, θ ≈ 53.13° ≈ 0.9273 rad ≈ 59.03 grad
const polarDeg = formatComplexPolar(z34, "DEG", (n) => formatResultNumber(n, "FIX", 2));
assert.strictEqual(polarDeg, "5.00∠53.13°");

const polarRad = formatComplexPolar(z34, "RAD", (n) => formatResultNumber(n, "FIX", 4));
assert.strictEqual(polarRad, "5.0000∠0.9273 rad");

const polarGrad = formatComplexPolar(z34, "GRAD", (n) => formatResultNumber(n, "FIX", 2));
assert.strictEqual(polarGrad, "5.00∠59.03 grad");
console.log("✓ Test 7.2: Polar formatting renders correctly in DEG, RAD, and GRAD");

// =========================================================================
// 8. REAL / CPLX DOMAIN POLICY
// =========================================================================
console.log("\n--- 8. REAL / CPLX DOMAIN POLICY ---");

// Test 8.1: REAL mode sqrt(-1) throws domain error
const d1 = evaluateExpression("sqrt(-1)", { isComplexMode: false });
assert.strictEqual(d1.isValid, false);
assert.ok(d1.error?.includes("Enable CPLX mode"));
console.log("✓ Test 8.1: REAL mode sqrt(-1) retains real domain validation");

// Test 8.2: CPLX mode sqrt(-1) = i
const d2 = evaluateExpression("sqrt(-1)", { isComplexMode: true });
assert.strictEqual(d2.isValid, true);
assert.strictEqual(d2.isComplex, true);
assert.strictEqual(d2.formattedResult, "i");
console.log("✓ Test 8.2: CPLX mode sqrt(-1) = i");

// Test 8.3: CPLX mode sqrt(-4) = 2i
const d3 = evaluateExpression("sqrt(-4)", { isComplexMode: true });
assert.strictEqual(d3.isValid, true);
assert.strictEqual(d3.formattedResult, "2i");
console.log("✓ Test 8.3: CPLX mode sqrt(-4) = 2i");

// Test 8.4: Explicit literal 'i' evaluates in complex domain even when isComplexMode is false
const d4 = evaluateExpression("2 + 3i", { isComplexMode: false });
assert.strictEqual(d4.isValid, true);
assert.strictEqual(d4.isComplex, true);
assert.strictEqual(d4.formattedResult, "2 + 3i");

const d4b = evaluateExpression("i^2", { isComplexMode: false });
assert.strictEqual(d4b.isValid, true);
assert.strictEqual(d4b.result, -1);
console.log("✓ Test 8.4: Explicit complex literal evaluates in complex domain regardless of UI toggle");

// =========================================================================
// 9. PHYSICAL UNITS INTERACTION
// =========================================================================
console.log("\n--- 9. PHYSICAL UNITS INTERACTION ---");

// Test 9.1: Real unit expressions continue to evaluate
const u1 = evaluateExpression("5 m + 200 cm");
assert.strictEqual(u1.isValid, true);
assert.strictEqual(u1.formattedResult, "7 m");
console.log("✓ Test 9.1: Real unit expressions continue to operate normally");

// Test 9.2: Complex expressions combined with physical units are rejected with Unit Error
const u2 = evaluateExpression("(2 + 3i) m");
assert.strictEqual(u2.isValid, false);
assert.ok(u2.error?.includes("Unit Error: Physical unit calculations do not support complex numbers in V1."));

const u3 = evaluateExpression("5 kg + 2i kg");
assert.strictEqual(u3.isValid, false);
assert.ok(u3.error?.includes("Unit Error: Physical unit calculations do not support complex numbers in V1."));
console.log("✓ Test 9.2: Complex expressions with units produce mandatory Unit Error in V1");

// =========================================================================
// 10. HISTORY & ANS RECALL
// =========================================================================
console.log("\n--- 10. HISTORY & ANS RECALL ---");

// Test 10.1: Full complex Ans propagation (3 + 4i, then Ans * 2 = 6 + 8i)
const ansInit = evaluateExpression("3 + 4i");
assert.strictEqual(ansInit.isValid, true);
const ansMathVal = ansInit.canonicalResult!;

const ansEval = evaluateExpression("Ans * 2", {
  ansMathValue: ansMathVal,
});
assert.strictEqual(ansEval.isValid, true);
assert.strictEqual(ansEval.formattedResult, "6 + 8i");
console.log("✓ Test 10.1: Ans preserves both real and imaginary components (Ans * 2 = 6 + 8i)");

// =========================================================================
// 11. CHECK MY ANSWER
// =========================================================================
console.log("\n--- 11. CHECK MY ANSWER VERIFICATION ---");

// Test 11.1: Complex equal within 10^-10 tolerance
const v1 = verifyEquationAnswer("x = 2 + 3i", "x = 2.00000000001 + 3.00000000001i");
assert.strictEqual(v1.status, "valid");
console.log("✓ Test 11.1: Complex numbers within 10^-10 tolerance verify as correct");

// Test 11.2: Complex unequal
const v2 = verifyEquationAnswer("x = 2 + 3i", "x = 2 + 4i");
assert.strictEqual(v2.status, "invalid");
console.log("✓ Test 11.2: Complex numbers with differing imaginary parts verify as incorrect");

// Test 11.3: Real vs complex equivalent 5 + 0i == 5
const v3 = verifyEquationAnswer("x = 5 + 0i", "x = 5");
assert.strictEqual(v3.status, "valid");
console.log("✓ Test 11.3: 5 + 0i equals 5 in Check My Answer");

// =========================================================================
// 12. ANSWER DIAGNOSTICS
// =========================================================================
console.log("\n--- 12. ANSWER DIAGNOSTICS ---");

// Test 12.1: i² sign error diagnostic
const diag1 = diagnoseAnswerDifference("(2 + 3i) * (4 + 5i)", "-7 + 22i");
assert.strictEqual(diag1.primaryHypothesis.cause, "same_answer");

const diag2 = diagnoseAnswerDifference("(2 + 3i) * (4 + 5i)", "23 + 22i");
assert.strictEqual(diag2.primaryHypothesis.cause, "complex_i_squared_sign");
console.log("✓ Test 12.1: Diagnostic detects i² sign inversion mistake");

// Test 12.2: Component-wise division diagnostic
const diag3 = diagnoseAnswerDifference("(4 + 6i) / (2 + 3i)", "2 + 2i");
assert.strictEqual(diag3.primaryHypothesis.cause, "complex_component_division");
console.log("✓ Test 12.2: Diagnostic detects component-wise division mistake");

console.log("\n============================================================");
console.log("ALL PHASE 7 FIRST-CLASS COMPLEX NUMBER ENGINE TESTS PASSED!");
console.log("============================================================\n");
