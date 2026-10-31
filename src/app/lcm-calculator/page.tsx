import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LCMCalculatorShell } from "@/components/calculator/LCMCalculatorShell";
import { FormulaSection } from "@/components/calculator/FormulaSection";
import { ExampleSection } from "@/components/calculator/ExampleSection";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { getCalculatorBySlug } from "@/calculators/registry";

export const metadata: Metadata = {
  title: "LCM & GCD Calculator — Least Common Multiple & Greatest Common Divisor",
  description:
    "Free online LCM and GCD calculator. Find the Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) of two or more numbers with step-by-step solutions.",
  alternates: {
    canonical: "/lcm-calculator",
  },
  openGraph: {
    title: "LCM & GCD Calculator — Least Common Multiple & Greatest Common Divisor | YourCalculate",
    description:
      "Deterministic mathematical calculator for Least Common Multiple (LCM) and Greatest Common Divisor (GCD / HCF) with safe integer arithmetic.",
    url: "/lcm-calculator",
    siteName: "YourCalculate",
    type: "website",
  },
};

export default function LCMCalculatorPage() {
  const definition = getCalculatorBySlug("lcm-calculator");

  if (!definition) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "LCM & GCD Calculator",
    applicationCategory: "EducationalApplication",
    description: definition.shortDescription,
    url: "https://yourcalculate.com/lcm-calculator",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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

          {/* Contextual Link to Fraction Calculator */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
            <div>
              <span className="font-semibold text-[var(--text-primary)]">
                Need to add, subtract, or simplify fractions with common denominators?
              </span>{" "}
              <span className="text-[var(--text-secondary)]">
                Use our Fraction Calculator to calculate exact rational arithmetic, LCDs, and mixed numbers.
              </span>
            </div>
            <Link
              href="/fraction-calculator"
              className="font-semibold text-[var(--primary)] hover:underline shrink-0 text-xs sm:text-sm"
            >
              Open Fraction Calculator →
            </Link>
          </div>

          {/* Calculator Interface & Results */}
          <LCMCalculatorShell />

          {/* Mathematical Formulas & Methodology */}
          <FormulaSection
            title="How LCM and GCD Are Calculated"
            description="Pure integer mathematical formulas using the Euclidean algorithm, GCD-first LCM division, and product identities."
            formulas={definition.formulas}
          />

          {/* Practical Worked Examples */}
          <ExampleSection examples={definition.examples} />

          {/* Frequently Asked Questions */}
          <FAQSection
            description="Clear answers to common questions about finding the Least Common Multiple, Greatest Common Divisor, HCF, coprime numbers, and negative inputs."
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
