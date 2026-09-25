export interface SearchSuggestion {
  text: string;
  category: string;
}

export interface PopularCalculatorItem {
  id: string;
  name: string;
  description: string;
  category: string;
  slug: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export interface TrustPoint {
  title: string;
  description: string;
}

export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { text: "15% of 850", category: "Math" },
  { text: "5 kg to pounds", category: "Converters" },
  { text: "₹50 lakh home loan EMI", category: "Finance" },
  { text: "8.4 CGPA to percentage", category: "Education & Exams" },
];

export const POPULAR_CALCULATORS: PopularCalculatorItem[] = [
  {
    id: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentage increases, discounts, fractional shares, and differences.",
    category: "Math",
    slug: "/percentage-calculator",
  },
  {
    id: "emi-calculator",
    name: "EMI Calculator",
    description: "Determine monthly loan repayments, total interest breakdown, and amortization schedules.",
    category: "Finance",
    slug: "/emi-calculator",
  },
  {
    id: "sip-calculator",
    name: "SIP Calculator",
    description: "Forecast wealth accumulation, compounding returns, and maturity values for systematic investments.",
    category: "Finance",
    slug: "/sip-calculator",
  },
  {
    id: "cgpa-to-percentage",
    name: "CGPA to Percentage",
    description: "Convert institutional CGPA and GPA to percentage scores across standard university formulas.",
    category: "Education & Exams",
    slug: "/cgpa-to-percentage",
  },
  {
    id: "age-calculator",
    name: "Age Calculator",
    description: "Compute exact chronological age in years, months, days, and time intervals.",
    category: "Time & Date",
    slug: "/age-calculator",
  },
  {
    id: "bmi-calculator",
    name: "BMI Calculator",
    description: "Assess Body Mass Index with Metric and Imperial standards alongside healthy weight classifications.",
    category: "Health",
    slug: "/bmi-calculator",
  },
  {
    id: "unit-converter",
    name: "Unit Converter",
    description: "Convert length, mass, volume, area, temperature, and speed measurements accurately.",
    category: "Converters",
    slug: "/unit-converter",
  },
  {
    id: "average-calculator",
    name: "Average Calculator",
    description: "Calculate arithmetic mean, weighted average, median, and mode for data series.",
    category: "Math",
    slug: "/average-calculator",
  },
];

export const CATEGORIES: CategoryItem[] = [
  { id: "math", name: "Math", description: "Percentages, fractions, statistics, algebra, and geometry", slug: "/categories/math" },
  { id: "finance", name: "Finance", description: "Loans, investments, compound interest, taxes, and retirement", slug: "/categories/finance" },
  { id: "education-exams", name: "Education & Exams", description: "GPA, CGPA conversions, test grading scales, and syllabus metrics", slug: "/categories/education-exams" },
  { id: "converters", name: "Converters", description: "Metric, imperial, data storage, currency, and scientific units", slug: "/categories/converters" },
  { id: "time-date", name: "Time & Date", description: "Age, date differences, countdowns, time zones, and workdays", slug: "/categories/time-date" },
  { id: "health", name: "Health", description: "BMI, BMR, calorie needs, body fat, and hydration estimators", slug: "/categories/health" },
  { id: "fitness", name: "Fitness", description: "Pace, 1-rep max, heart rate zones, and workout energy expenditure", slug: "/categories/fitness" },
  { id: "business", name: "Business", description: "Profit margin, break-even, markup, ROI, and customer lifetime value", slug: "/categories/business" },
  { id: "home-construction", name: "Home & Construction", description: "Flooring, paint, concrete volume, tile counts, and roofing", slug: "/categories/home-construction" },
  { id: "automotive", name: "Automotive", description: "Fuel economy, lease vs buy, trip cost, and horsepower conversions", slug: "/categories/automotive" },
  { id: "technology", name: "Technology", description: "Bandwidth transfer time, screen aspect ratio, and bit rate calculations", slug: "/categories/technology" },
  { id: "engineering", name: "Engineering", description: "Electrical Ohm's law, torque, pressure, and structural loads", slug: "/categories/engineering" },
  { id: "science", name: "Science", description: "Physics mechanics, chemical molarity, thermodynamics, and astronomy", slug: "/categories/science" },
  { id: "travel", name: "Travel", description: "Flight time, luggage allowance, tip calculations, and currency conversion", slug: "/categories/travel" },
  { id: "cooking", name: "Cooking", description: "Recipe scaling, kitchen unit conversions, and baking hydration", slug: "/categories/cooking" },
  { id: "sports", name: "Sports", description: "Batting averages, winning percentages, tournament brackets, and handicaps", slug: "/categories/sports" },
];

export const TRUST_POINTS: TrustPoint[] = [
  {
    title: "Deterministic Results",
    description: "Zero guesswork or probabilistic AI approximation. Every computation executes pure, verified mathematical algorithms.",
  },
  {
    title: "Transparent Formulas",
    description: "Understand how every answer is derived with step-by-step methodologies, formula breakdowns, and explicit assumptions.",
  },
  {
    title: "Instant & Lightweight",
    description: "Engineered for speed with zero unnecessary JavaScript overhead. Fast to load, responsive on mobile, and distraction-free.",
  },
  {
    title: "Purpose-Built Utilities",
    description: "Direct input-to-answer workflows designed for everyday academic, financial, engineering, and personal tasks.",
  },
];
