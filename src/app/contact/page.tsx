import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Contact YourCalculate | Calculator Feedback & Support",
  description:
    "Get in touch with the YourCalculate team for calculator feedback, error reporting, mathematical corrections, or feature suggestions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact YourCalculate | Calculator Feedback & Support",
    description:
      "Get in touch with the YourCalculate team for calculator feedback, error reporting, mathematical corrections, or feature suggestions.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl">
            {/* Tag */}
            <div className="mb-4">
              <span className="inline-block rounded-md bg-[var(--secondary)] px-3 py-1 font-mono text-xs font-bold text-[var(--primary)] border border-[var(--border)]">
                Help & Feedback
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Contact & Feedback
            </h1>

            <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              We welcome mathematical feedback, bug reports, feature suggestions, and general inquiries to ensure YourCalculate remains reliable, accurate, and accessible.
            </p>

            {/* Contact Channels Grid */}
            <div className="mt-10 space-y-8 border-t border-[var(--border)] pt-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--secondary)] text-[var(--primary)] font-bold text-sm">
                    ✉
                  </div>
                  <h2 className="mt-4 text-lg font-bold tracking-tight text-[var(--text-primary)]">
                    Email Inquiries
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    For general questions, calculator feedback, or partnership inquiries:
                  </p>
                  <p className="mt-3 font-mono text-sm font-semibold text-[var(--primary)] select-all">
                    contact@yourcalculate.com
                  </p>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--secondary)] text-[var(--primary)] font-bold text-sm">
                    ⚙
                  </div>
                  <h2 className="mt-4 text-lg font-bold tracking-tight text-[var(--text-primary)]">
                    Calculation Error Reports
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    To report a calculation bug or formula discrepancy:
                  </p>
                  <p className="mt-3 font-mono text-sm font-semibold text-[var(--primary)] select-all">
                    support@yourcalculate.com
                  </p>
                </div>
              </div>

              {/* Guidelines for Reporting Calculation Issues */}
              <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  How to Report a Calculation Discrepancy
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  To help our engineering team verify and resolve mathematical issues quickly, please include the following details in your message:
                </p>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--primary)]">•</span>
                    <span><strong>Calculator URL:</strong> The specific calculator page (e.g., <code className="rounded bg-[var(--secondary)] px-1 py-0.5 text-xs font-mono">/compound-interest-calculator</code>).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--primary)]">•</span>
                    <span><strong>Input Values:</strong> The exact parameters and mode selected during your calculation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--primary)]">•</span>
                    <span><strong>Observed vs. Expected Result:</strong> The result produced by the tool alongside the expected result and reference formula or standard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-[var(--primary)]">•</span>
                    <span><strong>Browser / Device Context:</strong> Your browser version and operating system if the issue is layout or interaction related.</span>
                  </li>
                </ul>
              </section>

              {/* Feature Suggestions */}
              <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
                  Requesting a New Calculator
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Have a specific mathematical formula, financial utility, or academic converter you would like to see added to YourCalculate? Let us know the intended use case, required inputs, and calculation formulas.
                </p>
                <div className="mt-4">
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    Explore Current Directory
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
