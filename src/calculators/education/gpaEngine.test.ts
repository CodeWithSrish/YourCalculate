import assert from "node:assert";
import {
  calculateCourseGpa,
  calculateSimpleGpa,
  calculateCumulativeGpa,
  calculateWeightedGpa,
} from "./gpaEngine";

console.log("Running International GPA Calculator Engine Tests...\n");

// ==========================================
// 1. CORE COURSE & SEMESTER GPA TESTS
// ==========================================

// Test 1: Single course (Calculus: A, 4.0 GP, 4 credits)
const test1 = calculateCourseGpa([
  { id: "1", name: "Calculus", grade: "A", credits: 4 },
]);
assert.strictEqual(test1.isValid, true);
assert.strictEqual(test1.formattedGpa, "4");
assert.strictEqual(test1.totalCredits, 4);
assert.strictEqual(test1.totalQualityPoints, 16);
console.log("✓ Test 1: Single course (A @ 4 cr) = 4.00 GPA");

// Test 2: Standard semester with plus/minus grades
// Calculus (A-, 3.7, 4cr = 14.8 QP), Physics (B+, 3.3, 4cr = 13.2 QP), Literature (A, 4.0, 3cr = 12.0 QP), History (B, 3.0, 3cr = 9.0 QP)
// Total QP = 14.8 + 13.2 + 12.0 + 9.0 = 49.0; Total Credits = 14.0; GPA = 49 / 14 = 3.50
const test2 = calculateCourseGpa([
  { id: "1", name: "Calculus", grade: "A-", credits: 4 },
  { id: "2", name: "Physics", grade: "B+", credits: 4 },
  { id: "3", name: "Literature", grade: "A", credits: 3 },
  { id: "4", name: "History", grade: "B", credits: 3 },
]);
assert.strictEqual(test2.isValid, true);
assert.strictEqual(test2.formattedGpa, "3.5");
assert.strictEqual(test2.totalCredits, 14);
assert.strictEqual(test2.totalQualityPoints, 49);
console.log("✓ Test 2: Standard 4-course semester (49 QP / 14 cr) = 3.50 GPA");

// Test 3: Decimal credit hours (0.5, 1.5, 3.5 credits)
const test3 = calculateCourseGpa([
  { id: "1", name: "Lab", grade: "A", credits: 1.5 },
  { id: "2", name: "Seminar", grade: "B", credits: 0.5 },
  { id: "3", name: "Core", grade: "A-", credits: 3.5 },
]);
// 1.5*4.0 (6.0) + 0.5*3.0 (1.5) + 3.5*3.7 (12.95) = 20.45 QP / 5.5 cr = 3.71818... -> 3.72
assert.strictEqual(test3.isValid, true);
assert.strictEqual(test3.formattedGpa, "3.72");
assert.strictEqual(test3.totalCredits, 5.5);
console.log("✓ Test 3: Decimal credit hours (1.5, 0.5, 3.5) = 3.72 GPA");

// Test 4: All failing grades (0.00 GPA)
const test4 = calculateCourseGpa([
  { id: "1", name: "Course 1", grade: "F", credits: 3 },
  { id: "2", name: "Course 2", grade: "F", credits: 3 },
]);
assert.strictEqual(test4.isValid, true);
assert.strictEqual(test4.formattedGpa, "0");
assert.strictEqual(test4.totalQualityPoints, 0);
assert.strictEqual(test4.totalCredits, 6);
console.log("✓ Test 4: All F grades = 0.00 GPA cleanly handled");

// Test 5: 50 dynamic course rows
const fiftyCourses = Array.from({ length: 50 }, (_, i) => ({
  id: `c-${i}`,
  name: `Course ${i + 1}`,
  grade: i % 2 === 0 ? "A" : "B",
  credits: 3,
}));
const test5 = calculateCourseGpa(fiftyCourses);
assert.strictEqual(test5.isValid, true);
assert.strictEqual(test5.totalCredits, 150);
assert.strictEqual(test5.formattedGpa, "3.5");
console.log("✓ Test 5: 50 dynamic course rows scaled seamlessly");

// Test 6: Empty course list rejection
const test6 = calculateCourseGpa([]);
assert.strictEqual(test6.isValid, false);
assert.strictEqual(test6.error, "Please add at least one course.");
console.log("✓ Test 6: Empty course list rejected with clear error");

// Test 7: Zero credits rejection
const test7 = calculateCourseGpa([
  { id: "1", name: "Physics", grade: "A", credits: 0 },
]);
assert.strictEqual(test7.isValid, false);
assert.ok(test7.error?.includes("credit hours greater than 0"));
console.log("✓ Test 7: Zero credits rejected");

// Test 8: Negative credits rejection
const test8 = calculateCourseGpa([
  { id: "1", name: "Chemistry", grade: "A", credits: -3 },
]);
assert.strictEqual(test8.isValid, false);
assert.ok(test8.error?.includes("credit hours greater than 0"));
console.log("✓ Test 8: Negative credits rejected");

// Test 9: Invalid letter grade rejection
const test9 = calculateCourseGpa([
  { id: "1", name: "Biology", grade: "XYZ", credits: 3 },
]);
assert.strictEqual(test9.isValid, false);
assert.ok(test9.error?.includes("Invalid grade"));
console.log("✓ Test 9: Invalid letter grade rejected");

// ==========================================
// 2. PASS / FAIL (P/NP) COURSE TESTS
// ==========================================

// Test 10: Mixed graded courses and Pass/No-Pass courses
// Math (A, 4.0, 4cr = 16 QP), Phys Ed (P, 0 QP, 2cr earned), Research (NP, 0 QP, 1cr unearned)
// Total GPA Credits = 4.0; Total Credits = 7.0; Total Earned Credits = 6.0; Total QP = 16.0; GPA = 16 / 4 = 4.00
const test10 = calculateCourseGpa([
  { id: "1", name: "Math", grade: "A", credits: 4 },
  { id: "2", name: "Phys Ed", grade: "P", credits: 2 },
  { id: "3", name: "Research", grade: "NP", credits: 1 },
]);
assert.strictEqual(test10.isValid, true);
assert.strictEqual(test10.formattedGpa, "4");
assert.strictEqual(test10.gpaCredits, 4);
assert.strictEqual(test10.totalCredits, 7);
assert.strictEqual(test10.earnedCredits, 6);
assert.strictEqual(test10.totalQualityPoints, 16);
console.log("✓ Test 10: Pass/Fail courses (P/NP) correctly excluded from GPA quality points & divisor");

// Test 11: All courses Pass/Fail
const test11 = calculateCourseGpa([
  { id: "1", name: "Internship", grade: "P", credits: 6 },
]);
assert.strictEqual(test11.isValid, true);
assert.strictEqual(test11.formattedGpa, "N/A");
assert.strictEqual(test11.earnedCredits, 6);
assert.ok(test11.stepExplanation?.includes("non-GPA credit courses"));
console.log("✓ Test 11: All-Pass semester yields N/A GPA with 6 earned credits");

// ==========================================
// 3. SIMPLE GPA MODE TESTS
// ==========================================

// Test 12: Simple GPA with A, A-, B+, B
// (4.0 + 3.7 + 3.3 + 3.0) / 4 = 14.0 / 4 = 3.50
const test12 = calculateSimpleGpa(["A", "A-", "B+", "B"]);
assert.strictEqual(test12.isValid, true);
assert.strictEqual(test12.formattedGpa, "3.5");
assert.strictEqual(test12.totalCourses, 4);
assert.ok(test12.stepExplanation?.includes("equal credit weight"));
console.log("✓ Test 12: Simple GPA [A, A-, B+, B] = 3.50 GPA");

// Test 13: Simple GPA with invalid grade
const test13 = calculateSimpleGpa(["A", "INVALID"]);
assert.strictEqual(test13.isValid, false);
assert.ok(test13.error?.includes("not recognized"));
console.log("✓ Test 13: Invalid grade in Simple GPA rejected");

// ==========================================
// 4. CUMULATIVE GPA TESTS
// ==========================================

// Test 14: Prior Cumulative (3.60 on 60 cr) + Current Semester (3.80 on 15 cr)
// QP = (3.60 * 60) + (3.80 * 15) = 216 + 57 = 273; Total Credits = 75; Cumulative GPA = 273 / 75 = 3.64
const test14 = calculateCumulativeGpa({
  previousGpa: 3.6,
  previousCredits: 60,
  currentGpa: 3.8,
  currentCredits: 15,
});
assert.strictEqual(test14.isValid, true);
assert.strictEqual(test14.formattedCumulativeGpa, "3.64");
assert.strictEqual(test14.totalCredits, 75);
assert.strictEqual(test14.totalQualityPoints, 273);
console.log("✓ Test 14: Cumulative GPA (3.60 @ 60cr + 3.80 @ 15cr) = 3.64 GPA");

// Test 15: Cumulative GPA with zero credits rejected
const test15 = calculateCumulativeGpa({
  previousGpa: 3.5,
  previousCredits: 0,
  currentGpa: 3.8,
  currentCredits: 15,
});
assert.strictEqual(test15.isValid, false);
assert.strictEqual(test15.error, "Previous completed credits must be greater than 0.");
console.log("✓ Test 15: Zero previous credits rejected in Cumulative mode");

// Test 16: Cumulative GPA out-of-bounds rejection
const test16 = calculateCumulativeGpa({
  previousGpa: 4.5,
  previousCredits: 60,
  currentGpa: 3.8,
  currentCredits: 15,
  maxGpa: 4.0,
});
assert.strictEqual(test16.isValid, false);
assert.ok(test16.error?.includes("must be between 0.00 and 4"));
console.log("✓ Test 16: Out-of-bounds previous GPA rejected");

// ==========================================
// 5. WEIGHTED GPA TESTS
// ==========================================

// Test 17: Weighted GPA (Regular, Honors +0.5, AP +1.0)
// Course 1 (Regular, A, 4.0 GP, 3 cr = 12.0 unweighted QP, 12.0 weighted QP)
// Course 2 (Honors, A, 4.0 GP + 0.5 boost = 4.5, 3 cr = 12.0 unweighted QP, 13.5 weighted QP)
// Course 3 (AP, A, 4.0 GP + 1.0 boost = 5.0, 3 cr = 12.0 unweighted QP, 15.0 weighted QP)
// Total Credits = 9; Unweighted QP = 36 -> Unweighted GPA = 4.00
// Weighted QP = 12.0 + 13.5 + 15.0 = 40.5 -> Weighted GPA = 40.5 / 9 = 4.50
const test17 = calculateWeightedGpa([
  { id: "1", name: "English", grade: "A", credits: 3, level: "regular" },
  { id: "2", name: "Honors Chemistry", grade: "A", credits: 3, level: "honors" },
  { id: "3", name: "AP Calculus", grade: "A", credits: 3, level: "ap" },
]);
assert.strictEqual(test17.isValid, true);
assert.strictEqual(test17.formattedUnweightedGpa, "4");
assert.strictEqual(test17.formattedWeightedGpa, "4.5");
assert.strictEqual(test17.weightedQualityPoints, 40.5);
console.log("✓ Test 17: Weighted GPA (Regular 4.0, Honors 4.5, AP 5.0) = 4.50 Weighted GPA (4.00 Unweighted)");

// Test 18: Weighted GPA with failing grade (F does not receive weighting boost)
const test18 = calculateWeightedGpa([
  { id: "1", name: "AP History", grade: "F", credits: 3, level: "ap" },
]);
assert.strictEqual(test18.isValid, true);
assert.strictEqual(test18.formattedWeightedGpa, "0");
assert.strictEqual(test18.weightedQualityPoints, 0);
console.log("✓ Test 18: Failing grade (F) in AP course receives no weight boost");

// ==========================================
// 6. DIFFERENT GRADING SCALES TESTS
// ==========================================

// Test 19: Standard 4.0 Letter Scale (without plus/minus)
const test19 = calculateCourseGpa(
  [
    { id: "1", name: "Course A", grade: "A", credits: 3 },
    { id: "2", name: "Course B", grade: "B", credits: 3 },
  ],
  "standard-4-0-letter"
);
// (4.0*3 + 3.0*3) / 6 = 21 / 6 = 3.50
assert.strictEqual(test19.isValid, true);
assert.strictEqual(test19.formattedGpa, "3.5");
console.log("✓ Test 19: Standard 4.0 Letter Grades scale computed accurately");

// Test 20: 5.0 Scale
const test20 = calculateCourseGpa(
  [
    { id: "1", name: "Course A", grade: "A", credits: 4 }, // 5.0 * 4 = 20
    { id: "2", name: "Course B", grade: "B", credits: 4 }, // 4.0 * 4 = 16
  ],
  "scale-5-0"
);
// 36 / 8 = 4.50 GPA
assert.strictEqual(test20.isValid, true);
assert.strictEqual(test20.formattedGpa, "4.5");
console.log("✓ Test 20: 5.0 Scale computed accurately (4.50 on 5.0 scale)");

// Test 21: Custom Scale with direct numeric grade points
const test21 = calculateCourseGpa(
  [
    { id: "1", name: "Special Course 1", grade: "Custom", gradePoint: 3.85, credits: 4 },
    { id: "2", name: "Special Course 2", grade: "Custom", gradePoint: 3.15, credits: 4 },
  ],
  "custom"
);
// (3.85*4 + 3.15*4) / 8 = (15.4 + 12.6) / 8 = 28 / 8 = 3.50
assert.strictEqual(test21.isValid, true);
assert.strictEqual(test21.formattedGpa, "3.5");
console.log("✓ Test 21: Custom numeric grade points calculated accurately");

console.log("\nAll International GPA Calculator tests passed successfully!");
