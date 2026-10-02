import assert from "node:assert";
import {
  BUILTIN_FORMULAS,
  getFormulaById,
  getAllFormulas,
  getParsedFormulaAST,
  evaluateFormula,
  searchFormulaLibrary,
  getFormulaPlainText,
} from "./scientificFormulas";
import { extractASTVariables } from "./scientificVerify";

console.log("Running Phase 6 Formula Workbench Tests...\n");

// =========================================================================
// 1. FORMULA REGISTRY & INTEGRITY
// =========================================================================
console.log("--- 1. Formula Registry & Structure ---");
assert.strictEqual(BUILTIN_FORMULAS.length, 14, "Exactly 14 approved formulas must be present in V1");
assert.strictEqual(getAllFormulas().length, 14);

for (const formula of BUILTIN_FORMULAS) {
  assert.ok(formula.id, "Formula must have an id");
  assert.ok(formula.name, "Formula must have a name");
  assert.ok(formula.category, "Formula must have a category");
  assert.ok(formula.expression, "Formula must have an expression");
  assert.ok(formula.displayFormula, "Formula must have a displayFormula");
  assert.ok(formula.targetVariable, "Formula must have a targetVariable");
  assert.ok(formula.variables.length > 0, "Formula must have at least one variable");
  assert.ok(formula.examples.length > 0, "Formula must have at least one example");
  assert.strictEqual(getFormulaById(formula.id), formula, `Lookup by id for ${formula.id} must succeed`);
}
console.log("✓ Test 1: All 14 formula definitions have complete required metadata.");

// =========================================================================
// 2. PARSER & AST EXTRACTION INVARIANT
// =========================================================================
console.log("\n--- 2. AST Parsing & Variable Extraction Invariant ---");

for (const formula of BUILTIN_FORMULAS) {
  // Parsing must succeed
  const ast = getParsedFormulaAST(formula.expression);
  assert.ok(ast, `AST parsing must succeed for ${formula.id} ("${formula.expression}")`);

  // Structural AST Variable Extraction Invariant
  const detectedVars = extractASTVariables(ast);
  const declaredVars = new Set(formula.variables.map((v) => v.symbol));

  assert.strictEqual(
    detectedVars.size,
    declaredVars.size,
    `Detected variable count (${Array.from(detectedVars).join(", ")}) must match declared count (${Array.from(declaredVars).join(", ")}) in ${formula.id}`
  );

  for (const sym of declaredVars) {
    assert.ok(
      detectedVars.has(sym),
      `Variable "${sym}" in ${formula.id} must be detected in AST`
    );
  }
}
console.log("✓ Test 2: Invariant (Declared Variables ≡ Detected AST Variables) passed for all 14 formulas.");

// =========================================================================
// 3. DETERMINISTIC EVALUATION FOR ALL 14 FORMULAS
// =========================================================================
console.log("\n--- 3. Deterministic Evaluation of All 14 Formulas ---");

// 1. Circle Area: A = πr²
const circleArea = getFormulaById("geom-circle-area")!;
const res1 = evaluateFormula(circleArea, { r: 5 }, { r: "cm" });
assert.strictEqual(res1.isValid, true);
assert.strictEqual(res1.formattedExact, "25π");
assert.strictEqual(res1.outputUnit, "cm²");
assert.ok(Math.abs(res1.numericResult! - 25 * Math.PI) < 1e-10);
console.log("✓ 1. Circle Area (r=5 cm -> 25π cm²)");

// 2. Circle Perimeter: C = 2πr
const circlePerim = getFormulaById("geom-circle-perimeter")!;
const res2 = evaluateFormula(circlePerim, { r: 5 }, { r: "cm" });
assert.strictEqual(res2.isValid, true);
assert.strictEqual(res2.formattedExact, "10π");
assert.strictEqual(res2.outputUnit, "cm");
assert.ok(Math.abs(res2.numericResult! - 10 * Math.PI) < 1e-10);
console.log("✓ 2. Circle Perimeter (r=5 cm -> 10π cm)");

// 3. Rectangle Area: A = l * w
const rectArea = getFormulaById("geom-rectangle-area")!;
const res3 = evaluateFormula(rectArea, { l: 10, w: 5 }, { l: "m", w: "m" });
assert.strictEqual(res3.isValid, true);
assert.strictEqual(res3.numericResult, 50);
assert.strictEqual(res3.formattedExact, "50");
assert.strictEqual(res3.outputUnit, "m²");
console.log("✓ 3. Rectangle Area (10 m × 5 m -> 50 m²)");

// 4. Triangle Area: A = (b * h) / 2
const triArea = getFormulaById("geom-triangle-area")!;
const res4 = evaluateFormula(triArea, { b: 6, h: 4 }, { b: "m", h: "m" });
assert.strictEqual(res4.isValid, true);
assert.strictEqual(res4.numericResult, 12);
assert.strictEqual(res4.formattedExact, "12");
assert.strictEqual(res4.outputUnit, "m²");
console.log("✓ 4. Triangle Area (b=6 m, h=4 m -> 12 m²)");

// 5. Sphere Volume: V = 4/3 * π * r³
const sphereVol = getFormulaById("geom-sphere-volume")!;
const res5 = evaluateFormula(sphereVol, { r: 3 }, { r: "cm" });
assert.strictEqual(res5.isValid, true);
assert.strictEqual(res5.formattedExact, "36π");
assert.strictEqual(res5.outputUnit, "cm³");
assert.ok(Math.abs(res5.numericResult! - 36 * Math.PI) < 1e-10);
console.log("✓ 5. Sphere Volume (r=3 cm -> 36π cm³)");

// 6. Cylinder Volume: V = π * r² * h
const cylVol = getFormulaById("geom-cylinder-volume")!;
const res6 = evaluateFormula(cylVol, { r: 3, h: 5 }, { r: "cm", h: "cm" });
assert.strictEqual(res6.isValid, true);
assert.strictEqual(res6.formattedExact, "45π");
assert.strictEqual(res6.outputUnit, "cm³");
assert.ok(Math.abs(res6.numericResult! - 45 * Math.PI) < 1e-10);
console.log("✓ 6. Cylinder Volume (r=3 cm, h=5 cm -> 45π cm³)");

// 7. Average Speed: v = d / t
const avgSpeed = getFormulaById("phys-average-speed")!;
const res7 = evaluateFormula(avgSpeed, { d: 100, t: 2 }, { d: "km", t: "h" });
assert.strictEqual(res7.isValid, true);
assert.strictEqual(res7.numericResult, 50);
assert.strictEqual(res7.formattedExact, "50");
assert.strictEqual(res7.outputUnit, "km/h");
console.log("✓ 7. Average Speed (100 km / 2 h -> 50 km/h)");

// 8. Simple Interest: I = P * r * t
const simpleInt = getFormulaById("fin-simple-interest")!;
const res8 = evaluateFormula(simpleInt, { P: 1000, r: 0.05, t: 3 });
assert.strictEqual(res8.isValid, true);
assert.strictEqual(res8.numericResult, 150);
console.log("✓ 8. Simple Interest ($1,000 at 5% for 3 yr -> $150)");

// 9. Compound Interest: A = P * (1 + r / n)^(n * t)
const compoundInt = getFormulaById("fin-compound-interest")!;
const res9 = evaluateFormula(compoundInt, { P: 1000, r: 0.05, n: 1, t: 2 });
assert.strictEqual(res9.isValid, true);
assert.strictEqual(res9.numericResult, 1102.5);
console.log("✓ 9. Compound Interest ($1,000 at 5% for 2 yr -> $1,102.50)");

// 10. Future Value: FV = PV * (1 + r)^n
const futureVal = getFormulaById("fin-future-value")!;
const res10 = evaluateFormula(futureVal, { PV: 1000, r: 0.08, n: 5 });
assert.strictEqual(res10.isValid, true);
assert.ok(Math.abs(res10.numericResult! - 1469.3280768) < 1e-6);
console.log("✓ 10. Future Value (PV=1000, r=0.08, n=5 -> 1469.33)");

// 11. Present Value: PV = FV / (1 + r)^n
const presentVal = getFormulaById("fin-present-value")!;
const res11 = evaluateFormula(presentVal, { FV: 1500, r: 0.06, n: 3 });
assert.strictEqual(res11.isValid, true);
assert.ok(Math.abs(res11.numericResult! - 1259.4289245484526) < 1e-6);
console.log("✓ 11. Present Value (FV=1500, r=0.06, n=3 -> 1259.43)");

// 12. Pythagorean Theorem: c = sqrt(a² + b²)
const pythagoras = getFormulaById("trig-pythagorean")!;
const res12a = evaluateFormula(pythagoras, { a: 3, b: 4 }, { a: "cm", b: "cm" });
assert.strictEqual(res12a.isValid, true);
assert.strictEqual(res12a.numericResult, 5);
assert.strictEqual(res12a.formattedExact, "5");

const res12b = evaluateFormula(pythagoras, { a: 1, b: 1 }, { a: "cm", b: "cm" });
assert.strictEqual(res12b.isValid, true);
assert.strictEqual(res12b.formattedExact, "√2");
assert.ok(Math.abs(res12b.numericResult! - Math.SQRT2) < 1e-10);
console.log("✓ 12. Pythagorean Theorem (3,4 -> 5 and 1,1 -> √2)");

// 13. Distance Formula: d = sqrt((x2 - x1)² + (y2 - y1)²)
const distanceForm = getFormulaById("alg-distance-formula")!;
const res13 = evaluateFormula(distanceForm, { x1: 0, y1: 0, x2: 3, y2: 4 });
assert.strictEqual(res13.isValid, true);
assert.strictEqual(res13.numericResult, 5);
assert.strictEqual(res13.formattedExact, "5");
console.log("✓ 13. Distance Formula ((0,0) to (3,4) -> 5)");

// 14. Slope of a Line: m = (y2 - y1) / (x2 - x1)
const slopeForm = getFormulaById("alg-slope")!;
const res14 = evaluateFormula(slopeForm, { x1: 1, y1: 2, x2: 4, y2: 8 });
assert.strictEqual(res14.isValid, true);
assert.strictEqual(res14.numericResult, 2);
assert.strictEqual(res14.formattedExact, "2");
console.log("✓ 14. Slope of a Line ((1,2) and (4,8) -> 2)");

// =========================================================================
// 4. UNIT CONVERSIONS & EXACT RATIONAL SCALING
// =========================================================================
console.log("\n--- 4. Unit Normalization & Exact Scaling ---");

// Mixed length units: 100 cm by 2 m in m²
const mixedRect = evaluateFormula(rectArea, { l: 100, w: 2 }, { l: "cm", w: "m" }, { userOutputUnit: "m²" });
assert.strictEqual(mixedRect.isValid, true);
assert.strictEqual(mixedRect.numericResult, 2);
assert.strictEqual(mixedRect.formattedExact, "2");
assert.strictEqual(mixedRect.outputUnit, "m²");
console.log("✓ Mixed Rectangle (100 cm × 2 m = 2 m²)");

// 50 mm radius to cm²
const mmCircle = evaluateFormula(circleArea, { r: 50 }, { r: "mm" }, { userOutputUnit: "cm²" });
assert.strictEqual(mmCircle.isValid, true);
assert.strictEqual(mmCircle.formattedExact, "25π");
assert.strictEqual(mmCircle.outputUnit, "cm²");
console.log("✓ Radius 50 mm with cm² output = 25π cm²");

// Sprint 100 m in 10 s to m/s
const sprint = evaluateFormula(avgSpeed, { d: 100, t: 10 }, { d: "m", t: "s" }, { userOutputUnit: "m/s" });
assert.strictEqual(sprint.isValid, true);
assert.strictEqual(sprint.numericResult, 10);
assert.strictEqual(sprint.formattedExact, "10");
assert.strictEqual(sprint.outputUnit, "m/s");
console.log("✓ Sprint 100 m / 10 s = 10 m/s");

// =========================================================================
// 5. VALIDATION & ERROR HANDLING
// =========================================================================
console.log("\n--- 5. Validation & Domain Checks ---");

// Negative radius
const negRadius = evaluateFormula(circleArea, { r: -5 }, { r: "cm" });
assert.strictEqual(negRadius.isValid, false);
assert.ok(negRadius.error?.includes("must be at least 0"));
console.log("✓ Negative radius rejected properly");

// Zero time in speed
const zeroTime = evaluateFormula(avgSpeed, { d: 100, t: 0 }, { d: "km", t: "h" });
assert.strictEqual(zeroTime.isValid, false);
assert.ok(zeroTime.error?.includes("Time") && (zeroTime.error.includes("positive") || zeroTime.error.includes("at least")));
console.log("✓ Zero time in speed rejected properly");

// Vertical line in slope (x1 = x2)
const vertLine = evaluateFormula(slopeForm, { x1: 2, y1: 3, x2: 2, y2: 9 });
assert.strictEqual(vertLine.isValid, false);
assert.ok(vertLine.error?.includes("Vertical line error"));
console.log("✓ Vertical line slope division by zero handled cleanly");

// Incompatible output unit (Area with kg)
const badUnit = evaluateFormula(circleArea, { r: 5 }, { r: "cm" }, { userOutputUnit: "kg" });
assert.strictEqual(badUnit.isValid, false);
assert.ok(badUnit.error?.includes("Incompatible output unit"));
console.log("✓ Incompatible output unit rejected properly");

// =========================================================================
// 6. EXAMPLE PRESETS VERIFICATION
// =========================================================================
console.log("\n--- 6. Example Presets Verification ---");

for (const formula of BUILTIN_FORMULAS) {
  for (const ex of formula.examples) {
    const res = evaluateFormula(
      formula,
      ex.variableValues,
      ex.variableUnits,
      { userOutputUnit: ex.outputUnit }
    );
    assert.strictEqual(res.isValid, true, `Example "${ex.title}" in ${formula.id} must be valid`);
    assert.ok(
      Math.abs(res.numericResult! - ex.expectedResult.decimal) < 1e-4,
      `Example "${ex.title}" decimal ${res.numericResult} must match expected ${ex.expectedResult.decimal}`
    );
    if (ex.expectedResult.exact) {
      assert.strictEqual(
        res.formattedExact,
        ex.expectedResult.exact,
        `Example "${ex.title}" exact result "${res.formattedExact}" must match "${ex.expectedResult.exact}"`
      );
    }
  }
}
console.log("✓ All examples across all 14 formulas evaluated accurately against presets.");

// =========================================================================
// 7. FORMULA SEARCH & FILTERING
// =========================================================================
console.log("\n--- 7. Formula Search & Category Filter ---");

// All
const all = searchFormulaLibrary({ category: "All" });
assert.strictEqual(all.length, 14);

// Category filter
const geom = searchFormulaLibrary({ category: "Geometry" });
assert.strictEqual(geom.length, 6);

const phys = searchFormulaLibrary({ category: "Physics" });
assert.strictEqual(phys.length, 1);

const fin = searchFormulaLibrary({ category: "Finance" });
assert.strictEqual(fin.length, 4);

const trig = searchFormulaLibrary({ category: "Trigonometry" });
assert.strictEqual(trig.length, 1);

const alg = searchFormulaLibrary({ category: "Algebra" });
assert.strictEqual(alg.length, 2);

// Keyword query search
const queryCircle = searchFormulaLibrary({ searchQuery: "circle" });
assert.strictEqual(queryCircle.length, 2);

const querySpeed = searchFormulaLibrary({ searchQuery: "speed" });
assert.strictEqual(querySpeed.length, 1);
assert.strictEqual(querySpeed[0].id, "phys-average-speed");

const queryInterest = searchFormulaLibrary({ searchQuery: "interest" });
assert.strictEqual(queryInterest.length, 2);

const queryPythagoras = searchFormulaLibrary({ searchQuery: "hypotenuse" });
assert.strictEqual(queryPythagoras.length, 1);
assert.strictEqual(queryPythagoras[0].id, "trig-pythagorean");

console.log("✓ Search & Category filter queries executed accurately.");

// =========================================================================
// 8. TARGETED MANUAL-TEST CORRECTIONS REGRESSION SUITE
// =========================================================================
console.log("\n--- 8. Targeted Manual-Test Corrections Verification ---");

// Issue A: No raw \pi in plain text or display representations
for (const f of BUILTIN_FORMULAS) {
  const plain = getFormulaPlainText(f);
  assert.ok(!plain.includes("\\pi"), `Plain text formula for ${f.id} must not contain raw LaTeX "\\pi"`);
  assert.ok(!plain.includes("\\frac"), `Plain text formula for ${f.id} must not contain raw "\\frac"`);
  assert.ok(!plain.includes("\\sqrt"), `Plain text formula for ${f.id} must not contain raw "\\sqrt"`);
}
console.log("✓ Issue A: No raw LaTeX command strings in plain text representations.");

// Issue B: AST-aware substituted formulas preserve variable unit before power
const circleSubRes = evaluateFormula(circleArea, { r: 5 }, { r: "cm" });
assert.ok(
  circleSubRes.substitutedFormulaText?.includes("(5 cm)²") || circleSubRes.substitutedFormulaText?.includes("(5 cm)^2"),
  `Substituted circle formula must contain "(5 cm)²", received: ${circleSubRes.substitutedFormulaText}`
);
assert.ok(
  !circleSubRes.substitutedFormulaText?.includes("5 cm²"),
  `Substituted circle formula must NOT contain "5 cm²", received: ${circleSubRes.substitutedFormulaText}`
);

const sphereSubRes = evaluateFormula(sphereVol, { r: 3 }, { r: "cm" });
assert.ok(
  sphereSubRes.substitutedFormulaText?.includes("(3 cm)³") || sphereSubRes.substitutedFormulaText?.includes("(3 cm)^3"),
  `Substituted sphere formula must contain "(3 cm)³", received: ${sphereSubRes.substitutedFormulaText}`
);

const cylSubRes = evaluateFormula(cylVol, { r: 3, h: 5 }, { r: "cm", h: "cm" });
assert.ok(
  cylSubRes.substitutedFormulaText?.includes("(3 cm)²"),
  `Substituted cylinder formula must contain "(3 cm)²", received: ${cylSubRes.substitutedFormulaText}`
);

const pythSubRes = evaluateFormula(pythagoras, { a: 3, b: 4 }, { a: "cm", b: "cm" });
assert.ok(
  pythSubRes.substitutedFormulaText?.includes("(3 cm)²") && pythSubRes.substitutedFormulaText?.includes("(4 cm)²"),
  `Substituted pythagorean formula must contain "(3 cm)²" and "(4 cm)²", received: ${pythSubRes.substitutedFormulaText}`
);
console.log("✓ Issue B: Substituted formulas are AST-aware and dimensionally correct across all formulas.");

// Issue C & D: Circle Area (r = 5 cm) with target unit m²
const circleM2 = evaluateFormula(circleArea, { r: 5 }, { r: "cm" }, { userOutputUnit: "m²" });
assert.strictEqual(circleM2.isValid, true);
assert.strictEqual(circleM2.formattedExact, "π/400", "Exact result for 5 cm in m² must be π/400");
assert.strictEqual(circleM2.outputUnit, "m²");
assert.strictEqual(circleM2.formattedDecimal, "0.007854", "Decimal result must be formatted cleanly as 0.007854");

// Verify no IEEE-754 precision artifacts in steps
for (const st of circleM2.steps) {
  assert.ok(
    !st.explanation?.includes("0.002500000000000005"),
    `Step ${st.stepNumber} explanation must not contain floating-point noise: ${st.explanation}`
  );
  assert.ok(
    !st.formattedSubResult?.includes("0.002500000000000005"),
    `Step ${st.stepNumber} subResult must not contain floating-point noise: ${st.formattedSubResult}`
  );
}
console.log("✓ Issue C: Floating-point precision artifacts (0.002500000000000005) prevented in steps.");
console.log("✓ Issue D: Decimal formatting is clean (0.007854) while exact result remains π/400.");

// =========================================================================
// 9. CATEGORY / SEARCH / FORMULA SYNCHRONIZATION TEST SUITE
// =========================================================================
console.log("\n--- 9. Category, Search & Selection Synchronization ---");

// Test 1: Initial State (All -> Circle Area valid)
const initialList = searchFormulaLibrary({ category: "All" });
assert.strictEqual(initialList.length, 14);
const initialFormula = initialList.find((f) => f.id === "geom-circle-area");
assert.ok(initialFormula, "Circle area must be valid initial formula");
console.log("✓ Test 1: Initial state (All + Circle Area) is valid.");

// Test 2: Physics selection from All + Circle Area
const physList = searchFormulaLibrary({ category: "Physics" });
assert.strictEqual(physList.length, 1);
const physFormula = physList[0];
assert.strictEqual(physFormula.id, "phys-average-speed");
assert.strictEqual(physFormula.category, "Physics");
console.log("✓ Test 2: Selecting Physics yields Physics + Average Speed.");

// Test 3: Finance selection yields 4 Finance formulas
const finList = searchFormulaLibrary({ category: "Finance" });
assert.strictEqual(finList.length, 4);
for (const f of finList) {
  assert.strictEqual(f.category, "Finance");
}
console.log("✓ Test 3: Selecting Finance yields 4 valid Finance formulas.");

// Test 4: Trigonometry selection yields Pythagorean Theorem
const trigList = searchFormulaLibrary({ category: "Trigonometry" });
assert.strictEqual(trigList.length, 1);
assert.strictEqual(trigList[0].id, "trig-pythagorean");
assert.strictEqual(trigList[0].category, "Trigonometry");
console.log("✓ Test 4: Selecting Trigonometry yields Pythagorean Theorem.");

// Test 5: Algebra selection yields Distance and Slope formulas
const algList = searchFormulaLibrary({ category: "Algebra" });
assert.strictEqual(algList.length, 2);
const algIds = algList.map((f) => f.id);
assert.ok(algIds.includes("alg-distance-formula"));
assert.ok(algIds.includes("alg-slope"));
for (const f of algList) {
  assert.strictEqual(f.category, "Algebra");
}
console.log("✓ Test 5: Selecting Algebra yields Distance Formula & Slope of a Line.");

// Test 6: Geometry selection yields 6 Geometry formulas
const geomList = searchFormulaLibrary({ category: "Geometry" });
assert.strictEqual(geomList.length, 6);
for (const f of geomList) {
  assert.strictEqual(f.category, "Geometry");
}
console.log("✓ Test 6: Selecting Geometry yields 6 valid Geometry formulas.");

// Test 7: Dropdown options per category contain only matching formulas
const allCategories: ("Geometry" | "Physics" | "Finance" | "Trigonometry" | "Algebra")[] = [
  "Geometry",
  "Physics",
  "Finance",
  "Trigonometry",
  "Algebra",
];
for (const cat of allCategories) {
  const catFormulas = searchFormulaLibrary({ category: cat });
  for (const f of catFormulas) {
    assert.strictEqual(f.category, cat, `Dropdown formula ${f.name} in category ${cat} must belong to ${cat}`);
  }
}
console.log("✓ Test 7: Dropdown formula list strictly filtered per category with no foreign items.");

// Test 8: Search in All (Query "speed" -> Average Speed)
const searchAllSpeed = searchFormulaLibrary({ category: "All", searchQuery: "speed" });
assert.strictEqual(searchAllSpeed.length, 1);
assert.strictEqual(searchAllSpeed[0].id, "phys-average-speed");
console.log("✓ Test 8: Search All with 'speed' resolves to Average Speed.");

// Test 9: Search with Category (Physics + "speed" -> Average Speed)
const searchPhysSpeed = searchFormulaLibrary({ category: "Physics", searchQuery: "speed" });
assert.strictEqual(searchPhysSpeed.length, 1);
assert.strictEqual(searchPhysSpeed[0].id, "phys-average-speed");
console.log("✓ Test 9: Search in Physics with 'speed' resolves to Average Speed.");

// Test 10: Zero Results (Geometry + "speed" -> 0 formulas)
const searchGeomSpeed = searchFormulaLibrary({ category: "Geometry", searchQuery: "speed" });
assert.strictEqual(searchGeomSpeed.length, 0, "Geometry + 'speed' must return 0 formulas");
console.log("✓ Test 10: Zero search results in Geometry + 'speed' handled cleanly (0 matches).");

// Test 11: Clear Search restores full category formulas
const clearedGeom = searchFormulaLibrary({ category: "Geometry", searchQuery: "" });
assert.strictEqual(clearedGeom.length, 6);
assert.ok(clearedGeom.some((f) => f.id === "geom-circle-area"));
console.log("✓ Test 11: Clearing search restores all 6 Geometry formulas.");

// Test 12: Manual selection preserves state integrity
const sampleFormula = getFormulaById("fin-compound-interest")!;
assert.strictEqual(sampleFormula.category, "Finance");
assert.ok(finList.some((f) => f.id === sampleFormula.id));
console.log("✓ Test 12: Manual selection maps to expected category and formula metadata.");

// Test 13: Sequential category switching invariant
let activeFormulaId = "geom-circle-area";
for (const cat of allCategories) {
  const visible = searchFormulaLibrary({ category: cat });
  assert.ok(visible.length > 0, `Category ${cat} must have at least 1 formula`);
  const stillValid = visible.find((f) => f.id === activeFormulaId);
  const nextActive = stillValid || visible[0];
  assert.strictEqual(nextActive.category, cat, `Selected formula ${nextActive.name} must belong to ${cat}`);
  activeFormulaId = nextActive.id;
}
console.log("✓ Test 13: Sequential category transitions preserve category/formula invariant.");

// Test 14: Formula content & variable switching
const f1 = getFormulaById("geom-circle-area")!;
const f2 = getFormulaById("phys-average-speed")!;
const f3 = getFormulaById("fin-compound-interest")!;
const f4 = getFormulaById("trig-pythagorean")!;

assert.strictEqual(f1.variables[0].symbol, "r");
assert.strictEqual(f2.variables[0].symbol, "d");
assert.strictEqual(f3.variables[0].symbol, "P");
assert.strictEqual(f4.variables[0].symbol, "a");

const resF1 = evaluateFormula(f1, { r: 5 }, { r: "cm" });
const resF2 = evaluateFormula(f2, { d: 100, t: 2 }, { d: "km", t: "h" });
const resF3 = evaluateFormula(f3, { P: 1000, r: 0.05, n: 1, t: 2 });
const resF4 = evaluateFormula(f4, { a: 3, b: 4 }, { a: "cm", b: "cm" });

assert.strictEqual(resF1.targetSymbol, "A");
assert.strictEqual(resF2.targetSymbol, "v");
assert.strictEqual(resF3.targetSymbol, "A");
assert.strictEqual(resF4.targetSymbol, "c");
console.log("✓ Test 14: Formula-specific variables, evaluations and targets update accurately on switch.");

console.log("\n==================================================");
console.log("ALL PHASE 6 FORMULA WORKBENCH TESTS PASSED! (100%)");
console.log("==================================================");


