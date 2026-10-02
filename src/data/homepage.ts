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

export interface CategoryTopicItem {
  name: string;
  slug?: string;
  isAvailable?: boolean;
}

export type CategoryTopic = string | CategoryTopicItem;

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  topics: CategoryTopic[];
  slug: string;
}

export interface TrustPoint {
  title: string;
  description: string;
}

export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { text: "₹50 lakh home loan EMI", category: "Finance" },
  { text: "Student marks percentage", category: "Math" },
  { text: "8.5 CGPA to percentage", category: "Education & Exams" },
  { text: "18% GST on ₹10,000", category: "Finance" },
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
    id: "gpa-calculator",
    name: "GPA Calculator",
    description: "Calculate international 4.0 GPA, semester quality points, and multi-term cumulative grades.",
    category: "Education & Exams",
    slug: "/gpa-calculator",
  },
  {
    id: "cgpa-calculator",
    name: "CGPA Calculator",
    description: "Calculate 10-point Indian CGPA from subject grades or credit-weighted semester SGPA scores.",
    category: "Education & Exams",
    slug: "/cgpa-calculator",
  },
  {
    id: "percentage-to-cgpa-calculator",
    name: "Percentage to CGPA",
    description: "Convert aggregate percentage marks to 10-point CGPA using CBSE 9.5 or direct 10× scales.",
    category: "Education & Exams",
    slug: "/percentage-to-cgpa-calculator",
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
    id: "discount-calculator",
    name: "Discount Calculator",
    description: "Calculate sale prices, percentage discounts, savings amounts, and original retail prices.",
    category: "Finance",
    slug: "/discount-calculator",
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    description: "Calculate GST amounts, add or remove GST from prices, and split CGST, SGST, and IGST components.",
    category: "Finance",
    slug: "/gst-calculator",
  },
  {
    id: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    description: "Calculate future investment value, accrued compound interest, and growth with annual, monthly, or daily compounding.",
    category: "Finance",
    slug: "/compound-interest-calculator",
  },
  {
    id: "loan-calculator",
    name: "Loan Calculator",
    description: "Calculate monthly repayments, borrowing capacity, and payoff timelines across three comprehensive loan modes.",
    category: "Finance",
    slug: "/loan-calculator",
  },
  {
    id: "simple-interest-calculator",
    name: "Simple Interest Calculator",
    description: "Calculate simple interest earned, total maturity amount, and overall growth for loans or savings deposits.",
    category: "Finance",
    slug: "/simple-interest-calculator",
  },
  {
    id: "average-calculator",
    name: "Average Calculator",
    description: "Calculate arithmetic mean, sum, count, and weighted averages for any list of numbers or custom dataset.",
    category: "Math",
    slug: "/average-calculator",
  },
  {
    id: "ratio-calculator",
    name: "Ratio Calculator",
    description: "Simplify ratios, solve missing proportion values (A : B = C : D), and split monetary amounts by ratio shares.",
    category: "Math",
    slug: "/ratio-calculator",
  },
  {
    id: "fraction-calculator",
    name: "Fraction Calculator",
    description: "Add, subtract, multiply, divide, and simplify fractions, or convert mixed numbers with exact solutions.",
    category: "Math",
    slug: "/fraction-calculator",
  },
  {
    id: "lcm-calculator",
    name: "LCM & GCD Calculator",
    description: "Find the Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) of two or more numbers with step-by-step math.",
    category: "Math",
    slug: "/lcm-calculator",
  },
  {
    id: "scientific-calculator",
    name: "Scientific Calculator",
    description: "Advanced scientific calculator for trigonometry, logarithms, powers, roots, and complex expressions.",
    category: "Math",
    slug: "/scientific-calculator",
  },
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: "math",
    name: "Math",
    description: "Percentages, fractions, statistics, algebra, and geometry",
    topics: [
      { name: "Scientific Calculator", slug: "/scientific-calculator", isAvailable: true },
      { name: "Percentage Calculator", slug: "/percentage-calculator", isAvailable: true },
      { name: "Fraction Calculator", slug: "/fraction-calculator", isAvailable: true },
      { name: "LCM & GCD Calculator", slug: "/lcm-calculator", isAvailable: true },
      { name: "Average Calculator", slug: "/average-calculator", isAvailable: true },
      { name: "Ratio Calculator", slug: "/ratio-calculator", isAvailable: true },
      "Algebra & Geometry",
      "Probability & Statistics",
    ],
    slug: "/categories/math",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Loans, investments, compound interest, taxes, and retirement",
    topics: [
      { name: "EMI Calculator", slug: "/emi-calculator", isAvailable: true },
      { name: "Loan Calculator", slug: "/loan-calculator", isAvailable: true },
      { name: "SIP Calculator", slug: "/sip-calculator", isAvailable: true },
      { name: "Simple Interest", slug: "/simple-interest-calculator", isAvailable: true },
      { name: "Compound Interest", slug: "/compound-interest-calculator", isAvailable: true },
      { name: "Discount Calculator", slug: "/discount-calculator", isAvailable: true },
      { name: "GST Calculator", slug: "/gst-calculator", isAvailable: true },
      "Taxes & Retirement",
    ],
    slug: "/categories/finance",
  },
  {
    id: "education-exams",
    name: "Education & Exams",
    description: "GPA, CGPA conversions, test grading scales, and syllabus metrics",
    topics: [
      { name: "CGPA Calculator", slug: "/cgpa-calculator", isAvailable: true },
      { name: "Percentage to CGPA", slug: "/percentage-to-cgpa-calculator", isAvailable: true },
      { name: "GPA Calculator", slug: "/gpa-calculator", isAvailable: true },
      "Grading Scales & Class Division",
    ],
    slug: "/categories/education-exams",
  },
  {
    id: "converters",
    name: "Converters",
    description: "Metric, imperial, data storage, currency, and scientific units",
    topics: ["Length & Distance", "Mass & Weight", "Temperature", "Volume"],
    slug: "/categories/converters",
  },
  {
    id: "time-date",
    name: "Time & Date",
    description: "Age, date differences, countdowns, time zones, and workdays",
    topics: [
      { name: "Age Calculator", slug: "/age-calculator", isAvailable: true },
      "Date Differences",
      "Countdowns",
      "Time Zones",
    ],
    slug: "/categories/time-date",
  },
  {
    id: "health",
    name: "Health",
    description: "BMI, BMR, calorie needs, body fat, and hydration estimators",
    topics: [
      { name: "BMI Calculator", slug: "/bmi-calculator", isAvailable: true },
      "BMR & Calorie Needs",
      "Body Fat",
      "Hydration",
    ],
    slug: "/categories/health",
  },
  {
    id: "fitness",
    name: "Fitness",
    description: "Pace, 1-rep max, heart rate zones, and workout energy expenditure",
    topics: ["Running Pace", "1-Rep Max", "Heart Rate Zones", "Workouts"],
    slug: "/categories/fitness",
  },
  {
    id: "business",
    name: "Business",
    description: "Profit margin, break-even, markup, ROI, and customer lifetime value",
    topics: ["Profit Margin", "Break-Even", "Markup & Discount", "ROI & LTV"],
    slug: "/categories/business",
  },
  {
    id: "home-construction",
    name: "Home & Construction",
    description: "Flooring, paint, concrete volume, tile counts, and roofing",
    topics: ["Flooring & Tiles", "Concrete Volume", "Paint Coverage", "Roofing"],
    slug: "/categories/home-construction",
  },
  {
    id: "automotive",
    name: "Automotive",
    description: "Fuel economy, lease vs buy, trip cost, and horsepower conversions",
    topics: ["Fuel Economy", "Lease vs Buy", "Trip Expenses", "Horsepower"],
    slug: "/categories/automotive",
  },
  {
    id: "technology",
    name: "Technology",
    description: "Bandwidth transfer time, screen aspect ratio, and bit rate calculations",
    topics: ["Transfer Times", "Screen Ratios", "Bitrates", "IP Subnetting"],
    slug: "/categories/technology",
  },
  {
    id: "engineering",
    name: "Engineering",
    description: "Electrical Ohm's law, torque, pressure, and structural loads",
    topics: ["Ohm's Law", "Torque & RPM", "Pressure Units", "Beam Loads"],
    slug: "/categories/engineering",
  },
  {
    id: "science",
    name: "Science",
    description: "Physics mechanics, chemical molarity, thermodynamics, and astronomy",
    topics: ["Physics Mechanics", "Molarity & pH", "Thermodynamics", "Astronomy"],
    slug: "/categories/science",
  },
  {
    id: "travel",
    name: "Travel",
    description: "Flight time, luggage allowance, tip calculations, and currency conversion",
    topics: ["Flight Duration", "Luggage Weights", "Tip Calculation", "Time Drift"],
    slug: "/categories/travel",
  },
  {
    id: "cooking",
    name: "Cooking",
    description: "Recipe scaling, kitchen unit conversions, and baking hydration",
    topics: ["Recipe Scaling", "Oven Temperatures", "Baking Hydration", "Volume/Weight"],
    slug: "/categories/cooking",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Batting averages, winning percentages, tournament brackets, and handicaps",
    topics: ["Batting Averages", "Win Percentages", "Brackets", "Handicaps"],
    slug: "/categories/sports",
  },
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
