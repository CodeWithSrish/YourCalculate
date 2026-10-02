import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScientificCalculatorShell } from "@/components/calculator/ScientificCalculatorShell";
import { FormulaSection } from "@/components/calculator/FormulaSection";
import { ExampleSection } from "@/components/calculator/ExampleSection";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { getCalculatorBySlug } from "@/calculators/registry";

export const metadata: Metadata = {
  title: "Scientific Calculator — Free Online Advanced Math Instrument | YourCalculate",
  description:
    "Free online scientific calculator with trigonometry, logarithms, powers, roots, factorials, DEG/RAD modes, memory registers, Ans recall, and calculation history.",
  alternates: {
    canonical: "/scientific-calculator",
  },
  openGraph: {
    title: "Scientific Calculator — Free Online Advanced Math Instrument | YourCalculate",
    description:
      "A fast, deterministic digital scientific calculator instrument with DEG/RAD modes, 2nd function key, memory, history, and full keyboard support.",
    url: "/scientific-calculator",
    siteName: "YourCalculate",
    type: "website",
  },
};

export default function ScientificCalculatorPage() {
  const definition = getCalculatorBySlug("scientific-calculator");

  if (!definition) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Scientific Calculator",
    applicationCategory: "EducationalApplication",
    description: definition.shortDescription,
    url: "https://yourcalculate.com/scientific-calculator",
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
                Working with rational fractions or lowest common denominators?
              </span>{" "}
              <span className="text-[var(--text-secondary)]">
                Use our Fraction Calculator for step-by-step fraction addition, reduction, and mixed-number conversions.
              </span>
            </div>
            <Link
              href="/fraction-calculator"
              className="font-semibold text-[var(--primary)] hover:underline shrink-0 text-xs sm:text-sm"
            >
              Open Fraction Calculator →
            </Link>
          </div>

          {/* Interactive Scientific Calculator Instrument */}
          <ScientificCalculatorShell />

          {/* Feature Highlights & Keyboard Reference */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Keyboard Shortcuts & Operating Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-2">
                <h3 className="font-bold text-[var(--text-primary)]">Basic Operations</h3>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">0-9</kbd> Enter numbers</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">+</kbd> <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">-</kbd> <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">*</kbd> <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">/</kbd> Arithmetic operators</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">=</kbd> Evaluate expression</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">Backspace</kbd> Delete character</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">Esc</kbd> All Clear (AC)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-2">
                <h3 className="font-bold text-[var(--text-primary)]">Trigonometric & Logs</h3>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">s</kbd> Sine / ArcSine (with 2nd)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">c</kbd> Cosine / ArcCosine (with 2nd)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">t</kbd> Tangent / ArcTangent (with 2nd)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">l</kbd> Common Logarithm (log₁₀)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">n</kbd> Natural Logarithm (ln)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-2">
                <h3 className="font-bold text-[var(--text-primary)]">Powers & Constants</h3>
                <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">^</kbd> Exponentiation (xʸ)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">p</kbd> or <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">π</kbd> Pi constant (3.14159...)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">e</kbd> Euler constant (2.71828...)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">!</kbd> Factorial (n!)</li>
                  <li><kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">(</kbd> <kbd className="px-1.5 py-0.5 bg-[var(--surface)] rounded border font-mono">)</kbd> Grouping parentheses</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mathematical Formulas & Methodology */}
          <FormulaSection
            title="Scientific Mathematical Operations & Precedence"
            description="Pure mathematical explanations for trigonometry, logarithms, power laws, and factorial combinatorics."
            formulas={definition.formulas}
          />

          {/* Practical Worked Examples */}
          <ExampleSection examples={definition.examples} />

          {/* Frequently Asked Questions */}
          <FAQSection
            description="Clear answers to common questions about using DEG/RAD modes, secondary functions, memory keys, Ans recall, and order of operations."
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
