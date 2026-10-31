import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About Us — Transparent & Deterministic Online Calculators",
  description:
    "Learn about YourCalculate's mission to provide fast, deterministic, formula-transparent online calculators across mathematics, finance, education, and health.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About YourCalculate | Free Online Calculators",
    description:
      "Learn about YourCalculate's mission to provide fast, deterministic, formula-transparent online calculators across mathematics, finance, education, and health.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl">
            {/* Breadcrumb / Category Tag */}
            <div className="mb-4">
              <span className="inline-block rounded-md bg-[var(--secondary)] px-3 py-1 font-mono text-xs font-bold text-[var(--primary)] border border-[var(--border)]">
                About YourCalculate
              </span>
            </div>

            {/* Page Heading */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Calculate. Understand. Verify.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              YourCalculate is an open computational platform engineered to provide fast, accurate, and transparent calculation tools across mathematics, personal finance, academic grading, health, and daily utilities.
            </p>

            {/* Core Pillars */}
            <div className="mt-10 space-y-10 border-t border-[var(--border)] pt-8">
              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  1. Calculator-First Philosophy
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  We believe computational tools should solve problems immediately without unnecessary obstacles, cluttered layouts, or multi-step redirects. Every calculator on YourCalculate places the core input interface directly above the fold, providing instant results with responsive real-time updates as you adjust values.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  2. Deterministic & Transparent Calculation Methodology
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Computations should never be a black box. Each calculator on YourCalculate is built upon deterministic calculation engines executed directly in your browser. We explicitly publish the mathematical formulas, variable definitions, and step-by-step methodologies behind every result so you can verify how numbers are derived.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  3. Commitment to Accuracy & Verification
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  All calculation logic across our platform is backed by automated unit test suites covering standard baselines, fractional values, edge cases, and boundary conditions. From standard loan amortization schedules to our advanced scientific workspace with exact symbolic arithmetic and complex number engines, accuracy is our central engineering priority.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  4. Informational Purpose & Professional Verification
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  While our engines are developed with rigorous attention to mathematical standards, all calculators on YourCalculate are provided strictly as informational and educational tools. Financial calculations (such as loan interest or SIP estimates), tax computations (such as GST), health metrics (such as BMI classifications), and academic conversions (such as CGPA to percentage) represent mathematical models based on general standards.
                </p>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  Users should always verify significant financial agreements, tax filings, medical assessments, or institutional grade transcripts with qualified professionals or official governing institutions.
                </p>
              </section>

              <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  Explore Our Tools
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                  Discover our complete suite of mathematical, financial, and academic calculators or test our advanced scientific workspace.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    Browse All Calculators
                  </Link>
                  <Link
                    href="/scientific-calculator"
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    Scientific Calculator
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
