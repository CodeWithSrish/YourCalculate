import assert from "node:assert";
import { evaluateExpression, tokenize } from "./scientific";
import { verifyEquationAnswer, parseProposedAnswer } from "./scientificVerify";

console.log("Running Phase 3 Scientific Calculator Exact Math & Verification Tests...\n");

// =========================================================================
// PART 1: EXACT MATHEMATICS COMPOSITION AUDIT
// =========================================================================

// 1. Rationals
const r1 = evaluateExpression("1/2 + 1/3");
assert.strictEqual(r1.mathematicalResult?.formattedExact, "5/6");
console.log("✓ Audit 1: 1/2 + 1/3 = 5/6");

const r2 = evaluateExpression("1/2 - 1/3");
assert.strictEqual(r2.mathematicalResult?.formattedExact, "1/6");
console.log("✓ Audit 2: 1/2 - 1/3 = 1/6");

const r3 = evaluateExpression("2/3 * 3/4");
assert.strictEqual(r3.mathematicalResult?.formattedExact, "1/2");
console.log("✓ Audit 3: 2/3 × 3/4 = 1/2");

const r4 = evaluateExpression("(2/3) / (4/5)");
assert.strictEqual(r4.mathematicalResult?.formattedExact, "5/6");
console.log("✓ Audit 4: 2/3 ÷ 4/5 = 5/6");

const r5 = evaluateExpression("2/4");
assert.strictEqual(r5.mathematicalResult?.formattedExact, "1/2");
console.log("✓ Audit 5: 2/4 = 1/2");

const r6 = evaluateExpression("6/9");
assert.strictEqual(r6.mathematicalResult?.formattedExact, "2/3");
console.log("✓ Audit 6: 6/9 = 2/3");

const r7 = evaluateExpression("-1/2 + 1/4");
assert.strictEqual(r7.mathematicalResult?.formattedExact, "-1/4");
console.log("✓ Audit 7: -1/2 + 1/4 = -1/4");

// 2. Radicals
const rad1 = evaluateExpression("sqrt(2)");
assert.strictEqual(rad1.mathematicalResult?.formattedExact, "√2");
console.log("✓ Audit 8: sqrt(2) = √2");

const rad2 = evaluateExpression("sqrt(8)");
assert.strictEqual(rad2.mathematicalResult?.formattedExact, "2√2");
console.log("✓ Audit 9: sqrt(8) = 2√2");

const rad3 = evaluateExpression("sqrt(18)");
assert.strictEqual(rad3.mathematicalResult?.formattedExact, "3√2");
console.log("✓ Audit 10: sqrt(18) = 3√2");

const rad4 = evaluateExpression("sqrt(50)");
assert.strictEqual(rad4.mathematicalResult?.formattedExact, "5√2");
console.log("✓ Audit 11: sqrt(50) = 5√2");

const rad5 = evaluateExpression("2 * sqrt(8)");
assert.strictEqual(rad5.mathematicalResult?.formattedExact, "4√2");
console.log("✓ Audit 12: 2sqrt(8) = 4√2");

const rad6 = evaluateExpression("sqrt(2) * sqrt(8)");
assert.strictEqual(rad6.mathematicalResult?.formattedExact, "4");
console.log("✓ Audit 13: sqrt(2) × sqrt(8) = 4");

const rad7 = evaluateExpression("sqrt(8) / sqrt(2)");
assert.strictEqual(rad7.mathematicalResult?.formattedExact, "2");
console.log("✓ Audit 14: sqrt(8) / sqrt(2) = 2");

const rad8 = evaluateExpression("sqrt(2) * (3/2)");
assert.strictEqual(rad8.mathematicalResult?.formattedExact, "3√2/2");
console.log("✓ Audit 15: sqrt(2) × 3/2 = 3√2/2");

// 3. Pi
const pi1 = evaluateExpression("π");
assert.strictEqual(pi1.mathematicalResult?.formattedExact, "π");

const pi2 = evaluateExpression("2 * π");
assert.strictEqual(pi2.mathematicalResult?.formattedExact, "2π");

const pi3 = evaluateExpression("π / 2");
assert.strictEqual(pi3.mathematicalResult?.formattedExact, "π/2");

const pi4 = evaluateExpression("2 * (π / 4)");
assert.strictEqual(pi4.mathematicalResult?.formattedExact, "π/2");

const pi5 = evaluateExpression("(3 * π) / 2");
assert.strictEqual(pi5.mathematicalResult?.formattedExact, "3π/2");
console.log("✓ Audit 16: Pi multiples (π, 2π, π/2, 2(π/4)=π/2, 3π/2)");

// 4. Trig Composition
const tr1 = evaluateExpression("sin(30)", { angleMode: "DEG" });
assert.strictEqual(tr1.mathematicalResult?.formattedExact, "1/2");

const tr2 = evaluateExpression("cos(60)", { angleMode: "DEG" });
assert.strictEqual(tr2.mathematicalResult?.formattedExact, "1/2");

const tr3 = evaluateExpression("sin(30) + cos(60)", { angleMode: "DEG" });
assert.strictEqual(tr3.mathematicalResult?.formattedExact, "1");
console.log("✓ Audit 17: sin(30°) + cos(60°) = 1");

const tr4 = evaluateExpression("sin(30) * 2", { angleMode: "DEG" });
assert.strictEqual(tr4.mathematicalResult?.formattedExact, "1");
console.log("✓ Audit 18: sin(30°) × 2 = 1");

const tr5 = evaluateExpression("sin(30) + sqrt(4)", { angleMode: "DEG" });
assert.strictEqual(tr5.mathematicalResult?.formattedExact, "5/2");
console.log("✓ Audit 19: sin(30°) + sqrt(4) = 5/2");

// 5. Mixed
const mix1 = evaluateExpression("sqrt(8) + sqrt(2)");
assert.strictEqual(mix1.mathematicalResult?.formattedExact, "3√2");
console.log("✓ Audit 20: sqrt(8) + sqrt(2) = 3√2");

const mix2 = evaluateExpression("2 + sqrt(8)");
assert.strictEqual(mix2.mathematicalResult?.formattedExact, "2 + 2√2");
console.log("✓ Audit 21: 2 + sqrt(8) = 2 + 2√2");

const mix3 = evaluateExpression("π/2 + π/2");
assert.strictEqual(mix3.mathematicalResult?.formattedExact, "π");
console.log("✓ Audit 22: π/2 + π/2 = π");

// 6. Conservative Fallback on Unsupported Exact Forms
const fb1 = evaluateExpression("sin(17)", { angleMode: "DEG" });
assert.strictEqual(fb1.mathematicalResult?.hasExact, false);
assert.strictEqual(fb1.mathematicalResult?.exact, null);
assert.ok(Math.abs(fb1.result! - 0.29237170472273677) < 1e-10);

const fb2 = evaluateExpression("sqrt(2) + π");
assert.strictEqual(fb2.mathematicalResult?.hasExact, false);
assert.ok(Math.abs(fb2.result! - (Math.SQRT2 + Math.PI)) < 1e-10);
console.log("✓ Audit 23: Unsupported expressions correctly fallback to authoritative decimal");

// =========================================================================
// PART 2: CHECK MY ANSWER VERIFICATION TESTS
// =========================================================================

// Test V0: parseProposedAnswer helper
const p1 = parseProposedAnswer("x = 5", "x");
assert.strictEqual(p1.variable, "x");
assert.strictEqual(p1.numericValue, 5);
const p2 = parseProposedAnswer("1/2", "x");
assert.strictEqual(p2.variable, "x");
assert.strictEqual(p2.numericValue, 0.5);
assert.strictEqual(p2.formattedValue, "1/2");
console.log("✓ Verify 0: parseProposedAnswer parses 'x = 5' and '1/2' cleanly");

// Test V1: 2x + 5 = 15 with x = 5 (Correct)
const v1 = verifyEquationAnswer("2x + 5 = 15", "x = 5");
assert.strictEqual(v1.status, "valid");
assert.strictEqual(v1.variable, "x");
assert.strictEqual(v1.lhs?.numericResult, 15);
assert.strictEqual(v1.rhs?.numericResult, 15);
assert.strictEqual(v1.difference, 0);
assert.ok(v1.message.includes("Correct"));
assert.ok(v1.detailedSteps.length >= 4);
console.log("✓ Verify 1: 2x + 5 = 15 with x = 5 satisfies equation");

// Test V2: 2x + 5 = 15 with 5 (Implicit variable name)
const v2 = verifyEquationAnswer("2x + 5 = 15", "5");
assert.strictEqual(v2.status, "valid");
assert.strictEqual(v2.variable, "x");
console.log("✓ Verify 2: 2x + 5 = 15 with answer '5' is accepted and verified");

// Test V3: 2x + 5 = 15 with x = 4 (Incorrect)
const v3 = verifyEquationAnswer("2x + 5 = 15", "x = 4");
assert.strictEqual(v3.status, "invalid");
assert.strictEqual(v3.lhs?.numericResult, 13);
assert.strictEqual(v3.rhs?.numericResult, 15);
assert.strictEqual(v3.difference, -2);
assert.ok(v3.message.includes("Does not satisfy"));
console.log("✓ Verify 3: 2x + 5 = 15 with x = 4 correctly rejected with difference explanation");

// Test V4: 3x = 12 with x = 4
const v4 = verifyEquationAnswer("3x = 12", "x = 4");
assert.strictEqual(v4.status, "valid");
console.log("✓ Verify 4: 3x = 12 with x = 4 satisfies equation");

// Test V5: x + 7 = 10 with x = 3
const v5 = verifyEquationAnswer("x + 7 = 10", "x = 3");
assert.strictEqual(v5.status, "valid");
console.log("✓ Verify 5: x + 7 = 10 with x = 3 satisfies equation");

// Test V6: 2(x + 3) = 14 with x = 4
const v6 = verifyEquationAnswer("2(x + 3) = 14", "x = 4");
assert.strictEqual(v6.status, "valid");
assert.strictEqual(v6.lhs?.numericResult, 14);
console.log("✓ Verify 6: 2(x + 3) = 14 with x = 4 satisfies equation");

// Test V7: x/2 = 5 with x = 10
const v7 = verifyEquationAnswer("x/2 = 5", "x = 10");
assert.strictEqual(v7.status, "valid");
console.log("✓ Verify 7: x/2 = 5 with x = 10 satisfies equation");

// Test V8: Exact fraction verification: 2x = 1 with x = 1/2
const v8 = verifyEquationAnswer("2x = 1", "x = 1/2");
assert.strictEqual(v8.status, "valid");
assert.strictEqual(v8.lhs?.numericResult, 1);
assert.strictEqual(v8.rhs?.numericResult, 1);
console.log("✓ Verify 8: 2x = 1 with x = 1/2 exact fraction verification satisfies equation");

// Test V9: Variable name y: 4y - 2 = 10 with y = 3
const v9 = verifyEquationAnswer("4y - 2 = 10", "y = 3");
assert.strictEqual(v9.status, "valid");
assert.strictEqual(v9.variable, "y");
console.log("✓ Verify 9: Custom variable 'y' in 4y - 2 = 10 correctly detected and verified");

// Test V10: Floating point tolerance check (x = 5.00000000000001 satisfies within 1e-10)
const v10 = verifyEquationAnswer("2x + 5 = 15", "x = 5.00000000000001");
assert.strictEqual(v10.status, "valid");
console.log("✓ Verify 10: Floating point numerical tolerance policy applied safely");

// Test V11: Floating point non-tolerance check (x = 5.0001 fails)
const v11 = verifyEquationAnswer("2x + 5 = 15", "x = 5.0001");
assert.strictEqual(v11.status, "invalid");
console.log("✓ Verify 11: Significant decimal deviation is rejected");

// Test V12: Invalid input (malformed text)
const v12 = verifyEquationAnswer("2x + 5 = 15", "x = abc");
assert.strictEqual(v12.status, "invalidInput");
console.log("✓ Verify 12: Malformed answer 'x = abc' safely returns invalidInput");

// Test V13: Malformed equation (no equal sign)
const v13 = verifyEquationAnswer("2x + 5", "x = 5");
assert.strictEqual(v13.status, "invalidInput");
console.log("✓ Verify 13: Missing equal sign returns invalidInput");

// Test V14: No variable in equation
const v14 = verifyEquationAnswer("2 + 5 = 7", "x = 5");
assert.strictEqual(v14.status, "unsupported");
console.log("✓ Verify 14: Equation with no variable returns unsupported");

// Test V15: Multi-variable equation
const v15 = verifyEquationAnswer("2x + 3y = 12", "x = 3");
assert.strictEqual(v15.status, "unsupported");
console.log("✓ Verify 15: Multi-variable equation safely flagged as unsupported");

// Test V16: Security test - blocked JS prototype/eval injection
assert.throws(() => {
  tokenize("constructor");
});
assert.throws(() => {
  tokenize("__proto__");
});
const sec1 = evaluateExpression("constructor");
assert.strictEqual(sec1.isValid, false);
const sec2 = evaluateExpression("__proto__");
assert.strictEqual(sec2.isValid, false);
console.log("✓ Verify 16: Security protection prevents prototype and identifier execution");

console.log("\nAll Phase 3 Exact Math and Check My Answer verification tests passed successfully!");
