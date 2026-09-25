export interface ConversionProfile {
  id: string;
  name: string;
  country: string;
  system: string;
  inputScale: string;
  outputScale: string;
  direction: "percentage-to-cgpa" | "cgpa-to-percentage" | "both";
  formulaDescription: string;
  formulaMath: string;
  applicabilityNotes: string;
  source: string;
  sourceUrl?: string;
  verificationStatus: "verified" | "standard_convention" | "custom";
  calculatePercentageToCgpa: (percentage: number) => { cgpa: number; isScaleExceeded?: boolean };
  calculateCgpaToPercentage: (cgpa: number) => { percentage: number };
}

export const CONVERSION_PROFILES: ConversionProfile[] = [
  {
    id: "standard-9-5",
    name: "Standard 9.5 Multiplier (CBSE / AICTE Convention)",
    country: "India",
    system: "10-Point Scale (CBSE Class 10/12, UGC/AICTE Standard Guidelines)",
    inputScale: "0–100%",
    outputScale: "10-Point CGPA",
    direction: "both",
    formulaDescription: "CGPA = Percentage ÷ 9.5  |  Percentage = CGPA × 9.5",
    formulaMath: "\\text{CGPA} = \\frac{\\text{Percentage}}{9.5} \\quad | \\quad \\text{Percentage} = \\text{CGPA} \\times 9.5",
    applicabilityNotes:
      "Standard convention historically prescribed by CBSE and widely referenced by engineering colleges and recruitment bodies. Note: Not universally applicable to all universities; always verify with your official transcript.",
    source: "CBSE Examination Byelaws & AICTE Examination Reform Guidelines",
    verificationStatus: "standard_convention",
    calculatePercentageToCgpa: (percentage: number) => ({
      cgpa: percentage / 9.5,
      isScaleExceeded: percentage / 9.5 > 10,
    }),
    calculateCgpaToPercentage: (cgpa: number) => ({
      percentage: cgpa * 9.5,
    }),
  },
  {
    id: "direct-10",
    name: "Direct 10× Linear Scale (Percentage = CGPA × 10)",
    country: "India",
    system: "Direct Linear 10-Point Scale",
    inputScale: "0–100%",
    outputScale: "10-Point CGPA",
    direction: "both",
    formulaDescription: "CGPA = Percentage ÷ 10  |  Percentage = CGPA × 10",
    formulaMath: "\\text{CGPA} = \\frac{\\text{Percentage}}{10} \\quad | \\quad \\text{Percentage} = \\text{CGPA} \\times 10",
    applicabilityNotes:
      "Employed by institutes where grade points are direct deciles of percentage marks (e.g. 10.0 CGPA = 100%, 8.5 CGPA = 85%).",
    source: "Standard Academic Linear Scaling Ordinance",
    verificationStatus: "standard_convention",
    calculatePercentageToCgpa: (percentage: number) => ({
      cgpa: percentage / 10,
      isScaleExceeded: percentage / 10 > 10,
    }),
    calculateCgpaToPercentage: (cgpa: number) => ({
      percentage: cgpa * 10,
    }),
  },
];

export function getConversionProfileById(id: string): ConversionProfile | undefined {
  return CONVERSION_PROFILES.find((p) => p.id === id);
}
