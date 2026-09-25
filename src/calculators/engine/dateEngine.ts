export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

export interface AgeCalculationOutput {
  isValid: boolean;
  years?: number;
  months?: number;
  days?: number;
  totalDays?: number;
  totalWeeks?: number;
  remainingDaysInWeek?: number;
  totalMonths?: number;
  totalHours?: number;
  dayOfWeekBorn?: string;
  nextBirthdayDate?: string;
  daysUntilNextBirthday?: number;
  nextBirthdayDayOfWeek?: string;
  formattedPrimary?: string;
  isBirthdayToday?: boolean;
  stepExplanation?: string;
  error?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Checks if a given year is a leap year in the Gregorian calendar.
 * Rule: Year divisible by 4, except end-of-century years unless divisible by 400.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the exact number of days in a given month and year.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;
  const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return days[month - 1];
}

/**
 * Validates whether the given calendar components represent an authentic calendar date.
 */
export function isValidCalendarDate(date: CalendarDate): boolean {
  if (!date || typeof date.year !== "number" || typeof date.month !== "number" || typeof date.day !== "number") {
    return false;
  }
  if (!Number.isInteger(date.year) || !Number.isInteger(date.month) || !Number.isInteger(date.day)) {
    return false;
  }
  if (date.year < 1800 || date.year > 2200) {
    return false;
  }
  if (date.month < 1 || date.month > 12) {
    return false;
  }
  const maxDays = getDaysInMonth(date.year, date.month);
  return date.day >= 1 && date.day <= maxDays;
}

/**
 * Timezone-safe string parser for "YYYY-MM-DD" formatted dates.
 */
export function parseDateString(dateStr: string): CalendarDate | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(trimmed);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  const parsed: CalendarDate = { year, month, day };
  if (!isValidCalendarDate(parsed)) return null;

  return parsed;
}

/**
 * Compares two calendar dates.
 * Returns negative if a < b, 0 if a == b, positive if a > b.
 */
export function compareDates(a: CalendarDate, b: CalendarDate): number {
  if (a.year !== b.year) return a.year - b.year;
  if (a.month !== b.month) return a.month - b.month;
  return a.day - b.day;
}

/**
 * Returns formatted date string like "March 15, 1999".
 */
export function formatFullDate(date: CalendarDate): string {
  const monthName = MONTH_NAMES[date.month - 1] || "";
  return `${monthName} ${date.day}, ${date.year}`;
}

/**
 * Returns ISO format "YYYY-MM-DD" with zero padding.
 */
export function formatISODate(date: CalendarDate): string {
  const m = String(date.month).padStart(2, "0");
  const d = String(date.day).padStart(2, "0");
  return `${date.year}-${m}-${d}`;
}

/**
 * Returns day of week using timezone-safe UTC instantiation.
 */
export function getDayOfWeek(date: CalendarDate): string {
  const utcDate = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return DAYS_OF_WEEK[utcDate.getUTCDay()];
}

/**
 * Calculates absolute elapsed days between two calendar dates.
 */
export function getTotalDaysBetween(start: CalendarDate, end: CalendarDate): number {
  const startUTC = Date.UTC(start.year, start.month - 1, start.day);
  const endUTC = Date.UTC(end.year, end.month - 1, end.day);
  return Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24));
}

/**
 * Formats singular/plural age string.
 * Example: "25 Years, 4 Months, 12 Days" or "1 Year, 1 Month, 1 Day"
 */
export function formatAgeString(years: number, months: number, days: number): string {
  const yStr = `${years} ${years === 1 ? "Year" : "Years"}`;
  const mStr = `${months} ${months === 1 ? "Month" : "Months"}`;
  const dStr = `${days} ${days === 1 ? "Day" : "Days"}`;
  return `${yStr}, ${mStr}, ${dStr}`;
}

/**
 * Resolves the calendar date of a birthday in a given year.
 * Handles Feb 29 leap day birthdays: In non-leap years, falls on March 1.
 */
export function getBirthdayInYear(dob: CalendarDate, targetYear: number): CalendarDate {
  if (dob.month === 2 && dob.day === 29) {
    if (isLeapYear(targetYear)) {
      return { year: targetYear, month: 2, day: 29 };
    } else {
      return { year: targetYear, month: 3, day: 1 };
    }
  }
  return { year: targetYear, month: dob.month, day: dob.day };
}

/**
 * Core deterministic age calculation engine.
 */
export function calculateAge(dob: CalendarDate, refDate: CalendarDate): AgeCalculationOutput {
  if (!isValidCalendarDate(dob)) {
    return {
      isValid: false,
      error: "Please enter a valid date of birth (YYYY-MM-DD).",
    };
  }

  if (!isValidCalendarDate(refDate)) {
    return {
      isValid: false,
      error: "Please enter a valid reference date (YYYY-MM-DD).",
    };
  }

  if (compareDates(dob, refDate) > 0) {
    return {
      isValid: false,
      error: "Date of birth cannot be in the future relative to the reference date.",
    };
  }

  // 1. Calculate raw calendar differences
  let years = refDate.year - dob.year;
  let months = refDate.month - dob.month;
  let days = refDate.day - dob.day;

  // 2. Day Borrowing
  if (days < 0) {
    months -= 1;
    const prevMonth = refDate.month === 1 ? 12 : refDate.month - 1;
    const prevYear = refDate.month === 1 ? refDate.year - 1 : refDate.year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);
    days += daysInPrevMonth;
  }

  // 3. Month Borrowing
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  // 4. Summary & breakdown metrics
  const totalDays = getTotalDaysBetween(dob, refDate);
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDaysInWeek = totalDays % 7;
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const dayOfWeekBorn = getDayOfWeek(dob);

  // 5. Next birthday resolution
  const bdayThisYear = getBirthdayInYear(dob, refDate.year);
  let nextBirthday: CalendarDate;
  let isBirthdayToday = false;

  const comparisonThisYear = compareDates(bdayThisYear, refDate);
  if (comparisonThisYear > 0) {
    nextBirthday = bdayThisYear;
  } else if (comparisonThisYear === 0) {
    isBirthdayToday = true;
    nextBirthday = bdayThisYear;
  } else {
    nextBirthday = getBirthdayInYear(dob, refDate.year + 1);
  }

  const daysUntilNextBirthday = isBirthdayToday
    ? 0
    : getTotalDaysBetween(refDate, nextBirthday);
  const nextBirthdayDayOfWeek = getDayOfWeek(nextBirthday);

  const formattedPrimary = formatAgeString(years, months, days);

  // Step explanation
  const isFeb29Common = dob.month === 2 && dob.day === 29 && !isLeapYear(refDate.year);
  const feb29Note = isFeb29Common
    ? " (Note: In common non-leap years, Feb 29 birthdays are officially marked on March 1)"
    : "";

  const stepExplanation =
    `From ${formatFullDate(dob)} to ${formatFullDate(refDate)}:\n` +
    `• ${years} complete ${years === 1 ? "year" : "years"}\n` +
    `• ${months} complete ${months === 1 ? "month" : "months"}\n` +
    `• ${days} remaining ${days === 1 ? "day" : "days"}${feb29Note}`;

  return {
    isValid: true,
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    remainingDaysInWeek,
    totalMonths,
    totalHours,
    dayOfWeekBorn,
    nextBirthdayDate: formatFullDate(nextBirthday),
    daysUntilNextBirthday,
    nextBirthdayDayOfWeek,
    formattedPrimary,
    isBirthdayToday,
    stepExplanation,
  };
}
