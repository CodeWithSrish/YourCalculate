import Link from "next/link";
import { RelatedCalculatorLink } from "@/calculators/engine/types";

interface RelatedCalculatorsProps {
  related: RelatedCalculatorLink[];
}

export function RelatedCalculators({ related }: RelatedCalculatorsProps) {
  return (
    <section className="border-t border-[var(--border)] pt-8 sm:pt-10">
      <div className="border-b border-[var(--border)] pb-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Related Calculators
        </h2>
        <p className="mt-1 text-[15px] sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Explore connected academic, financial, and mathematical computation tools.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((calc) => (
          <div
            key={calc.id}
            className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xs"
          >
            <div>
              <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
                {calc.category}
              </span>

              <h3 className="mt-2.5 text-base font-semibold text-[var(--text-primary)]">
                {calc.isAvailable ? (
                  <Link
                    href={calc.slug}
                    className="hover:text-[var(--primary)] transition-colors inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded-xs"
                  >
                    <span>{calc.name}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <span>{calc.name}</span>
                )}
              </h3>
            </div>

            <div className="mt-4 text-xs">
              {calc.isAvailable ? (
                <span className="text-[var(--primary)] font-semibold">Available</span>
              ) : (
                <span className="text-[var(--text-muted)] font-medium">Coming Soon</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
