import { TRUST_POINTS } from "@/data/homepage";

export function TrustSection() {
  return (
    <section className="border-t border-[var(--border)] py-8 sm:py-10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="border-b border-[var(--border)] pb-2.5">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text-primary)]">
            Engineering & Calculation Standards
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Core principles guiding mathematical verification, architectural determinism, and privacy.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map((item) => (
            <div key={item.title} className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {item.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
