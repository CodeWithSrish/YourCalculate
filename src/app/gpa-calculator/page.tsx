import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GPACalculatorShell } from "@/components/calculator/GPACalculatorShell";
import { EducationCalculatorNav } from "@/components/education/EducationCalculatorNav";
import { FormulaSection } from "@/components/calculator/FormulaSection";
import { ExampleSection } from "@/components/calculator/ExampleSection";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { getCalculatorBySlug } from "@/calculators/registry";

export const metadata: Metadata = {
  title: "GPA Calculator - Calculate Course, Semester & Cumulative GPA",
  description:
    "Free international GPA calculator with credit hours, cumulative GPA projection, weighted Honors/AP calculations, and standard 4.0 scale quality points.",
  alternates: {
    canonical: "/gpa-calculator",
  },
  openGraph: {
    title: "GPA Calculator - Calculate Course, Semester & Cumulative GPA | YourCalculate",
    description:
      "Deterministic International GPA calculator with quality points, multi-term cumulative projection, and weighted grading scales.",
    url: "/gpa-calculator",
    siteName: "YourCalculate",
    type: "website",
  },
};

export default function GPACalculatorPage() {
  const definition = getCalculatorBySlug("gpa-calculator");

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
          <EducationCalculatorNav currentSlug="gpa-calculator" />

          {/* Page Heading Area */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[var(--text-primary)]">
              {definition.name}
            </h1>
            <p className="mt-2.5 text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              {definition.shortDescription}
            </p>
          </div>

          {/* Interactive Calculator Shell */}
          <GPACalculatorShell />

          {/* Mathematical Formulas & Methodology */}
          <FormulaSection
            title="How GPA Is Calculated"
            description="Mathematical formulas and quality-point credit-weighting methodologies for international grading systems."
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
