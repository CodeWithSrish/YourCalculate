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
  topics: string[];
  slug: string;
}

export interface TrustPoint {
  title: string;
  description: string;
}

export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { text: "15% of 850", category: "Math" },
  { text: "3.8 GPA on 4.0 scale", category: "Education & Exams" },
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
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: "math",
    name: "Math",
    description: "Percentages, fractions, statistics, algebra, and geometry",
    topics: ["Percentages", "Fractions", "Statistics", "Algebra"],
    slug: "/categories/math",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Loans, investments, compound interest, taxes, and retirement",
    topics: ["Loans & EMI", "SIP & Compounding", "Taxes", "Retirement"],
    slug: "/categories/finance",
  },
  {
    id: "education-exams",
    name: "Education & Exams",
    description: "GPA, CGPA conversions, test grading scales, and syllabus metrics",
    topics: ["GPA / CGPA", "Grading Scales", "Percentage Rules", "Class Division"],
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
    topics: ["Age Calculation", "Date Differences", "Countdowns", "Time Zones"],
    slug: "/categories/time-date",
  },
  {
    id: "health",
    name: "Health",
    description: "BMI, BMR, calorie needs, body fat, and hydration estimators",
    topics: ["BMI & BMR", "Calorie Needs", "Body Fat", "Hydration"],
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
