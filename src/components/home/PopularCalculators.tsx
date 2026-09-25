import { POPULAR_CALCULATORS } from "@/data/homepage";

export function PopularCalculators() {
  return (
    <section id="calculators" className="py-8 sm:py-12 scroll-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-[var(--border)] pb-3">
          <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
            Popular Calculators
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-secondary)] sm:text-sm">
            Quick access to core mathematical, financial, academic, and unit conversion tools.
          </p>
        </div>

        {/* Dense, highly scannable directory list */}
        <div className="mt-4 grid grid-cols-1 divide-y divide-[var(--border)] sm:grid-cols-2 sm:divide-y-0 sm:gap-x-8 sm:gap-y-0 lg:grid-cols-2">
          {POPULAR_CALCULATORS.map((calc, idx) => (
            <div
              key={calc.id}
              className={`flex items-start justify-between py-3.5 sm:py-4 transition-colors ${
                idx % 2 === 0 ? "sm:border-b sm:border-[var(--border)]" : "sm:border-b sm:border-[var(--border)]"
              }`}
            >
              <div className="pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {calc.name}
                  </span>
                  <span className="rounded bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                    {calc.category}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-1">
                  {calc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
