import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Review the Terms and Conditions for using YourCalculate. Understand usage rights, informational disclaimers, and mathematical computation terms.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms & Conditions | YourCalculate",
    description:
      "Review the Terms and Conditions for using YourCalculate. Understand usage rights, informational disclaimers, and mathematical computation terms.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-3xl">
            {/* Tag */}
            <div className="mb-4">
              <span className="inline-block rounded-md bg-[var(--secondary)] px-3 py-1 font-mono text-xs font-bold text-[var(--primary)] border border-[var(--border)]">
                Legal & Terms
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Terms &amp; Conditions
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-muted)]">
              Last Updated: September 26, 2026
            </p>

            <p className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
              Please read these Terms and Conditions (&quot;Terms&quot;) carefully before using the YourCalculate website and its computational utilities.
            </p>

            {/* Sections */}
            <div className="mt-10 space-y-8 border-t border-[var(--border)] pt-8">
              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  1. Acceptance of Terms
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  By accessing or using YourCalculate, you agree to be bound by these Terms. If you disagree with any part of these terms, you should discontinue use of our website and services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  2. Informational &amp; Educational Purpose
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  All calculation tools, formulas, mathematical step breakdowns, charts, and explanations provided on YourCalculate are offered exclusively for general informational, educational, and computational assistance purposes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  3. Domain-Specific Disclaimers
                </h2>
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                      Financial &amp; Tax Disclaimer
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      Financial calculators (including Loan, EMI, SIP, Compound Interest, Simple Interest, and GST calculators) provide mathematical approximations based on user-supplied parameters. They do not constitute certified financial, investment, lending, or tax advice. Actual loan terms, repayment schedules, taxation rules, and investment returns are governed by individual financial institutions and applicable legal statutes.
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                      Health &amp; Fitness Disclaimer
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      Health tools such as the Adult BMI Calculator use generalized public health classifications (such as standard World Health Organization categories) for educational awareness. They do not account for individual medical history, body composition, or clinical factors and must not be used as a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                  </div>

                  <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
                    <h3 className="font-semibold text-sm sm:text-base text-[var(--text-primary)]">
                      Academic Grading Disclaimer
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      Grading calculators (such as Percentage to CGPA, CGPA, and GPA calculators) apply standard academic conversion benchmarks (such as the standard CBSE 9.5 multiplier or 4.0 grade point scales). Grading formulas, credit weighting rules, and pass/fail policies vary across individual universities, colleges, and examination boards. Always consult your official educational institution for official grade conversions.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  4. Accuracy &amp; Mathematical Engines
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  While we take extensive precautions—including automated testing suites, deterministic calculation engines, and boundary checks—to maintain accurate computation logic, YourCalculate makes no warranties regarding the absolute completeness, accuracy, or reliability of any calculation result. You assume full responsibility for evaluating the accuracy and usefulness of results for your specific circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  5. Intellectual Property &amp; Acceptable Use
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  The design, layout, custom code, UI components, and written explanations on YourCalculate are protected by intellectual property laws. You may use our tools for personal, educational, and professional calculation tasks. You may not scrape, mirror, systematically extract, or republish our software, codebase, or content without express authorization.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  6. Limitation of Liability
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  To the maximum extent permitted by applicable law, YourCalculate and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages resulting from your access to, use of, or inability to use our website or reliance on any calculations or information provided herein.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  7. Changes to Terms
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. Material modifications will take effect immediately upon posting to this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  8. Contact Information
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <p className="mt-2 font-mono text-sm font-semibold text-[var(--primary)]">
                  contact@yourcalculate.com
                </p>
              </section>

              <div className="pt-4">
                <Link
                  href="/"
                  className="text-sm font-semibold text-[var(--primary)] hover:underline"
                >
                  ← Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
