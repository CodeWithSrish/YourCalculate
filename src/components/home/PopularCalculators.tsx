import Link from "next/link";
import { POPULAR_CALCULATORS } from "@/data/homepage";
import { isCalculatorAvailable } from "@/calculators/registry";

export function PopularCalculators() {
  return (
    <section id="popular-calculators" className="py-8 sm:py-10 scroll-mt-14">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[var(--border)] pb-2.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Popular Calculators
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Core computational utilities for financial, academic, mathematical, and measurement tasks.
            </p>
          </div>
          <span className="mt-1 sm:mt-0 text-xs font-mono text-[var(--text-muted)]">
            8 Core Utilities
          </span>
        </div>

        {/* Multi-column text-first utility directory */}
        <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_CALCULATORS.map((calc) => {
            const isAvailable = isCalculatorAvailable(calc.slug.replace(/^\//, ""));

            return (
              <div
                key={calc.id}
                className="flex flex-col justify-start border-b border-[var(--border)] pb-4 sm:border-b-0 sm:pb-0"
              >
                <div className="flex items-center justify-between">
                  {isAvailable ? (
                    <Link
                      href={calc.slug}
                      className="text-sm font-semibold text-[var(--primary)] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-xs"
                    >
                      {calc.name} <span aria-hidden="true">→</span>
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-[var(--text-primary)] cursor-default">
                      {calc.name}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {calc.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
