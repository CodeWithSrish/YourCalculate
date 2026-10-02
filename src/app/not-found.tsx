import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { POPULAR_CALCULATORS } from "@/data/homepage";
import "./globals.css";

export default function NotFound() {
  const quickCalculators = POPULAR_CALCULATORS.slice(0, 6);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
          {/* Main 404 Error Message */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-md bg-[var(--secondary)] px-3 py-1 font-mono text-xs font-bold text-[var(--primary)] border border-[var(--border)]">
              404 Error
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Page Not Found
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              The calculator or page you requested does not exist or has been moved. Explore our core calculation tools below or return to the homepage directory.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                Return to Homepage
              </Link>
              <Link
                href="/scientific-calculator"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--secondary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              >
                Scientific Calculator
              </Link>
            </div>
          </div>

          {/* Popular Calculators Grid */}
          <div className="mt-12 sm:mt-16 border-t border-[var(--border)] pt-8 sm:pt-10">
            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                Popular Calculation Engines
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Direct links to verified mathematical, financial, and academic utilities.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {quickCalculators.map((calc) => (
                <Link
                  key={calc.id}
                  href={calc.slug}
                  className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs hover:border-[var(--primary)] hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--ring)] group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                        {calc.category}
                      </span>
                      <span className="text-xs font-semibold text-[var(--primary)] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">
                        →
                      </span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {calc.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                      {calc.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
