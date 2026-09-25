import assert from "node:assert";
import {
  calculateSubjectCGPA,
  calculateSemesterCGPA,
  SubjectGradeItem,
  SemesterSGPAItem,
} from "./cgpa";

console.log("Running CGPA & SGPA Calculator Engine Tests...\n");

// --- CGPA SUBJECT-WISE TESTS ---

// 1. One subject
const sub1: SubjectGradeItem[] = [{ id: "1", name: "Math", gradePoint: 9, credits: 4 }];
const res1 = calculateSubjectCGPA(sub1);
assert.strictEqual(res1.isValid, true);
assert.strictEqual(res1.primaryValue, "9 CGPA");
console.log("✓ Test 1: One subject (9.0 GP, 4 credits) = 9.0 CGPA");

// 2. Multiple equal-credit subjects (arithmetic mean equivalence)
const sub2: SubjectGradeItem[] = [
  { id: "1", name: "Subject 1", gradePoint: 8, credits: 3 },
  { id: "2", name: "Subject 2", gradePoint: 9, credits: 3 },
  { id: "3", name: "Subject 3", gradePoint: 10, credits: 3 },
];
const res2 = calculateSubjectCGPA(sub2);
assert.strictEqual(res2.isValid, true);
assert.strictEqual(res2.primaryValue, "9 CGPA");
console.log("✓ Test 2: Multiple equal-credit subjects (8, 9, 10 @ 3 cr) = 9.0 CGPA");

// 3. Multiple unequal-credit subjects
const sub3: SubjectGradeItem[] = [
  { id: "1", name: "Subject 1", gradePoint: 9, credits: 4 }, // 36
  { id: "2", name: "Subject 2", gradePoint: 8, credits: 2 }, // 16 -> total 52 / 6 = 8.6666...
];
const res3 = calculateSubjectCGPA(sub3);
assert.strictEqual(res3.isValid, true);
assert.strictEqual(res3.primaryValue, "8.67 CGPA");
console.log("✓ Test 3: Multiple unequal-credit subjects = 8.67 CGPA");

// 4. Decimal grade points and credits
const sub4: SubjectGradeItem[] = [
  { id: "1", name: "Subject 1", gradePoint: 8.5, credits: 3.5 }, // 29.75
  { id: "2", name: "Subject 2", gradePoint: 9.25, credits: 4.5 }, // 41.625 -> total 71.375 / 8 = 8.921875
];
const res4 = calculateSubjectCGPA(sub4);
assert.strictEqual(res4.isValid, true);
assert.strictEqual(res4.primaryValue, "8.92 CGPA");
console.log("✓ Test 4: Decimal grade points and credits = 8.92 CGPA");

// 5. Zero credits validation
const sub5: SubjectGradeItem[] = [{ id: "1", name: "Subject 1", gradePoint: 9, credits: 0 }];
const res5 = calculateSubjectCGPA(sub5);
assert.strictEqual(res5.isValid, false);
assert.strictEqual(res5.error, "Credits must be greater than 0.");
console.log("✓ Test 5: Zero credits rejected");

// 6. Negative credits validation
const sub6: SubjectGradeItem[] = [{ id: "1", name: "Subject 1", gradePoint: 9, credits: -3 }];
const res6 = calculateSubjectCGPA(sub6);
assert.strictEqual(res6.isValid, false);
assert.strictEqual(res6.error, "Credits must be greater than 0.");
console.log("✓ Test 6: Negative credits rejected");

// 7. Empty subjects array validation
const res7 = calculateSubjectCGPA([]);
assert.strictEqual(res7.isValid, false);
assert.strictEqual(res7.error, "Add at least one valid subject.");
console.log("✓ Test 7: Empty subjects list rejected");

// 8. Grade point > 10 validation
const sub8: SubjectGradeItem[] = [{ id: "1", name: "Subject 1", gradePoint: 10.5, credits: 4 }];
const res8 = calculateSubjectCGPA(sub8);
assert.strictEqual(res8.isValid, false);
assert.strictEqual(res8.error, "Grade point must be between 0 and 10.");
console.log("✓ Test 8: Grade point > 10 rejected");

// 9. Negative grade point validation
const sub9: SubjectGradeItem[] = [{ id: "1", name: "Subject 1", gradePoint: -1, credits: 4 }];
const res9 = calculateSubjectCGPA(sub9);
assert.strictEqual(res9.isValid, false);
assert.strictEqual(res9.error, "Grade point must be between 0 and 10.");
console.log("✓ Test 9: Negative grade point rejected");

// --- SGPA TO CGPA TESTS ---

// 10. One semester
const sem10: SemesterSGPAItem[] = [{ id: "1", name: "Sem 1", sgpa: 8.5, credits: 20 }];
const res10 = calculateSemesterCGPA(sem10);
assert.strictEqual(res10.isValid, true);
assert.strictEqual(res10.primaryValue, "8.5 CGPA");
console.log("✓ Test 10: One semester (8.5 SGPA, 20 credits) = 8.5 CGPA");

// 11. Multiple equal-credit semesters
const sem11: SemesterSGPAItem[] = [
  { id: "1", name: "Sem 1", sgpa: 8.0, credits: 20 },
  { id: "2", name: "Sem 2", sgpa: 9.0, credits: 20 },
];
const res11 = calculateSemesterCGPA(sem11);
assert.strictEqual(res11.isValid, true);
assert.strictEqual(res11.primaryValue, "8.5 CGPA");
console.log("✓ Test 11: Multiple equal-credit semesters (8.0, 9.0 @ 20 cr) = 8.5 CGPA");

// 12. Multiple unequal-credit semesters
const sem12: SemesterSGPAItem[] = [
  { id: "1", name: "Sem 1", sgpa: 8.0, credits: 20 }, // 160
  { id: "2", name: "Sem 2", sgpa: 9.0, credits: 24 }, // 216 -> 376 / 44 = 8.545454...
];
const res12 = calculateSemesterCGPA(sem12);
assert.strictEqual(res12.isValid, true);
assert.strictEqual(res12.primaryValue, "8.55 CGPA");
console.log("✓ Test 12: Multiple unequal-credit semesters = 8.55 CGPA");

// 13. Decimal SGPA and credits
const sem13: SemesterSGPAItem[] = [
  { id: "1", name: "Sem 1", sgpa: 8.75, credits: 22.5 },
  { id: "2", name: "Sem 2", sgpa: 7.92, credits: 23.5 },
];
const res13 = calculateSemesterCGPA(sem13);
assert.strictEqual(res13.isValid, true);
assert.strictEqual(res13.primaryValue, "8.33 CGPA");
console.log("✓ Test 13: Decimal SGPA and credits = 8.33 CGPA");

// 14. Invalid SGPA (> 10)
const sem14: SemesterSGPAItem[] = [{ id: "1", name: "Sem 1", sgpa: 11, credits: 20 }];
const res14 = calculateSemesterCGPA(sem14);
assert.strictEqual(res14.isValid, false);
assert.strictEqual(res14.error, "SGPA must be between 0 and 10.");
console.log("✓ Test 14: SGPA > 10 rejected");

// 15. Invalid SGPA (< 0)
const sem15: SemesterSGPAItem[] = [{ id: "1", name: "Sem 1", sgpa: -0.5, credits: 20 }];
const res15 = calculateSemesterCGPA(sem15);
assert.strictEqual(res15.isValid, false);
assert.strictEqual(res15.error, "SGPA must be between 0 and 10.");
console.log("✓ Test 15: Negative SGPA rejected");

// 16. Zero semester credits validation
const sem16: SemesterSGPAItem[] = [{ id: "1", name: "Sem 1", sgpa: 8.5, credits: 0 }];
const res16 = calculateSemesterCGPA(sem16);
assert.strictEqual(res16.isValid, false);
assert.strictEqual(res16.error, "Credits must be greater than 0.");
console.log("✓ Test 16: Zero semester credits rejected");

// 17. Empty semesters list validation
const res17 = calculateSemesterCGPA([]);
assert.strictEqual(res17.isValid, false);
assert.strictEqual(res17.error, "Add at least one valid semester.");
console.log("✓ Test 17: Empty semesters list rejected");

console.log("\nAll CGPA & SGPA Calculator tests passed successfully!");
