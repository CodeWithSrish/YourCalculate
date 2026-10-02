import assert from "node:assert";
import {
  diagnoseAnswerDifference,
  generateAlternativeInterpretations,
} from "./scientificDiagnostics";

console.log("Running Phase 4 Scientific Calculator Answer Diagnostics Tests...\n");

// -------------------------------------------------------------------------
// Test 1: Operator Precedence (Addition before Multiplication)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("2 + 3 * 4", "20", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.calculatorNumericResult, 14);
  assert.strictEqual(diag.userNumericAnswer, 20);
  assert.strictEqual(diag.primaryHypothesis.cause, "operator_precedence");
  assert.strictEqual(diag.primaryHypothesis.confidence, "exact_match");
  assert(
    diag.primaryHypothesis.explanation.includes("(2 + 3) * 4") ||
    diag.primaryHypothesis.explanation.includes("(2 + 3) × 4") ||
    diag.primaryHypothesis.userInterpretationExpression?.includes("(2 + 3)")
  );
  console.log("✓ Test 1: 2 + 3 * 4 with user answer 20 correctly diagnoses operator precedence ((2+3)*4)");
}

// -------------------------------------------------------------------------
// Test 2: Parentheses Difference (Subtraction before Multiplication)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("10 - 2 * 3", "24", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.calculatorNumericResult, 4);
  assert.strictEqual(diag.userNumericAnswer, 24);
  assert.strictEqual(diag.primaryHypothesis.cause, "operator_precedence");
  assert.strictEqual(diag.primaryHypothesis.confidence, "exact_match");
  assert(diag.primaryHypothesis.userInterpretationExpression?.includes("(10 - 2)"));
  console.log("✓ Test 2: 10 - 2 * 3 with user answer 24 correctly diagnoses (10-2)*3");
}

// -------------------------------------------------------------------------
// Test 3: Multiplication before Exponentiation (2 * 3 ^ 2)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("2 * 3 ^ 2", "36", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.calculatorNumericResult, 18);
  assert.strictEqual(diag.userNumericAnswer, 36);
  assert.strictEqual(diag.primaryHypothesis.cause, "operator_precedence");
  console.log("✓ Test 3: 2 * 3 ^ 2 with user answer 36 correctly diagnoses (2 * 3) ^ 2");
}

// -------------------------------------------------------------------------
// Test 4: Exponent Associativity (2^3^2 = 512 vs (2^3)^2 = 64)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("2^3^2", "64", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.calculatorNumericResult, 512);
  assert.strictEqual(diag.userNumericAnswer, 64);
  assert.strictEqual(diag.primaryHypothesis.cause, "operator_precedence");
  assert.strictEqual(diag.primaryHypothesis.confidence, "exact_match");
  console.log("✓ Test 4: 2^3^2 with user answer 64 correctly diagnoses (2^3)^2 left-associative exponentiation");
}

// -------------------------------------------------------------------------
// Test 5: Same Answer (No Difference Detected)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("2 + 3 * 4", "14", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.primaryHypothesis.cause, "same_answer");
  assert.strictEqual(diag.primaryHypothesis.confidence, "exact_match");
  console.log("✓ Test 5: 2 + 3 * 4 with user answer 14 returns same_answer confirmation");
}

// -------------------------------------------------------------------------
// Test 6: Angle Mode Mismatch (User answer in DEG while calculator in RAD)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("sin(30)", "0.5", { angleMode: "RAD" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.primaryHypothesis.cause, "angle_mode_mismatch");
  assert.strictEqual(diag.primaryHypothesis.confidence, "exact_match");
  assert(diag.primaryHypothesis.explanation.includes("DEG"));
  console.log("✓ Test 6: sin(30) in RAD with user answer 0.5 detects DEG angle mode mismatch");
}

// -------------------------------------------------------------------------
// Test 7: Rounding & Approximation (Pi vs 3.14)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("pi", "3.14", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.primaryHypothesis.cause, "rounding_or_approximation");
  assert.strictEqual(diag.primaryHypothesis.confidence, "approximate_match");
  console.log("✓ Test 7: pi with user answer 3.14 detects decimal rounding approximation");
}

// -------------------------------------------------------------------------
// Test 8: Rounding & Approximation (sqrt(2) vs 1.414)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("sqrt(2)", "1.414", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.primaryHypothesis.cause, "rounding_or_approximation");
  console.log("✓ Test 8: sqrt(2) with user answer 1.414 detects decimal approximation");
}

// -------------------------------------------------------------------------
// Test 9: Sign Error (Opposite Sign)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("15 - 8", "-7", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.calculatorNumericResult, 7);
  assert.strictEqual(diag.userNumericAnswer, -7);
  assert.strictEqual(diag.primaryHypothesis.cause, "sign_error");
  console.log("✓ Test 9: 15 - 8 with user answer -7 detects opposite sign error");
}

// -------------------------------------------------------------------------
// Test 10: Reciprocal / Inverted Division
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("20 / 4", "0.2", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.calculatorNumericResult, 5);
  assert.strictEqual(diag.userNumericAnswer, 0.2);
  assert.strictEqual(diag.primaryHypothesis.cause, "reciprocal_error");
  console.log("✓ Test 10: 20 / 4 with user answer 0.2 detects inverted division / reciprocal");
}

// -------------------------------------------------------------------------
// Test 11: Percentage Scale / Factor of 100
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("0.25", "25", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.primaryHypothesis.cause, "percentage_scale");
  console.log("✓ Test 11: 0.25 with user answer 25 detects factor of 100 scale");
}

// -------------------------------------------------------------------------
// Test 12: Unexplained Difference (No Fabrication)
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("2 + 3 * 4", "15", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "success");
  assert.strictEqual(diag.calculatorNumericResult, 14);
  assert.strictEqual(diag.userNumericAnswer, 15);
  assert.strictEqual(diag.primaryHypothesis.cause, "unexplained_difference");
  assert.strictEqual(diag.primaryHypothesis.confidence, "unverified");
  assert(diag.primaryHypothesis.explanation.includes("does not match common"));
  console.log("✓ Test 12: 2 + 3 * 4 with arbitrary 15 does not fabricate an explanation");
}

// -------------------------------------------------------------------------
// Test 13: Invalid user answer input
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("2 + 3 * 4", "abc", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "invalid_input");
  assert.strictEqual(diag.primaryHypothesis.cause, "invalid_input");
  console.log("✓ Test 13: Invalid answer 'abc' handled safely without throwing error");
}

// -------------------------------------------------------------------------
// Test 14: Empty expression or answer input
// -------------------------------------------------------------------------
{
  const diag1 = diagnoseAnswerDifference("", "20");
  assert.strictEqual(diag1.status, "invalid_input");

  const diag2 = diagnoseAnswerDifference("2 + 3", "");
  assert.strictEqual(diag2.status, "invalid_input");
  console.log("✓ Test 14: Empty expression / answer handled safely");
}

// -------------------------------------------------------------------------
// Test 15: Security protection against code injection
// -------------------------------------------------------------------------
{
  const diag = diagnoseAnswerDifference("2 + 3", "console.log(1)", { angleMode: "DEG" });
  assert.strictEqual(diag.status, "invalid_input");
  console.log("✓ Test 15: Code injection attempts safely rejected");
}

// -------------------------------------------------------------------------
// Test 16: Alternative interpretation generator coverage
// -------------------------------------------------------------------------
{
  const alts = generateAlternativeInterpretations("2 + 3 * 4");
  assert(alts.length >= 2);
  assert(alts.some((a) => a.expression.includes("(2 + 3)")));
  console.log("✓ Test 16: Alternative candidate generator produces valid AST variations");
}

console.log("\nAll Phase 4 Scientific Calculator Answer Diagnostics tests passed successfully!\n");
