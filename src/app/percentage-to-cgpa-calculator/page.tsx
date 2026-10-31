import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { EducationCalculatorNav } from "@/components/education/EducationCalculatorNav";
import { FormulaSection } from "@/components/calculator/FormulaSection";
import { ExampleSection } from "@/components/calculator/ExampleSection";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { getCalculatorBySlug } from "@/calculators/registry";

export const metadata: Metadata = {
  title: "Percentage to CGPA Calculator - Convert Percentage ↔ CGPA",
  description:
    "Convert percentage to CGPA and CGPA to percentage using CBSE 9.5, direct 10×, or custom university multipliers with step-by-step formula calculations.",
  alternates: {
    canonical: "/percentage-to-cgpa-calculator",
  },
  openGraph: {
    title: "Percentage to CGPA Calculator - Convert Percentage ↔ CGPA | YourCalculate",
    description:
      "Convert percentage to CGPA and CGPA to percentage using CBSE 9.5, direct 10×, or custom university multipliers with step-by-step formula calculations.",
    url: "/percentage-to-cgpa-calculator",
    siteName: "YourCalculate",
    type: "website",
  },
};

export default function PercentageToCgpaCalculatorPage() {
  const definition = getCalculatorBySlug("percentage-to-cgpa-calculator");

  if (!definition) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 space-y-8">
          {/* Navigation Controls: Back Link & Breadcrumbs */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-3">
            <Link
              href="/#popular-calculators"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-xs w-fit"
            >
              <span aria-hidden="true">←</span> Back to calculators
            </Link>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
                Home
              </Link>
              <span>/</span>
              <span>{definition.category}</span>
              <span>/</span>
              <span className="font-medium text-[var(--text-primary)]">
                {definition.name}
              </span>
            </nav>
          </div>

          {/* Education Tool Navigation Strip */}
          <EducationCalculatorNav currentSlug="percentage-to-cgpa-calculator" />

          {/* Page Heading Area */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[var(--text-primary)]">
              {definition.name}
            </h1>
            <p className="mt-2.5 text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              {definition.shortDescription}
            </p>
          </div>

          {/* Calculator Interface & Results */}
          <CalculatorShell slug={definition.slug} />

          {/* Methodology & Board Guidelines Disclaimer Box */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 text-sm text-[var(--text-secondary)] leading-relaxed shadow-2xs">
            <div className="flex items-start gap-3">
              <span className="text-base leading-none mt-0.5" aria-hidden="true">ℹ️</span>
              <div className="space-y-1">
                <p className="font-semibold text-[var(--text-primary)] text-sm sm:text-[15px]">
                  Conversion Methodology & Institutional Notice
                </p>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  CGPA-to-percentage conversion is not governed by one universal formula across all Indian institutions. Select the conversion method specified by your board or university (such as the standard CBSE / 9.5 method, direct 10× method, or a custom institutional multiplier).
                </p>
              </div>
            </div>
          </div>

          {/* Mathematical Formulas & Methodology */}
          <FormulaSection
            title="How Percentage to CGPA Conversion Works"
            description="Mathematical formulas, institutional multipliers, and conversion methodologies for grading systems."
            formulas={definition.formulas}
          />

          {/* Practical Worked Examples */}
          <ExampleSection examples={definition.examples} />

          {/* Frequently Asked Questions */}
          <FAQSection faqs={definition.faqs} />

          {/* Connected Calculators */}
          <RelatedCalculators related={definition.relatedCalculators} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
