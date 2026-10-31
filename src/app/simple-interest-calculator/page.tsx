import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { FormulaSection } from "@/components/calculator/FormulaSection";
import { ExampleSection } from "@/components/calculator/ExampleSection";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { getCalculatorBySlug } from "@/calculators/registry";

export const metadata: Metadata = {
  title:
    "Simple Interest Calculator – Calculate Interest & Total Amount",
  description:
    "Free online simple interest calculator to quickly calculate interest earned, total maturity amount, and growth rates on loans or deposits with transparent formulas.",
  alternates: {
    canonical: "/simple-interest-calculator",
  },
  openGraph: {
    title:
      "Simple Interest Calculator – Calculate Interest & Total Amount | YourCalculate",
    description:
      "Deterministic simple interest calculator to compute interest returns and final maturity values on lump-sum principal sums.",
    url: "/simple-interest-calculator",
    siteName: "YourCalculate",
    type: "website",
  },
};

export default function SimpleInterestCalculatorPage() {
  const definition = getCalculatorBySlug("simple-interest-calculator");

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

            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]"
            >
              <Link
                href="/"
                className="hover:text-[var(--text-primary)] transition-colors"
              >
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

          {/* Page Heading Area */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[var(--text-primary)]">
              {definition.name}
            </h1>
            <p className="mt-2.5 text-base sm:text-lg text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              {definition.shortDescription}
            </p>
          </div>

          {/* Contextual Link to Compound Interest */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div>
              <span className="font-semibold text-[var(--text-primary)]">
                Looking for compound growth with periodic reinvestment?
              </span>{" "}
              <span className="text-[var(--text-secondary)]">
                Use our Compound Interest Calculator for annual, quarterly, monthly, and daily compounding cycles.
              </span>
            </div>
            <Link
              href="/compound-interest-calculator"
              className="font-semibold text-[var(--primary)] hover:underline shrink-0 text-xs sm:text-sm"
            >
              Open Compound Interest Calculator →
            </Link>
          </div>

          {/* Calculator Interface & Results */}
          <CalculatorShell slug={definition.slug} />

          {/* Mathematical Formulas & Methodology */}
          <FormulaSection
            title="How Simple Interest Is Calculated"
            description="Pure mathematical formulas for fixed simple interest and total maturity accumulation."
            formulas={definition.formulas}
          />

          {/* Practical Worked Examples */}
          <ExampleSection examples={definition.examples} />

          {/* Frequently Asked Questions */}
          <FAQSection
            description="Clear answers to common questions about simple interest calculation, annual rates, loan interest, and zero-interest conditions."
            faqs={definition.faqs}
          />

          {/* Connected Calculators */}
          <RelatedCalculators related={definition.relatedCalculators} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
