import assert from "node:assert";
import {
  isLeapYear,
  getDaysInMonth,
  isValidCalendarDate,
  parseDateString,
  calculateAge,
  getDayOfWeek,
  getTotalDaysBetween,
  formatAgeString,
} from "./dateEngine";

console.log("Running Age Calculator & Date Engine Tests...\n");

// Test 1: Same date -> 0Y 0M 0D
const test1 = calculateAge({ year: 2000, month: 5, day: 15 }, { year: 2000, month: 5, day: 15 });
assert.strictEqual(test1.isValid, true);
assert.strictEqual(test1.years, 0);
assert.strictEqual(test1.months, 0);
assert.strictEqual(test1.days, 0);
assert.strictEqual(test1.formattedPrimary, "0 Years, 0 Months, 0 Days");
assert.strictEqual(test1.totalDays, 0);
assert.strictEqual(test1.isBirthdayToday, true);
console.log("✓ Test 1: Same date yields 0 Years, 0 Months, 0 Days");

// Test 2: Exactly one year -> 1Y 0M 0D
const test2 = calculateAge({ year: 2023, month: 1, day: 1 }, { year: 2024, month: 1, day: 1 });
assert.strictEqual(test2.isValid, true);
assert.strictEqual(test2.years, 1);
assert.strictEqual(test2.months, 0);
assert.strictEqual(test2.days, 0);
assert.strictEqual(test2.formattedPrimary, "1 Year, 0 Months, 0 Days");
console.log("✓ Test 2: Exactly one year yields 1 Year, 0 Months, 0 Days (singular formatting verified)");

// Test 3: Exact 25th birthday -> 25Y 0M 0D
const test3 = calculateAge({ year: 1999, month: 8, day: 20 }, { year: 2024, month: 8, day: 20 });
assert.strictEqual(test3.isValid, true);
assert.strictEqual(test3.years, 25);
assert.strictEqual(test3.months, 0);
assert.strictEqual(test3.days, 0);
assert.strictEqual(test3.isBirthdayToday, true);
console.log("✓ Test 3: Exact 25th birthday yields 25 Years, 0 Months, 0 Days");

// Test 4: Birthday not yet reached in reference year -> 24Y 11M 28D
const test4 = calculateAge({ year: 1999, month: 8, day: 20 }, { year: 2024, month: 8, day: 17 });
assert.strictEqual(test4.isValid, true);
assert.strictEqual(test4.years, 24);
assert.strictEqual(test4.months, 11);
assert.strictEqual(test4.days, 28);
assert.strictEqual(test4.daysUntilNextBirthday, 3);
console.log("✓ Test 4: Birthday not yet reached borrows July days accurately");

// Test 5: Birthday already passed in reference year -> 25Y 3M 12D
const test5 = calculateAge({ year: 1999, month: 3, day: 15 }, { year: 2024, month: 6, day: 27 });
assert.strictEqual(test5.isValid, true);
assert.strictEqual(test5.years, 25);
assert.strictEqual(test5.months, 3);
assert.strictEqual(test5.days, 12);
assert.strictEqual(test5.formattedPrimary, "25 Years, 3 Months, 12 Days");
console.log("✓ Test 5: Birthday already passed calculates remaining months and days accurately");

// Test 6: Leap year check logic
assert.strictEqual(isLeapYear(2000), true);
assert.strictEqual(isLeapYear(2024), true);
assert.strictEqual(isLeapYear(1900), false);
assert.strictEqual(isLeapYear(2023), false);
assert.strictEqual(getDaysInMonth(2024, 2), 29);
assert.strictEqual(getDaysInMonth(2023, 2), 28);
console.log("✓ Test 6: Gregorian leap-year math verified (2000 leap, 1900 common, 2024 29 days)");

// Test 7: February 29 DOB to February 29 in a leap year
const test7 = calculateAge({ year: 2000, month: 2, day: 29 }, { year: 2024, month: 2, day: 29 });
assert.strictEqual(test7.isValid, true);
assert.strictEqual(test7.years, 24);
assert.strictEqual(test7.months, 0);
assert.strictEqual(test7.days, 0);
assert.strictEqual(test7.isBirthdayToday, true);
console.log("✓ Test 7: Feb 29 DOB to Feb 29 in leap year yields exact 24 Years");

// Test 8: February 29 DOB to March 1 in a common year
const test8 = calculateAge({ year: 2000, month: 2, day: 29 }, { year: 2023, month: 3, day: 1 });
assert.strictEqual(test8.isValid, true);
assert.strictEqual(test8.years, 23);
assert.strictEqual(test8.months, 0);
assert.strictEqual(test8.days, 0);
console.log("✓ Test 8: Feb 29 DOB turns 23 on March 1 in common non-leap year");

// Test 9: January 31 -> February 28 in common year
const test9 = calculateAge({ year: 2023, month: 1, day: 31 }, { year: 2023, month: 2, day: 28 });
assert.strictEqual(test9.isValid, true);
assert.strictEqual(test9.years, 0);
assert.strictEqual(test9.months, 0);
assert.strictEqual(test9.days, 28);
console.log("✓ Test 9: Jan 31 -> Feb 28 in common year yields 0 Years, 0 Months, 28 Days");

// Test 10: January 31 -> March 31
const test10 = calculateAge({ year: 2023, month: 1, day: 31 }, { year: 2023, month: 3, day: 31 });
assert.strictEqual(test10.isValid, true);
assert.strictEqual(test10.years, 0);
assert.strictEqual(test10.months, 2);
assert.strictEqual(test10.days, 0);
console.log("✓ Test 10: Jan 31 -> Mar 31 yields exactly 0 Years, 2 Months, 0 Days");

// Test 11: December 31 -> January 1 (Year boundary)
const test11 = calculateAge({ year: 2023, month: 12, day: 31 }, { year: 2024, month: 1, day: 1 });
assert.strictEqual(test11.isValid, true);
assert.strictEqual(test11.years, 0);
assert.strictEqual(test11.months, 0);
assert.strictEqual(test11.days, 1);
assert.strictEqual(test11.totalDays, 1);
console.log("✓ Test 11: Dec 31 -> Jan 1 yields 0 Years, 0 Months, 1 Day across year boundary");

// Test 12: Future DOB rejection
const test12 = calculateAge({ year: 2025, month: 1, day: 1 }, { year: 2024, month: 1, day: 1 });
assert.strictEqual(test12.isValid, false);
assert.ok(test12.error?.includes("cannot be in the future"));
console.log("✓ Test 12: Future DOB relative to reference date rejected cleanly");

// Test 13: Invalid February 29 in non-leap year
assert.strictEqual(isValidCalendarDate({ year: 2023, month: 2, day: 29 }), false);
assert.strictEqual(parseDateString("2023-02-29"), null);
console.log("✓ Test 13: Invalid Feb 29 in common year (2023-02-29) rejected");

// Test 14: Invalid April 31
assert.strictEqual(isValidCalendarDate({ year: 2023, month: 4, day: 31 }), false);
assert.strictEqual(parseDateString("2023-04-31"), null);
console.log("✓ Test 14: Invalid April 31 rejected");

// Test 15: Invalid month (13)
assert.strictEqual(isValidCalendarDate({ year: 2023, month: 13, day: 10 }), false);
assert.strictEqual(parseDateString("2023-13-10"), null);
console.log("✓ Test 15: Invalid month (13) rejected");

// Test 16: Total days calculation
const test16Days = getTotalDaysBetween({ year: 2023, month: 1, day: 1 }, { year: 2024, month: 1, day: 1 });
assert.strictEqual(test16Days, 365); // 2023 is common year
const test16Leap = getTotalDaysBetween({ year: 2024, month: 1, day: 1 }, { year: 2025, month: 1, day: 1 });
assert.strictEqual(test16Leap, 366); // 2024 is leap year
console.log("✓ Test 16: Total elapsed days (365 in 2023, 366 in 2024) computed accurately");

// Test 17: Total weeks + remaining days
const test17 = calculateAge({ year: 2023, month: 1, day: 1 }, { year: 2023, month: 1, day: 17 });
assert.strictEqual(test17.totalDays, 16);
assert.strictEqual(test17.totalWeeks, 2);
assert.strictEqual(test17.remainingDaysInWeek, 2);
console.log("✓ Test 17: 16 total days = 2 weeks and 2 remaining days");

// Test 18: Total months calculation
const test18 = calculateAge({ year: 2020, month: 1, day: 1 }, { year: 2022, month: 7, day: 1 });
assert.strictEqual(test18.totalMonths, 30); // 2*12 + 6 = 30
console.log("✓ Test 18: Total full months (30 months for 2.5 years) verified");

// Test 19: Next birthday date
const test19 = calculateAge({ year: 1995, month: 10, day: 25 }, { year: 2024, month: 5, day: 1 });
assert.strictEqual(test19.nextBirthdayDate, "October 25, 2024");
console.log("✓ Test 19: Next birthday date resolved accurately to October 25, 2024");

// Test 20: Days until next birthday
const test20 = calculateAge({ year: 2000, month: 1, day: 10 }, { year: 2024, month: 1, day: 5 });
assert.strictEqual(test20.daysUntilNextBirthday, 5);
console.log("✓ Test 20: Countdown of 5 days until next birthday verified");

// Test 21: Day of week born (1995-10-25 was Wednesday)
const test21Day = getDayOfWeek({ year: 1995, month: 10, day: 25 });
assert.strictEqual(test21Day, "Wednesday");
console.log("✓ Test 21: Day of week born (Oct 25, 1995 -> Wednesday) verified timezone-safely");

// Test 22: Singular format helper
assert.strictEqual(formatAgeString(1, 1, 1), "1 Year, 1 Month, 1 Day");
assert.strictEqual(formatAgeString(2, 0, 4), "2 Years, 0 Months, 4 Days");
console.log("✓ Test 22: Singular/plural grammatical string formatting verified");

console.log("\nAll Age Calculator & Date Engine tests passed successfully!");
