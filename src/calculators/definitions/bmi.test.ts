import assert from "node:assert";
import {
  calculateMetricBMI,
  calculateUSCustomaryBMI,
  calculateMetricBMIWrapper,
  calculateUSCustomaryBMIWrapper,
  getAdultBMICategory,
} from "./bmi";

console.log("Running Adult BMI Calculator Engine Tests...\n");

// Test 1: Basic Metric BMI (170 cm, 70 kg, age 25) -> 24.221... -> "24.2" (Healthy Weight)
const t1 = calculateMetricBMI(170, 70, 25);
assert.strictEqual(t1.isValid, true);
assert.strictEqual(t1.formattedBmi, "24.2");
assert.strictEqual(t1.category, "Healthy Weight");
assert.strictEqual(t1.isPediatricAge, false);
console.log("✓ Test 1: Basic Metric BMI calculates 24.2 Healthy Weight");

// Test 2: Basic US Customary BMI (5 ft 7 in = 67 in, 154 lb, age 30) -> 24.120... -> "24.1" (Healthy Weight)
const t2 = calculateUSCustomaryBMI(5, 7, 154, 30);
assert.strictEqual(t2.isValid, true);
assert.strictEqual(t2.formattedBmi, "24.1");
assert.strictEqual(t2.category, "Healthy Weight");
assert.strictEqual(t2.isPediatricAge, false);
console.log("✓ Test 2: Basic US Customary BMI calculates 24.1 Healthy Weight");

// Test 3: Metric/US unit conversion equivalence
// 180 cm (~70.866 in) and 80 kg (~176.37 lb)
// 80 / 1.8^2 = 24.691358
// US: 5 ft 10.866 in = 70.866 in, 176.3698 lb -> (176.3698 / 70.866^2) * 703 = 24.691...
const t3Metric = calculateMetricBMI(180, 80, 25);
const t3US = calculateUSCustomaryBMI(5, 10.866, 176.37, 25);
assert.strictEqual(t3Metric.formattedBmi, "24.7");
assert.strictEqual(t3US.formattedBmi, "24.7");
console.log("✓ Test 3: Metric and US Customary modes produce equivalent normalized BMI");

// Category Boundaries Tests
// Test 4: BMI < 18.5 -> Underweight (e.g. 18.49)
const cat1849 = getAdultBMICategory(18.49);
assert.strictEqual(cat1849.category, "Underweight");
assert.strictEqual(cat1849.obesityClass, undefined);
console.log("✓ Test 4: BMI 18.49 is classified as Underweight");

// Test 5: BMI 18.50 -> Healthy Weight
const cat1850 = getAdultBMICategory(18.5);
assert.strictEqual(cat1850.category, "Healthy Weight");
assert.strictEqual(cat1850.obesityClass, undefined);
console.log("✓ Test 5: BMI 18.50 is classified as Healthy Weight");

// Test 6: BMI 24.99 -> Healthy Weight
const cat2499 = getAdultBMICategory(24.99);
assert.strictEqual(cat2499.category, "Healthy Weight");
assert.strictEqual(cat2499.obesityClass, undefined);
console.log("✓ Test 6: BMI 24.99 is classified as Healthy Weight");

// Test 7: BMI 25.00 -> Overweight
const cat2500 = getAdultBMICategory(25.0);
assert.strictEqual(cat2500.category, "Overweight");
assert.strictEqual(cat2500.obesityClass, undefined);
console.log("✓ Test 7: BMI 25.00 is classified as Overweight");

// Test 8: BMI 29.99 -> Overweight
const cat2999 = getAdultBMICategory(29.99);
assert.strictEqual(cat2999.category, "Overweight");
assert.strictEqual(cat2999.obesityClass, undefined);
console.log("✓ Test 8: BMI 29.99 is classified as Overweight");

// Test 9: BMI 30.00 -> Obesity / Class 1
const cat3000 = getAdultBMICategory(30.0);
assert.strictEqual(cat3000.category, "Obesity");
assert.strictEqual(cat3000.obesityClass, "Class 1");
console.log("✓ Test 9: BMI 30.00 is classified as Obesity (Class 1)");

// Test 10: BMI 34.99 -> Obesity / Class 1
const cat3499 = getAdultBMICategory(34.99);
assert.strictEqual(cat3499.category, "Obesity");
assert.strictEqual(cat3499.obesityClass, "Class 1");
console.log("✓ Test 10: BMI 34.99 is classified as Obesity (Class 1)");

// Test 11: BMI 35.00 -> Obesity / Class 2
const cat3500 = getAdultBMICategory(35.0);
assert.strictEqual(cat3500.category, "Obesity");
assert.strictEqual(cat3500.obesityClass, "Class 2");
console.log("✓ Test 11: BMI 35.00 is classified as Obesity (Class 2)");

// Test 12: BMI 39.99 -> Obesity / Class 2
const cat3999 = getAdultBMICategory(39.99);
assert.strictEqual(cat3999.category, "Obesity");
assert.strictEqual(cat3999.obesityClass, "Class 2");
console.log("✓ Test 12: BMI 39.99 is classified as Obesity (Class 2)");

// Test 13: BMI 40.00 -> Obesity / Class 3
const cat4000 = getAdultBMICategory(40.0);
assert.strictEqual(cat4000.category, "Obesity");
assert.strictEqual(cat4000.obesityClass, "Class 3");
console.log("✓ Test 13: BMI 40.00 is classified as Obesity (Class 3)");

// Validation & Edge Cases Tests
// Test 14: Zero and negative height rejection (Metric)
const zeroHeightMetric = calculateMetricBMI(0, 70, 25);
assert.strictEqual(zeroHeightMetric.isValid, false);
const negHeightMetric = calculateMetricBMI(-170, 70, 25);
assert.strictEqual(negHeightMetric.isValid, false);
console.log("✓ Test 14: Zero and negative metric height rejected");

// Test 15: Zero and negative weight rejection (Metric)
const zeroWeightMetric = calculateMetricBMI(170, 0, 25);
assert.strictEqual(zeroWeightMetric.isValid, false);
const negWeightMetric = calculateMetricBMI(170, -70, 25);
assert.strictEqual(negWeightMetric.isValid, false);
console.log("✓ Test 15: Zero and negative metric weight rejected");

// Test 16: Out-of-bounds metric values rejection (<50 cm or >280 cm, <20 kg or >400 kg)
assert.strictEqual(calculateMetricBMI(49, 70, 25).isValid, false);
assert.strictEqual(calculateMetricBMI(281, 70, 25).isValid, false);
assert.strictEqual(calculateMetricBMI(170, 19, 25).isValid, false);
assert.strictEqual(calculateMetricBMI(170, 401, 25).isValid, false);
console.log("✓ Test 16: Out-of-bounds metric inputs properly rejected");

// Test 17: US Customary invalid inches (>= 12) rejection
const invalidInches = calculateUSCustomaryBMI(5, 12, 150, 25);
assert.strictEqual(invalidInches.isValid, false);
const negInches = calculateUSCustomaryBMI(5, -1, 150, 25);
assert.strictEqual(negInches.isValid, false);
console.log("✓ Test 17: Invalid US inches (>= 12 or < 0) properly rejected");

// Test 18: US Customary out-of-bounds feet/weight
assert.strictEqual(calculateUSCustomaryBMI(0, 6, 150, 25).isValid, false);
assert.strictEqual(calculateUSCustomaryBMI(10, 0, 150, 25).isValid, false);
assert.strictEqual(calculateUSCustomaryBMI(5, 6, 39, 25).isValid, false);
assert.strictEqual(calculateUSCustomaryBMI(5, 6, 901, 25).isValid, false);
console.log("✓ Test 18: US Customary out-of-bounds feet/weight properly rejected");

// Test 19: Decimal height and weight inputs
const decimalTest = calculateMetricBMI(175.5, 68.75, 25);
assert.strictEqual(decimalTest.isValid, true);
// 68.75 / (1.755)^2 = 68.75 / 3.080025 = 22.321...
assert.strictEqual(decimalTest.formattedBmi, "22.3");
assert.strictEqual(decimalTest.category, "Healthy Weight");
console.log("✓ Test 19: Decimal height and weight inputs handled with full precision");

// Test 20: Age Safety - Age 19 (Pediatric Notice, adult category blocked)
const age19Test = calculateMetricBMI(170, 70, 19);
assert.strictEqual(age19Test.isValid, true);
assert.strictEqual(age19Test.formattedBmi, "24.2");
assert.strictEqual(age19Test.isPediatricAge, true);
assert.strictEqual(age19Test.category, undefined);
assert.strictEqual(age19Test.obesityClass, undefined);
assert.ok(age19Test.disclaimer?.includes("pediatric"));

const age19Wrapper = calculateMetricBMIWrapper({ heightCm: 170, weightKg: 70, age: 19 });
assert.strictEqual(age19Wrapper.isValid, true);
assert.strictEqual(age19Wrapper.primaryValue, "24.2 BMI");
assert.strictEqual(age19Wrapper.primaryLabel, "Calculated Body Mass Index (kg/m²)");
assert.strictEqual(age19Wrapper.disclaimerLabel, "Pediatric Notice");
assert.ok(age19Wrapper.disclaimer?.includes("pediatric"));
const hasPediatricNotice = age19Wrapper.secondaryValues?.some((s) => s.label === "Pediatric Notice");
assert.strictEqual(hasPediatricNotice, true);
const hasAdultCategory = age19Wrapper.secondaryValues?.some((s) => s.label === "BMI Category");
assert.strictEqual(hasAdultCategory, false);
console.log("✓ Test 20: Age < 20 blocks adult category and returns explicit pediatric notice");

// Test 21: Age Safety - Age 20 (Adult Classification Allowed)
const age20Wrapper = calculateMetricBMIWrapper({ heightCm: 170, weightKg: 70, age: 20 });
assert.strictEqual(age20Wrapper.isValid, true);
assert.strictEqual(age20Wrapper.primaryValue, "24.2 BMI");
assert.strictEqual(age20Wrapper.primaryLabel, "BMI category: Healthy Weight");
const age20Category = age20Wrapper.secondaryValues?.find((s) => s.label === "BMI Category");
assert.strictEqual(age20Category?.value, "Healthy Weight");
console.log("✓ Test 21: Age >= 20 allows adult classification");

// Test 22: Healthy Weight Range calculation
// For height 170 cm (1.70 m): min = 18.5 * 1.7^2 = 53.465 -> 53.5 kg, max = 24.9 * 1.7^2 = 71.961 -> 72.0 kg
const hwMetric = calculateMetricBMI(170, 70, 25);
assert.strictEqual(hwMetric.formattedHealthyWeightRange, "53.5 – 72.0 kg");

// For height 5 ft 7 in (67 in):
// min = 18.5 * 67^2 / 703 = 83046.5 / 703 = 118.1315 -> 118.1 lb
// max = 24.9 * 67^2 / 703 = 111776.1 / 703 = 159.00 -> 159.0 lb
const hwUS = calculateUSCustomaryBMI(5, 7, 154, 25);
assert.strictEqual(hwUS.formattedHealthyWeightRange, "118.1 – 159.0 lb");
console.log("✓ Test 22: Healthy Weight Range calculated accurately for both metric and US units");

// Test 23: Wrapper handling of US Customary with Obesity Class
const usObeseWrapper = calculateUSCustomaryBMIWrapper({
  heightFeet: 5,
  heightInches: 10,
  weightLb: 250,
  age: 40,
});
// 70 inches: (250 / 4900) * 703 = 35.867 -> 35.9 BMI (Obesity, Class 2)
assert.strictEqual(usObeseWrapper.isValid, true);
assert.strictEqual(usObeseWrapper.primaryValue, "35.9 BMI");
assert.strictEqual(usObeseWrapper.primaryLabel, "BMI category: Obesity");
const usObesityClass = usObeseWrapper.secondaryValues?.find((s) => s.label === "Obesity Class");
assert.strictEqual(usObesityClass?.value, "Class 2");
// Test 24: US Customary test case 5 ft 7 in, 154 lb, age 25 vs age 19
const us25 = calculateUSCustomaryBMIWrapper({
  heightFeet: 5,
  heightInches: 7,
  weightLb: 154,
  age: 25,
});
assert.strictEqual(us25.isValid, true);
assert.strictEqual(us25.primaryValue, "24.1 BMI");
assert.strictEqual(us25.primaryLabel, "BMI category: Healthy Weight");
const us25Category = us25.secondaryValues?.find((s) => s.label === "BMI Category");
assert.strictEqual(us25Category?.value, "Healthy Weight");
const us25Range = us25.secondaryValues?.find((s) => s.label === "Healthy Weight Range");
assert.strictEqual(us25Range?.value, "118.1 – 159.0 lb");
assert.strictEqual(us25.disclaimerLabel, "Medical Disclaimer");

const us19 = calculateUSCustomaryBMIWrapper({
  heightFeet: 5,
  heightInches: 7,
  weightLb: 154,
  age: 19,
});
assert.strictEqual(us19.isValid, true);
assert.strictEqual(us19.primaryValue, "24.1 BMI");
assert.strictEqual(us19.disclaimerLabel, "Pediatric Notice");
assert.strictEqual(us19.secondaryValues?.some((s) => s.label === "BMI Category"), false);
console.log("✓ Test 24: US Customary 5 ft 7 in / 154 lb calculates 24.1 BMI with age 25 adult & age 19 pediatric guard");

console.log("\nAll 24 Adult BMI Calculator tests passed successfully!");
