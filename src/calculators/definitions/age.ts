import {
  CalculatorDefinition,
  CalculationOutput,
} from "../engine/types";
import {
  parseDateString,
  calculateAge,
  formatFullDate,
} from "../engine/dateEngine";

export function calculateAgeWrapper(inputs: Record<string, number | string>): CalculationOutput {
  const dobRaw = inputs.dateOfBirth;
  const refRaw = inputs.referenceDate;

  if (!dobRaw || typeof dobRaw !== "string" || !dobRaw.trim()) {
    return {
      isValid: false,
      error: "Please enter your date of birth.",
    };
  }

  if (!refRaw || typeof refRaw !== "string" || !refRaw.trim()) {
    return {
      isValid: false,
      error: "Please enter a reference date.",
    };
  }

  const dob = parseDateString(dobRaw);
  if (!dob) {
    return {
      isValid: false,
      error: `"${dobRaw}" is not a valid calendar date. Please enter a valid date of birth (YYYY-MM-DD).`,
    };
  }

  const refDate = parseDateString(refRaw);
  if (!refDate) {
    return {
      isValid: false,
      error: `"${refRaw}" is not a valid calendar date. Please enter a valid reference date (YYYY-MM-DD).`,
    };
  }

  const result = calculateAge(dob, refDate);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error || "Invalid calculation parameters.",
    };
  }

  const secondaryValues = [
    { label: "Total Days Lived", value: `${(result.totalDays ?? 0).toLocaleString()} Days` },
    {
      label: "Total Weeks",
      value: `${(result.totalWeeks ?? 0).toLocaleString()} Weeks, ${result.remainingDaysInWeek ?? 0} Days`,
    },
    {
      label: "Total Full Months",
      value: `${(result.totalMonths ?? 0).toLocaleString()} Months, ${result.days ?? 0} Days`,
    },
    { label: "Total Hours", value: `${(result.totalHours ?? 0).toLocaleString()} Hours` },
    { label: "Day of Birth", value: result.dayOfWeekBorn || "N/A" },
    {
      label: "Next Birthday",
      value: `${result.nextBirthdayDate || "N/A"} (${result.nextBirthdayDayOfWeek || ""})`,
    },
    {
      label: "Countdown to Birthday",
      value: result.isBirthdayToday ? "🎉 Today is your birthday!" : `${result.daysUntilNextBirthday} Days Remaining`,
    },
  ];

  return {
    isValid: true,
    primaryValue: result.formattedPrimary,
    primaryLabel: `Exact chronological age as of ${formatFullDate(refDate)}`,
    stepExplanation: result.stepExplanation,
    secondaryValues,
  };
}

export const ageCalculatorDefinition: CalculatorDefinition = {
  id: "age-calculator",
  slug: "age-calculator",
  name: "Age Calculator",
  category: "Time & Date",
  categorySlug: "time-date",
  shortDescription: "Calculate your exact chronological age in years, months, and days with calendar-aware arithmetic.",
  longDescription: "A pure, deterministic calculation engine that computes exact chronological age, elapsed days, life weeks, and next birthday countdowns using verified Gregorian calendar arithmetic.",
  icon: "📅",
  searchKeywords: [
    "age",
    "age calculator",
    "calculate age",
    "exact age",
    "exact age calculator",
    "date of birth",
    "dob",
    "how old am i",
    "chronological age",
    "birthday calculator",
    "age in years months days",
    "age at date",
  ],
  defaultModeId: "exact-age",
  modes: [
    {
      id: "exact-age",
      name: "Exact Chronological Age",
      description: "Enter your date of birth and reference date to calculate your exact age in years, months, and days.",
      formulaText: "Age = Reference Date (Y, M, D) − Date of Birth (Y, M, D) with Calendar Borrowing",
      inputs: [
        {
          id: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          defaultValue: "",
          placeholder: "YYYY-MM-DD",
          helperText: "Your birth date in YYYY-MM-DD format",
        },
        {
          id: "referenceDate",
          label: "Calculate age as of",
          type: "date",
          defaultValue: "today",
          placeholder: "YYYY-MM-DD",
          helperText: "Reference date (defaults to today)",
        },
      ],
      calculate: calculateAgeWrapper,
    },
  ],
  formulas: [
    {
      modeId: "exact-age",
      title: "1. Calendar Arithmetic & Day Borrowing Formula",
      formulaMath: "\\text{Age} = (Y_{\\text{ref}} - Y_{\\text{birth}}) \\text{ yr}, \\quad (M_{\\text{ref}} - M_{\\text{birth}}) \\text{ mo}, \\quad (D_{\\text{ref}} - D_{\\text{birth}}) \\text{ days}",
      explanation: "Chronological age cannot be calculated with simple year subtraction (such as 2024 − 1999) because birth months and days determine whether a full cycle has elapsed. When the reference day is smaller than the birth day (Day_ref < Day_birth), one month is borrowed from the reference date, adding the exact number of calendar days in the preceding month.",
      example: "Born March 15, 1999 with reference date July 27, 2024: (2024 − 1999 = 25 years), (7 − 3 = 4 months), (27 − 15 = 12 days) → 25 Years, 4 Months, 12 Days.",
      whenToUse: "Standard legal, medical, and administrative age determination worldwide.",
    },
    {
      modeId: "exact-age",
      title: "2. Leap Years & February 29 Birthday Convention",
      formulaMath: "\\text{Feb 29 Birthday in Common Year} \\rightarrow \\text{March 1}",
      explanation: "For individuals born on February 29 (leap day), their birthday in common non-leap years (such as 2021, 2022, 2023, 2025) officially completes on March 1 after the full 365 days elapse. In leap years (such as 2024, 2028), the birthday falls on February 29.",
      example: "Born February 29, 2000: On February 28, 2023 the age is 22 Years, 11 Months, 30 Days. On March 1, 2023, the age becomes exactly 23 Years, 0 Months, 0 Days.",
      whenToUse: "Legal and statutory age verification across international jurisdictions.",
    },
    {
      modeId: "exact-age",
      title: "3. Elapsed Days & Milestone Breakdown",
      formulaMath: "\\Delta\\text{Days} = \\frac{\\text{UTC}(\\text{Ref}) - \\text{UTC}(\\text{DOB})}{86400000}, \\quad \\text{Weeks} = \\lfloor \\Delta\\text{Days} / 7 \\rfloor",
      explanation: "Absolute elapsed metrics count the physical days elapsed between the two calendar midnights, allowing exact conversion into total weeks, elapsed hours, and upcoming birthday countdowns.",
      example: "16 elapsed days = 2 full weeks and 2 remaining days = 384 total hours.",
      whenToUse: "Developmental tracking, life milestone celebrations, and countdown planning.",
    },
  ],
  examples: [
    {
      title: "Example 1: Standard Milestone Age",
      description: "Calculating age from March 15, 1999 to July 27, 2024.",
      modeId: "exact-age",
      inputs: { dateOfBirth: "1999-03-15", referenceDate: "2024-07-27" },
      expectedOutput: "25 Years, 4 Months, 12 Days",
    },
    {
      title: "Example 2: Leap Day (Feb 29) Birthday",
      description: "A leap day baby born on February 29, 2000 reaching February 29, 2024.",
      modeId: "exact-age",
      inputs: { dateOfBirth: "2000-02-29", referenceDate: "2024-02-29" },
      expectedOutput: "24 Years, 0 Months, 0 Days",
    },
    {
      title: "Example 3: Month-End Boundary Transition",
      description: "Born on January 31, 2023 reaching March 31, 2023.",
      modeId: "exact-age",
      inputs: { dateOfBirth: "2023-01-31", referenceDate: "2023-03-31" },
      expectedOutput: "0 Years, 2 Months, 0 Days",
    },
  ],
  faqs: [
    {
      question: "How do I calculate my age from my date of birth?",
      answer: "Enter your date of birth in the Date of Birth field and keep or adjust the reference date. The calculator uses calendar-aware arithmetic to determine your exact chronological age in completed years, months, and days.",
    },
    {
      question: "How old am I today?",
      answer: "Your current age is the exact elapsed time between your birth date and today's date. The calculator defaults the reference date to today so you can view your exact age in years, months, days, total weeks, and total days lived instantly.",
    },
    {
      question: "How does an age calculator calculate years, months and days?",
      answer: "The calculator performs component-wise calendar subtraction between the reference date and birth date. When the reference day is smaller than the birth day, it borrows the exact number of days in the preceding calendar month; if the reference month is smaller, it borrows 12 months from the reference year.",
    },
    {
      question: "How many days old am I?",
      answer: "Your age in total days is computed by counting the absolute number of calendar days between your birth date and the reference date. You can view this figure directly in the secondary results summary under 'Total Days Lived'.",
    },
    {
      question: "How does an age calculator calculate the next birthday?",
      answer: "The calculator determines the date of your upcoming birthday in the current or next calendar year, calculates the remaining days countdown, and displays the exact day of the week on which your next birthday falls.",
    },
    {
      question: "How does this calculator handle February 29 (leap day) birthdays in non-leap years?",
      answer: "In common non-leap years (which have 28 days in February), a person born on February 29 completes a full year of life on March 1 after the 365th day elapses. In leap years, their birthday occurs on February 29.",
    },
    {
      question: "Can I calculate my age on a historical date or future date?",
      answer: "Yes. You can customize the 'Calculate age as of' reference field to any past, present, or future calendar date on or after your date of birth to check your exact age at that point in time.",
    },
  ],
  relatedCalculators: [
    {
      id: "bmi-calculator",
      name: "BMI Calculator",
      category: "Health",
      slug: "/bmi-calculator",
      isAvailable: true,
    },
    {
      id: "percentage-calculator",
      name: "Percentage Calculator",
      category: "Math",
      slug: "/percentage-calculator",
      isAvailable: true,
    },
    {
      id: "average-calculator",
      name: "Average Calculator",
      category: "Math",
      slug: "/average-calculator",
      isAvailable: true,
    },
  ],
  seo: {
    title: "Age Calculator — Exact Age in Years, Months & Days | YourCalculate",
    description: "Calculate your exact chronological age in years, months, and days with calendar-aware arithmetic. Includes leap-year handling, total days lived, and next birthday countdown.",
    canonicalPath: "/age-calculator",
    keywords: [
      "age calculator",
      "calculate age",
      "exact age calculator",
      "age in years months days",
      "date of birth calculator",
      "how old am I",
      "chronological age calculator",
    ],
  },
};
