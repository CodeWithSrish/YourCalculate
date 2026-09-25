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
    "Loan Calculator — Calculate Monthly Payments, Borrowing Capacity & Payoff | YourCalculate",
  description:
    "Free online loan calculator to compute monthly loan payments, calculate maximum borrowing capacity, and determine exact debt payoff timelines with full mathematical transparency.",
  alternates: {
    canonical: "/loan-calculator",
  },
  openGraph: {
    title:
      "Loan Calculator — Calculate Monthly Payments, Borrowing Capacity & Payoff | YourCalculate",
    description:
      "Calculate monthly loan installments, maximum affordable principal from your monthly budget, and debt payoff duration across three comprehensive modes.",
    url: "/loan-calculator",
    siteName: "YourCalculate",
    type: "website",
  },
};

export default function LoanCalculatorPage() {
  const definition = getCalculatorBySlug("loan-calculator");

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

          {/* Contextual Link to EMI & Amortization Schedule */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div>
              <span className="font-semibold text-[var(--text-primary)]">
                Looking for a month-by-month repayment schedule?
              </span>{" "}
              <span className="text-[var(--text-secondary)]">
                Use our dedicated EMI Calculator for complete loan balance amortization tables.
              </span>
            </div>
            <Link
              href="/emi-calculator"
              className="font-semibold text-[var(--primary)] hover:underline shrink-0 text-xs sm:text-sm"
            >
              Open EMI Calculator →
            </Link>
          </div>

          {/* Calculator Interface & Results */}
          <CalculatorShell slug={definition.slug} />

          {/* Mathematical Formulas & Methodology */}
          <FormulaSection
            title="How Loan Calculations Work"
            description="Pure mathematical formulas for loan installments, borrowing power, and payoff timelines based on the reducing balance method."
            formulas={definition.formulas}
          />

          {/* Practical Worked Examples */}
          <ExampleSection examples={definition.examples} />

          {/* Frequently Asked Questions */}
          <FAQSection
            description="Clear answers to common questions about loan installments, maximum borrowing capacity, reducing balance interest, and debt payoff duration."
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
